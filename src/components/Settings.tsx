import { useState, useEffect } from "react";
import { Save, FolderSearch, ExternalLink } from "lucide-react";
import {
  getSettings,
  saveSettings,
  detectOpenclawPath,
  type AppSettings,
} from "../lib/tauri";

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((e) => setMessage({ type: "error", text: String(e) }));
  }, []);

  function update(patch: Partial<AppSettings>) {
    if (!settings) return;
    setSettings({ ...settings, ...patch });
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveSettings(settings);
      setMessage({ type: "success", text: "Settings saved." });
    } catch (err) {
      setMessage({ type: "error", text: String(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDetect() {
    setDetecting(true);
    try {
      const path = await detectOpenclawPath();
      update({ openclaw_path: path });
      setMessage({ type: "success", text: `Found OpenClaw at ${path}` });
    } catch (err) {
      setMessage({ type: "error", text: String(err) });
    } finally {
      setDetecting(false);
    }
  }

  function openDashboard() {
    if (!settings) return;
    window.open(`http://localhost:${settings.dashboard_port}`, "_blank");
  }

  if (!settings) {
    return (
      <div className="empty-state">
        <span className="spinner" />
        <p style={{ marginTop: "0.6rem" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure your OpenClaw installation and Agent Hub preferences.</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type === "success" ? "success" : "error"}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="form-group">
          <label>OpenClaw Binary Path</label>
          <div className="form-row">
            <div className="form-group">
              <input
                value={settings.openclaw_path}
                onChange={(e) => update({ openclaw_path: e.target.value })}
                placeholder="/usr/local/bin/openclaw"
              />
            </div>
            <button
              className="btn-secondary btn-sm"
              onClick={handleDetect}
              disabled={detecting}
              style={{ whiteSpace: "nowrap" }}
            >
              <FolderSearch size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
              {detecting ? "Detecting..." : "Auto-detect"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Workspace Directory</label>
          <input
            value={settings.workspace_path}
            onChange={(e) => update({ workspace_path: e.target.value })}
            placeholder="~/.openclaw"
          />
        </div>

        <div className="form-group">
          <label>Dashboard Port</label>
          <input
            type="number"
            value={settings.dashboard_port}
            onChange={(e) =>
              update({ dashboard_port: parseInt(e.target.value) || 18789 })
            }
            style={{ width: 120 }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={settings.auto_check_updates}
              onChange={(e) =>
                update({ auto_check_updates: e.target.checked })
              }
              style={{ width: "auto", padding: 0 }}
            />
            Automatically check for bundle updates
          </label>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.5rem" }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <button className="btn-secondary" onClick={openDashboard}>
            <ExternalLink size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
            Open Dashboard
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: "0.75rem" }}>
        <h3 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>API Key Reminder</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          Make sure your AI provider API keys are configured in your OpenClaw
          environment. Agent templates require a valid API key to run.
          Check your <code style={{ color: "var(--accent)", background: "var(--bg-secondary)", padding: "0.1rem 0.3rem", borderRadius: 4 }}>~/.openclaw/config.yaml</code> or
          set the <code style={{ color: "var(--accent)", background: "var(--bg-secondary)", padding: "0.1rem 0.3rem", borderRadius: 4 }}>OPENCLAW_API_KEY</code> environment variable.
        </p>
      </div>
    </div>
  );
}
