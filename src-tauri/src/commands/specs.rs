use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;

fn resolve_workspace(custom_path: Option<&str>) -> PathBuf {
    if let Some(p) = custom_path {
        PathBuf::from(p)
    } else {
        dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".openclaw")
    }
}

fn pending_dir(workspace: &std::path::Path) -> PathBuf {
    workspace.join("forgeclaw").join("pending")
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Proposal {
    pub agent_id: String,
    pub proposed_soul: String,
    pub reason: String,
    pub timestamp: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ProposalReview {
    pub agent_id: String,
    pub agent_name: String,
    pub current_soul: String,
    pub proposed_soul: String,
    pub reason: String,
    pub timestamp: Option<String>,
}

/// Read an agent's current SOUL.md.
#[tauri::command]
pub async fn read_agent_specs(
    agent_id: String,
    workspace_path: Option<String>,
) -> Result<String, String> {
    let ws = resolve_workspace(workspace_path.as_deref());
    let soul_path = ws.join("agents").join(&agent_id).join("SOUL.md");

    if !soul_path.exists() {
        return Err(format!("SOUL.md not found for agent '{}'", agent_id));
    }

    fs::read_to_string(&soul_path)
        .await
        .map_err(|e| format!("Failed to read SOUL.md: {e}"))
}

/// List all pending proposals waiting for user review.
#[tauri::command]
pub async fn list_pending_proposals(
    workspace_path: Option<String>,
) -> Result<Vec<ProposalReview>, String> {
    let ws = resolve_workspace(workspace_path.as_deref());
    let dir = pending_dir(&ws);

    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut proposals = Vec::new();
    let mut entries = fs::read_dir(&dir)
        .await
        .map_err(|e| format!("Failed to read pending dir: {e}"))?;

    while let Some(entry) = entries.next_entry().await.map_err(|e| e.to_string())? {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("json") {
            continue;
        }

        let data = match fs::read_to_string(&path).await {
            Ok(d) => d,
            Err(_) => continue,
        };

        let proposal: Proposal = match serde_json::from_str(&data) {
            Ok(p) => p,
            Err(_) => continue,
        };

        let current_soul = fs::read_to_string(
            ws.join("agents").join(&proposal.agent_id).join("SOUL.md"),
        )
        .await
        .unwrap_or_else(|_| "(agent not yet installed)".to_string());

        let agent_name = proposal
            .agent_id
            .split('-')
            .map(|w| {
                let mut c = w.chars();
                match c.next() {
                    Some(f) => f.to_uppercase().to_string() + c.as_str(),
                    None => String::new(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ");

        proposals.push(ProposalReview {
            agent_id: proposal.agent_id,
            agent_name,
            current_soul,
            proposed_soul: proposal.proposed_soul,
            reason: proposal.reason,
            timestamp: proposal.timestamp,
        });
    }

    Ok(proposals)
}

/// Approve a pending proposal — write the proposed SOUL.md and delete the pending file.
#[tauri::command]
pub async fn approve_proposal(
    agent_id: String,
    workspace_path: Option<String>,
) -> Result<(), String> {
    let ws = resolve_workspace(workspace_path.as_deref());
    let pending_file = pending_dir(&ws).join(format!("{}.json", agent_id));

    if !pending_file.exists() {
        return Err(format!("No pending proposal for '{}'", agent_id));
    }

    let data = fs::read_to_string(&pending_file)
        .await
        .map_err(|e| format!("Failed to read proposal: {e}"))?;

    let proposal: Proposal =
        serde_json::from_str(&data).map_err(|e| format!("Invalid proposal format: {e}"))?;

    let soul_path = ws.join("agents").join(&agent_id).join("SOUL.md");
    if !soul_path.parent().map_or(false, |p| p.exists()) {
        return Err(format!("Agent directory not found for '{}'", agent_id));
    }

    fs::write(&soul_path, &proposal.proposed_soul)
        .await
        .map_err(|e| format!("Failed to write SOUL.md: {e}"))?;

    fs::remove_file(&pending_file)
        .await
        .map_err(|e| format!("Failed to remove pending file: {e}"))?;

    Ok(())
}

/// Reject a pending proposal — discard without applying.
#[tauri::command]
pub async fn reject_proposal(
    agent_id: String,
    workspace_path: Option<String>,
) -> Result<(), String> {
    let ws = resolve_workspace(workspace_path.as_deref());
    let pending_file = pending_dir(&ws).join(format!("{}.json", agent_id));

    if !pending_file.exists() {
        return Err(format!("No pending proposal for '{}'", agent_id));
    }

    fs::remove_file(&pending_file)
        .await
        .map_err(|e| format!("Failed to remove pending file: {e}"))?;

    Ok(())
}

/// Ensure the pending proposals directory exists.
pub async fn ensure_pending_dir(workspace_path: Option<&str>) -> Result<PathBuf, String> {
    let ws = resolve_workspace(workspace_path);
    let dir = pending_dir(&ws);
    fs::create_dir_all(&dir)
        .await
        .map_err(|e| format!("Failed to create pending dir: {e}"))?;
    Ok(dir)
}
