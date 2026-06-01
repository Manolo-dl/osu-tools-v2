use tauri_plugin_log::{Target, TargetKind};

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
            commands::download::download_beatmap,
            commands::download::download_beatmap_beatconnect,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}