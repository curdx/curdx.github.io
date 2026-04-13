# Configuration

## Config File

CurdX Bridge reads configuration from `curdx.config` at two levels:

| Location | Scope |
|----------|-------|
| `.curdx/curdx.config` | Project-level (takes priority) |
| `~/.curdx/curdx.config` | Global (user-level default) |

### Simple Format

List provider names, one per line or space-separated:

```
claude codex gemini opencode
```

### JSON Format

For advanced options:

```json
{
  "providers": ["claude", "codex", "gemini", "opencode"],
  "flags": {
    "resume": true,
    "auto": true
  }
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CURDX_DEBUG` | Enable debug logging | `CURDX_DEBUG=1 curdx` |
| `CURDX_LANG` | Force language (en/zh) | `CURDX_LANG=zh` |
| `CURDX_THEME` | Force theme | `CURDX_THEME=dark` |

## CLAUDE.md Integration

CurdX Bridge injects configuration into your project's `CLAUDE.md` file so Claude Code understands how to work with the multi-AI setup. This includes:

### Role Assignment Table

Controls which AI provider fills each role:

```markdown
| Role | Provider | Description |
|------|----------|-------------|
| designer | claude | Primary planner and architect |
| inspiration | gemini | Creative brainstorming |
| reviewer | codex | Scored quality gate |
| executor | claude | Code implementation |
```

To change a role assignment, edit the Provider column. For example, to make Gemini the reviewer:

```markdown
| reviewer | gemini | Scored quality gate |
```

### Peer Review Framework

The review configuration in `CLAUDE.md` defines when reviews happen:

1. **Plan Review** — After finalizing a plan, before writing code
2. **Code Review** — After completing code changes, before reporting done

Pass criteria: overall score ≥ 7.0 AND no single dimension ≤ 3.

### Async Guardrail

The async guardrail configuration ensures that when Claude sends a request to another provider, it waits properly for the response instead of polling or adding follow-up text.

## AutoFlow Configuration

For the automated task execution system (`/cxb-task-run`), additional configuration is stored in `.curdx/`:

| File | Purpose |
|------|---------|
| `.curdx/state.json` | Current task execution state |
| `.curdx/todo.md` | Task list with status markers |
| `.curdx/plan_log.md` | Execution history and decisions |

### Role Override

AutoFlow supports role overrides via `.autoflow/roles.json`:

```json
{
  "executor": "codex",
  "reviewer": "codex"
}
```

This is a secondary lookup — the `CLAUDE.md` Role Assignment table takes priority.
