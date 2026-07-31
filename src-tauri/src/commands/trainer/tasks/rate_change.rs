use anyhow::Result;
use rosu_map::{Beatmap, section::hit_objects::HitObjectKind};

use crate::commands::trainer::model::RateChangeParams;

pub fn apply(beatmap: &mut Beatmap, params: &RateChangeParams) -> Result<()> {
    let rate = params.rate;

    for tp in beatmap.control_points.timing_points.iter_mut() {
        tp.beat_len /= rate;
    }

    for obj in beatmap.hit_objects.iter_mut() {
        obj.start_time /= rate;

        match &mut obj.kind {

            HitObjectKind::Circle(_) => {}
            HitObjectKind::Slider(_) => {}
            HitObjectKind::Spinner(spinner) => {
                spinner.duration /= rate;
            }

            HitObjectKind::Hold(hold) => {
                hold.duration /= rate;
            }
        }
    }

    let suffix = if params.nightcore { " NC" } else { "" };
    beatmap.version = format!("{} ({}x{})", beatmap.version, rate, suffix);
    Ok(())
}