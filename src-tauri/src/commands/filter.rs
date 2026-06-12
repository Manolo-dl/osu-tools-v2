use osynic_osudb::entity::osu::osudb::OsuDB;

#[derive(serde::Serialize)]
pub struct OsuBeatmapFiltered {
    pub md5: String,
    pub beatmapset_id: u32,
    pub title: String,
    pub artist: String,
    pub stars: f64,
}

#[tauri::command]
pub fn read_osu_db_filtered(
    osu_path: String,
    mode: Option<u8>,           // 0=std, 1=taiko, 2=ctb, 3=mania
    min_stars: Option<f64>,
    max_stars: Option<f64>,
    status: Option<String>,     // "ranked", "loved", "approved", etc.
) -> Result<Vec<OsuBeatmapFiltered>, String> {
    use osynic_osudb::entity::osu::field::mode::Mode;
    use osynic_osudb::entity::osu::field::rank::RankedStatus;

    let path = std::path::Path::new(&osu_path).join("osu!.db");
    let db = OsuDB::from_file(&path).map_err(|e| e.to_string())?;

    let filter_mode = mode.and_then(Mode::from_raw);
    let filter_status = status.as_deref().and_then(|s| match s {
        "ranked" => Some(RankedStatus::Ranked),
        "loved" => Some(RankedStatus::Loved),
        "approved" => Some(RankedStatus::Approved),
        "qualified" => Some(RankedStatus::Qualified),
        "unranked" => Some(RankedStatus::PendingWipGraveyard),
        _ => None,
    });

    let mut seen = std::collections::HashSet::new();

    let result = db.beatmaps.into_iter()
        .filter_map(|b| {
            let md5 = b.hash?;
            if b.beatmapset_id < 0 { return None; }

            if let Some(m) = filter_mode {
                if b.mode != m { return None; }
            }

            if let Some(s) = filter_status {
                if b.status != s { return None; }
            }

            let stars = match filter_mode.unwrap_or(Mode::Standard) {
                Mode::Standard => &b.std_ratings,
                Mode::Taiko => &b.taiko_ratings,
                Mode::CatchTheBeat => &b.ctb_ratings,
                Mode::Mania => &b.mania_ratings,
            }.iter().next()
             .map(|(_, s)| *s)
             .unwrap_or(0.0);

            if let Some(min) = min_stars {
                if stars < min { return None; }
            }
            if let Some(max) = max_stars {
                if stars > max { return None; }
            }

            if !seen.insert(b.beatmapset_id) { return None; }

            Some(OsuBeatmapFiltered {
                md5,
                beatmapset_id: b.beatmapset_id as u32,
                title: b.title_ascii.unwrap_or_default(),
                artist: b.artist_ascii.unwrap_or_default(),
                stars,
            })
        })
        .collect();

    Ok(result)
}