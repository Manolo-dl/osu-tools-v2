use std::collections::HashMap;
use osynic_osudb::entity::osu::osudb::OsuDB;
use crate::OsuState;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OsuDiff {
    pub md5: String,
    pub diff_name: String,
    pub mode: u8,
    pub bpm: f64,
    pub length: u32,
    pub stars: f64,
    pub last_played: bool,
    pub circle_size: f32,
    pub approach_rate: f32,
    pub hp_drain: f32,
    pub overall_difficulty: f32,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OsuBeatmapSet {
    pub beatmapset_id: u32,
    pub title: String,
    pub artist: String,
    pub status: String,
    pub diffs: Vec<OsuDiff>
}

#[tauri::command]
pub fn read_osu_db_full(state: tauri::State<'_, OsuState>) -> Result<Vec<OsuBeatmapSet>, String> {

    let path = state.path.lock().unwrap();
    let osu_path = path.as_ref().ok_or("osu! path not set")?;

    use osynic_osudb::entity::osu::field::mode::Mode;
    use osynic_osudb::entity::osu::field::rank::RankedStatus;

    let db_path = std::path::Path::new(osu_path).join("osu!.db");
    let db = OsuDB::from_file(&db_path).map_err(|e| e.to_string())?;

    let mut sets: HashMap<u32, OsuBeatmapSet> = HashMap::new();

    for b in db.beatmaps {

        let md5 = match b.hash {
            Some(h) => h,
            None => continue
        };

        if b.beatmapset_id < 0 { continue; }

        if matches!(b.status, RankedStatus::Unknown | RankedStatus::Unsubmitted | RankedStatus::Unused) { continue; }

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

        let diff = OsuDiff {
            md5,
            diff_name: b.difficulty_name.unwrap_or_default(),
            mode: b.mode.raw(),
            bpm,
            length: b.total_time,
            stars,
            last_played: b.last_played.is_some(),
            circle_size: b.circle_size,
            approach_rate: b.approach_rate,
            hp_drain: b.hp_drain,
            overall_difficulty: b.overall_difficulty,
        };

        sets.entry(b.beatmapset_id as u32)
            .or_insert_with(|| OsuBeatmapSet {
                beatmapset_id: b.beatmapset_id as u32,
                title: b.title_ascii.unwrap_or_default(),
                artist: b.artist_ascii.unwrap_or_default(),
                status: status.to_string(),
                diffs: Vec::new(),
            })
            .diffs.push(diff);

    }

    Ok(sets.into_values().collect())
}