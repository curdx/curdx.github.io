# Commands

CurdX Bridge provides a set of CLI commands. Most of the time Claude handles these for you, but they're available for direct use.

## Core Commands

### curdx

The main entry point. Launches the split-pane terminal session.

```bash
curdx                                  # Default providers
curdx claude codex gemini opencode     # Specify providers
curdx -r                               # Resume last session
curdx -r claude codex gemini           # Resume with specific providers
```

| Flag | Description |
|------|-------------|
| `-r` | Resume previous session |
| `--no-auto` | Disable auto-approve mode |

### curdx kill

Terminate running sessions.

```bash
curdx kill                # Kill all sessions
curdx kill codex -f       # Force kill specific provider
```

## Provider Communication

### cxb-ask

Send an async request to a provider. This is the foundation of inter-agent communication.

```bash
cxb-ask codex "Review this diff for security issues"
cxb-ask gemini "Suggest alternative API designs"
cxb-ask opencode "What do you think about this approach?"
cxb-ask claude "Summarize the current state"
```

### Provider-Specific Shortcuts

Each provider has dedicated ask, reply, and ping commands:

| Provider | Ask | Reply | Ping |
|----------|-----|-------|------|
| Claude | `cxb-claude-ask` | `cxb-claude-pend` | `cxb-claude-ping` |
| Codex | `cxb-codex-ask` | `cxb-codex-pend` | `cxb-codex-ping` |
| Gemini | `cxb-gemini-ask` | `cxb-gemini-pend` | `cxb-gemini-ping` |
| OpenCode | `cxb-opencode-ask` | `cxb-opencode-pend` | `cxb-opencode-ping` |

### cxb-pend

View the latest reply from a provider.

```bash
cxb-pend codex           # Latest Codex reply
cxb-pend gemini 3        # Last 3 Gemini conversations
```

### cxb-ping

Test connectivity with a provider.

```bash
cxb-ping codex           # Check if Codex is reachable
```

## Session Management

### curdx-mounted

Report which providers are currently mounted (session exists AND daemon is online).

```bash
curdx-mounted            # JSON output of provider statuses
```

### cxb-autonew

Start a fresh session for a provider without context injection.

```bash
cxb-autonew codex        # Fresh Codex session
```

## AutoFlow Commands

### cxb-autoloop

The auto-loop daemon that drives the automated task execution pipeline.

```bash
cxb-autoloop start       # Start the execution loop
cxb-autoloop stop        # Stop the loop
```

### cxb-ctx-transfer

Transfer context between sessions for continuity.

```bash
cxb-ctx-transfer         # Transfer current context
```

## Utility Commands

| Command | Purpose |
|---------|---------|
| `curdx-arch` | Display architecture information |
| `curdx-cleanup` | Clean up stale sessions and temp files |
| `curdx-completion-hook` | Shell completion hook |
| `curdx-installer-helper` | Installation helper utility |
| `curdx-mcp-delegation` | MCP server delegation |
