import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LicenseModalProps {
  open: boolean;
  onActivated: () => void;
}

export default function LicenseModal({ open, onActivated }: LicenseModalProps) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      // Try Tauri invoke first, fall back to localStorage stub
      let valid = false;
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const result = (await invoke("validate_license", {
          key: trimmed,
        })) as { valid: boolean };
        valid = result.valid;
      } catch {
        // Fallback: accept keys >= 8 chars (dev stub)
        valid = trimmed.length >= 8;
      }

      if (valid) {
        localStorage.setItem("xemory_license_key", trimmed);
        localStorage.setItem("xemory_licensed", "true");
        onActivated();
      } else {
        setError("Invalid license key. Please check and try again.");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(2,2,8,0.92)",
            zIndex: 200,
            backdropFilter: "blur(12px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              width: 420,
              background:
                "linear-gradient(135deg, rgba(15,12,40,0.95) 0%, rgba(8,8,24,0.98) 100%)",
              border: "1px solid rgba(108,92,231,0.3)",
              borderRadius: 20,
              padding: "40px 32px",
              textAlign: "center",
              boxShadow: `
                0 0 60px rgba(108,92,231,0.15),
                0 30px 80px rgba(0,0,0,0.6)
              `,
            }}
          >
            {/* Orb icon */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(108,92,231,0.4)",
                  "0 0 40px rgba(108,92,231,0.7)",
                  "0 0 20px rgba(108,92,231,0.4)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 40% 40%, #8b7bf7, #4834d4)",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </motion.div>

            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#e8e8f0",
                marginBottom: 6,
              }}
            >
              Unlock the Soul Chamber
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 28,
                lineHeight: 1.5,
              }}
            >
              Enter your Gumroad license key to access all 11 premium agent
              templates.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(108,92,231,0.25)",
                  borderRadius: 10,
                  color: "#e8e8f0",
                  fontSize: 14,
                  textAlign: "center",
                  letterSpacing: 0.8,
                  outline: "none",
                  transition: "border-color 0.2s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(108,92,231,0.6)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(108,92,231,0.25)")
                }
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "rgba(255,71,87,0.1)",
                    border: "1px solid rgba(255,71,87,0.3)",
                    borderRadius: 8,
                    color: "#ff4757",
                    fontSize: 12,
                  }}
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading || !key.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "14px 0",
                  background: loading
                    ? "rgba(108,92,231,0.5)"
                    : "linear-gradient(135deg, #6c5ce7 0%, #4834d4 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                  letterSpacing: 0.3,
                  fontFamily: "inherit",
                  boxShadow: "0 4px 20px rgba(108,92,231,0.3)",
                  opacity: !key.trim() ? 0.5 : 1,
                }}
              >
                {loading ? "Validating..." : "Activate License"}
              </motion.button>
            </form>

            <p
              style={{
                marginTop: 24,
                fontSize: 11,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Purchase at gumroad.com/xemorysystems &middot; $24.99 one-time
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
