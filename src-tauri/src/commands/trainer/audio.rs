use std::{fs::File, path::Path};

use anyhow::Result;
use hound::{WavSpec, WavWriter};
use symphonia::core::{
    codecs::{CodecParameters, audio::AudioDecoderOptions}, formats::{FormatOptions, probe::Hint}, io::MediaSourceStream, meta::MetadataOptions,
};
use timestretch::StretchParams;

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

    loop {
        let packet = match format.next_packet()? {
            Some(packet) => packet,
            None => break,
        };

        if packet.track_id != track_id {
            continue;
        }

        match decoder.decode(&packet) {
            Ok(decoded) => {
                decoded.copy_to_vec_interleaved::<f32>(&mut samples);
            }
            Err(_) => continue,
        }
    }

    Ok(DecodedAudio {
        samples,
        sample_rate,
        channels,
    })
}

pub fn apply_timestretch(
    audio: &DecodedAudio,
    rate: f64,
) -> Result<Vec<f32>> {

    let stretch_ratio = 1.0 / rate;

    let params = StretchParams::new(stretch_ratio)
        .with_sample_rate(audio.sample_rate)
        .with_channels(audio.channels as u32);

    let ouput = timestretch::stretch(&audio.samples, &params)
        .map_err(|e| anyhow::anyhow!("timestretch failed: {:?}", e))?;

    Ok(ouput)
}

pub fn write_wav(
    samples: &[f32],
    sample_rate: u32,
    channels: u16,
    output_path: &Path,
) -> Result<()> {
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