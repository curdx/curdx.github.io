# Commands

Most users operate CurdX Bridge through natural language in the Claude pane, but the CLI is still important for debugging, automation, and power-user workflows.

## Core Session Commands

### `curdx`

Launch a split-pane session.

```bash
curdx
curdx claude codex
curdx claude codex gemini opencode
curdx -r
curdx -r claude codex gemini
curdx --no-auto
```

| Flag | Description | Notes |
|------|-------------|-------|
| `-r` | Resume the last session | Best for continuing multi-step work |
| `--no-auto` | Disable auto-approve behavior | Safer when exploring unfamiliar repos |

Practical examples:

```bash
# Start with a narrow pair for implementation + review
curdx claude codex

# Restore yesterday's session with the same three providers
curdx -r claude codex gemini

# Investigate a risky migration with full visibility
curdx claude codex gemini opencode --no-auto
```

### `curdx kill`

Terminate active panes.

```bash
curdx kill
curdx kill codex -f
curdx kill gemini -f
```

Use this when one provider is stuck, authenticated incorrectly, or producing unusable output. In practice, killing one pane is often better than restarting the entire session.

## Provider Communication Commands

### `cxb-ask`

Send an async request to a provider.

```bash
cxb-ask codex "Review the current diff for correctness, security, and missing tests"
cxb-ask gemini "Suggest three alternative API shapes for a webhook retry queue"
cxb-ask opencode "Challenge this refactor plan and look for rollback risk"
```

Real-world usage patterns:

```bash
# Ask for a scored review before implementation
cxb-ask codex "Review this implementation plan using the standard plan rubric"

# Ask for divergent ideas without changing ownership
cxb-ask gemini "Give me 5 naming directions for a feature flag cleanup command"

# Use OpenCode as a tie-breaker when Claude and Codex disagree
cxb-ask opencode "Compare these two migration strategies and highlight hidden costs"
```

Best practice: make the request specific about the job. Mention review dimensions, constraints, and expected output format.

### `cxb-pend`

Retrieve recent replies from a provider.

```bash
cxb-pend codex
cxb-pend gemini 3
cxb-pend opencode 5
```

Use `cxb-pend` when you want to inspect the raw provider output outside the Claude pane or debug whether an async request actually completed.

### Provider-specific shortcuts

| Provider | Ask | Pending replies | Ping |
|----------|-----|-----------------|------|
| Claude | `cxb-claude-ask` | `cxb-claude-pend` | `cxb-claude-ping` |
| Codex | `cxb-codex-ask` | `cxb-codex-pend` | `cxb-codex-ping` |
| Gemini | `cxb-gemini-ask` | `cxb-gemini-pend` | `cxb-gemini-ping` |
| OpenCode | `cxb-opencode-ask` | `cxb-opencode-pend` | `cxb-opencode-ping` |

These are useful in scripts and when you do not want to pass the provider name repeatedly.

### `cxb-ping`

Verify connectivity to a provider.

```bash
cxb-ping codex
cxb-ping gemini
```

Run this first if a pane exists but you suspect the provider daemon is not responding.

## Session And State Commands

### `curdx-mounted`

Show which providers are mounted and responsive.

```bash
curdx-mounted
```

This returns JSON, which makes it useful for shell scripts and editor integrations.

### `cxb-autonew`

Start a fresh session for a specific provider without injecting old context.

```bash
cxb-autonew codex
cxb-autonew gemini
```

Use this when a provider has accumulated too much context drift but the rest of the session is still useful.

### `cxb-ctx-transfer`

Transfer context between sessions.

```bash
cxb-ctx-transfer
```

This is mainly valuable for continuity when AutoFlow or provider restarts need to preserve task state.

## AutoFlow Commands

### `cxb-autoloop`

Drive the automated execution pipeline.

```bash
cxb-autoloop start
cxb-autoloop stop
```

Typical workflow:

```bash
# Create plan artifacts first, then let the loop advance steps
cxb-autoloop start

# Pause automation when you want to inspect or redirect a task manually
cxb-autoloop stop
```

## Utility Commands

| Command | Purpose | When to use it |
|---------|---------|----------------|
| `curdx-arch` | Show architecture information | Quick sanity check of the active environment |
| `curdx-cleanup` | Remove stale sessions and temp files | After crashes or abandoned sessions |
| `curdx-completion-hook` | Shell completion integration | Improve CLI ergonomics |
| `curdx-installer-helper` | Assist installation tasks | Packaging and environment setup |
| `curdx-mcp-delegation` | MCP delegation helper | Advanced integrations and tooling bridges |

## Command Recipes

### Review a risky change before merge

```bash
cxb-ask codex "Review the staged diff for correctness, rollback risk, and missing tests"
cxb-pend codex
```

### Restart one provider without losing the rest

```bash
curdx kill gemini -f
cxb-autonew gemini
```

### Inspect whether a provider is alive before resuming

```bash
curdx-mounted
cxb-ping codex
```

## Power User Tips

- Prefer `curdx claude codex` for day-to-day coding. Add more providers only when they have a clear job.
- Use `cxb-pend` to debug transport issues before assuming the model failed semantically.
- If a provider keeps getting low-signal, start a fresh provider session with `cxb-autonew` instead of polluting the rest of the workspace.
- Script around `curdx-mounted` and `cxb-ping` if you are integrating Bridge into editor tasks or shell aliases.
