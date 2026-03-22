import { useState } from "react";
import { KeyRound, ArrowRight } from "lucide-react";
import { validateLicense } from "../lib/tauri";

interface Props {
  onActivated: () => void;
}

export default function LicenseGate({ onActivated }: Props) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await validateLicense(key);
      if (result.valid) {
        onActivated();
      } else {
        setError("License key is not valid. Please check and try again.");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      <div style={{ width: 400, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            padding: "0.8rem",
            background: "rgba(108,92,231,0.15)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "1.2rem",
          }}
        >
          <KeyRound size={32} color="var(--accent)" />
        </div>

        <h1 style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>
          ForgeClaw
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
          }}
        >
          Enter your Gumroad license key to unlock the premium agent bundle.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              style={{ textAlign: "center", letterSpacing: "0.5px" }}
              autoFocus
            />
          </div>

          {error && (
            <div className="alert alert-error" style={{ textAlign: "left" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !key.trim()}
            style={{
              width: "100%",
              padding: "0.7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                Activate License <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
          }}
        >
          Don't have a key? Purchase the bundle at gumroad.com/forgeclaw
        </p>
      </div>
    </div>
  );
}
