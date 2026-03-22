import { useState, useEffect } from "react";
import { Download, CheckCircle2, Circle, Package } from "lucide-react";
import {
  getBundleStatus,
  installBundle,
  type BundleStatus,
} from "../lib/tauri";

const ALL_TEMPLATES = [
  "code-reviewer",
  "doc-writer",
  "test-generator",
  "refactor-pilot",
  "security-auditor",
  "api-designer",
  "debug-detective",
  "deploy-manager",
  "data-pipeline",
  "onboarding-guide",
];

interface Props {
  workspacePath?: string;
}

export default function InstallBundle({ workspacePath }: Props) {
  const [status, setStatus] = useState<BundleStatus | null>(null);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBundleStatus(workspacePath)
      .then(setStatus)
      .catch((e) => setError(String(e)));
  }, [workspacePath]);

  async function handleInstall() {
    setInstalling(true);
    setError(null);
    try {
      const result = await installBundle(workspacePath);
      setStatus(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setInstalling(false);
    }
  }

  const installedSet = new Set(status?.installed_templates ?? []);

  return (
    <div>
      <div className="page-header">
        <h2>Install Bundle</h2>
        <p>
          One-click install of all 10 premium agent templates into your OpenClaw
          workspace.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="install-hero">
          <Package size={44} color="var(--accent)" style={{ marginBottom: "0.6rem" }} />
          <h3>Premium Agent Bundle</h3>
          <p>
            {status?.installed
              ? "All templates installed successfully."
              : `${installedSet.size} of ${ALL_TEMPLATES.length} templates installed.`}
          </p>

          {!status?.installed && (
            <button
              className="btn-primary"
              onClick={handleInstall}
              disabled={installing}
              style={{
                padding: "0.7rem 2rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {installing ? (
                <>
                  <span className="spinner" /> Installing...
                </>
              ) : (
                <>
                  <Download size={16} /> Install Bundle
                </>
              )}
            </button>
          )}

          {status?.installed && (
            <div className="alert alert-success" style={{ display: "inline-block" }}>
              All templates are installed and ready to use.
            </div>
          )}

          <div className="template-checklist">
            {ALL_TEMPLATES.map((name) => (
              <div
                key={name}
                className={`template-item ${installedSet.has(name) ? "installed" : "missing"}`}
              >
                {installedSet.has(name) ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Circle size={14} />
                )}
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {status && (
        <p
          style={{
            marginTop: "0.8rem",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          Workspace: {status.workspace_path}
        </p>
      )}
    </div>
  );
}
