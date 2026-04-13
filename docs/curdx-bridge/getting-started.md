# Getting Started

This page is the fastest path from zero to a working multi-pane session.

## Prerequisites

| Requirement | Why it matters | Install |
|-------------|----------------|---------|
| **tmux** (or WezTerm) | Provides the split-pane terminal layout | `brew install tmux` / `apt install tmux` |
| **Claude Code** | Primary operator interface | `npm install -g @anthropic-ai/claude-code` |
| **Codex CLI** (recommended) | Best default reviewer and implementation peer | `npm install -g @openai/codex` |
| **Gemini CLI** (optional) | Useful for brainstorming and alternatives | See [Gemini CLI docs](https://github.com/google-gemini/gemini-cli) |
| **OpenCode CLI** (optional) | Extra implementation perspective | See [OpenCode docs](https://github.com/opencode-ai/opencode) |

Before you install CurdX Bridge, verify that each provider CLI can start on its own and is already authenticated.

## Quick Sanity Check

Run the tools you plan to use once before launching CurdX Bridge:

```bash
claude
codex
gemini
opencode
```

If one of them fails here, fix that first. CurdX Bridge is an orchestrator, not a replacement for provider setup.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/curdx/curdx-bridge/main/install.sh | bash
```

The installer downloads the latest release for your platform and places `curdx` in `~/.local/bin`.

If `~/.local/bin` is not already on your `PATH`, add it:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## First Launch

```bash
curdx
```

By default, this starts `claude`, `codex`, and `gemini`.

Common launch patterns:

```bash
curdx claude codex                     # Lean setup for build + review
curdx claude codex gemini opencode     # Full four-provider workspace
curdx --no-auto                        # Require manual approval for risky actions
```

What you should expect:

1. Your terminal splits into panes.
2. Each provider boots in its own pane.
3. Claude appears in the main left pane.
4. You start talking to Claude normally.

## Your First Five Minutes

A realistic first session usually looks like this:

```text
You:    Scan this repo and tell me the riskiest parts of the auth flow.
Claude: [reviews repo locally]

You:    Ask Codex to review your findings and score the proposed fix.
Claude: [sends an async request to Codex]
        Codex processing...

You:    While Codex works, ask Gemini for two alternative API shapes.
Claude: [sends a second async request]

You:    Summarize both responses and recommend one direction.
Claude: [merges Codex review with Gemini ideas]
```

The important mental model is simple: you keep talking to Claude, and Claude decides when to involve the other panes.

## Resuming A Session

```bash
curdx -r
curdx -r claude codex gemini
```

Use `-r` when you want to preserve the prior pane context. This is especially useful for:

- multi-step feature work
- long review loops
- debugging sessions that span several terminals or commits

If you want a clean slate for one provider instead, use the session commands covered in [Commands](/curdx-bridge/commands).

## Recommended Starter Setups

### Solo implementation

```bash
curdx claude codex
```

Best for focused work where you want one reviewer but not too much side chatter.

### Design exploration

```bash
curdx claude codex gemini
```

Best when you need a reviewer plus one creativity-oriented model.

### Wide-angle investigation

```bash
curdx claude codex gemini opencode
```

Best for migrations, architecture choices, or debugging where multiple perspectives are worth the extra noise.

## Common Natural-Language Prompts

These are effective because they map cleanly onto the built-in skill system:

- "Ask Codex to review this plan before we write code."
- "Have Gemini suggest three lighter-weight alternatives."
- "Let Codex check the diff for regressions and testing gaps."
- "Summarize what each provider said and recommend the next step."
- "Resume where we left off and continue with the next task."

## Flags

| Flag | Description | Typical use |
|------|-------------|-------------|
| `-r` | Resume the last session | Continue long-running work |
| `--no-auto` | Disable auto-approve behavior | Safer mode for unfamiliar repos |

## Build From Source

```bash
git clone https://github.com/curdx/curdx-bridge.git
cd curdx-bridge
./scripts/build-all.sh
```

## Best Practices

- Keep your first session small. Two or three providers are easier to manage than four.
- Ask for explicit review criteria. "Review for security and migration safety" works better than "take a look".
- Treat provider panes as observable workers. If a model drifts, stop it and redirect the task.
- Resume intentionally. If the repo changed heavily since the last session, a fresh start may be cleaner than `-r`.

## Next Steps

- Read [How It Works](/curdx-bridge/how-it-works) for the architecture and async model
- Configure provider defaults and roles in [Configuration](/curdx-bridge/configuration)
- Learn the planning and execution pipeline in [Skills](/curdx-bridge/skills/)
