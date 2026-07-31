use std::{fs, path::Path};

use rosu_map::Beatmap;

use crate::commands::trainer::{
    audio_processing, model::{RunTrainerRequest, TrainerTaskParams}, pipeline,
};

#[tauri::command]
pub async fn run_trainer(request: RunTrainerRequest) -> Result<(), String> {
    log::debug!("run_trainer called for {}", request.osu_file_path);

    let original_path = Path::new(&request.osu_file_path);
    let beatmap_folder = original_path.parent()
        .ok_or_else(|| {
            log::error!("run_trainer failed: invalid .osu path {:?}", original_path);
            "Invalid .osu path".to_string()
        })?;

    let mut beatmap = rosu_map::from_path::<Beatmap>(original_path).map_err(|e| {
        log::error!("failed to parse .osu file {:?}: {}", original_path, e);
        e.to_string()
    })?;

    beatmap.hp_drain_rate = request.difficulty.hp as f32;
    beatmap.circle_size = request.difficulty.cs as f32;
    beatmap.overall_difficulty = request.difficulty.od as f32;
    beatmap.approach_rate = request.difficulty.ar as f32;

    pipeline::run(&mut beatmap, &request.tasks).map_err(|e| {
        log::error!("pipeline execution failed: {}", e);
        e.to_string()
    })?;

    let title = format!("{} - {}", beatmap.artist, beatmap.title);

    let base_dir = dirs::home_dir()
        .ok_or_else(|| "could not find home directory".to_string())?
        .join(".osu-trainer");

    let temp_dir = base_dir.join("staging").join(&title);
    let output_dir = base_dir.join("output");

    log::debug!("creating temp directory at {:?}", temp_dir);
    fs::create_dir_all(&temp_dir).map_err(|e| {
        log::error!("failed to create temp directory {:?}: {}", temp_dir, e);
        e.to_string()
    })?;

    fs::create_dir_all(&output_dir).map_err(|e| {
        log::error!("failed to create output directory {:?}: {}", output_dir, e);
        e.to_string()
    })?;

    // Copia TODO el contenido original del beatmapset (demás diffs, audio, background, etc.)
    for entry in fs::read_dir(beatmap_folder).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            let file_name = path.file_name().unwrap();
            let dest = temp_dir.join(file_name);
            fs::copy(&path, &dest).map_err(|e| {
                log::error!("failed to copy {:?} -> {:?}: {}", path, dest, e);
                e.to_string()
            })?;
        }
    }
    log::debug!("copied original beatmapset contents to {:?}", temp_dir);

    // ¿Hay una tarea RateChange? Si la hay, generamos un audio NUEVO (sin tocar el original,
    // que sigue siendo referenciado por las demás dificultades del set).
    let rate_task = request.tasks.iter().find_map(|t| {
        if let TrainerTaskParams::RateChange(params) = &t.task {
            Some(params)
        } else {
            None
        }
    });

    if let Some(params) = rate_task {
        log::debug!("processing audio for rate change: rate={}, nightcore={}", params.rate, params.nightcore);

        let audio_src = beatmap_folder.join(&beatmap.audio_file);
        let decoded = audio_processing::decode_audio(&audio_src).map_err(|e| {
            log::error!("failed to decode audio {:?}: {}", audio_src, e);
            e.to_string()
        })?;

        let (processed_samples, output_sample_rate) = if params.nightcore {
            audio_processing::apply_resample(&decoded, params.rate)
        } else {
            let stretched = audio_processing::apply_timestretch(&decoded, params.rate).map_err(|e| {
                log::error!("timestretch failed: {}", e);
                e.to_string()
            })?;
            (stretched, decoded.sample_rate)
        };

        // Nombre distinto al original, para no pisarlo ni afectar a las demás dificultades del set
        let wav_filename = format!("audio_trainer_{}x.wav", params.rate);
        let wav_path = temp_dir.join(&wav_filename);

        audio_processing::write_wav(&processed_samples, output_sample_rate, decoded.channels as u16, &wav_path)
            .map_err(|e| {
                log::error!("failed to write wav {:?}: {}", wav_path, e);
                e.to_string()
            })?;

        // Solo la NUEVA dificultad apunta al nuevo audio; el resto del set sigue con el original
        beatmap.audio_file = wav_filename;

        log::debug!("audio processing complete: {:?}", wav_path);
    }

    // Escribe la nueva dificultad generada (con audio_file ya actualizado si aplica)
    let output_osu = beatmap.encode_to_string().map_err(|e| {
        log::error!("failed to encode beatmap: {}", e);
        e.to_string()
    })?;

    let new_osu_name = format!(
        "{} - {} ({}) [{} (trainer)].osu",
        beatmap.artist, beatmap.title, beatmap.creator, beatmap.version
    );

    fs::write(temp_dir.join(&new_osu_name), output_osu).map_err(|e| {
        log::error!("failed to write {:?}: {}", temp_dir.join(&new_osu_name), e);
        e.to_string()
    })?;
    log::debug!("wrote new diff: {}", new_osu_name);

    let osz_path = output_dir.join(format!("{}.osz", title));
    log::debug!("creating osz archive at {:?}", osz_path);

    create_osz(&temp_dir, &osz_path).map_err(|e| {
        log::error!("failed to create osz archive {:?}: {}", osz_path, e);
        e
    })?;

    log::debug!("opening osz with default handler: {:?}", osz_path);
    open::that(&osz_path).map_err(|e| {
        log::error!("failed to open .osz: {}", e);
        format!("Failed to open .osz: {}", e)
    })?;

    if let Err(e) = fs::remove_dir_all(&temp_dir) {
        log::warn!("failed to clean up temp directory {:?}: {}", temp_dir, e);
    } else {
        log::debug!("cleaned up temp directory {:?}", temp_dir);
    }

    log::info!("successfully generated trainer map: {}", beatmap.version);

    Ok(())
}

fn create_osz(source_dir: &Path, output_path: &Path) -> Result<(), String> {
    use std::io::{Read, Write};
    use zip::write::SimpleFileOptions;

    let file = fs::File::create(output_path).map_err(|e| e.to_string())?;
    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);

    for entry in fs::read_dir(source_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            let file_name = path.file_name()
                .and_then(|n| n.to_str())
                .ok_or("Invalid file name")?;

            zip.start_file(file_name, options).map_err(|e| e.to_string())?;

            let mut f = fs::File::open(&path).map_err(|e| e.to_string())?;
            let mut buffer = Vec::new();
            f.read_to_end(&mut buffer).map_err(|e| e.to_string())?;
            zip.write_all(&buffer).map_err(|e| e.to_string())?;
        }
    }

    zip.finish().map_err(|e| e.to_string())?;
    Ok(())
}