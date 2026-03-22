import { motion, AnimatePresence } from "framer-motion";

interface StatusToastProps {
  toast: { message: string; type: "success" | "error" | "info" } | null;
}

const colors = {
  success: { bg: "rgba(46,213,115,0.12)", border: "rgba(46,213,115,0.35)", text: "#2ed573" },
  error: { bg: "rgba(255,71,87,0.12)", border: "rgba(255,71,87,0.35)", text: "#ff4757" },
  info: { bg: "rgba(108,92,231,0.12)", border: "rgba(108,92,231,0.35)", text: "#8b7bf7" },
};

export default function StatusToast({ toast }: StatusToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.message}
          initial={{ opacity: 0, y: 30, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            position: "fixed",
            bottom: 120,
            left: "50%",
            zIndex: 300,
            padding: "12px 24px",
            background: colors[toast.type].bg,
            border: `1px solid ${colors[toast.type].border}`,
            borderRadius: 12,
            color: colors[toast.type].text,
            fontSize: 13,
            fontWeight: 600,
            maxWidth: 500,
            textAlign: "center",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
