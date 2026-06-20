use sqlx::{SqlitePool, prelude::FromRow};
use walkdir::WalkDir;
use crate::OsuState;
use crate::DbState;

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

async fn resolve_beatmapset_folder(osu_path: String, file_name: String, beatmapset_id: u32) -> Result<BeatmapsetFolder, String> {

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
    db_state: tauri::State<'_, DbState>,
    osu_state: tauri::State<'_, OsuState>,
    beatmapset_id: u32,
    file_name: String,
) -> Result<BeatmapsetFolder, String> {

    let pool = &db_state.pool;
    
    let cached = resolve_cached_beatmapset_folder(pool, beatmapset_id)
    .await
    .map_err(|e| e.to_string())?;

    if let Some(folder) = cached {
        return Ok(folder);
    }

    let osu_path = {
        let path = osu_state.path.lock().unwrap();
        path.as_ref().ok_or("Osu! path not set")?.clone()
    };

    let folder = resolve_beatmapset_folder(osu_path, file_name, beatmapset_id)
        .await?;

    save_beatmapset_folder(pool, beatmapset_id, &folder.folder_path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(folder)
}