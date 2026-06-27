use rosu_replay::{GameMode, Replay, ReplayEvent};

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReplayInfo {
    pub beatmap_hash: String,
    pub username: String,
    pub score: u32,
    pub count_300: u16,
    pub count_100: u16,
    pub count_50: u16,
    pub count_miss: u16,
    pub key_events: Vec<(i32, u32)>,
}

#[tauri::command]
pub fn read_replay(replay_path: String) -> Result<ReplayInfo, String> {

    log::debug!("Reading replay from {}", replay_path);

    let replay = Replay::from_path(&replay_path)
        .map_err(|e| {
            log::error!("Failed to parse replay: {}: {:?}", replay_path, e);
            format!("Failed to parse replay: {:?}", e)
        })?;

    if replay.mode != GameMode::Mania {
        return Err("Only mania replays are supported for now".to_string());
    }

    let mut absolute_time = 0i32;
    let mut key_events = Vec::new();

    for event in &replay.replay_data {
        if let ReplayEvent::Mania(e) = event {
            absolute_time += e.time_delta;
            key_events.push((absolute_time, e.keys.value()));
        }
    }

    log::info!("Parsed replay: {} key events, beatmap_hash={}", key_events.len(), replay.beatmap_hash);

    Ok(ReplayInfo { 
        beatmap_hash: replay.beatmap_hash,
        username: replay.username,
        score: replay.score,
        count_300: replay.count_300,
        count_100: replay.count_100,
        count_50: replay.count_50,
        count_miss: replay.count_miss,
        key_events,
    })
}