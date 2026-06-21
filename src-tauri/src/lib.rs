use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_updater::UpdaterExt;
use std::sync::Mutex;
use sqlx::SqlitePool;
use tauri::Manager;

mod commands;

pub struct OsuState {
    pub path: Mutex<Option<String>>,
}

pub struct DbState {
    pub pool: SqlitePool,
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

            let app_dir = app.path().app_data_dir().unwrap();
            std::fs::create_dir_all(&app_dir).unwrap();
            let db_path = app_dir.join("osu_cache.db");

            let pool = tauri::async_runtime::block_on(async {
                SqlitePool::connect(&format!("sqlite://{}?mode=rwc", db_path.display()))
                    .await
                    .expect("failed to connect to sqlite")
            });

            tauri::async_runtime::block_on(async {
                commands::osu_db_cache::init_schema(&pool).await.expect("failed to init osudb schema");
                commands::collection_cache::init_schema(&pool).await.expect("failed to init collection schema")
            });

            app.manage(DbState { pool });

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = update(handle).await {
                    log::error!("failed to check for updates: {e}");
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_log::Builder::new()
        .max_file_size(50_000)
        .format(|out, message, record| {
            out.finish(format_args!(
                "[{} {}] {}",
                record.level(),
                record.target(),
                message
            ))
        })
        .targets([
            Target::new(TargetKind::LogDir { file_name: None }),
            Target::new(TargetKind::Stdout),
        ])
        .build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::osu_path::get_osu_path,
            commands::osu_path::save_osu_path,
            commands::auth::start_oauth,
            commands::auth::refresh_oauth_token,
            commands::collections::read_osu_collections,
            commands::collections::write_text_file,
            commands::osu_db::read_osu_db_full,
            commands::download::start_downloads,
            commands::download::append_text_file,
            commands::manage_folders::validate_pack_folder,
            commands::pack_creator::create_pack,
        ])
        .manage(OsuState { path: Mutex::new(None) })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app
        .updater_builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()?
        .check()
        .await? 
    {

        let mut downloaded = 0;

        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    
                    log::info!("downloaded {downloaded} of {content_length:?}");
                },
                || {
                    log::info!("download complete, installing update...");
                },
            )
            .await?;

        log::info!("update installed");
        app.restart();
    }

    Ok(())
}
