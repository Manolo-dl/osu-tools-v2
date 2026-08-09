use reqwest::Client;
use futures_util::{StreamExt, stream};
use tauri::{Emitter, Manager};

use crate::AppConfigState;

const MAX_SIZE: u64 = 200 * 1024 * 1024; // 200 MB
const DELAY_BETWEEN_DOWNLOADS_MS: u64 = 1000; // 1 second - recommended from the osu API documentation

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
    beatmap_set_ids: Vec<u64>,
) -> Result<(), String> {

    // Get the osu! path and downloader configuration from the app state
    let config_state = app.state::<AppConfigState>();
    let (osu_path, downloader_config) = {
        let config = config_state.config.lock().unwrap();
        (
            config.osu_path.clone().ok_or("osu! path not set")?,
            config.downloader.clone(),
        )
    };

    let osu_session = downloader_config
        .osu_session
        .clone()
        .ok_or("osu_session not set in configuration")?;

    let songs_folder = downloader_config
        .output_path
        .clone()
        .unwrap_or_else(|| format!("{}/Songs", osu_path));

    if !std::path::Path::new(&songs_folder).exists() {
        log::error!("Output folder not found: {}", songs_folder);
        return Err(format!("Output folder not found: {}", songs_folder));
    }

    let client = Client::new();
    let max_concurrent = downloader_config.max_concurrent_downloads.max(1) as usize;

    let results: Vec<(u64, Result<(), String>)> = stream::iter(beatmap_set_ids)
        .map(|id| {
            let app = app.clone();
            let client = client.clone();
            let osu_session = osu_session.clone();
            let songs_folder = songs_folder.clone();
            let skip_video = downloader_config.skip_video;

            async move {
                app.emit("download:progress", DownloadProgress {
                    beatmap_set_id: id,
                    progress: 0.0,
                    status: "downloading".to_string(),
                }).ok();

                tokio::time::sleep(std::time::Duration::from_millis(DELAY_BETWEEN_DOWNLOADS_MS)).await;

                let result = download_beatmap(&app, &client, id, &osu_session, &songs_folder, skip_video).await;

                match &result {
                    Ok(_) => {
                        app.emit("download:progress", DownloadProgress {
                            beatmap_set_id: id,
                            progress: 100.0,
                            status: "done".to_string(),
                        }).ok();
                    }
                    Err(e) => {
                        log::warn!("Beatmap {} marked as failed: {}", id, e);
                        app.emit("download:progress", DownloadProgress {
                            beatmap_set_id: id,
                            progress: 0.0,
                            status: "failed".to_string(),
                        }).ok();
                    }
                }

                (id, result)
            }
        })
        .buffer_unordered(max_concurrent)
        .collect()
        .await;

    let failed_ids: Vec<u64> = results.iter()
        .filter_map(|(id, r)| r.as_ref().err().map(|_| *id))
        .collect();

    if downloader_config.error_file && !failed_ids.is_empty() {
        let error_file_path = format!("{}/failed_downloads.txt", songs_folder);
        let content = failed_ids.iter().map(|id| id.to_string()).collect::<Vec<_>>().join("\n");
        if let Err(e) = std::fs::write(&error_file_path, content) {
            log::error!("Failed to write error file {}: {}", error_file_path, e);
        }
    }

    if downloader_config.notify {
        use tauri_plugin_notification::NotificationExt;

        let _ = app.notification()
            .builder()
            .title("Downloads complete")
            .body(format!("{} succeeded, {} failed", results.len() - failed_ids.len(), failed_ids.len()))
            .show();
    }

    Ok(())
}

async fn download_beatmap(
    app: &tauri::AppHandle,
    client: &Client,
    beatmap_set_id: u64,
    osu_session: &str,
    songs_folder: &str,
    skip_video: bool
) -> Result<(), String> {

    let url = if skip_video {
        format!("https://osu.ppy.sh/beatmapsets/{}/download?noVideo=1", beatmap_set_id)
    } else {
        format!("https://osu.ppy.sh/beatmapsets/{}/download", beatmap_set_id)
    };

    let response = client
        .get(url)
        .header("Cookie", format!("osu_session={}", osu_session))
        .header("Referer", format!("https://osu.ppy.sh/beatmapsets/{}", beatmap_set_id))
        .send()
        .await
        .map_err(|e| {
            log::error!("HTTP request failed for {}: {}", beatmap_set_id, e);
            e.to_string()
        })?;

    if !response.status().is_success() {
        log::error!("Failed to download {}: HTTP {}", beatmap_set_id, response.status());
        return Err(format!("HTTP {}", response.status()));
    }

    let total = response.content_length().unwrap_or(0);

    if total > MAX_SIZE {
        log::error!("Beatmap set {} is too large: {} bytes", beatmap_set_id, total);
        return Err(format!("Beatmap set {} is too large", beatmap_set_id));
    }

    let disposition = response.headers()
        .get("content-disposition")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    let filename = extract_filename(&disposition, beatmap_set_id);
    let path = format!("{}/{}", songs_folder, filename);
    let tmp_path = format!("{}.part", path);

    use tokio::io::AsyncWriteExt;

    let mut file = tokio::fs::File::create(&tmp_path).await.map_err(|e| {
        log::error!("error to create file {}: {}", tmp_path, e);
        e.to_string()
    })?;

    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = match chunk {
            Ok(c) => c,
            Err(e) => {
                log::error!("Stream interrupted for {}: {}", beatmap_set_id, e);
                let _ = tokio::fs::remove_file(&tmp_path).await;
                return Err(e.to_string());
            }
        };

        downloaded += chunk.len() as u64;

        if let Err(e) = file.write_all(&chunk).await {
            log::error!("Failed to write chunk for {}: {}",  beatmap_set_id, e);
            let _ = tokio::fs::remove_file(&tmp_path).await;
            return Err(e.to_string());
        }

        if total > 0 {
            let progress = (downloaded as f64 / total as f64) * 100.0;
            app.emit("download:progress", DownloadProgress {
                beatmap_set_id,
                progress,
                status: "downloading".to_string(),
            }).ok();
        }
    }

    file.flush().await.map_err(|e| e.to_string())?;
    drop(file);

    tokio::fs::rename(&tmp_path, &path).await.map_err(|e| {
        log::error!("Failed to finalize file {}: {}", path, e);
        e.to_string()
    })?;

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
pub fn get_osu_session(state: tauri::State<'_, AppConfigState>) -> Option<String> {
    state.config.lock().unwrap().downloader.osu_session.clone()
}

#[tauri::command]
pub fn set_osu_session(
    session: Option<String>,
    state: tauri::State<'_, AppConfigState>,
) -> Result<(), String> {
    state.config.lock().unwrap().downloader.osu_session = session;
    Ok(())
}

#[tauri::command]
pub async fn append_text_file(path: String, content: String) -> Result<(), String> {
    use std::io::Write;
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;

    file.write_all(content.as_bytes()).map_err(|e| {
        log::error!("Failed to write file {}: {}", path, e);
        e.to_string()
    })
}
