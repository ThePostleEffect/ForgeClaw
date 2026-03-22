# ForgeClaw

A premium desktop companion app for [OpenClaw](https://github.com/openclaw/openclaw) — install, manage, and orchestrate 11 specialist AI agents with one click.

![ForgeClaw](ForgeClaw-Logo.png)

## What is ForgeClaw?

ForgeClaw is a Tauri-based desktop app that installs a curated bundle of 11 premium AI agent templates into your OpenClaw workspace. Each agent has a deeply crafted personality (SOUL.md) and configuration (AGENTS.md), designed to work independently or delegate tasks to each other through OpenClaw's multi-agent system.

## The Agent Roster

| Agent | Role |
|---|---|
| **Inbox Zero Sentinel** | Communications triage — protects your attention, drafts replies, delivers daily briefings |
| **Content Forge** | World-class writing — blog posts, social media, email sequences, landing pages |
| **Personal CFO** | Financial clarity — spending tracking, budgets, anomaly detection, forecasting |
| **Research Raven** | Deep research — multi-source synthesis, confidence labeling, structured briefs |
| **Code Companion** | Senior engineer — code review, pair programming, debugging, security-aware |
| **Customer Whisperer** | Customer experience — empathetic support, pattern recognition, escalation |
| **Meeting Maestro** | Meeting intelligence — agendas, smart notes, action tracking, anti-meeting advocacy |
| **Health Horizon** | Wellness strategist — habit architecture, sleep/movement/nutrition/stress systems |
| **Sales Scout** | Pipeline builder — prospect research, value-first outreach, deal management |
| **Learning Luminary** | Adaptive educator — personalized learning paths, spaced repetition, mastery tracking |
| **Xemory Keeper** | Memory & context — cross-agent knowledge graph, pattern detection, institutional memory |

## Features

- **Soul Chamber UI** — Immersive 3D interface with a glowing orb and orbiting crystal shards representing each agent
- **One-Click Install** — Copies templates, registers agents with OpenClaw, and configures the subagent allowlist automatically
- **License Gate** — Gumroad license key validation for premium access
- **Dashboard Integration** — Launch the OpenClaw Control UI directly from the app
- **Update Checker** — Poll for new bundle versions from GitHub
- **Cross-Platform** — Built with Tauri (Rust + React), runs on Windows, macOS, and Linux

## Prerequisites

- [OpenClaw](https://docs.openclaw.ai) installed and configured (`openclaw --version`)
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) toolchain
- [pnpm](https://pnpm.io/) package manager

## Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ForgeClaw.git
cd ForgeClaw

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## How It Works

1. **Launch ForgeClaw** — the Soul Chamber renders with 11 crystal shards orbiting a central orb
2. **Enter your license key** — validates against Gumroad (dev mode: any 8+ character key)
3. **Click "Install Bundle"** — the app:
   - Copies SOUL.md + AGENTS.md for each agent to `~/.openclaw/agents/<agent-id>/`
   - Registers each agent with `openclaw agents add <id> --non-interactive --workspace <path>`
   - Configures the subagent allowlist so your main agent can delegate to all 11 specialists
4. **Shards turn green** as each agent installs successfully
5. **Verify**: Run `openclaw agents list` to see all 12 agents (main + 11 specialists)

## Project Structure

```
ForgeClaw/
├── src/                          # React frontend
│   ├── App.tsx                   # Main app orchestration
│   ├── components/
│   │   ├── SoulChamber.tsx       # 3D scene (Three.js + R3F)
│   │   ├── HUD.tsx               # Top bar + action buttons
│   │   ├── TemplatePanel.tsx     # Agent detail panel
│   │   ├── LicenseModal.tsx      # License key input
│   │   └── StatusToast.tsx       # Notification toasts
│   └── lib/
│       └── templates.ts          # Agent template definitions
├── src-tauri/                    # Rust backend
│   └── src/
│       ├── main.rs               # Entry point
│       ├── lib.rs                # Tauri plugin setup
│       └── commands/
│           ├── bundle.rs         # Install logic + OpenClaw CLI integration
│           ├── agents.rs         # Agent listing + OpenClaw detection
│           ├── openclaw_bin.rs   # Cross-platform binary resolution
│           ├── license.rs        # License validation
│           ├── settings.rs       # App settings
│           └── updater.rs        # Update checker
└── bundle-templates/             # The 11 premium agent templates
    ├── inbox-zero-sentinel/
    ├── content-forge/
    ├── personal-cfo/
    ├── research-raven/
    ├── code-companion/
    ├── customer-whisperer/
    ├── meeting-maestro/
    ├── health-horizon/
    ├── sales-scout/
    ├── learning-luminary/
    └── xemory-keeper/
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Three.js, @react-three/fiber, Framer Motion
- **Backend**: Rust, Tauri 2
- **3D**: @react-three/drei, @react-three/postprocessing (bloom/glow effects)
- **Agent Framework**: OpenClaw

## Security Notes

- The app never exposes network ports — all communication is local via Tauri IPC
- License keys are validated client-side (Gumroad API integration planned)
- OpenClaw CLI commands are executed through Rust's `std::process::Command` with no shell interpolation
- File operations are restricted to the OpenClaw workspace directory
- The CSP policy restricts connections to `self`, `api.gumroad.com`, and `api.github.com`

## License

Proprietary — sold as a premium bundle on Gumroad. See LICENSE for details.

---

Built with [Tauri](https://tauri.app) and [OpenClaw](https://openclaw.ai).
