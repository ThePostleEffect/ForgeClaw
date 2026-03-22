use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;
use tokio::io::AsyncWriteExt;

const GITHUB_REPO: &str = "xemorysystems/openclaw-premium-bundle";

#[derive(Debug, Serialize, Deserialize)]
pub struct ReleaseInfo {
    pub tag_name: String,
    pub name: Option<String>,
    pub published_at: Option<String>,
    pub download_url: Option<String>,
    pub body: Option<String>,
}

/// Check GitHub releases for a newer bundle version.
#[tauri::command]
pub async fn check_for_updates(
    current_version: String,
) -> Result<Option<ReleaseInfo>, String> {
    let url = format!(
        "https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
    );

    let client = reqwest::Client::builder()
        .user_agent("XemorySystems-AgentHub/0.1")
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to check for updates: {e}"))?;

    if resp.status() == 404 {
        // No releases yet
        return Ok(None);
    }

    if !resp.status().is_success() {
        return Err(format!("GitHub API returned {}", resp.status()));
    }

    let release: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

    let tag = release["tag_name"]
        .as_str()
        .unwrap_or("0.0.0")
        .trim_start_matches('v');

    // Simple semver comparison: if tag differs from current, treat as update
    if tag == current_version.trim_start_matches('v') {
        return Ok(None);
    }

    // Find the zip asset download URL
    let download_url = release["assets"]
        .as_array()
        .and_then(|assets| {
            assets.iter().find_map(|a| {
                let name = a["name"].as_str().unwrap_or("");
                if name.ends_with(".zip") {
                    a["browser_download_url"].as_str().map(|s| s.to_string())
                } else {
                    None
                }
            })
        });

    Ok(Some(ReleaseInfo {
        tag_name: release["tag_name"].as_str().unwrap_or("").to_string(),
        name: release["name"].as_str().map(|s| s.to_string()),
        published_at: release["published_at"].as_str().map(|s| s.to_string()),
        download_url,
        body: release["body"].as_str().map(|s| s.to_string()),
    }))
}

/// Download a bundle update zip and extract to a temp directory.
/// Returns the path where templates were extracted.
#[tauri::command]
pub async fn download_update(download_url: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .user_agent("XemorySystems-AgentHub/0.1")
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(&download_url)
        .send()
        .await
        .map_err(|e| format!("Download failed: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("Download returned {}", resp.status()));
    }

    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;

    // Write to temp file
    let temp_dir = std::env::temp_dir().join("xemorysystems-update");
    fs::create_dir_all(&temp_dir)
        .await
        .map_err(|e| e.to_string())?;

    let zip_path = temp_dir.join("bundle-update.zip");
    let mut file = fs::File::create(&zip_path)
        .await
        .map_err(|e| e.to_string())?;
    file.write_all(&bytes).await.map_err(|e| e.to_string())?;
    file.flush().await.map_err(|e| e.to_string())?;

    // Extract zip (blocking — use spawn_blocking)
    let extract_dir = temp_dir.join("extracted");
    let extract_dir_clone = extract_dir.clone();
    let zip_path_clone = zip_path.clone();

    tokio::task::spawn_blocking(move || {
        let file = std::fs::File::open(&zip_path_clone).map_err(|e| e.to_string())?;
        let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;
        archive
            .extract(&extract_dir_clone)
            .map_err(|e| format!("Zip extraction failed: {e}"))?;
        Ok::<_, String>(())
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e: String| e)?;

    Ok(extract_dir.display().to_string())
}

/// Get the path where we'd store downloaded bundle data.
pub fn _downloads_dir() -> PathBuf {
    dirs::cache_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("xemorysystems")
}
