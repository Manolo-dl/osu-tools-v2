use sqlx::{SqlitePool, prelude::FromRow};
use walkdir::WalkDir;
use crate::OsuState;

#[derive(serde::Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct BeatmapsetFolder {
    pub beatmapset_id: u32,
    pub folder_path: String,
}

async fn resolve_cached_beatmapset_folder(pool: &SqlitePool, beatmapset_id: u32) -> Result<Option<BeatmapsetFolder>, sqlx::Error> {

    // check if the beatmapset folder is already cached
    Ok(
        sqlx::query_as::<_, BeatmapsetFolder>(
            "SELECT beatmapset_id, folder_path FROM beatmapset_folders WHERE beatmapset_id = $1"
        )
        .bind(beatmapset_id)
        .fetch_optional(pool)
        .await?
    )
}

async fn resolve_beatmapset_folder(osu_path: &str, file_name: &str, beatmapset_id: u32) -> Result<BeatmapsetFolder, String> {

    let songs_folder = format!("{}/Songs", osu_path);

    for entry in WalkDir::new(songs_folder).max_depth(2) {

        let entry = entry.map_err(|e| e.to_string())?;
        if entry.file_name().to_string_lossy() == file_name {

            let folder_path = entry.path()
                .parent()
                .ok_or("Could not get parent folder")?
                .to_string_lossy()
                .to_string();

            return Ok(BeatmapsetFolder {
                beatmapset_id,
                folder_path,
            })
        }
    }

    Err(format!("Could not find folder for beatmapset_id {} with file_name {}", beatmapset_id, file_name))
}

async fn save_beatmapset_folder(pool: &SqlitePool, beatmapset_id: u32, folder_path: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO beatmapset_folders (beatmapset_id, folder_path)
            VALUES ($1, $2)
            ON CONFLICT(beatmapset_id) DO UPDATE SET folder_path = $2"
    )
    .bind(beatmapset_id)
    .bind(folder_path)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_beatmapset_folder(
    pool: &SqlitePool,
    osu_path: &str,
    beatmapset_id: u32,
    file_name: &str,
) -> Result<BeatmapsetFolder, String> {
    
    let cached = resolve_cached_beatmapset_folder(pool, beatmapset_id)
    .await
    .map_err(|e| e.to_string())?;

    if let Some(folder) = cached {
        if check_beatmapset_folder_exists(&folder.folder_path)
        .await?
        {
            return Ok(folder);
        }
    }

    let folder = resolve_beatmapset_folder(osu_path, file_name, beatmapset_id)
        .await?;

    save_beatmapset_folder(pool, beatmapset_id, &folder.folder_path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(folder)
}

pub async fn check_beatmapset_folder_exists(folder_path: &str) -> Result<bool, String> {
    Ok(std::path::Path::new(folder_path).exists())
}

#[tauri::command]
pub async fn validate_pack_folder(folder_name: String, osu_state: tauri::State<'_, OsuState>) -> Result<bool, String> {
    
    let osu_path = {
        let path = osu_state.path.lock().unwrap();
        path.as_ref().ok_or("Osu path not set")?.clone()
    };

    let target_path = format!("{}/Songs/Custom-pack_{}", osu_path, sanitize(&folder_name));

    let exist = check_beatmapset_folder_exists(&target_path).await?;

    Ok(!exist)
}

fn sanitize(name: &str) -> String {
    name.chars()
        .map(|c| if "/\\:*?\"<>|".contains(c) { '_' } else { c })
        .collect()
}