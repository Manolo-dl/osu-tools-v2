use osynic_osudb::entity::osu::osudb::OsuDB;
use crate::OsuState;

#[derive(serde::Serialize)]
pub struct OsuBeatmapFull {
    pub md5: String,
    pub beatmapset_id: u32,
    pub title: String,
    pub artist: String,
    pub stars: f64,
    pub mode: u8,
    pub status: String,
    pub bpm: f64,
    pub length: u32,
    pub last_played: bool,
}

#[tauri::command]
pub fn read_osu_db_full(state: tauri::State<'_, OsuState>) -> Result<Vec<OsuBeatmapFull>, String> {

    let path = state.path.lock().unwrap();
    let osu_path = path.as_ref().ok_or("osu! path not set")?;

    use osynic_osudb::entity::osu::field::mode::Mode;
    use osynic_osudb::entity::osu::field::rank::RankedStatus;

    let db_path = std::path::Path::new(osu_path).join("osu!.db");
    let db = OsuDB::from_file(&db_path).map_err(|e| e.to_string())?;

    let result = db.beatmaps.into_iter()
        .filter_map(|b| {

            let md5 = b.hash?;
            
            if b.beatmapset_id < 0 { return None; }

            if matches!(b.status, RankedStatus::Unknown | RankedStatus::Unsubmitted | RankedStatus::Unused) { return None; }

            let stars = match b.mode {
                Mode::Standard => &b.std_ratings,
                Mode::Taiko => &b.taiko_ratings,
                Mode::CatchTheBeat => &b.ctb_ratings,
                Mode::Mania => &b.mania_ratings,
            }.iter().next()
            .map(|(_, s)| *s)
            .unwrap_or(0.0);

        let bpm = b.timing_points.iter()
        .find(|tp| !tp.inherits)
        .map(|tp| (60000.0 / tp.bpm).round())
        .unwrap_or(0.0);

        let status = match b.status {
            RankedStatus::Ranked => "ranked",
            RankedStatus::Loved => "loved",
            RankedStatus::Approved => "approved",
            RankedStatus::Qualified => "qualified",
            RankedStatus::PendingWipGraveyard => "unranked",
            _ => "unknown",
        }.to_string();

        Some(OsuBeatmapFull {
            md5,
            beatmapset_id: b.beatmapset_id as u32,
            title: b.title_ascii.unwrap_or_default(),
            artist: b.artist_ascii.unwrap_or_default(),
            stars,
            mode: b.mode.raw(),
            status,
            bpm,
            length: b.total_time,
            last_played: b.last_played.is_some(),
        })
        })
        .collect();

    Ok(result)
}