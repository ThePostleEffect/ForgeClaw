use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LicenseInfo {
    pub valid: bool,
    pub email: Option<String>,
    pub key: String,
}

fn license_file_path() -> PathBuf {
    let config_dir = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
    config_dir.join("forgeclaw").join("license.json")
}

/// Validate a Gumroad license key.
/// For MVP this does a local format check + persists the key.
/// In production, call POST https://api.gumroad.com/v2/licenses/verify
#[tauri::command]
pub async fn validate_license(key: String) -> Result<LicenseInfo, String> {
    let trimmed = key.trim().to_string();

    // Basic format gate: Gumroad keys are typically 35 chars with hyphens
    if trimmed.len() < 8 {
        return Err("Invalid license key format".into());
    }

    // TODO(prod): Replace stub with actual Gumroad API call:
    //
    // let client = reqwest::Client::new();
    // let resp = client.post("https://api.gumroad.com/v2/licenses/verify")
    //     .form(&[
    //         ("product_id", "YOUR_PRODUCT_ID"),
    //         ("license_key", &trimmed),
    //     ])
    //     .send().await.map_err(|e| e.to_string())?;
    //
    // For now, accept any key that passes the length check.

    let info = LicenseInfo {
        valid: true,
        email: Some("user@example.com".into()),
        key: trimmed,
    };

    // Persist license to disk
    let path = license_file_path();
    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create config dir: {e}"))?;
    }
    let json = serde_json::to_string_pretty(&info).map_err(|e| e.to_string())?;
    tokio::fs::write(&path, json)
        .await
        .map_err(|e| format!("Failed to save license: {e}"))?;

    Ok(info)
}

/// Check if a valid license exists on disk.
#[tauri::command]
pub async fn get_license_status() -> Result<Option<LicenseInfo>, String> {
    let path = license_file_path();
    if !path.exists() {
        return Ok(None);
    }
    let data = tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| e.to_string())?;
    let info: LicenseInfo = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(Some(info))
}
