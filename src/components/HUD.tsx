import { motion } from "framer-motion";

interface HUDProps {
  onInstallBundle: () => void;
  onOpenDashboard: () => void;
  onAdjustSpecs: () => void;
  templateCount: number;
  installedCount: number;
  installing: boolean;
  licensed: boolean;
  pendingCount: number;
}

export default function HUD({
  onInstallBundle,
  onOpenDashboard,
  onAdjustSpecs,
  templateCount,
  installedCount,
  installing,
  licensed,
  pendingCount,
}: HUDProps) {
  const allInstalled = installedCount === templateCount;

  return (
    <>
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          background:
            "linear-gradient(180deg, rgba(5,5,15,0.85) 0%, rgba(5,5,15,0) 100%)",
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        {/* Brand */}
        <div style={{ pointerEvents: "auto" }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#e8e8f0",
              letterSpacing: 0.5,
            }}
          >
            FORGE
            <span style={{ color: "#6c5ce7", fontWeight: 300 }}>CLAW</span>
          </span>
        </div>

        {/* Right section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            pointerEvents: "auto",
          }}
        >
          {/* Install progress */}
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                color: allInstalled ? "#2ed573" : "#6c5ce7",
                fontWeight: 700,
              }}
            >
              {installedCount}
            </span>
            /{templateCount} installed
          </div>

          {/* License badge */}
          <div
            style={{
              fontSize: 10,
              background: licensed
                ? "rgba(46,213,115,0.12)"
                : "rgba(255,71,87,0.12)",
              color: licensed ? "#2ed573" : "#ff4757",
              padding: "4px 10px",
              borderRadius: 99,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              border: `1px solid ${licensed ? "rgba(46,213,115,0.25)" : "rgba(255,71,87,0.25)"}`,
            }}
          >
            {licensed ? "Licensed" : "Unlicensed"}
          </div>
        </div>
      </motion.div>

      {/* Bottom action bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
          zIndex: 50,
        }}
      >
        <motion.button
          whileHover={!installing && !allInstalled ? { scale: 1.04, y: -2 } : {}}
          whileTap={!installing && !allInstalled ? { scale: 0.97 } : {}}
          onClick={onInstallBundle}
          disabled={installing || allInstalled}
          style={{
            padding: "12px 28px",
            background: allInstalled
              ? "linear-gradient(135deg, #2ed573 0%, #1ea85a 100%)"
              : "linear-gradient(135deg, #6c5ce7 0%, #4834d4 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            cursor: installing || allInstalled ? "default" : "pointer",
            letterSpacing: 0.3,
            boxShadow: allInstalled
              ? "0 4px 24px rgba(46,213,115,0.3)"
              : "0 4px 24px rgba(108,92,231,0.35)",
            opacity: installing ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {installing && (
            <div
              style={{
                width: 14,
                height: 14,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
          )}
          {allInstalled
            ? "All Templates Installed"
            : installing
              ? "Installing..."
              : "Install Bundle"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenDashboard}
          style={{
            padding: "12px 24px",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
          }}
        >
          Open Dashboard
        </motion.button>
      </motion.div>

      {/* Bottom-left: Adjust Specs link */}
      {(installedCount > 0 || pendingCount > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{
            position: "fixed",
            bottom: 28,
            left: 28,
            zIndex: 50,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.04, x: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAdjustSpecs}
            style={{
              background: "none",
              border: "none",
              color: pendingCount > 0 ? "rgba(108,92,231,0.9)" : "rgba(108,92,231,0.6)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: 0.3,
              padding: "8px 0",
              borderBottom: "1px solid rgba(108,92,231,0.25)",
              transition: "color 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(108,92,231,1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = pendingCount > 0 ? "rgba(108,92,231,0.9)" : "rgba(108,92,231,0.6)")
            }
          >
            Adjust Agent Specifications
            {pendingCount > 0 && (
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    "0 0 4px rgba(108,92,231,0.4)",
                    "0 0 12px rgba(108,92,231,0.8)",
                    "0 0 4px rgba(108,92,231,0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  background: "linear-gradient(135deg, #6c5ce7, #4834d4)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {pendingCount}
              </motion.span>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Subtle hint text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: "fixed",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
          textAlign: "center",
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        Click a shard to inspect &middot; Scroll to zoom &middot; Drag to orbit
      </motion.div>
    </>
  );
}
