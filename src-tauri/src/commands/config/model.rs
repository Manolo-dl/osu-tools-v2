use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Clone)]
pub struct AppConfig {
    #[serde(default)]
    osu_path: Option<String>,

    #[serde(default)]
    excluded_tools: Vec<String>,

    #[serde(default)]
    pub tosu: TosuConfig,
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

fn default_true() -> bool { true }
fn default_ip() -> String { "127.0.0.1".to_string() }
fn default_port() -> u16 { 24050 }

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