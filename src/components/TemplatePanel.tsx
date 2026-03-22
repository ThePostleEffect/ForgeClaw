import { motion, AnimatePresence } from "framer-motion";
import type { AgentTemplate } from "../lib/templates";

interface TemplatePanelProps {
  template: AgentTemplate | null;
  onClose: () => void;
  onInstall: (template: AgentTemplate) => void;
}

export default function TemplatePanel({
  template,
  onClose,
  onInstall,
}: TemplatePanelProps) {
  return (
    <AnimatePresence>
      {template && (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, scale: 0.85, x: 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 40 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 24,
          }}
          style={{
            position: "fixed",
            right: 32,
            top: "50%",
            transform: "translateY(-50%)",
            width: 380,
            zIndex: 100,
          }}
        >
          {/* Holographic panel */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(15,12,40,0.92) 0%, rgba(8,8,24,0.95) 100%)",
              border: "1px solid rgba(108,92,231,0.35)",
              borderRadius: 16,
              padding: "28px 24px",
              backdropFilter: "blur(20px)",
              boxShadow: `
                0 0 40px rgba(108,92,231,0.15),
                inset 0 1px 0 rgba(255,255,255,0.05),
                0 20px 60px rgba(0,0,0,0.5)
              `,
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: 18,
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 4,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
              }
            >
              &times;
            </button>

            {/* Status indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 8px rgba(${template.color.map((c) => Math.round(c * 255)).join(",")}, 0.6)`,
                    `0 0 20px rgba(${template.color.map((c) => Math.round(c * 255)).join(",")}, 0.9)`,
                    `0 0 8px rgba(${template.color.map((c) => Math.round(c * 255)).join(",")}, 0.6)`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: `rgb(${template.color.map((c) => Math.round(c * 255)).join(",")})`,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: 600,
                }}
              >
                {template.status}
              </span>
              {template.isBonus && (
                <span
                  style={{
                    fontSize: 10,
                    background: "rgba(255,165,2,0.15)",
                    color: "#ffa502",
                    padding: "2px 8px",
                    borderRadius: 99,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  BONUS
                </span>
              )}
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#e8e8f0",
                marginBottom: 8,
                letterSpacing: -0.3,
              }}
            >
              {template.name}
            </h2>

            {/* Description */}
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 20,
              }}
            >
              {template.description}
            </p>

            {/* Soul excerpt */}
            <div
              style={{
                background: "rgba(108,92,231,0.08)",
                border: "1px solid rgba(108,92,231,0.2)",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  color: "rgba(108,92,231,0.7)",
                  marginBottom: 6,
                  fontWeight: 700,
                }}
              >
                Soul Essence
              </div>
              <p
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  color: "rgba(255,255,255,0.5)",
                  fontStyle: "italic",
                }}
              >
                "{template.soul}"
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                whileHover={
                  template.status !== "installed" && template.status !== "installing"
                    ? { scale: 1.03 }
                    : {}
                }
                whileTap={
                  template.status !== "installed" && template.status !== "installing"
                    ? { scale: 0.97 }
                    : {}
                }
                onClick={() => {
                  if (template.status !== "installed" && template.status !== "installing") {
                    onInstall(template);
                  }
                }}
                disabled={template.status === "installed" || template.status === "installing"}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background:
                    template.status === "installed"
                      ? "linear-gradient(135deg, #2ed573 0%, #1ea85a 100%)"
                      : template.status === "installing"
                        ? "linear-gradient(135deg, #6c5ce780 0%, #4834d480 100%)"
                        : "linear-gradient(135deg, #6c5ce7 0%, #4834d4 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor:
                    template.status === "installed" || template.status === "installing"
                      ? "default"
                      : "pointer",
                  letterSpacing: 0.3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {template.status === "installed"
                  ? "Installed"
                  : template.status === "installing"
                    ? "Installing..."
                    : "Install Template"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{
                  padding: "12px 20px",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
