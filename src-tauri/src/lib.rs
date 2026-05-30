// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_shell::ShellExt;

#[tauri::command]
async fn get_osu_path(app: tauri::AppHandle) -> Result<String, String> {
    // check cosu_songsfd
    if let Some(home) = dirs::home_dir() {
        #[cfg(target_os = "windows")]
        let cosu_file = dirs::data_dir()
            .unwrap_or(home.clone())
            .join("cosu_songsfd");
        
        #[cfg(not(target_os = "windows"))]
        let cosu_file = home.join(".cosu_songsfd");

        if cosu_file.exists() {
            if let Ok(path) = std::fs::read_to_string(&cosu_file) {
                let path = path.trim().to_string();
                if !path.is_empty() {
                    return Ok(path);
                }
            }
        }
    }

    // check OSU_SONG_FOLDER env variable
    if let Ok(path) = std::env::var("OSU_SONG_FOLDER") {
        if !path.is_empty() {
            return Ok(path);
        }
    }

    // Try default paths
    #[cfg(target_os = "windows")]
    if let Some(local) = dirs::data_local_dir() {
        let default = local.join("osu!").join("Songs");
        if default.exists() {
            return Ok(default.to_string_lossy().to_string());
        }
    }

    #[cfg(not(target_os = "windows"))]
    if let Some(home) = dirs::home_dir() {
        let candidates = [
            home.join(".local/share/osu/Songs"),
            home.join(".wine/drive_c/users")
                .join(std::env::var("USER").unwrap_or_default())
                .join("AppData/Local/osu!/Songs"),
        ];
        
        for path in &candidates {
            if path.exists() {
                return Ok(path.to_string_lossy().to_string());
            }
        }
    }

    // Try osumem
    let output = app.shell()
        .sidecar("osumem")
        .map_err(|e| e.to_string())?
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    if !stdout.trim().is_empty() {
        return Ok(stdout.trim().to_string());
    }

    Err("osu! folder not found".to_string())
}

#[tauri::command]
fn save_osu_path(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let cosu_file = dirs::data_dir()
        .ok_or("could not find data dir")?
        .join("cosu_songsfd");

    #[cfg(not(target_os = "windows"))]
    let cosu_file = dirs::home_dir()
        .ok_or("could not find home dir")?
        .join(".cosu_songsfd");

    std::fs::write(&cosu_file, path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_osu_path, save_osu_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
