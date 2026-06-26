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
                
                commands::osu_db::cache::init_schema(&pool).await.expect("failed to init osudb schema");
                commands::collections::cache::init_schema(&pool).await.expect("failed to init collection schema")
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
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_log::Builder::new()
        .max_file_size(50_000)
        .format(|out, message, record| {
            out.finish(format_args!(
                "[{} {} {}] {}",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
                record.level(),
                record.target(),
                message
            ))
        })
        .level(log::LevelFilter::Debug)
        .level_for("h2", log::LevelFilter::Off)
        .level_for("hyper", log::LevelFilter::Off)
        .level_for("hyper_util", log::LevelFilter::Off)
        .level_for("reqwest", log::LevelFilter::Off)
        .level_for("tracing", log::LevelFilter::Off)
        .level_for("tao", log::LevelFilter::Off)
        .level_for("wry", log::LevelFilter::Off)
        .level_for("rustls", log::LevelFilter::Off)
        .level_for("zbus", log::LevelFilter::Off)
        .level_for("rustls_platform_verifier", log::LevelFilter::Off)
        .level_for("sqlx", log::LevelFilter::Off)
        .level_for("tauri_plugin_updater", log::LevelFilter::Off)
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
            commands::system::osu_path::get_osu_path,
            commands::system::osu_path::save_osu_path,
            commands::collections::reader::read_osu_collections,
            commands::collections::reader::write_text_file,
            commands::collections::writer::import_collections,
            commands::osu_db::reader::read_osu_db_full,
            commands::system::download::start_downloads,
            commands::system::download::append_text_file,
            commands::packs::folders::validate_pack_folder,
            commands::packs::creator::create_pack,
            commands::dev::logs::read_logs,
            commands::dev::database::get_database_tables,
            commands::dev::database::get_table_columns,
            commands::dev::database::execute_query,
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
