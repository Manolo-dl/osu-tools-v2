#[tauri::command]
pub async fn download_beatmap(
    beatmapset_id: u64,
    token: String,
    songs_folder: String,
) -> Result<(), String> {
    log::info!("Downloading beatmapset {} from osu!", beatmapset_id);

    let client = reqwest::Client::new();
    let url = format!(
        "https://osu.ppy.sh/beatmapsets/{}/download",
        beatmapset_id
    );

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("User-Agent", "osu-tools")
        .send()
        .await
        .map_err(|e| e.to_string())?;

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
    log::info!(
        "Downloading beatmapset {} from beatconnect",
        beatmapset_id
    );

    let client = reqwest::Client::new();
    let url = format!("https://beatconnect.io/b/{}", beatmapset_id);

    let response = client
        .get(&url)
        .header("User-Agent", "osu-tools")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!(
            "beatconnect returned status: {}",
            response.status()
        ));
    }

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let path = format!("{}/{}.osz", songs_folder, beatmapset_id);
    std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;

    log::info!("Saved to {}", path);
    Ok(())
}