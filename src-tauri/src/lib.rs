// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_shell::ShellExt;
use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
async fn get_osu_path(app: tauri::AppHandle) -> Result<String, String> {
    log::info!("Getting osu! path");

    // check cosu_songsfd
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
    // check OSU_SONG_FOLDER env variable
    if let Ok(path) = std::env::var("OSU_SONG_FOLDER") {
        if !path.is_empty() {
            return Ok(path);
        }
    }

    log::info!("checking default paths");
    // Try default paths
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

    log::error!("osu! folder not found");
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

#[tauri::command]
async fn start_oauth(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    use tiny_http::{Server, Response};
    
    let client_id = env!("OSU_CLIENT_ID");
    let client_secret = env!("OSU_CLIENT_SECRET");
    let redirect_uri = "http://localhost:7878/callback";
    
    // open browser to osu! OAuth page
    let auth_url = format!(
        "https://osu.ppy.sh/oauth/authorize?client_id={}&redirect_uri={}&response_type=code&scope=public+identify",
        client_id,
        urlencoding::encode(redirect_uri)
    );
    
    log::info!("Opening OAuth URL: {}", auth_url);
    app.opener().open_url(&auth_url, None::<&str>)
        .map_err(|e| e.to_string())?;
    
    // start local server to catch callback
    let server = Server::http("127.0.0.1:7878")
        .map_err(|e| e.to_string())?;
    
    log::info!("Waiting for OAuth callback on port 7878...");
    
    let code = tokio::task::spawn_blocking(move || {
        for request in server.incoming_requests() {
            let url = request.url().to_string();
            log::info!("Received callback: {}", url);
            
            // send response to close browser tab
            let response = Response::from_string(
                "<html><body><h2>Login successful! You can close this tab.</h2></body></html>"
            ).with_header(
                "Content-Type: text/html".parse::<tiny_http::Header>().unwrap()
            );
            let _ = request.respond(response);
            
            // extract code from URL
            if let Some(query) = url.split('?').nth(1) {
                for param in query.split('&') {
                    if let Some(code) = param.strip_prefix("code=") {
                        return Ok(code.to_string());
                    }
                }
            }
        }
        Err("No callback received".to_string())
    }).await.map_err(|e| e.to_string())??;
    
    log::info!("Got OAuth code, exchanging for token...");
    
    // exchange code for token
    let client = reqwest::Client::new();
    let token_response = client
        .post("https://osu.ppy.sh/oauth/token")
        .json(&serde_json::json!({
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;
    
    log::info!("Got token response");
    
    let access_token = token_response["access_token"]
        .as_str()
        .ok_or("No access token")?
        .to_string();
    
    let refresh_token = token_response["refresh_token"]
        .as_str()
        .ok_or("No refresh token")?
        .to_string();
    
    let expires_in = token_response["expires_in"]
        .as_u64()
        .unwrap_or(86400);
    
    let expires_at = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64 + (expires_in * 1000);
    
    // fetch user profile
    let user = client
        .get("https://osu.ppy.sh/api/v2/me")
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;
    
    log::info!("Got user profile: {}", user["username"].as_str().unwrap_or("unknown"));
    
    Ok(serde_json::json!({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": expires_at,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "avatar_url": user["avatar_url"],
        }
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::Webview),
        ])
        .build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_osu_path, save_osu_path, start_oauth])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
