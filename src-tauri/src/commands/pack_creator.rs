use std::fs;
use std::path::{Path, PathBuf};
use sqlx::SqlitePool;
use walkdir::WalkDir;
use crate::commands::osu_db_cache;
use crate::{OsuState, DbState};

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SelectedDiff {
    pub beatmapset_id: u32,
    pub file_name: String,
    pub audio: String,
    pub creator: String,
    pub new_diff_name: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct createPackRequest {
    pub set_title: String,
    pub final_creator: String,
    pub diffs: Vec<SelectedDiff>,
}


