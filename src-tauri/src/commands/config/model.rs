use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Clone)]
pub struct AppConfig {
    #[serde(default)]
    pub osu_path: Option<String>,

    #[serde(default)]
    pub excluded_tools: Vec<String>,

    #[serde(default)]
    pub tosu: TosuConfig,

    #[serde(default)]
    pub downloader: DownloaderConfig,

    #[serde(default)]
    pub osu_db: OsuDbConfig,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct TosuConfig {
    #[serde(default = "default_true")]
    pub auto_start: bool,

    #[serde(default)]
    pub auto_shutdown: bool,

    #[serde(default = "default_ip")]
    pub ip: String,

    #[serde(default = "default_port")]
    pub port: u16,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct DownloaderConfig {
    #[serde(default = "default_false")]
    pub notify: bool,

    #[serde(default = "default_true")]
    pub error_file: bool,

    #[serde(default)]
    pub osu_session: Option<String>,

    #[serde(default)]
    pub output_path: Option<String>,

    #[serde(default = "default_false")]
    pub load_library: bool,

    #[serde(default = "default_false")]
    pub skip_video: bool,

    #[serde(default = "default_max_concurrent_downloads")]
    pub max_concurrent_downloads: u32,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct OsuDbConfig {
    #[serde(default = "default_true")]
    pub db: bool,


}

fn default_true() -> bool { true }
fn default_ip() -> String { "127.0.0.1".to_string() }
fn default_port() -> u16 { 24050 }
fn default_false() -> bool { false }
fn default_max_concurrent_downloads() -> u32 { 2 }

impl Default for TosuConfig { 
    fn default() -> Self {
        Self {
            auto_start: true,
            auto_shutdown: false,
            ip: default_ip(),
            port: default_port(),
        }
    }
}

impl Default for DownloaderConfig {
    fn default() -> Self {
        Self {
            notify: false,
            error_file: true,
            osu_session: None,
            output_path: None,
            load_library: false,
            skip_video: false,
            max_concurrent_downloads: default_max_concurrent_downloads(),
        }
    }
}

impl Default for OsuDbConfig {
    fn default() -> Self {
        Self {
            db: true,
        }
    }
}