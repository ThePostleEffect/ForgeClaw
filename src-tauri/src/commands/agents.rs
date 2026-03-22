use super::openclaw_bin;
use serde::{Deserialize, Serialize};
use std::process::Stdio;
use tokio::process::Command;

/// Matches the JSON output of `openclaw agents list --json`.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentInfo {
    pub id: String,
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub workspace: Option<String>,
    #[serde(default)]
    pub agent_dir: Option<String>,
    #[serde(default)]
    pub bindings: Option<serde_json::Value>,
    #[serde(default)]
    pub is_default: Option<bool>,
    #[serde(default)]
    pub routes: Option<Vec<String>>,
}

/// Run `openclaw agents list --json` and return the parsed agent list.
#[tauri::command]
pub async fn list_agents(openclaw_path: Option<String>) -> Result<Vec<AgentInfo>, String> {
    let bin = openclaw_bin::resolve(openclaw_path.as_deref());

    let result = Command::new(&bin)
        .args(["agents", "list", "--json"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    match result {
        Ok(output) if output.status.success() => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let agents: Vec<AgentInfo> = serde_json::from_str(&stdout).map_err(|e| {
                format!("Failed to parse openclaw output: {e}\nRaw: {stdout}")
            })?;
            Ok(agents)
        }
        Ok(output) => {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("openclaw exited with error: {stderr}"))
        }
        Err(e) => Err(format!(
            "Could not run '{bin}'. Is OpenClaw installed? Error: {e}"
        )),
    }
}

/// Check whether the `openclaw` CLI is accessible.
#[tauri::command]
pub async fn check_openclaw() -> Result<String, String> {
    let bin = openclaw_bin::resolve(None);

    let result = Command::new(&bin)
        .arg("--version")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    match result {
        Ok(output) if output.status.success() => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            Ok(stdout.trim().to_string())
        }
        Ok(output) => {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("openclaw returned an error: {stderr}"))
        }
        Err(e) => Err(format!(
            "OpenClaw CLI not found at '{bin}'. Is it installed? Error: {e}"
        )),
    }
}
