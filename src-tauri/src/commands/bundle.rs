use super::openclaw_bin;
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::fs;
use tokio::process::Command;

/// The 11 premium agent template folder names included in the bundle.
const BUNDLE_TEMPLATES: &[&str] = &[
    "inbox-zero-sentinel",
    "content-forge",
    "personal-cfo",
    "research-raven",
    "code-companion",
    "customer-whisperer",
    "meeting-maestro",
    "health-horizon",
    "sales-scout",
    "learning-luminary",
    "xemory-keeper",
];

#[derive(Debug, Serialize, Clone)]
pub struct AgentInstallResult {
    pub id: String,
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct BundleStatus {
    pub installed: bool,
    pub installed_templates: Vec<String>,
    pub missing_templates: Vec<String>,
    pub registered_agents: Vec<String>,
    pub workspace_path: String,
    pub results: Vec<AgentInstallResult>,
}

/// Resolve the OpenClaw workspace directory.
fn resolve_workspace(custom_path: Option<&str>) -> PathBuf {
    if let Some(p) = custom_path {
        PathBuf::from(p)
    } else {
        dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".openclaw")
    }
}

/// Query `openclaw agents list --json` to get registered agent IDs.
async fn get_registered_agents() -> Vec<String> {
    let output = Command::new(&openclaw_bin::resolve(None))
        .args(["agents", "list", "--json"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    match output {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            // Parse JSON array — each object has an "id" field
            if let Ok(agents) = serde_json::from_str::<Vec<serde_json::Value>>(&stdout) {
                agents
                    .iter()
                    .filter_map(|a| a.get("id").and_then(|v| v.as_str()).map(String::from))
                    .collect()
            } else {
                Vec::new()
            }
        }
        _ => Vec::new(),
    }
}

/// Check which bundle templates are installed (files on disk + registered with OpenClaw).
#[tauri::command]
pub async fn get_bundle_status(workspace_path: Option<String>) -> Result<BundleStatus, String> {
    let ws = resolve_workspace(workspace_path.as_deref());
    let agents_dir = ws.join("agents");
    let registered = get_registered_agents().await;

    let mut installed = Vec::new();
    let mut missing = Vec::new();

    for name in BUNDLE_TEMPLATES {
        let template_dir = agents_dir.join(name);
        // Consider "installed" only if SOUL.md exists AND agent is registered
        if template_dir.join("SOUL.md").exists() && registered.contains(&name.to_string()) {
            installed.push(name.to_string());
        } else {
            missing.push(name.to_string());
        }
    }

    Ok(BundleStatus {
        installed: missing.is_empty() && !installed.is_empty(),
        installed_templates: installed,
        missing_templates: missing,
        registered_agents: registered,
        workspace_path: ws.display().to_string(),
        results: Vec::new(),
    })
}

/// Locate the `bundle-templates/` directory.
/// Checks multiple locations to work in both dev and production.
fn find_bundle_source(explicit: Option<&str>) -> Result<PathBuf, String> {
    if let Some(p) = explicit {
        let path = PathBuf::from(p);
        if path.exists() {
            return Ok(path);
        }
        return Err(format!("Explicit bundle source not found at '{p}'"));
    }

    let mut candidates: Vec<PathBuf> = Vec::new();

    // 1. Dev mode: project root is CARGO_MANIFEST_DIR/.. (compile-time constant)
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    candidates.push(manifest_dir.join("..").join("bundle-templates"));
    // Also try manifest dir itself
    candidates.push(manifest_dir.join("bundle-templates"));

    // 2. Next to the running executable (production builds)
    if let Ok(exe) = std::env::current_exe() {
        if let Some(exe_dir) = exe.parent() {
            candidates.push(exe_dir.join("bundle-templates"));
        }
    }

    // 3. Current working directory
    candidates.push(PathBuf::from("bundle-templates"));

    for candidate in &candidates {
        // Canonicalize to resolve ".." and check existence
        if let Ok(resolved) = candidate.canonicalize() {
            if resolved.is_dir() {
                return Ok(resolved);
            }
        }
        // Fallback: just check exists without canonicalize
        if candidate.exists() && candidate.is_dir() {
            return Ok(candidate.clone());
        }
    }

    let searched: Vec<String> = candidates.iter().map(|c| format!("  - {}", c.display())).collect();
    Err(format!(
        "Bundle source not found. Searched:\n{}",
        searched.join("\n")
    ))
}

/// Register a single agent with OpenClaw via `openclaw agents add`.
/// The workspace dir is where the SOUL.md lives; OpenClaw creates its own
/// agent state dir alongside it.
async fn register_agent(name: &str, workspace_dir: &Path) -> AgentInstallResult {
    let ws_str = workspace_dir.to_string_lossy().to_string();

    let output = Command::new(&openclaw_bin::resolve(None))
        .args([
            "agents",
            "add",
            name,
            "--non-interactive",
            "--workspace",
            &ws_str,
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    match output {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            AgentInstallResult {
                id: name.to_string(),
                success: true,
                message: format!("Registered: {}", stdout.trim()),
            }
        }
        Ok(o) => {
            let stderr = String::from_utf8_lossy(&o.stderr);
            let stdout = String::from_utf8_lossy(&o.stdout);
            let msg = if stderr.is_empty() {
                stdout.to_string()
            } else {
                stderr.to_string()
            };
            // Check if agent already exists (not a real failure)
            if msg.contains("already exists") || msg.contains("duplicate") {
                AgentInstallResult {
                    id: name.to_string(),
                    success: true,
                    message: "Already registered".to_string(),
                }
            } else {
                AgentInstallResult {
                    id: name.to_string(),
                    success: false,
                    message: format!("openclaw agents add failed: {}", msg.trim()),
                }
            }
        }
        Err(e) => AgentInstallResult {
            id: name.to_string(),
            success: false,
            message: format!("Failed to run openclaw: {e}"),
        },
    }
}

/// Install bundle templates into the workspace.
/// 1. Copies template files (SOUL.md, AGENTS.md) into ~/.openclaw/agents/<id>/
/// 2. Registers each agent with `openclaw agents add <id> --non-interactive --workspace <path>`
#[tauri::command]
pub async fn install_bundle(
    workspace_path: Option<String>,
    bundle_source: Option<String>,
) -> Result<BundleStatus, String> {
    let ws = resolve_workspace(workspace_path.as_deref());
    let agents_dir = ws.join("agents");

    let source = find_bundle_source(bundle_source.as_deref())?;

    // Check openclaw is available before starting
    let oc_check = Command::new(&openclaw_bin::resolve(None))
        .arg("--version")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    if oc_check.is_err() || !oc_check.as_ref().unwrap().status.success() {
        return Err("OpenClaw CLI not found in PATH. Install it first: https://docs.openclaw.ai".to_string());
    }

    // Create agents dir if needed
    fs::create_dir_all(&agents_dir)
        .await
        .map_err(|e| format!("Failed to create agents directory: {e}"))?;

    let registered = get_registered_agents().await;
    let mut results: Vec<AgentInstallResult> = Vec::new();

    for name in BUNDLE_TEMPLATES {
        let src = source.join(name);
        if !src.exists() {
            results.push(AgentInstallResult {
                id: name.to_string(),
                success: false,
                message: format!("Template not found in bundle source"),
            });
            continue;
        }

        // Step 1: Copy template files
        let dest = agents_dir.join(name);
        if let Err(e) = copy_dir_recursive(&src, &dest).await {
            results.push(AgentInstallResult {
                id: name.to_string(),
                success: false,
                message: format!("File copy failed: {e}"),
            });
            continue;
        }

        // Step 2: Register with OpenClaw (skip if already registered)
        if registered.contains(&name.to_string()) {
            results.push(AgentInstallResult {
                id: name.to_string(),
                success: true,
                message: "Already registered".to_string(),
            });
        } else {
            let result = register_agent(name, &dest).await;
            results.push(result);
        }
    }

    // Step 3: Configure subagent allowlist so main can delegate to all specialists
    let successfully_registered: Vec<&str> = results
        .iter()
        .filter(|r| r.success)
        .map(|r| r.id.as_str())
        .collect();

    if !successfully_registered.is_empty() {
        let _ = configure_subagent_allowlist(&successfully_registered).await;
    }

    // Build final status
    let updated_registered = get_registered_agents().await;
    let mut installed = Vec::new();
    let mut missing = Vec::new();

    for name in BUNDLE_TEMPLATES {
        let template_dir = agents_dir.join(name);
        if template_dir.join("SOUL.md").exists() && updated_registered.contains(&name.to_string())
        {
            installed.push(name.to_string());
        } else {
            missing.push(name.to_string());
        }
    }

    Ok(BundleStatus {
        installed: missing.is_empty() && !installed.is_empty(),
        installed_templates: installed,
        missing_templates: missing,
        registered_agents: updated_registered,
        workspace_path: ws.display().to_string(),
        results,
    })
}

/// Install a single template by ID.
/// Copies files and registers with OpenClaw.
#[tauri::command]
pub async fn install_single_template(
    template_id: String,
    workspace_path: Option<String>,
    bundle_source: Option<String>,
) -> Result<BundleStatus, String> {
    if !BUNDLE_TEMPLATES.contains(&template_id.as_str()) {
        return Err(format!("Unknown template: '{template_id}'"));
    }

    let ws = resolve_workspace(workspace_path.as_deref());
    let agents_dir = ws.join("agents");

    let source = find_bundle_source(bundle_source.as_deref())?;

    let src = source.join(&template_id);
    if !src.exists() {
        return Err(format!(
            "Template '{}' not found in bundle at '{}'",
            template_id,
            source.display()
        ));
    }

    fs::create_dir_all(&agents_dir)
        .await
        .map_err(|e| format!("Failed to create agents directory: {e}"))?;

    // Copy files
    let dest = agents_dir.join(&template_id);
    copy_dir_recursive(&src, &dest)
        .await
        .map_err(|e| format!("Failed to copy template '{template_id}': {e}"))?;

    // Register with OpenClaw
    let registered = get_registered_agents().await;
    let result = if registered.contains(&template_id) {
        AgentInstallResult {
            id: template_id.clone(),
            success: true,
            message: "Already registered".to_string(),
        }
    } else {
        register_agent(&template_id, &dest).await
    };

    if !result.success {
        return Err(format!(
            "Files copied but registration failed: {}",
            result.message
        ));
    }

    // Add this agent to main's subagent allowlist
    let _ = configure_subagent_allowlist(&[&template_id]).await;

    get_bundle_status(workspace_path).await
}

/// Configure `main` agent's subagent allowlist so it can delegate to specialists.
/// Reads the current allowlist, merges in new IDs, and writes back via `openclaw config set`.
async fn configure_subagent_allowlist(agent_ids: &[&str]) -> Result<(), String> {
    let bin = openclaw_bin::resolve(None);

    // Read current allowlist
    let current = Command::new(&bin)
        .args(["config", "get", "agents.list[0].subagents.allowAgents", "--json"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    let mut allow_set: Vec<String> = Vec::new();

    if let Ok(output) = current {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            if let Ok(list) = serde_json::from_str::<Vec<String>>(&stdout) {
                allow_set = list;
            }
        }
    }

    // Merge in new agent IDs (deduplicate)
    for id in agent_ids {
        let id_str = id.to_string();
        if !allow_set.contains(&id_str) {
            allow_set.push(id_str);
        }
    }

    // Write back
    let json_value = serde_json::to_string(&allow_set).unwrap_or_else(|_| "[]".to_string());

    let result = Command::new(&bin)
        .args([
            "config",
            "set",
            "agents.list[0].subagents.allowAgents",
            &json_value,
            "--strict-json",
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await;

    match result {
        Ok(o) if o.status.success() => Ok(()),
        Ok(o) => {
            let stderr = String::from_utf8_lossy(&o.stderr);
            Err(format!("Failed to set subagent allowlist: {}", stderr.trim()))
        }
        Err(e) => Err(format!("Failed to run openclaw config set: {e}")),
    }
}

/// Recursively copy a directory tree.
async fn copy_dir_recursive(src: &Path, dest: &Path) -> Result<(), String> {
    fs::create_dir_all(dest)
        .await
        .map_err(|e| format!("mkdir {}: {e}", dest.display()))?;

    let mut entries = fs::read_dir(src)
        .await
        .map_err(|e| format!("read_dir {}: {e}", src.display()))?;

    while let Some(entry) = entries
        .next_entry()
        .await
        .map_err(|e| e.to_string())?
    {
        let file_type = entry.file_type().await.map_err(|e| e.to_string())?;
        let src_path = entry.path();
        let dest_path = dest.join(entry.file_name());

        if file_type.is_dir() {
            Box::pin(copy_dir_recursive(&src_path, &dest_path)).await?;
        } else {
            fs::copy(&src_path, &dest_path)
                .await
                .map_err(|e| format!("copy {} -> {}: {e}", src_path.display(), dest_path.display()))?;
        }
    }
    Ok(())
}
