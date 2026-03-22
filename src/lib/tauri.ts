import { invoke } from "@tauri-apps/api/core";

// ── License ──

export interface LicenseInfo {
  valid: boolean;
  email: string | null;
  key: string;
}

export async function validateLicense(key: string): Promise<LicenseInfo> {
  return invoke("validate_license", { key });
}

export async function getLicenseStatus(): Promise<LicenseInfo | null> {
  return invoke("get_license_status");
}

// ── Agents ──

export interface AgentInfo {
  name: string;
  status: string;
  last_heartbeat: string | null;
  template: string | null;
}

export async function listAgents(openclawPath?: string): Promise<AgentInfo[]> {
  return invoke("list_agents", { openclawPath: openclawPath ?? null });
}

// ── Bundle ──

export interface BundleStatus {
  installed: boolean;
  installed_templates: string[];
  missing_templates: string[];
  workspace_path: string;
}

export async function installBundle(
  workspacePath?: string,
  bundleSource?: string,
): Promise<BundleStatus> {
  return invoke("install_bundle", {
    workspacePath: workspacePath ?? null,
    bundleSource: bundleSource ?? null,
  });
}

export async function installSingleTemplate(
  templateId: string,
  workspacePath?: string,
  bundleSource?: string,
): Promise<BundleStatus> {
  return invoke("install_single_template", {
    templateId,
    workspacePath: workspacePath ?? null,
    bundleSource: bundleSource ?? null,
  });
}

export async function getBundleStatus(
  workspacePath?: string,
): Promise<BundleStatus> {
  return invoke("get_bundle_status", {
    workspacePath: workspacePath ?? null,
  });
}

// ── Updater ──

export interface ReleaseInfo {
  tag_name: string;
  name: string | null;
  published_at: string | null;
  download_url: string | null;
  body: string | null;
}

export async function checkForUpdates(
  currentVersion: string,
): Promise<ReleaseInfo | null> {
  return invoke("check_for_updates", { currentVersion });
}

export async function downloadUpdate(downloadUrl: string): Promise<string> {
  return invoke("download_update", { downloadUrl });
}

// ── Settings ──

export interface AppSettings {
  openclaw_path: string;
  workspace_path: string;
  dashboard_port: number;
  auto_check_updates: boolean;
  bundle_version: string;
}

export async function getSettings(): Promise<AppSettings> {
  return invoke("get_settings");
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return invoke("save_settings", { settings });
}

export async function detectOpenclawPath(): Promise<string> {
  return invoke("detect_openclaw_path");
}

// ── Proposals ──

export interface ProposalReview {
  agent_id: string;
  agent_name: string;
  current_soul: string;
  proposed_soul: string;
  reason: string;
  timestamp: string | null;
}

export async function listPendingProposals(
  workspacePath?: string,
): Promise<ProposalReview[]> {
  return invoke("list_pending_proposals", {
    workspacePath: workspacePath ?? null,
  });
}

export async function approveProposal(
  agentId: string,
  workspacePath?: string,
): Promise<void> {
  return invoke("approve_proposal", {
    agentId,
    workspacePath: workspacePath ?? null,
  });
}

export async function rejectProposal(
  agentId: string,
  workspacePath?: string,
): Promise<void> {
  return invoke("reject_proposal", {
    agentId,
    workspacePath: workspacePath ?? null,
  });
}
