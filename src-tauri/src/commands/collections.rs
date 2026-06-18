use osynic_osudb::entity::collection::collectiondb::CollectionDB;
use crate::OsuState;

#[derive(serde::Serialize)]
pub struct OsuCollection {
    pub name: String,
    pub md5s: Vec<String>,
}

#[tauri::command]
pub fn read_osu_collections(state: tauri::State<'_, OsuState>) -> Result<Vec<OsuCollection>, String> {
    
    let osu_path = {
        let path = state.path.lock().unwrap();
        path.as_ref().ok_or("osu! path not set")?.clone()
    };

    let path = std::path::Path::new(&osu_path).join("collection.db");
    let db = CollectionDB::from_file(&path).map_err(|e| e.to_string())?;

    Ok(db.collections
        .into_iter()
        .map(|c| OsuCollection {
            name: c.name.unwrap_or_default(),
            md5s: c.beatmap_hashes.into_iter().flatten().collect(),
        })
        .collect()
    )
}

#[tauri::command]
pub async fn write_text_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content.as_bytes()).map_err(|e| e.to_string())
}
