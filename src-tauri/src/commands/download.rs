use reqwest;

#[tauri::command]
pub async fn download_beatmap(
    beatmapset_id: u64,
    token: String,
    osu_session: Option<String>,
    songs_folder: String,
) -> Result<(), String> {
    log::info!("Downloading beatmapset {} from osu!", beatmapset_id);

    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("https://osu.ppy.sh/beatmapsets/{}/download", beatmapset_id);

    // Build cookie header — osu_session is captured from the WebView after
    // the OAuth login, giving us the same authenticated web session the user
    // used in the browser.
    let cookie_header = osu_session
        .as_deref()
        .map(|s| format!("osu_session={}", s))
        .unwrap_or_default();

    let mut req = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("User-Agent", "osu-tools/1.0")
        .header("Referer", format!("https://osu.ppy.sh/beatmapsets/{}", beatmapset_id));

    if !cookie_header.is_empty() {
        req = req.header("Cookie", cookie_header);
    }

    let response = req.send().await.map_err(|e| e.to_string())?;

    log::info!("osu! response status: {}", response.status());

    if !response.status().is_success() {
        return Err(format!("osu! returned status {}", response.status()));
    }

    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    log::info!("osu! Content-Type: {}", content_type);

    if content_type.contains("text/html") {
        return Err("osu! returned HTML — session cookie may be missing".to_string());
    }

    let filename = response
        .headers()
        .get("content-disposition")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| {
            v.split(';').find_map(|part| {
                let part = part.trim();
                if part.starts_with("filename=") {
                    Some(part["filename=".len()..].trim_matches('"').to_string())
                } else {
                    None
                }
            })
        })
        .unwrap_or_else(|| format!("{}.osz", beatmapset_id));

    let filename = filename.replace(['/', '\\', '\0'], "_");
    log::info!("Saving as: {}", filename);

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    if bytes.len() < 4 || bytes[0] != 0x50 || bytes[1] != 0x4B {
        log::error!("Not a valid OSZ: {} bytes, first bytes: {:?}", bytes.len(), &bytes[..bytes.len().min(16)]);
        return Err("osu! response is not a valid OSZ archive".to_string());
    }

    let path = format!("{}/{}", songs_folder, filename);
    std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;

    log::info!("Saved {} bytes to {}", bytes.len(), path);
    Ok(())
}

#[tauri::command]
pub async fn download_beatmap_beatconnect(
    beatmapset_id: u64,
    songs_folder: String,
) -> Result<(), String> {
    log::info!("Downloading beatmapset {} from beatconnect", beatmapset_id);

    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("https://beatconnect.io/b/{}", beatmapset_id);

    let response = client
        .get(&url)
        .header("User-Agent", "osu-tools/1.0")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    log::info!("Beatconnect status: {}", response.status());

    if !response.status().is_success() {
        return Err(format!("beatconnect returned status: {}", response.status()));
    }

    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    log::info!("Content-Type: {}", content_type);

    if content_type.contains("text/html") {
        return Err("beatconnect returned HTML — beatmap may not be available".to_string());
    }

    // Extract filename from Content-Disposition header, fall back to bare ID
    let filename = response
        .headers()
        .get("content-disposition")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| {
            v.split(';').find_map(|part| {
                let part = part.trim();
                if part.starts_with("filename=") {
                    Some(part["filename=".len()..].trim_matches('"').to_string())
                } else {
                    None
                }
            })
        })
        .unwrap_or_else(|| format!("{}.osz", beatmapset_id));

    // Prevent path traversal
    let filename = filename.replace(['/', '\\', '\0'], "_");
    log::info!("Saving as: {}", filename);

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    // OSZ files are ZIP archives — magic bytes must be PK (0x50 0x4B)
    if bytes.len() < 4 || bytes[0] != 0x50 || bytes[1] != 0x4B {
        log::error!("Response is not a valid ZIP/OSZ (got {} bytes, first bytes: {:?})", bytes.len(), &bytes[..bytes.len().min(16)]);
        return Err("Downloaded file is not a valid OSZ archive".to_string());
    }

    let path = format!("{}/{}", songs_folder, filename);
    std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;

    log::info!("Saved {} bytes to {}", bytes.len(), path);
    Ok(())
}