#[tauri::command]
pub async fn get_osu_path(#[allow(unused_variables)] app: tauri::AppHandle) -> Result<String, String> {
    log::info!("Getting osu! path");

    if let Some(home) = dirs::home_dir() {
        log::info!("home dir: {:?}", home);

        #[cfg(target_os = "windows")]
        let cosu_file = dirs::data_dir()
            .unwrap_or(home.clone())
            .join("cosu_songsfd");

        #[cfg(not(target_os = "windows"))]
        let cosu_file = home.join(".cosu_songsfd");
        log::info!("checking cosu_songsfd at {:?}", cosu_file);

        if cosu_file.exists() {
            log::info!("found cosu_songsfd, reading...");
            if let Ok(path) = std::fs::read_to_string(&cosu_file) {
                let path = path.trim().to_string();
                if !path.is_empty() {
                    return Ok(path);
                }
            }
        } else {
            log::info!("cosu_songsfd not found");
        }
    }

    log::info!("checking OSU_SONG_FOLDER env variable");
    if let Ok(path) = std::env::var("OSU_SONG_FOLDER") {
        if !path.is_empty() {
            return Ok(path);
        }
    }

    log::info!("checking default paths");
    #[cfg(target_os = "windows")]
    if let Some(local) = dirs::data_local_dir() {
        let osu_dir = local.join("osu!");
        if osu_dir.join("Songs").exists() {
            return Ok(osu_dir.to_string_lossy().to_string());
        }
    }

    #[cfg(not(target_os = "windows"))]
    if let Some(home) = dirs::home_dir() {
        let candidates = [
            home.join(".local/share/osu"),
            home.join(".wine/drive_c/users")
                .join(std::env::var("USER").unwrap_or_default())
                .join("AppData/Local/osu!"),
        ];
        for path in &candidates {
            log::info!("checking path: {:?}", path);
            if path.join("Songs").exists() {
                return Ok(path.to_string_lossy().to_string());
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        use tauri_plugin_shell::ShellExt;

        log::info!("checking osumem");
        let sidecar = app.shell()
            .sidecar("osumem")
            .map_err(|e| { log::error!("sidecar error: {}", e); e.to_string() })?;

        let (mut rx, child) = sidecar.spawn()
            .map_err(|e| { log::error!("osumem spawn error: {}", e); e.to_string() })?;

        let found = tokio::time::timeout(std::time::Duration::from_secs(10), async {
            while let Some(event) = rx.recv().await {
                let bytes = match event {
                    tauri_plugin_shell::process::CommandEvent::Stdout(b) => b,
                    tauri_plugin_shell::process::CommandEvent::Stderr(b) => b,
                    _ => continue,
                };
                let text = String::from_utf8_lossy(&bytes);
                for line in text.lines() {
                    log::info!("osumem: {}", line);
                    if let Some(songs_path) = line.strip_prefix("Found Song folder: ") {
                        let osu_dir = std::path::Path::new(songs_path.trim())
                            .parent()
                            .map(|p| p.to_string_lossy().to_string());
                        return osu_dir;
                    }
                }
            }
            None
        }).await;

        let _ = child.kill();

        match found {
            Ok(Some(path)) if !path.is_empty() => return Ok(path),
            Ok(_) => log::warn!("osumem did not output a song folder path"),
            Err(_) => log::warn!("osumem timed out after 10s"),
        }
    }

    log::error!("osu! folder not found");
    Err("osu! folder not found".to_string())
}

#[tauri::command]
pub fn save_osu_path(path: String) -> Result<(), String> {
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