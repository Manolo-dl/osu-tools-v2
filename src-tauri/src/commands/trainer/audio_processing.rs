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
                // Buffer temporal por paquete, luego lo AÑADIMOS al vector total
                // (copy_to_vec_interleaved probablemente hace clear() internamente)
                let mut packet_samples: Vec<f32> = Vec::new();
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

/// Modo "Normal": cambia la velocidad manteniendo el pitch original.
pub fn apply_timestretch(audio: &DecodedAudio, rate: f64) -> Result<Vec<f32>> {
    let mut st = SoundTouch::new();
    st.set_channels(audio.channels as u32)
        .set_sample_rate(audio.sample_rate)
        .set_tempo(rate)
        .set_setting(Setting::UseQuickseek, 1);

    let output = st.generate_audio(&audio.samples);

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