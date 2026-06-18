use std::collections::HashMap;
use sqlx::{FromRow, SqlitePool};
use crate::commands::osu_db::{OsuBeatmapSet, OsuDiff};

#[derive(FromRow)]
pub struct OsuDbMeta {
    pub last_modified: i64,
    pub file_size: i64,
}

#[derive(FromRow)]
struct BeatmapSetRow {
    pub beatmapset_id: i64,
    pub title: String,
    pub artist: String,
    pub status: String,
}

#[derive(FromRow)]
struct DiffRow {
    pub beatmapset_id: i64,
    pub md5: String,
    pub diff_name: String,
    pub mode: i64,
    pub length: i64,
    pub stars: f64,
    pub last_played: i64,
    pub circle_size: f64,
    pub approach_rate: f64,
    pub hp_drain: f64,
    pub overall_difficulty: f64,
}

pub async fn get_meta(pool: &SqlitePool) -> Option<OsuDbMeta> {
    sqlx::query_as::<_, OsuDbMeta>(
        "SELECT last_modified, file_size FROM osudb_meta WHERE id = 1"
    )
    .fetch_optional(pool)
    .await
    .ok()
    .flatten()
}

pub async fn set_meta(pool: &SqlitePool, last_modified: i64, file_size: i64) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO osudb_meta (id, last_modified, file_size)
         VALUES (1, $1, $2)
         ON CONFLICT(id) DO UPDATE SET last_modified = $1, file_size = $2"
    )
    .bind(last_modified)
    .bind(file_size)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_beatmapsets(pool: &SqlitePool) -> Result<Vec<OsuBeatmapSet>, sqlx::Error> {
    let sets = sqlx::query_as::<_, BeatmapSetRow>(
        "SELECT beatmapset_id, title, artist, status FROM beatmapsets"
    )
    .fetch_all(pool)
    .await?;

    let all_diffs = sqlx::query_as::<_, DiffRow>(
        "SELECT beatmapset_id, md5, diff_name, mode, length, stars, last_played,
         circle_size, approach_rate, hp_drain, overall_difficulty FROM diffs"
    )
    .fetch_all(pool)
    .await?;

    let mut diffs_by_set: HashMap<i64, Vec<OsuDiff>> = HashMap::new();
    for d in all_diffs {
        diffs_by_set.entry(d.beatmapset_id).or_default().push(OsuDiff {
            md5: d.md5,
            diff_name: d.diff_name,
            mode: d.mode as u8,
            bpm: 0.0,
            length: d.length as u32,
            stars: d.stars,
            last_played: d.last_played != 0,
            circle_size: d.circle_size as f32,
            approach_rate: d.approach_rate as f32,
            hp_drain: d.hp_drain as f32,
            overall_difficulty: d.overall_difficulty as f32,
        });
    }

    let result = sets.into_iter().map(|set| OsuBeatmapSet {
        beatmapset_id: set.beatmapset_id as u32,
        title: set.title,
        artist: set.artist,
        status: set.status,
        diffs: diffs_by_set.remove(&set.beatmapset_id).unwrap_or_default(),
    }).collect();

    Ok(result)
}

pub async fn save_beatmapsets(pool: &SqlitePool, sets: &[OsuBeatmapSet]) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;

    sqlx::query("DELETE FROM diffs").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM beatmapsets").execute(&mut *tx).await?;

    for set in sets {
        sqlx::query(
            "INSERT INTO beatmapsets (beatmapset_id, title, artist, status)
             VALUES ($1, $2, $3, $4)"
        )
        .bind(set.beatmapset_id as i64)
        .bind(&set.title)
        .bind(&set.artist)
        .bind(&set.status)
        .execute(&mut *tx)
        .await?;

        for diff in &set.diffs {
            sqlx::query(
                "INSERT INTO diffs (md5, beatmapset_id, diff_name, mode, length, stars,
                 last_played, circle_size, approach_rate, hp_drain, overall_difficulty)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)"
            )
            .bind(&diff.md5)
            .bind(set.beatmapset_id as i64)
            .bind(&diff.diff_name)
            .bind(diff.mode as i64)
            .bind(diff.length as i64)
            .bind(diff.stars)
            .bind(diff.last_played as i64)
            .bind(diff.circle_size as f64)
            .bind(diff.approach_rate as f64)
            .bind(diff.hp_drain as f64)
            .bind(diff.overall_difficulty as f64)
            .execute(&mut *tx)
            .await?;
        }
    }

    tx.commit().await?;
    Ok(())
}

pub async fn init_schema(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS osudb_meta (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            last_modified INTEGER NOT NULL,
            file_size INTEGER NOT NULL
        )"
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS beatmapsets (
            beatmapset_id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            status TEXT NOT NULL
        )"
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS diffs (
            md5 TEXT PRIMARY KEY,
            beatmapset_id INTEGER NOT NULL,
            diff_name TEXT NOT NULL,
            mode INTEGER NOT NULL,
            length INTEGER NOT NULL,
            stars REAL NOT NULL,
            last_played INTEGER NOT NULL,
            circle_size REAL NOT NULL,
            approach_rate REAL NOT NULL,
            hp_drain REAL NOT NULL,
            overall_difficulty REAL NOT NULL,
            FOREIGN KEY (beatmapset_id) REFERENCES beatmapsets(beatmapset_id)
        )"
    )
    .execute(pool)
    .await?;

    Ok(())
}