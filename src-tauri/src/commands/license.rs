use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Set this to your Gumroad product ID after creating the product.
/// Find it in your Gumroad dashboard under the product's settings.
const GUMROAD_PRODUCT_ID: &str = "kjwhz";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LicenseInfo {
    pub valid: bool,
    pub email: Option<String>,
    pub key: String,
}

#[derive(Deserialize)]
struct GumroadResponse {
    success: bool,
    purchase: Option<GumroadPurchase>,
}

#[derive(Deserialize)]
struct GumroadPurchase {
    email: Option<String>,
}

fn license_file_path() -> PathBuf {
    let config_dir = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
    config_dir.join("forgeclaw").join("license.json")
}

/// Validate a Gumroad license key against the API.
/// Falls back to offline validation if a persisted license exists.
#[tauri::command]
pub async fn validate_license(key: String) -> Result<LicenseInfo, String> {
    let trimmed = key.trim().to_string();

    if trimmed.len() < 8 {
        return Err("Invalid license key format".into());
    }

    // Call Gumroad license verification API
    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.gumroad.com/v2/licenses/verify")
        .form(&[
            ("product_id", GUMROAD_PRODUCT_ID),
            ("license_key", &trimmed),
            ("increment_uses_count", "true"),
        ])
        .send()
        .await
        .map_err(|e| format!("Failed to reach Gumroad: {e}"))?;

    let gumroad: GumroadResponse = resp
        .json()
        .await
        .map_err(|e| format!("Invalid response from Gumroad: {e}"))?;

    if !gumroad.success {
        return Err("Invalid license key. Please check and try again.".into());
    }

    let email = gumroad.purchase.and_then(|p| p.email);

    let info = LicenseInfo {
        valid: true,
        email,
        key: trimmed,
    };

    // Persist license to disk so the app works offline after first activation
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
