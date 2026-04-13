# Configuration

CurdX Bridge can be configured at the global level, the project level, and inside role-aware prompt files such as `CLAUDE.md`.

## Configuration Sources

CurdX Bridge reads `curdx.config` from two locations:

| Location | Scope | Priority |
|----------|-------|----------|
| `.curdx/curdx.config` | Project-local | Highest |
| `~/.curdx/curdx.config` | User default | Fallback |

Project-local config should contain repo-specific defaults. Global config should contain your personal baseline.

## Simple Provider List Format

If you only need to choose default providers, keep it minimal:

```text
claude codex gemini opencode
```

Good use cases:

- Your team almost always wants the same provider set
- You want a short config file that is easy to inspect
- You do not need extra flags

## JSON Format

Use JSON when you want explicit flags and more structure:

```json
{
  "providers": ["claude", "codex", "gemini"],
  "flags": {
    "resume": true,
    "auto": true
  }
}
```

Practical examples:

```json
{
  "providers": ["claude", "codex"],
  "flags": {
    "resume": false,
    "auto": false
  }
}
```

Use a narrower provider set when you want lower noise by default, then add Gemini or OpenCode explicitly for the rare sessions that need them.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CURDX_DEBUG` | Enable verbose logging | `CURDX_DEBUG=1 curdx` |
| `CURDX_LANG` | Force docs and UI language | `CURDX_LANG=zh` |
| `CURDX_THEME` | Force display theme | `CURDX_THEME=dark` |

Recommended uses:

- Enable `CURDX_DEBUG=1` when a provider does not route requests correctly
- Force `CURDX_LANG` in bilingual teams or shared environments
- Use `CURDX_THEME` when terminal and docs theme detection disagree

## `CLAUDE.md` Integration

CurdX Bridge relies on `CLAUDE.md` to describe how the primary agent should behave in a multi-provider environment.

### Role Assignment Table

```markdown
| Role | Provider | Description |
|------|----------|-------------|
| designer | claude | Primary planner and orchestrator |
| inspiration | gemini | Brainstorming and alternatives |
| reviewer | codex | Scored review gate |
| executor | codex | File operations and test execution |
```

This is the most important configuration surface for day-to-day behavior. It decides who does what.

Typical patterns:

- Keep `designer` on Claude for continuity and accountability
- Keep `reviewer` on Codex if you want stronger code and rubric-based review
- Assign `executor` to Codex when you want Claude to stay supervisory rather than directly editing

### Review Timing

`CLAUDE.md` also defines when review happens:

1. Plan review before writing code
2. Code review before reporting completion

The standard pass rule is:

- overall score `>= 7.0`
- no dimension `<= 3`

### Async Guardrail

The async guardrail keeps cross-provider requests clean:

- Claude submits the request
- Claude stops speaking instead of adding filler text
- Claude later retrieves the reply and continues the conversation

This prevents duplicate asks, accidental double polling, and broken handoffs.

## AutoFlow State Files

AutoFlow stores execution artifacts inside `.curdx/`:

| File | Purpose |
|------|---------|
| `.curdx/state.json` | Current step, status, and retry state |
| `.curdx/todo.md` | Human-readable task list and progress markers |
| `.curdx/plan_log.md` | Decision log, execution notes, and audit trail |

Treat these as working state, not polished project documentation.

## Role Overrides

Some workflows support overrides in `.autoflow/roles.json`:

```json
{
  "executor": "codex",
  "reviewer": "codex"
}
```

Precedence is important:

1. `CLAUDE.md` role table
2. `.autoflow/roles.json`
3. built-in defaults

If your behavior is not matching expectations, check the higher-priority file first.

## Recommended Team Patterns

### Small repo or solo project

- Global config sets your preferred providers
- Project config only overrides when the repo needs a different setup
- `CLAUDE.md` keeps the role table simple

### Large team repo

- Commit a project-local `.curdx/curdx.config`
- Commit a shared `CLAUDE.md` role table
- Use AutoFlow files only as task-state artifacts, not team policy documents

## Best Practices

- Keep project config narrow. Too many default providers creates noise.
- Change one layer at a time when debugging configuration issues.
- Document non-default role mappings in the repo so teammates know why they exist.
- Prefer explicit `executor` and `reviewer` assignments over relying on assumptions.
