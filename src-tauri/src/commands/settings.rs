use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub openclaw_path: String,
    pub workspace_path: String,
    pub dashboard_port: u16,
    pub auto_check_updates: bool,
    pub bundle_version: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
        Self {
            openclaw_path: "openclaw".to_string(),
            workspace_path: home.join(".openclaw").display().to_string(),
            dashboard_port: 18789,
            auto_check_updates: true,
            bundle_version: "0.0.0".to_string(),
        }
    }
}

fn settings_path() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("xemorysystems")
        .join("settings.json")
}

#[tauri::command]
pub async fn get_settings() -> Result<AppSettings, String> {
    let path = settings_path();
    if !path.exists() {
        return Ok(AppSettings::default());
    }
    let data = fs::read_to_string(&path).await.map_err(|e| e.to_string())?;
    serde_json::from_str(&data).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_settings(settings: AppSettings) -> Result<(), String> {
    let path = settings_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .await
            .map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&path, json).await.map_err(|e| e.to_string())
}

/// Try to auto-detect where OpenClaw is installed.
#[tauri::command]
pub async fn detect_openclaw_path() -> Result<String, String> {
    // Check common locations per-platform
    let candidates: Vec<PathBuf> = if cfg!(target_os = "windows") {
        vec![
            dirs::home_dir()
                .map(|h| h.join(".openclaw").join("bin").join("openclaw.exe"))
                .unwrap_or_default(),
            PathBuf::from(r"C:\Program Files\OpenClaw\openclaw.exe"),
            dirs::home_dir()
                .map(|h| h.join("AppData").join("Local").join("OpenClaw").join("openclaw.exe"))
                .unwrap_or_default(),
        ]
    } else {
        vec![
            PathBuf::from("/usr/local/bin/openclaw"),
            PathBuf::from("/usr/bin/openclaw"),
            dirs::home_dir()
                .map(|h| h.join(".local").join("bin").join("openclaw"))
                .unwrap_or_default(),
            dirs::home_dir()
                .map(|h| h.join(".openclaw").join("bin").join("openclaw"))
                .unwrap_or_default(),
        ]
    };

    for path in candidates {
        if path.exists() {
            return Ok(path.display().to_string());
        }
    }

    // Fallback: try running `which openclaw` / `where openclaw`
    let cmd = if cfg!(target_os = "windows") {
        "where"
    } else {
        "which"
    };

    let output = tokio::process::Command::new(cmd)
        .arg("openclaw")
        .output()
        .await;

    match output {
        Ok(o) if o.status.success() => {
            let path = String::from_utf8_lossy(&o.stdout).trim().to_string();
            Ok(path)
        }
        _ => Err("OpenClaw not found. Please set the path manually in Settings.".into()),
    }
}
