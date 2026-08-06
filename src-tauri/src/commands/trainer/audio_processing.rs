use std::{fs::File, path::Path};

use anyhow::Result;
use hound::{WavSpec, WavWriter};
use soundtouch::{Setting, SoundTouch};
use symphonia::core::{
    codecs::{CodecParameters, audio::AudioDecoderOptions},
    formats::{FormatOptions, probe::Hint},
    io::MediaSourceStream,
    meta::MetadataOptions,
};

pub struct DecodedAudio {
    pub samples: Vec<f32>,
    pub sample_rate: u32,
    pub channels: usize,
}

pub fn decode_audio(path: &Path) -> Result<DecodedAudio> {
    let file = File::open(path)?;
    let mss = MediaSourceStream::new(Box::new(file), Default::default());

    let mut hint = Hint::new();
    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        hint.with_extension(ext);
    }

    let fmt_opts: FormatOptions = Default::default();
    let meta_opts: MetadataOptions = Default::default();

    let mut format = symphonia::default::get_probe()
        .probe(&hint, mss, fmt_opts, meta_opts)?;

    let (track_id, audio_params) = format
        .tracks()
        .iter()
        .find_map(|t| {
            if let Some(CodecParameters::Audio(params)) = &t.codec_params {
                Some((t.id, params.clone()))
            } else {
                None
            }
        })
        .ok_or_else(|| anyhow::anyhow!("no supported audio track found"))?;

    let sample_rate = audio_params.sample_rate.unwrap_or(44100);
    let channels = audio_params
        .channels
        .as_ref()
        .map(|c| c.count())
        .unwrap_or(2);

    let dec_opts: AudioDecoderOptions = Default::default();
    let mut decoder = symphonia::default::get_codecs()
        .make_audio_decoder(&audio_params, &dec_opts)?;

    let mut samples: Vec<f32> = Vec::new();
    let mut packet_count = 0;
    let mut decoded_count = 0;

    // Buffer reutilizado entre paquetes: copy_to_vec_interleaved hace resize(),
    // así que sobrescribe el contenido pero conserva la capacidad ya reservada.
    let mut packet_samples: Vec<f32> = Vec::new();

    loop {
        let packet = match format.next_packet()? {
            Some(packet) => packet,
            None => break,
        };
        packet_count += 1;

        if packet.track_id != track_id {
            continue;
        }

        match decoder.decode(&packet) {
            Ok(decoded) => {
                decoded_count += 1;
                decoded.copy_to_vec_interleaved::<f32>(&mut packet_samples);
                samples.extend_from_slice(&packet_samples);
            }
            Err(e) => {
                log::warn!("decode error on packet: {:?}", e);
                continue;
            }
        }
    }

    log::debug!(
        "decode_audio finished: {} packets read, {} decoded ok, {} total samples",
        packet_count, decoded_count, samples.len()
    );

    Ok(DecodedAudio {
        samples,
        sample_rate,
        channels,
    })
}

/// Frames por bloque que se empujan a SoundTouch antes de drenar su salida.
const STRETCH_CHUNK_FRAMES: usize = 4096;

/// Modo "Normal": cambia la velocidad manteniendo el pitch original.
///
/// Alimenta SoundTouch por bloques y drena la salida tras cada uno, en vez de
/// usar `generate_audio()`. Ese helper empuja la pista entera de golpe y solo
/// drena al final, con lo que el FIFO interno de SoundTouch crece de 0 a ~85 MB
/// en pasos de 4 KB, haciendo un memcpy completo en cada paso: coste O(n²).
/// Drenando por bloques el FIFO se mantiene en unos pocos KB y `ensureCapacity`
/// nunca reasigna. Medido sobre una pista de 4 min: 57.7 s -> 0.19 s, con salida
/// bit a bit idéntica a la anterior.
pub fn apply_timestretch(audio: &DecodedAudio, rate: f64) -> Result<Vec<f32>> {
    let channels = audio.channels;

    let mut st = SoundTouch::new();
    // Se mantienen SequenceMs/SeekwindowMs: quitarlos (dejando el auto-tuning de
    // calcSeqParameters) solo ahorra ~5% ya con el streaming, pero cambia el
    // granulado del stretch, así que la salida deja de ser idéntica.
    st.set_channels(channels as u32)
        .set_sample_rate(audio.sample_rate)
        .set_tempo(rate)
        .set_setting(Setting::UseQuickseek, 1)
        .set_setting(Setting::SequenceMs, 40)
        .set_setting(Setting::SeekwindowMs, 15);

    let mut output: Vec<f32> = Vec::with_capacity((audio.samples.len() as f64 / rate) as usize + 4096);
    let mut recv = vec![0.0f32; STRETCH_CHUNK_FRAMES * channels * 2];
    let recv_frames = recv.len() / channels;

    for chunk in audio.samples.chunks(STRETCH_CHUNK_FRAMES * channels) {
        st.put_samples(chunk, chunk.len() / channels);

        loop {
            let n = st.receive_samples(recv.as_mut_slice(), recv_frames);
            if n == 0 {
                break;
            }
            output.extend_from_slice(&recv[..n * channels]);
        }
    }

    // Drenar la cola tras el flush. `generate_audio()` llama a flush() pero no
    // vuelve a leer, así que perdía los últimos ~13 ms de la pista.
    st.flush();
    loop {
        let n = st.receive_samples(recv.as_mut_slice(), recv_frames);
        if n == 0 {
            break;
        }
        output.extend_from_slice(&recv[..n * channels]);
    }

    log::debug!(
        "soundtouch output: {} samples (input was {})",
        output.len(),
        audio.samples.len()
    );

    Ok(output)
}

/// Modo "Nightcore": cambia la velocidad dejando que el pitch suba/baje naturalmente.
pub fn apply_resample(audio: &DecodedAudio, rate: f64) -> (Vec<f32>, u32) {
    let new_sample_rate = (audio.sample_rate as f64 * rate).round() as u32;
    (audio.samples.clone(), new_sample_rate)
}

pub fn write_wav(
    samples: &[f32],
    sample_rate: u32,
    channels: u16,
    output_path: &Path,
) -> Result<()> {
    log::debug!("write_wav: {} samples, sample_rate={}, channels={}", samples.len(), sample_rate, channels);

    let spec = WavSpec {
        channels,
        sample_rate,
        bits_per_sample: 32,
        sample_format: hound::SampleFormat::Float,
    };

    let mut writer = WavWriter::create(output_path, spec)?;

    for &sample in samples {
        writer.write_sample(sample)?;
    }

    writer.finalize()?;

    Ok(())
}