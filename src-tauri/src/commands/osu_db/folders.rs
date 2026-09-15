use sqlx::{SqlitePool, prelude::FromRow};

#[derive(FromRow)]
pub struct BeatmapsetFolder {
    pub folder_path: String,
}

async fn resolve_cached_beatmapset_folder(pool: &SqlitePool, folder_name: &str) -> Result<Option<BeatmapsetFolder>, sqlx::Error> {
    Ok(
        sqlx::query_as::<_, BeatmapsetFolder>(
            "SELECT folder_path FROM beatmapset_folders WHERE folder_name = $1"
        )
        .bind(folder_name)
        .fetch_optional(pool)
        .await?
    )
}

async fn save_beatmapset_folder(pool: &SqlitePool, folder_name: &str, folder_path: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO beatmapset_folders (folder_name, folder_path)
            VALUES ($1, $2)
            ON CONFLICT(folder_name) DO UPDATE SET folder_path = $2"
    )
    .bind(folder_name)
    .bind(folder_path)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_beatmapset_folder(
    pool: &SqlitePool,
    osu_path: &str,
    folder_name: &str,
) -> Result<BeatmapsetFolder, String> {

    let cached = resolve_cached_beatmapset_folder(pool, folder_name)
        .await
        .map_err(|e| e.to_string())?;

    if let Some(folder) = cached {
        if check_beatmapset_folder_exists(&folder.folder_path).await? {
            return Ok(folder);
        }
    }

    // Construcción directa, sin WalkDir: folder_name ya viene del osu!.db
    let folder_path = format!("{}/Songs/{}", osu_path, folder_name);

    if !check_beatmapset_folder_exists(&folder_path).await? {
        return Err(format!("Folder does not exist: {}", folder_path));
    }

    save_beatmapset_folder(pool, folder_name, &folder_path)
        .await
        .map_err(|e| e.to_string())?;

    Ok(BeatmapsetFolder { folder_path })
}

pub async fn check_beatmapset_folder_exists(folder_path: &str) -> Result<bool, String> {
    Ok(std::path::Path::new(folder_path).exists())
}