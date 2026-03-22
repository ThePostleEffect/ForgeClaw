import { useState, useEffect, useCallback } from "react";
import SoulChamber from "./components/SoulChamber";
import TemplatePanel from "./components/TemplatePanel";
import HUD from "./components/HUD";
import LicenseModal from "./components/LicenseModal";
import StatusToast from "./components/StatusToast";
import AgentSpecsPanel from "./components/AgentSpecsPanel";
import {
  TEMPLATES,
  type AgentTemplate,
  type TemplateStatus,
} from "./lib/templates";

type ToastInfo = {
  message: string;
  type: "success" | "error" | "info";
} | null;

export default function App() {
  const [licensed, setLicensed] = useState<boolean | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<AgentTemplate | null>(null);
  const [templateStatuses, setTemplateStatuses] = useState<
    Record<string, TemplateStatus>
  >({});
  const [installing, setInstalling] = useState(false);
  const [toast, setToast] = useState<ToastInfo>(null);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check license on mount
  useEffect(() => {
    (async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const info = (await invoke("get_license_status")) as {
          valid: boolean;
        } | null;
        setLicensed(info?.valid ?? false);
      } catch {
        const stored = localStorage.getItem("forgeclaw_licensed");
        setLicensed(stored === "true");
      }
    })();
  }, []);

  // Fetch bundle status on mount + after installs
  const refreshBundleStatus = useCallback(async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const status = (await invoke("get_bundle_status", {
        workspacePath: null,
      })) as {
        installed_templates: string[];
        missing_templates: string[];
      };
      const newStatuses: Record<string, TemplateStatus> = {};
      for (const id of status.installed_templates) {
        newStatuses[id] = "installed";
      }
      for (const id of status.missing_templates) {
        newStatuses[id] = "ready";
      }
      setTemplateStatuses(newStatuses);
    } catch {
      // Outside Tauri — leave all as "ready"
    }
  }, []);

  useEffect(() => {
    if (licensed) {
      refreshBundleStatus();
    }
  }, [licensed, refreshBundleStatus]);

  // Check for pending proposals once on launch
  useEffect(() => {
    if (!licensed) return;

    (async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const proposals = (await invoke("list_pending_proposals", {
          workspacePath: null,
        })) as unknown[];
        setPendingCount(proposals.length);
        if (proposals.length > 0) {
          setToast({
            message: `You have ${proposals.length} agent adjustment${proposals.length > 1 ? "s" : ""} waiting for review`,
            type: "info",
          });
          setTimeout(() => setToast(null), 5000);
        }
      } catch {
        // Outside Tauri or pending dir doesn't exist yet
      }
    })();
  }, [licensed]);

  // Merge statuses into template objects
  const templatesWithStatus = TEMPLATES.map((t) => ({
    ...t,
    status: templateStatuses[t.id] ?? t.status,
  }));

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  // Install entire bundle
  const handleInstallBundle = useCallback(async () => {
    setInstalling(true);
    // Mark all as "installing"
    setTemplateStatuses((prev) => {
      const next = { ...prev };
      for (const t of TEMPLATES) {
        if (next[t.id] !== "installed") next[t.id] = "installing";
      }
      return next;
    });

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      // Pre-check: is openclaw available?
      try {
        await invoke("check_openclaw");
      } catch (e) {
        showToast(
          `OpenClaw CLI not found. Install it first.`,
          "error",
        );
        setTemplateStatuses((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            if (next[key] === "installing") next[key] = "ready";
          }
          return next;
        });
        setInstalling(false);
        return;
      }

      const status = (await invoke("install_bundle", {
        workspacePath: null,
        bundleSource: null,
      })) as {
        installed: boolean;
        installed_templates: string[];
        missing_templates: string[];
        registered_agents: string[];
        workspace_path: string;
        results: Array<{ id: string; success: boolean; message: string }>;
      };

      const newStatuses: Record<string, TemplateStatus> = {};
      for (const id of status.installed_templates) {
        newStatuses[id] = "installed";
      }
      for (const id of status.missing_templates) {
        newStatuses[id] = "ready";
      }
      setTemplateStatuses(newStatuses);

      const succeeded = status.results.filter((r) => r.success).length;
      const failed = status.results.filter((r) => !r.success);

      if (status.installed) {
        showToast(
          `All ${succeeded} agents installed and registered with OpenClaw!`,
          "success",
        );
      } else if (failed.length > 0) {
        const failNames = failed.map((f) => f.id).join(", ");
        showToast(
          `${succeeded} installed. Failed: ${failNames}`,
          "error",
        );
      } else {
        showToast(
          `${status.installed_templates.length} of 11 installed.`,
          "info",
        );
      }
    } catch (err) {
      showToast(String(err), "error");
      // Reset installing statuses back to ready
      setTemplateStatuses((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key] === "installing") next[key] = "ready";
        }
        return next;
      });
    } finally {
      setInstalling(false);
    }
  }, [showToast]);

  // Install single template
  const handleInstallTemplate = useCallback(
    async (template: AgentTemplate) => {
      setTemplateStatuses((prev) => ({
        ...prev,
        [template.id]: "installing",
      }));

      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const status = (await invoke("install_single_template", {
          templateId: template.id,
          workspacePath: null,
          bundleSource: null,
        })) as {
          installed_templates: string[];
          missing_templates: string[];
          registered_agents: string[];
          workspace_path: string;
          results: Array<{ id: string; success: boolean; message: string }>;
        };

        const newStatuses: Record<string, TemplateStatus> = {};
        for (const id of status.installed_templates) {
          newStatuses[id] = "installed";
        }
        for (const id of status.missing_templates) {
          newStatuses[id] = "ready";
        }
        setTemplateStatuses(newStatuses);
        showToast(`"${template.name}" installed successfully.`, "success");
      } catch (err) {
        setTemplateStatuses((prev) => ({
          ...prev,
          [template.id]: "ready",
        }));
        showToast(`Failed to install "${template.name}": ${err}`, "error");
      }
    },
    [showToast],
  );

  const handleOpenDashboard = useCallback(async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      // Use Tauri shell open to launch in default browser
      await invoke("plugin:shell|open", {
        path: "http://localhost:18789",
      });
    } catch {
      // Fallback
      window.open("http://localhost:18789", "_blank");
    }
  }, []);

  // Loading
  if (licensed === null) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#020208",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid rgba(108,92,231,0.3)",
            borderTopColor: "#6c5ce7",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      </div>
    );
  }

  // Find the selected template with live status
  const selectedWithStatus = selectedTemplate
    ? templatesWithStatus.find((t) => t.id === selectedTemplate.id) ?? null
    : null;

  return (
    <>
      <LicenseModal
        open={!licensed}
        onActivated={() => setLicensed(true)}
      />

      <SoulChamber
        templates={templatesWithStatus}
        onSelectTemplate={setSelectedTemplate}
      />

      {licensed && (
        <HUD
          onInstallBundle={handleInstallBundle}
          onOpenDashboard={handleOpenDashboard}
          onAdjustSpecs={() => setSpecsOpen(true)}
          templateCount={TEMPLATES.length}
          installedCount={
            Object.values(templateStatuses).filter((s) => s === "installed")
              .length
          }
          installing={installing}
          licensed={licensed}
          pendingCount={pendingCount}
        />
      )}

      {licensed && (
        <TemplatePanel
          template={selectedWithStatus}
          onClose={() => setSelectedTemplate(null)}
          onInstall={handleInstallTemplate}
        />
      )}

      <AgentSpecsPanel
        open={specsOpen}
        onClose={() => setSpecsOpen(false)}
        showToast={showToast}
        onProposalHandled={() => setPendingCount((c) => Math.max(0, c - 1))}
        installedAgentIds={
          Object.entries(templateStatuses)
            .filter(([, s]) => s === "installed")
            .map(([id]) => id)
        }
      />

      <StatusToast toast={toast} />
    </>
  );
}
