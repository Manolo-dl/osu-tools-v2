use osynic_osudb::entity::collection::collectiondb::CollectionDB;
use osynic_osudb::entity::osu::osudb::OsuDB;

#[derive(serde::Serialize)]
pub struct OsuBeatmap {
    pub md5: String,
    pub beatmapset_id: u32,
    pub title: String,
    pub artist: String,
}

#[derive(serde::Serialize)]
pub struct OsuCollection {
    pub name: String,
    pub md5s: Vec<String>,
}

#[tauri::command]
pub fn read_osu_collections(osu_path: String) -> Result<Vec<OsuCollection>, String> {
    let path = std::path::Path::new(&osu_path).join("collection.db");
    let db = CollectionDB::from_file(&path).map_err(|e| e.to_string())?;

    let result: Vec<OsuCollection> = db
        .collections
        .into_iter()
        .map(|c| OsuCollection {
            name: c.name.unwrap_or_default(),
            md5s: c.beatmap_hashes.into_iter().flatten().collect(),
        })
        .collect();

    if let Some(first) = result.first() {
        log::info!(
            "First collection: {} with {} maps",
            first.name,
            first.md5s.len()
        );
        if let Some(first_md5) = first.md5s.first() {
            log::info!("First MD5 from collection: {}", first_md5);
        }
    }

    Ok(result)
}

#[tauri::command]
pub fn read_osu_db(osu_path: String) -> Result<Vec<OsuBeatmap>, String> {
    let path = std::path::Path::new(&osu_path).join("osu!.db");
    let db = OsuDB::from_file(&path).map_err(|e| e.to_string())?;

    let result: Vec<OsuBeatmap> = db
        .beatmaps
        .into_iter()
        .filter_map(|b| {
            let md5 = b.hash?;
            if b.beatmapset_id < 0 {
                return None;
            }
            Some(OsuBeatmap {
                md5,
                beatmapset_id: b.beatmapset_id as u32,
                title: b.title_ascii.unwrap_or_default(),
                artist: b.artist_ascii.unwrap_or_default(),
            })
        })
        .collect();

    if let Some(first) = result.first() {
        log::info!("First MD5 from osu!.db: {}", first.md5);
        log::info!("First beatmapset_id: {}", first.beatmapset_id);
    }

    Ok(result)
}

#[tauri::command]
pub async fn write_text_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content.as_bytes()).map_err(|e| e.to_string())
}
