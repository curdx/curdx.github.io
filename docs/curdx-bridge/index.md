# CurdX Bridge

Multi-AI split-pane terminal — Claude, Codex, Gemini, and OpenCode working side by side.

![CurdX Bridge screenshot](/images/curdx-bridge/screenshot.png)

## What is CurdX Bridge?

CurdX Bridge puts multiple AI coding agents into split terminal panes. You talk to Claude as your primary interface — when you need a second opinion, a code review, or creative ideas, just ask naturally. Claude coordinates with the other agents behind the scenes.

No tab switching. No copy-pasting context between tools. Just talk.

![CurdX Bridge layout](/images/curdx-bridge/layout.svg)

## Key Features

**Natural Language Orchestration** — Say "let Codex review this" or "ask Gemini for ideas" and Claude handles the rest.

**Role-Based Collaboration** — Each AI has a defined role: Claude designs and implements, Codex reviews with scored rubrics, Gemini brainstorms alternatives, OpenCode provides additional perspective.

**Quality Gates** — Code and plans must score ≥ 7/10 on multi-dimensional rubrics before shipping. Up to 3 review rounds, then the decision escalates to you.

**Session Persistence** — Resume previous sessions with full context using the `-r` flag.

**Cross-Platform** — Works on macOS (Intel/Apple Silicon), Linux (x86-64/ARM64), and Windows (x86-64 via WSL).

## Quick Links

- [Getting Started](/curdx-bridge/getting-started) — Install and run in under 2 minutes
- [How It Works](/curdx-bridge/how-it-works) — Architecture, roles, and communication model
- [Configuration](/curdx-bridge/configuration) — Customize providers, flags, and environment
- [Commands](/curdx-bridge/commands) — Full CLI reference
- [Skills](/curdx-bridge/skills/) — Built-in skill system for planning, review, and execution
- [Troubleshooting](/curdx-bridge/troubleshooting) — Common issues and fixes
