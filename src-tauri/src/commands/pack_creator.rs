use std::path::Path;
use rosu_map::Beatmap;
use crate::{DbState, OsuState, commands::manage_folders::get_beatmapset_folder};


#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SelectedDiff {
    pub beatmapset_id: u32,
    pub file_name: String,
    pub audio: String,
    pub new_diff_name: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePackRequest {
    pub set_title: String,
    pub final_creator: String,
    pub diffs: Vec<SelectedDiff>,
}

#[tauri::command]
pub async fn create_pack(
    request: CreatePackRequest,
    db_state: tauri::State<'_, DbState>,
    osu_state: tauri::State<'_, OsuState>,
) -> Result<(), String> {
    
    let pool = &db_state.pool;

    let osu_path = {
        let path = osu_state.path.lock().unwrap();
        path.as_ref().ok_or("Osu path not set")?.clone()
    };

    let songs_folder = format!("{}/Songs", osu_path);
    let new_folder = format!("{}/Custom-pack_{}", songs_folder, sanitize(&request.set_title));
    std::fs::create_dir_all(&new_folder).map_err(|e| e.to_string())?;

    for (index, diff) in request.diffs.iter().enumerate() {
        let folder = get_beatmapset_folder(pool, &osu_path, diff.beatmapset_id, &diff.file_name).await?;
        let osu_file_path = Path::new(&folder.folder_path).join(&diff.file_name);

        let mut map: Beatmap = rosu_map::from_path(osu_file_path)
            .map_err(|e| format!("Failed to parse {}: {}", diff.file_name, e))?;


        // Audio file
        let audio_extension = diff.audio.rsplit('.').next().unwrap_or("mp3");
        let new_audio_file_name = format!("{}-{}.{}", "audio", index + 1, audio_extension);
        let audio_source = Path::new(&folder.folder_path).join(&diff.audio);
        let audio_destination = Path::new(&new_folder).join(&new_audio_file_name);

        if audio_source.exists() {
            std::fs::copy(&audio_source, &audio_destination).map_err(|e| e.to_string())?;
        }

        // Update beatmap properties
        map.title = request.set_title.clone();
        map.title_unicode = request.set_title.clone();
        map.creator = request.final_creator.clone();
        map.version = diff.new_diff_name.clone();
        map.audio_file = new_audio_file_name;
        map.beatmap_id = -1;
        map.beatmap_set_id = -1;

        let new_osu_name = format!("{}.osu", sanitize(&diff.new_diff_name));
        map.encode_to_path(Path::new(&new_folder).join(&new_osu_name))
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

fn sanitize(name: &str) -> String {
    name.chars()
        .map(|c| if "/\\:*?\"<>|".contains(c) { '_' } else { c })
        .collect()
}


