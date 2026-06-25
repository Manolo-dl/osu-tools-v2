# osu-tools

A desktop app for managing your local osu! library. Built with [Tauri v2](https://tauri.app/) and [Angular 22](https://angular.dev/).

## Features

### Downloader
Batch-download beatmap sets directly to your `Songs` folder. Import a `.txt` file with beatmap set URLs or IDs, then start the download. Failed downloads are saved to `failed_downloads.txt` inside your osu! folder. Requires your `osu_session` cookie (copy it from your browser's DevTools).

### Export Collections
Read your `collection.db` and export your osu! collections to a plain-text format you can share or back up.

### Export Song Folder
Copy beatmap sets out of your `Songs` folder by selecting them from your loaded osu! library.

### Create Packs
Browse your loaded osu! library, select beatmap sets, and package them into `.osz` pack files. Validates against existing pack folders to avoid duplicates.

### Logs *(dev)*
View the app's log file grouped by level (DEBUG / INFO / WARN / ERROR) and target, with timestamps.

### Database Explorer *(dev)*
Browse the local SQLite cache (`osu_cache.db`) that stores beatmap metadata. Select a table, toggle columns, and query results live.

## Stack

| Layer | Technology |
|---|---|
| UI | Angular 22, NgRx Signals, Angular CDK |
| Desktop shell | Tauri v2 |
| Backend | Rust (async via Tokio) |
| HTTP | reqwest |
| Database | SQLite via sqlx |
| Icons | Phosphor Icons (ng-icons) |

## Development

```bash
# Install JS dependencies
npm install

# Start dev server (hot reload)
npm run tauri:linux   # Linux
npm run tauri dev     # macOS / Windows
```

Requires [Rust](https://rustup.rs/) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS.

## Building

```bash
npm run tauri build
```

Produces a native installer under `src-tauri/target/release/bundle/`.

## osu! folder detection

The app auto-detects your osu! installation on startup by checking the standard paths for your OS. If detection fails, you can select the folder manually via the bar at the top of the window. The path is persisted across sessions.

All tools are locked behind this path — nothing works until it is set.
