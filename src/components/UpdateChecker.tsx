import { useState } from "react";
import { RefreshCw, Download, ArrowUpCircle } from "lucide-react";
import {
  checkForUpdates,
  downloadUpdate,
  installBundle,
  type ReleaseInfo,
} from "../lib/tauri";

interface Props {
  currentVersion: string;
  workspacePath?: string;
}

export default function UpdateChecker({
  currentVersion,
  workspacePath,
}: Props) {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleCheck() {
    setChecking(true);
    setError(null);
    setRelease(null);
    setDone(false);
    try {
      const result = await checkForUpdates(currentVersion);
      setRelease(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setChecking(false);
    }
  }

  async function handleDownloadAndInstall() {
    if (!release?.download_url) return;
    setDownloading(true);
    setError(null);
    try {
      const extractedPath = await downloadUpdate(release.download_url);
      await installBundle(workspacePath, extractedPath);
      setDone(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Updates</h2>
        <p>Check for new versions of the premium agent bundle.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <strong style={{ fontSize: "0.9rem" }}>Current version</strong>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              v{currentVersion}
            </p>
          </div>
          <button className="btn-secondary btn-sm" onClick={handleCheck} disabled={checking}>
            <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
            {checking ? "Checking..." : "Check for Updates"}
          </button>
        </div>

        {release === null && !checking && !error && (
          <div className="alert alert-info">
            Click "Check for Updates" to see if a newer bundle is available.
          </div>
        )}

        {checking && (
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <span className="spinner" />
            <p style={{ marginTop: "0.5rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Checking GitHub releases...
            </p>
          </div>
        )}

        {release !== undefined && release === null && !checking && (
          <div className="alert alert-success">
            You're up to date! No new versions available.
          </div>
        )}

        {release && (
          <div className="update-banner">
            <div className="update-banner-text">
              <ArrowUpCircle size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
              <strong>{release.tag_name}</strong> is available
              {release.name && ` — ${release.name}`}
            </div>
            {!done ? (
              <button
                className="btn-primary btn-sm"
                onClick={handleDownloadAndInstall}
                disabled={downloading || !release.download_url}
              >
                {downloading ? (
                  <>
                    <span className="spinner" /> Downloading...
                  </>
                ) : (
                  <>
                    <Download size={14} style={{ marginRight: 4 }} />
                    Download & Install
                  </>
                )}
              </button>
            ) : (
              <span className="badge badge-success">Installed</span>
            )}
          </div>
        )}

        {release?.body && (
          <div style={{ marginTop: "0.8rem", fontSize: "0.82rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
            {release.body}
          </div>
        )}
      </div>
    </div>
  );
}
