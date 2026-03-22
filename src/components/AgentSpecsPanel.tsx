import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEMPLATES } from "../lib/templates";

interface ProposalReview {
  agent_id: string;
  agent_name: string;
  current_soul: string;
  proposed_soul: string;
  reason: string;
  timestamp: string | null;
}

interface AgentSpecsPanelProps {
  open: boolean;
  onClose: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  onProposalHandled: () => void;
  installedAgentIds: string[];
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AgentSpecsPanel({
  open,
  onClose,
  showToast,
  onProposalHandled,
  installedAgentIds,
}: AgentSpecsPanelProps) {
  const [tab, setTab] = useState<"proposals" | "agents">("proposals");
  const [proposals, setProposals] = useState<ProposalReview[]>([]);
  const [selectedProposal, setSelectedProposal] =
    useState<ProposalReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Agent overview state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentSoul, setAgentSoul] = useState("");
  const [loadingSoul, setLoadingSoul] = useState(false);

  const installedAgents = TEMPLATES.filter((t) =>
    installedAgentIds.includes(t.id),
  );

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const result = (await invoke("list_pending_proposals", {
        workspacePath: null,
      })) as ProposalReview[];
      setProposals(result);
    } catch {
      // Outside Tauri or dir doesn't exist
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchProposals();
      setSelectedProposal(null);
      setSelectedAgentId(null);
      setTab(proposals.length > 0 ? "proposals" : "agents");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadAgentSoul = async (agentId: string) => {
    setSelectedAgentId(agentId);
    setLoadingSoul(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const content = (await invoke("read_agent_specs", {
        agentId,
        workspacePath: null,
      })) as string;
      setAgentSoul(content);
    } catch (err) {
      setAgentSoul(`(Failed to load: ${err})`);
    } finally {
      setLoadingSoul(false);
    }
  };

  const handleApprove = async (agentId: string) => {
    setActionLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("approve_proposal", { agentId, workspacePath: null });
      setProposals((prev) => prev.filter((p) => p.agent_id !== agentId));
      setSelectedProposal(null);
      onProposalHandled();
      showToast("Approved — agent specifications updated", "success");
    } catch (err) {
      showToast(`Failed to approve: ${err}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (agentId: string) => {
    setActionLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("reject_proposal", { agentId, workspacePath: null });
      setProposals((prev) => prev.filter((p) => p.agent_id !== agentId));
      setSelectedProposal(null);
      onProposalHandled();
      showToast("Proposal rejected", "info");
    } catch (err) {
      showToast(`Failed to reject: ${err}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedAgentTemplate = selectedAgentId
    ? TEMPLATES.find((t) => t.id === selectedAgentId)
    : null;

  // Determine panel width based on current view
  const isWide = selectedProposal !== null;
  const panelWidth = isWide ? 860 : 520;

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
            background: "rgba(2,2,8,0.6)",
            zIndex: 150,
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: panelWidth,
              maxHeight: "82vh",
              background:
                "linear-gradient(135deg, rgba(15,12,40,0.95) 0%, rgba(8,8,24,0.98) 100%)",
              border: "1px solid rgba(108,92,231,0.3)",
              borderRadius: 20,
              padding: "32px 28px",
              boxShadow:
                "0 0 60px rgba(108,92,231,0.15), 0 30px 80px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "width 0.3s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {(selectedProposal || selectedAgentId) && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedProposal(null);
                      setSelectedAgentId(null);
                    }}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "rgba(255,255,255,0.6)",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    &#8592;
                  </motion.button>
                )}
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#e8e8f0",
                    margin: 0,
                  }}
                >
                  {selectedProposal
                    ? `Review: ${selectedProposal.agent_name}`
                    : selectedAgentId && selectedAgentTemplate
                      ? selectedAgentTemplate.name
                      : "Agent Specifications"}
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.4)",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                &#10005;
              </motion.button>
            </div>

            {/* Tabs (hidden when in detail view) */}
            {!selectedProposal && !selectedAgentId && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 16,
                  flexShrink: 0,
                }}
              >
                {(
                  [
                    { key: "proposals" as const, label: "Proposals" },
                    { key: "agents" as const, label: "Agents" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      background:
                        tab === key
                          ? "rgba(108,92,231,0.15)"
                          : "rgba(255,255,255,0.03)",
                      border:
                        tab === key
                          ? "1px solid rgba(108,92,231,0.35)"
                          : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10,
                      color:
                        tab === key ? "#e8e8f0" : "rgba(255,255,255,0.4)",
                      fontSize: 12,
                      fontWeight: tab === key ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    {label}
                    {key === "proposals" && proposals.length > 0 && (
                      <span
                        style={{
                          background:
                            "linear-gradient(135deg, #6c5ce7, #4834d4)",
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 800,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {proposals.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ═══ PROPOSAL REVIEW VIEW ═══ */}
            {selectedProposal && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  overflow: "hidden",
                  gap: 16,
                }}
              >
                {/* Reason banner */}
                <div
                  style={{
                    padding: "12px 16px",
                    background: "rgba(108,92,231,0.08)",
                    border: "1px solid rgba(108,92,231,0.2)",
                    borderRadius: 10,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(108,92,231,0.7)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    Proposed Change
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedProposal.reason}
                  </div>
                  {selectedProposal.timestamp && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.2)",
                        marginTop: 6,
                      }}
                    >
                      {relativeTime(selectedProposal.timestamp)}
                    </div>
                  )}
                </div>

                {/* Side-by-side */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={labelStyle}>Current</div>
                    <div style={{ ...paneStyle, borderColor: "rgba(255,255,255,0.08)" }}>
                      {selectedProposal.current_soul}
                    </div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ ...labelStyle, color: "rgba(108,92,231,0.6)" }}>Proposed</div>
                    <div style={{ ...paneStyle, background: "rgba(108,92,231,0.04)", borderColor: "rgba(108,92,231,0.2)" }}>
                      {selectedProposal.proposed_soul}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleReject(selectedProposal.agent_id)}
                    disabled={actionLoading}
                    style={{
                      padding: "10px 22px",
                      background: "rgba(255,71,87,0.1)",
                      color: "#ff4757",
                      border: "1px solid rgba(255,71,87,0.25)",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: actionLoading ? "default" : "pointer",
                    }}
                  >
                    Reject
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleApprove(selectedProposal.agent_id)}
                    disabled={actionLoading}
                    style={{
                      padding: "10px 22px",
                      background: "linear-gradient(135deg, #2ed573 0%, #1ea85a 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: actionLoading ? "default" : "pointer",
                      boxShadow: "0 4px 16px rgba(46,213,115,0.25)",
                    }}
                  >
                    {actionLoading ? "Applying..." : "Approve"}
                  </motion.button>
                </div>
              </div>
            )}

            {/* ═══ AGENT SOUL VIEWER ═══ */}
            {selectedAgentId && !selectedProposal && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", gap: 12 }}>
                <div style={{ ...labelStyle, marginBottom: 0 }}>SOUL.md</div>
                {loadingSoul ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        border: "2px solid rgba(108,92,231,0.3)",
                        borderTopColor: "#6c5ce7",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ ...paneStyle, flex: 1, borderColor: "rgba(108,92,231,0.15)" }}>
                    {agentSoul}
                  </div>
                )}
              </div>
            )}

            {/* ═══ PROPOSALS LIST ═══ */}
            {!selectedProposal && !selectedAgentId && tab === "proposals" && (
              <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        border: "2px solid rgba(108,92,231,0.3)",
                        borderTopColor: "#6c5ce7",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                  </div>
                ) : proposals.length === 0 ? (
                  <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: "48px 20px", fontSize: 13, lineHeight: 1.8 }}>
                    <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.4 }}>&#9675;</div>
                    No pending proposals.
                    <br />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>
                      Ask your main agent to adjust an agent's specifications and it will appear here for your review.
                    </span>
                  </div>
                ) : (
                  proposals.map((proposal) => (
                    <motion.button
                      key={proposal.agent_id}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedProposal(proposal)}
                      style={listItemStyle}
                    >
                      <motion.div
                        animate={{ boxShadow: ["0 0 4px rgba(108,92,231,0.4)", "0 0 10px rgba(108,92,231,0.8)", "0 0 4px rgba(108,92,231,0.4)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: 10, height: 10, borderRadius: "50%", background: "#6c5ce7", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{proposal.agent_name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                          {proposal.reason}
                        </div>
                      </div>
                      {proposal.timestamp && (
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>
                          {relativeTime(proposal.timestamp)}
                        </div>
                      )}
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>&#8594;</div>
                    </motion.button>
                  ))
                )}
              </div>
            )}

            {/* ═══ AGENTS LIST ═══ */}
            {!selectedProposal && !selectedAgentId && tab === "agents" && (
              <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {installedAgents.length === 0 ? (
                  <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: "48px 20px", fontSize: 13, lineHeight: 1.8 }}>
                    <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.4 }}>&#9675;</div>
                    No agents deployed yet.
                    <br />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>
                      Deploy the bundle first to view your agents here.
                    </span>
                  </div>
                ) : (
                  installedAgents.map((agent) => (
                    <motion.button
                      key={agent.id}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => loadAgentSoul(agent.id)}
                      style={listItemStyle}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: `rgb(${Math.round(agent.color[0] * 255)}, ${Math.round(agent.color[1] * 255)}, ${Math.round(agent.color[2] * 255)})`,
                          boxShadow: `0 0 8px rgba(${Math.round(agent.color[0] * 255)}, ${Math.round(agent.color[1] * 255)}, ${Math.round(agent.color[2] * 255)}, 0.5)`,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{agent.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {agent.description}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>&#8594;</div>
                    </motion.button>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Shared styles
const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "rgba(255,255,255,0.35)",
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 8,
};

const paneStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px 14px",
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  color: "rgba(255,255,255,0.7)",
  fontSize: 11.5,
  fontFamily: "monospace",
  lineHeight: 1.6,
  overflowY: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const listItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 16px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(108,92,231,0.15)",
  borderRadius: 12,
  cursor: "pointer",
  textAlign: "left",
  color: "#e8e8f0",
  width: "100%",
};
