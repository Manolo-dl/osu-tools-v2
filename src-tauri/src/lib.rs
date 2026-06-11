use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_updater::UpdaterExt;

mod commands;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                update(handle).await.unwrap();
            });
            Ok(())
        })
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    #[cfg(debug_assertions)]
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::osu_path::get_osu_path,
            commands::osu_path::save_osu_path,
            commands::auth::start_oauth,
            commands::auth::refresh_oauth_token,
            commands::download::write_beatmap_file,
            commands::collections::read_osu_collections,
            commands::collections::read_osu_db,
            commands::collections::write_text_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.
        updater_builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()?
        .check().
        await? {

        let mut downloaded = 0;

        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("dowloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}
