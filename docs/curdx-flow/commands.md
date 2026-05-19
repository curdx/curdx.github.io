# Commands

You don't need to memorize them. Pick by situation, then read details only when needed.

## Cheatsheet

```text
new feature            →  /curdx-flow:start <name> <goal>
where am I?            →  /curdx-flow:status
ready to build?        →  /curdx-flow:implement
goal is too big        →  /curdx-flow:triage <goal>
switch active spec     →  /curdx-flow:switch <spec>
install / repair       →  npm exec -- @curdx/flow@latest install curdx-flow --yes
health check           →  npm exec -- @curdx/flow@latest status
```

The 99% sequence:

```text
/curdx-flow:start todo-app  build a todo app
/curdx-flow:status
/curdx-flow:implement
```

## `/curdx-flow:start`

The recommended entry point. It decides whether to handle directly, write a light spec, write a full spec, resume existing work, or suggest decomposition.

```text
/curdx-flow:start todo-app build a Todo app with create, edit, complete, delete
```

**Flags worth knowing:**

| Flag | Use when |
| --- | --- |
| `--quick` | Low-risk work, fewer confirmation steps. |
| `--fresh` | Force a new spec — don't resume an old one. |
| `--task-granularity standard` | Default for product features. |
| `--task-granularity fine` | Smaller tasks, easier review. |
| `--task-granularity coarse` | Prototyping; you accept bigger tasks. |
| `--specs-dir <path>` | Monorepo — pick which `specs/` folder. |

## `/curdx-flow:status`

When you don't know where you are, run this first.

```text
/curdx-flow:status
```

Tells you:

- active spec
- which artifact files exist
- current phase
- the next command Flow recommends
- any missing companion capabilities

## `/curdx-flow:implement`

Run when `tasks.md` is ready.

```text
/curdx-flow:implement
```

**Flags worth knowing:**

| Flag | Use when |
| --- | --- |
| `--manual` | Auto-continuation isn't available, or you want one pass at a time. |
| `--max-task-iterations 5` | Cap retries per task. |
| `--max-global-iterations 30` | Cap the whole run. |
| `--recovery-mode` | After failures, generate fix-tasks instead of stalling. |

## `/curdx-flow:triage`

For goals too large for one spec.

```text
/curdx-flow:triage build a customer portal with login, billing, dashboard, and admin
```

Use it when:

- the ask clearly contains multiple modules,
- dependency order matters,
- one spec would be unreadable,
- child specs should be reviewed separately.

## CLI commands (terminal, outside Claude Code)

| Command | Purpose |
| --- | --- |
| `npm exec -- @curdx/flow@latest install curdx-flow --yes` | Install or repair. |
| `npm exec -- @curdx/flow@latest install --all --yes` | Add every known companion capability. |
| `npm exec -- @curdx/flow@latest status` | Show install state. |
| `npm exec -- @curdx/flow@latest update` | Update installed plugins. |
| `npm exec -- @curdx/flow@latest analyze --out report.md` | Analyze Claude Code session logs. |
| `npm exec -- @curdx/flow@latest check` | Validate evidence for the current spec. |
| `curdx-flow doctor` | One-line health diagnosis (plugins, MCP, browser). |
| `curdx-flow specs list` | List specs and their phases. |
| `curdx-flow route --compile --goal "…"` | Dry-run routing for a goal. |

## Full Claude Code command list

| Command | Purpose |
| --- | --- |
| `/curdx-flow:help` | Help text + recommended next step. |
| `/curdx-flow:start` | Smart start, create, or resume. |
| `/curdx-flow:new` | Explicitly create a new spec (no auto-resume). |
| `/curdx-flow:research` | Re-run fact and risk discovery. |
| `/curdx-flow:requirements` | Generate requirements and acceptance criteria. |
| `/curdx-flow:design` | Generate technical design. |
| `/curdx-flow:tasks` | Generate the task list. |
| `/curdx-flow:implement` | Run the task loop with verification. |
| `/curdx-flow:status` | Show state + next step. |
| `/curdx-flow:switch` | Change the active spec. |
| `/curdx-flow:triage` | Split a large goal into multiple specs. |
| `/curdx-flow:refactor` | Update spec files after implementation learning. |
| `/curdx-flow:cancel` | Stop or remove spec state (with confirmation). |
| `/curdx-flow:prompt-optimize` | Improve a draft prompt without executing. |
