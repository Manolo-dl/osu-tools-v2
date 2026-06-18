use reqwest::Client;
use std::sync::atomic::AtomicBool;
use futures_util::StreamExt;
use tauri::Emitter;
use std::sync::atomic::Ordering;
use crate::{OsuState, DownloadState};

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DownloadProgress {
    pub beatmap_set_id: u64,
    pub progress: f64,
    pub status: String,
}

#[tauri::command]
pub async fn start_downloads(
    app: tauri::AppHandle,
    osu_state: tauri::State<'_, OsuState>,
    dl_state: tauri::State<'_, DownloadState>,
    beatmap_set_ids: Vec<u64>,
    osu_session: String,
) -> Result<(), String> {

    let osu_path = {
        let path = osu_state.path.lock().unwrap();
        path.as_ref().ok_or("osu! path not set")?.clone()
    };

    let songs_folder = format!("{}/Songs", osu_path);
    if !std::path::Path::new(&songs_folder).exists() {
        return Err(format!("Songs folder not found: {}", songs_folder));
    }

    dl_state.cancelled.store(false, Ordering::Relaxed);
    let client = Client::new();

    for id in beatmap_set_ids {
        if dl_state.cancelled.load(Ordering::Relaxed) {
            break;
        }

        app.emit("download:progress", DownloadProgress {
            beatmap_set_id: id,
            progress: 0.0,
            status: "downloading".to_string(),
        }).ok();

        match download_beatmap(&app, &client, id, &osu_session, &songs_folder, &dl_state.cancelled).await {
            Ok(_) => {
                app.emit("download:progress", DownloadProgress {
                    beatmap_set_id: id,
                    progress: 100.0,
                    status: "done".to_string(),
                }).ok();
            }
            Err(e) => {
                log::error!("Failed to download {}: {}", id, e);
                app.emit("download:progress", DownloadProgress {
                    beatmap_set_id: id,
                    progress: 0.0,
                    status: "failed".to_string(),
                }).ok();
            }
        }

        tokio::time::sleep(std::time::Duration::from_millis(300)).await;
    }

    Ok(())
}

#[tauri::command]
pub async fn cancel_downloads(dl_state: tauri::State<'_, DownloadState>) -> Result<(), String> {
    dl_state.cancelled.store(true, Ordering::Relaxed);
    Ok(())
}

async fn download_beatmap(
    app: &tauri::AppHandle,
    client: &Client,
    beatmap_set_id: u64,
    osu_session: &str,
    songs_folder: &str,
    cancelled: &AtomicBool,
) -> Result<(), String> {

    let response = client
        .get(format!("https://osu.ppy.sh/beatmapsets/{}/download", beatmap_set_id))
        .header("Cookie", format!("osu_session={}", osu_session))
        .header("Referer", format!("https://osu.ppy.sh/beatmapsets/{}", beatmap_set_id))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("HTTP {}", response.status()));
    }

    let total = response.content_length().unwrap_or(0);
    let disposition = response.headers()
        .get("content-disposition")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    let filename = extract_filename(&disposition, beatmap_set_id);
    let path = format!("{}/{}", songs_folder, filename);

    let mut downloaded: u64 = 0;
    let mut bytes = Vec::new();
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        if cancelled.load(Ordering::Relaxed) {
            return Err("cancelled".to_string());
        }
        let chunk = chunk.map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        bytes.extend_from_slice(&chunk);

        if total > 0 {
            let progress = (downloaded as f64 / total as f64) * 100.0;
            app.emit("download:progress", DownloadProgress {
                beatmap_set_id,
                progress,
                status: "downloading".to_string(),
            }).ok();
        }
    }

    const MAX_SIZE: usize = 200 * 1024 * 1024;
    if bytes.len() > MAX_SIZE {
        return Err(format!("Beatmap set {} is too large", beatmap_set_id));
    }

    std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;

    Ok(())
}

fn extract_filename(disposition: &str, beatmap_set_id: u64) -> String {
    let re = regex::Regex::new(r#"filename="?([^";\n]+)"?"#).unwrap();
    if let Some(cap) = re.captures(disposition) {
        let name = cap[1].to_string();
        return name.replace(['/', '\\', '\0'], "_");
    }
    format!("{}.osz", beatmap_set_id)
}

#[tauri::command]
pub async fn append_text_file(path: String, content: String) -> Result<(), String> {
    use std::io::Write;
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;

    file.write_all(content.as_bytes()).map_err(|e| e.to_string())
}
