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
        })?
        .to_path_buf();

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

    // El .osz se crea como hermano de la carpeta del mapa, o sea dentro de Songs,
    // igual que cosu-trainer (`zipf = "<folderpath>.osz"`). Solo lleva la diff
    // nueva y el audio nuevo: osu! lo fusiona con el set existente al importar,
    // así que el background, el vídeo y las demás diffs siguen donde estaban.
    let songs_dir = beatmap_folder
        .parent()
        .ok_or_else(|| "beatmap folder has no parent (Songs) directory".to_string())?;

    let mut osz_name = beatmap_folder
        .file_name()
        .ok_or_else(|| "beatmap folder has no name".to_string())?
        .to_os_string();
    osz_name.push(".osz");

    let osz_path = songs_dir.join(osz_name);

    // ¿Hay una tarea RateChange? Si la hay, procesamos el audio en un hilo bloqueante dedicado,
    // para no congelar el runtime de tokio (y con él, el listener del WebSocket de tosu).
    let rate_task = request.tasks.iter().find_map(|t| {
        if let TrainerTaskParams::RateChange(params) = &t.task {
            Some(params.clone())
        } else {
            None
        }
    });

    let mut audio_entry: Option<(String, Vec<u8>)> = None;

    if let Some(params) = rate_task {
        log::debug!("processing audio for rate change: rate={}, adjust_pitch={}", params.rate, params.adjust_pitch);

        let audio_src = beatmap_folder.join(&beatmap.audio_file);
        let rate = params.rate;
        let adjust_pitch = params.adjust_pitch;

        let (processed_samples, output_sample_rate, channels) = tokio::task::spawn_blocking(move || {
            let decoded = audio_processing::decode_audio(&audio_src)?;

            let (samples, sample_rate) = if adjust_pitch {
                let stretched = audio_processing::apply_timestretch(&decoded, rate)?;
                (stretched, decoded.sample_rate)
            } else {
                audio_processing::apply_resample(&decoded, rate)
            };

            Ok::<_, anyhow::Error>((samples, sample_rate, decoded.channels))
        })
        .await
        .map_err(|e| {
            log::error!("audio processing task panicked: {}", e);
            format!("audio processing task panicked: {}", e)
        })?
        .map_err(|e| {
            log::error!("audio processing failed: {}", e);
            e.to_string()
        })?;

        let wav_filename = format!("audio_trainer_{}x.wav", rate);

        let wav_bytes =
            audio_processing::encode_wav(&processed_samples, output_sample_rate, channels as u16)
                .map_err(|e| {
                    log::error!("failed to encode wav: {}", e);
                    e.to_string()
                })?;

        log::debug!("audio processing complete: {} ({} bytes)", wav_filename, wav_bytes.len());

        beatmap.audio_file = wav_filename.clone();
        audio_entry = Some((wav_filename, wav_bytes));
    }

    // Escribe la nueva dificultad generada (con audio_file ya actualizado si aplica)
    let output_osu = beatmap.encode_to_string().map_err(|e| {
        log::error!("failed to encode beatmap: {}", e);
        e.to_string()
    })?;

    let output_osu = restore_beatmap_set_id(output_osu, beatmap.beatmap_set_id);

    let new_osu_name = format!(
        "{} - {} ({}) [{} (trainer)].osu",
        beatmap.artist, beatmap.title, beatmap.creator, beatmap.version
    );

    log::debug!("creating osz archive at {:?}", osz_path);
    write_osz(&osz_path, audio_entry.as_ref(), &new_osu_name, &output_osu).map_err(|e| {
        log::error!("failed to create osz archive {:?}: {}", osz_path, e);
        e
    })?;

    log::debug!("opening osz with default handler: {:?}", osz_path);
    open::that(&osz_path).map_err(|e| {
        log::error!("failed to open .osz: {}", e);
        format!("Failed to open .osz: {}", e)
    })?;

    log::info!("successfully generated trainer map: {}", beatmap.version);

    Ok(())
}

/// rosu-map parsea `BeatmapSetID`/`BeatmapID` pero su encoder no los vuelve a
/// escribir: `encode_metadata` solo emite Title, Artist, Creator, Version,
/// Source y Tags. Sin `BeatmapSetID` osu! no puede emparejar el .osz con el set
/// ya instalado y lo importaría como set nuevo (sin background ni demás diffs),
/// que es justo lo que queremos evitar con un .osz mínimo.
///
/// `BeatmapID` se deja fuera a propósito, igual que hace cosu-trainer, para que
/// la diff generada no colisione con la original.
fn restore_beatmap_set_id(osu: String, set_id: i32) -> String {
    const HEADER: &str = "[Metadata]\n";

    if set_id <= 0 {
        log::warn!(
            "beatmap has no valid BeatmapSetID ({}); osu! will import the .osz as a new set",
            set_id
        );
        return osu;
    }

    match osu.find(HEADER) {
        Some(idx) => {
            let at = idx + HEADER.len();
            let mut out = String::with_capacity(osu.len() + 32);
            out.push_str(&osu[..at]);
            out.push_str(&format!("BeatmapSetID: {}\n", set_id));
            out.push_str(&osu[at..]);
            out
        }
        None => {
            log::warn!("no [Metadata] section in encoded beatmap, cannot restore BeatmapSetID");
            osu
        }
    }
}

/// Escribe el .osz directamente desde memoria: sin staging y sin copiar el set.
fn write_osz(
    output_path: &Path,
    audio: Option<&(String, Vec<u8>)>,
    osu_name: &str,
    osu_content: &str,
) -> Result<(), String> {
    use std::io::Write;
    use zip::write::SimpleFileOptions;

    let file = fs::File::create(output_path).map_err(|e| e.to_string())?;
    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);

    if let Some((audio_name, audio_bytes)) = audio {
        zip.start_file(audio_name, options).map_err(|e| e.to_string())?;
        zip.write_all(audio_bytes).map_err(|e| e.to_string())?;
    }

    zip.start_file(osu_name, options).map_err(|e| e.to_string())?;
    zip.write_all(osu_content.as_bytes()).map_err(|e| e.to_string())?;

    zip.finish().map_err(|e| e.to_string())?;
    Ok(())
}