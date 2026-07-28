use futures_util::StreamExt;
use tauri::{AppHandle, Emitter};
use tokio_tungstenite::connect_async;

const TOSU_URL: &str = "ws://127.0.0.1:24050/websocket/v2";

pub async fn start_tosu_listener(app: AppHandle) {
    loop {
        match connect_async(TOSU_URL).await {
            Ok((ws_stream, _)) => {
                log::info!("Connected to TOSU WebSocket server");
                let (_write, mut read) = ws_stream.split();

                while let Some(msg) = read.next().await {
                    match msg {
                        Ok(msg) if msg.is_text() => {
                            let text = msg.into_text().unwrap_or_default();
                            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
                                let _ = app.emit("tosu-data", json);
                            }
                        }
                        Ok(_) => {}
                        Err(e) => {
                            log::error!("Error receiving message from TOSU WebSocket: {}", e);
                            break;
                        }
                    }
                }

                log::info!("Disconnected from TOSU WebSocket server, retrying...");
            }

            Err(e) => {
                log::error!("Failed to connect to TOSU: {}", e);
            }
        }

        tokio::time::sleep(std::time::Duration::from_secs(3)).await;
    }
}