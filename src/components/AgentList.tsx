import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Activity } from "lucide-react";
import { listAgents, type AgentInfo } from "../lib/tauri";

interface Props {
  openclawPath?: string;
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "running" || s === "active")
    return <span className="badge badge-success">Running</span>;
  if (s === "stopped" || s === "exited")
    return <span className="badge badge-danger">Stopped</span>;
  if (s === "idle")
    return <span className="badge badge-warning">Idle</span>;
  return <span className="badge badge-muted">{status}</span>;
}

export default function AgentList({ openclawPath }: Props) {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAgents(openclawPath);
      setAgents(result);
    } catch (err) {
      setError(String(err));
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [openclawPath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Agents</h2>
          <p>View and monitor your running OpenClaw agents.</p>
        </div>
        <button className="btn-secondary btn-sm" onClick={refresh} disabled={loading}>
          <RefreshCw size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && agents.length === 0 && !error && (
        <div className="empty-state">
          <Activity size={40} style={{ marginBottom: "0.8rem", opacity: 0.3 }} />
          <p>No agents found. Install the bundle and start an agent to see it here.</p>
        </div>
      )}

      {loading && agents.length === 0 && (
        <div className="empty-state">
          <span className="spinner" />
          <p style={{ marginTop: "0.6rem" }}>Loading agents...</p>
        </div>
      )}

      <div className="agent-grid">
        {agents.map((agent) => (
          <div className="agent-row" key={agent.name}>
            <div className="agent-info">
              <span className="agent-name">{agent.name}</span>
              {agent.last_heartbeat && (
                <span className="agent-meta">
                  Last heartbeat: {agent.last_heartbeat}
                </span>
              )}
              {agent.template && (
                <span className="agent-meta">Template: {agent.template}</span>
              )}
            </div>
            {statusBadge(agent.status)}
          </div>
        ))}
      </div>
    </div>
  );
}
