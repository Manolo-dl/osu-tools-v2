use reqwest;

#[tauri::command]
pub async fn download_beatmap(
    beatmapset_id: u64,
    token: String,
    songs_folder: String,
) -> Result<(), String> {
    log::info!("Downloading beatmapset {} from osu!", beatmapset_id);

    let client = reqwest::Client::builder()
        .cookie_store(true)
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!(
        "https://osu.ppy.sh/beatmapsets/{}/download",
        beatmapset_id
    );

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("User-Agent", "osu-tools/1.0")
        .header("Referer", format!("https://osu.ppy.sh/beatmapsets/{}", beatmapset_id))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    log::info!("Response status: {}", response.status());
    log::info!("Content-Type: {:?}", response.headers().get("content-type"));

    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    if content_type.contains("text/html") {
        return Err("osu! returned HTML instead of osz - falling back to beatconnect".to_string());
    }

    if !response.status().is_success() {
        return Err(format!("osu! returned status: {}", response.status()));
    }

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let path = format!("{}/{}.osz", songs_folder, beatmapset_id);
    std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;

    log::info!("Saved to {}", path);
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

    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    log::info!("Content-Type: {}", content_type);

    if content_type.contains("text/html") {
        return Err("beatconnect returned HTML instead of osz".to_string());
    }

    if !response.status().is_success() {
        return Err(format!("beatconnect returned status: {}", response.status()));
    }

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let path = format!("{}/{}.osz", songs_folder, beatmapset_id);
    std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;

    log::info!("Saved {} bytes to {}", bytes.len(), path);
    Ok(())
}