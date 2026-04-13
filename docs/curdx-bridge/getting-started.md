# Getting Started

## Prerequisites

| Requirement | Install |
|-------------|---------|
| **tmux** (or WezTerm) | `brew install tmux` / `apt install tmux` |
| **Claude Code** | `npm install -g @anthropic-ai/claude-code` |
| **Codex CLI** (optional) | `npm install -g @openai/codex` |
| **Gemini CLI** (optional) | See [Gemini CLI docs](https://github.com/google-gemini/gemini-cli) |
| **OpenCode CLI** (optional) | See [OpenCode docs](https://github.com/opencode-ai/opencode) |

Make sure each provider CLI works on its own before using CurdX Bridge.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/curdx/curdx-bridge/main/install.sh | bash
```

This downloads the latest release binary for your platform and places it in `~/.local/bin`.

## Run

```bash
curdx                                  # Default: Claude + Codex + Gemini
curdx claude codex gemini opencode     # All four providers
curdx claude codex                     # Just two providers
```

Terminal panes appear, each provider boots up, and you start talking to Claude in the left pane.

## Resume a Session

```bash
curdx -r                               # Resume last session with context
curdx -r claude codex gemini           # Resume with specific providers
```

The `-r` flag restores your previous session so you can pick up where you left off.

## Your First Conversation

Once the panes are up, talk to Claude naturally:

```
You:    Help me refactor this auth module.
Claude: [writes the refactored code]

You:    Let Codex review this.
Claude: [sends diff to Codex, waits for scores]
        Codex scored it 8.5/10. Suggestions: ...

You:    Ask Gemini for alternative naming ideas.
Claude: [asks Gemini asynchronously]
        Gemini suggests: ...

You:    Looks good. Apply Codex's suggestions and commit.
Claude: [makes changes, commits]
```

That's the whole workflow. Claude is your main interface — Codex, Gemini, and OpenCode are collaborators it calls on when you ask.

## Flags

| Flag | Description |
|------|-------------|
| `-r` | Resume last session (keeps context) |
| `--no-auto` | Disable auto-approve mode |

## Platforms

| Platform | Architecture |
|----------|-------------|
| macOS | Intel, Apple Silicon |
| Linux | x86-64, ARM64 |
| Windows | x86-64 (via WSL) |

## Build from Source

```bash
git clone https://github.com/curdx/curdx-bridge.git
cd curdx-bridge
./scripts/build-all.sh
```

## Next Steps

- Learn [how it works](/curdx-bridge/how-it-works) under the hood
- Customize your setup with [configuration](/curdx-bridge/configuration)
- Explore the [skill system](/curdx-bridge/skills/) for planning and review workflows
