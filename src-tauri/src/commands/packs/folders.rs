use crate::OsuState;
use crate::commands::osu_db::folders::check_beatmapset_folder_exists;

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