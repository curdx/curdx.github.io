# Commands

You do not need to memorize every command. Choose by situation.

## Which Command Should I Use?

| What you want | Use this |
| --- | --- |
| Start a new feature | `/curdx-flow:start <name> <goal>` |
| Find the next step | `/curdx-flow:status` |
| Execute after `tasks.md` is ready | `/curdx-flow:implement` |
| Split a large task first | `/curdx-flow:triage <goal>` |
| Switch to another spec | `/curdx-flow:switch <spec>` |
| Install or repair the plugin | `npm exec -- @curdx/flow@latest install curdx-flow --yes` |
| Check installation state | `npm exec -- @curdx/flow@latest status` |

The most common sequence is:

```text
/curdx-flow:start todo-app Build a Todo app
/curdx-flow:status
/curdx-flow:implement
```

## `/curdx-flow:start`

Recommended entry point. It decides whether to handle the work directly, create a light spec, create a full spec, resume existing work, or suggest decomposition.

```text
/curdx-flow:start todo-app Build a Todo app with create, edit, complete, and delete
```

Useful flags:

| Flag | When to use it |
| --- | --- |
| `--quick` | Low-risk work where you want fewer confirmation steps. |
| `--fresh` | Create a new spec instead of resuming an old one. |
| `--task-granularity standard` | Recommended for most feature work. |
| `--task-granularity fine` | Smaller tasks for easier review. |
| `--task-granularity coarse` | Larger tasks for prototypes or exploration. |
| `--specs-dir <path>` | Choose a spec directory in a monorepo. |

## `/curdx-flow:status`

When you do not know where you are, run this first.

```text
/curdx-flow:status
```

It tells you:

- the active spec;
- which files already exist;
- the current phase;
- the recommended next command;
- missing capabilities in the environment.

## `/curdx-flow:implement`

Run this when `tasks.md` is ready.

```text
/curdx-flow:implement
```

Useful flags:

| Flag | When to use it |
| --- | --- |
| `--manual` | Automatic continuation is unavailable, or you want to advance one pass at a time. |
| `--max-task-iterations 5` | Limit retries for one task. |
| `--max-global-iterations 30` | Limit the whole run. |
| `--recovery-mode` | Try to create fix tasks after failures. |

## `/curdx-flow:triage`

Use this when the goal is too large for one spec.

```text
/curdx-flow:triage Build a customer portal with login, billing, dashboard, and admin workflows
```

Good fit when:

- the request clearly contains multiple modules;
- dependency order matters;
- one spec would be too hard to explain;
- you want child specs to be reviewed separately.

## npm CLI In The Terminal

These commands run outside Claude Code:

| Command | Purpose |
| --- | --- |
| `npm exec -- @curdx/flow@latest install curdx-flow --yes` | Install or repair curdx-flow. |
| `npm exec -- @curdx/flow@latest install --all --yes` | Install all known companion capabilities. |
| `npm exec -- @curdx/flow@latest status` | Show install state. |
| `npm exec -- @curdx/flow@latest update` | Update installed plugins. |
| `npm exec -- @curdx/flow@latest analyze --out report.md` | Analyze Claude Code session logs. |
| `npm exec -- @curdx/flow@latest check` | Check verification evidence for the current spec. |

## Full Claude Code Command List

| Command | Purpose |
| --- | --- |
| `/curdx-flow:help` | Show help and recommended next step. |
| `/curdx-flow:start` | Smart start, create, or resume. |
| `/curdx-flow:new` | Explicitly create a new spec. |
| `/curdx-flow:research` | Re-run project fact and risk discovery. |
| `/curdx-flow:requirements` | Generate requirements and acceptance criteria. |
| `/curdx-flow:design` | Generate technical design. |
| `/curdx-flow:tasks` | Generate implementation tasks. |
| `/curdx-flow:implement` | Execute tasks. |
| `/curdx-flow:status` | Show state and next step. |
| `/curdx-flow:switch` | Change the active spec. |
| `/curdx-flow:triage` | Decompose a large task. |
| `/curdx-flow:refactor` | Update spec files after implementation learning. |
| `/curdx-flow:cancel` | Stop or remove spec state after confirmation. |
