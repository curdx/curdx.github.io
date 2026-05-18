# Commands

Beginners only need four commands at first.

## Most Used Commands

| Command | When to use it |
| --- | --- |
| `/curdx-flow:start <name> <goal>` | Start a task. This is the recommended entry point. |
| `/curdx-flow:status` | Check where you are and what to do next. |
| `/curdx-flow:implement` | Execute after `tasks.md` is ready. |
| `npm exec -- @curdx/flow@latest status` | Check installation state from the terminal. |

Example:

```text
/curdx-flow:start todo-app Build a Todo app
/curdx-flow:status
/curdx-flow:implement
```

## Commands Inside Claude Code

| Command | Purpose |
| --- | --- |
| `/curdx-flow:help` | Show help and recommended next step. |
| `/curdx-flow:start [name] [goal]` | Smart start, create, or resume. |
| `/curdx-flow:new <name> [goal]` | Explicitly create a new spec. |
| `/curdx-flow:research` | Re-run project fact and risk discovery. |
| `/curdx-flow:requirements` | Generate requirements and acceptance criteria. |
| `/curdx-flow:design` | Generate technical design. |
| `/curdx-flow:tasks` | Generate implementation tasks. |
| `/curdx-flow:implement` | Execute tasks. |
| `/curdx-flow:status` | Show state and next step. |
| `/curdx-flow:switch <spec>` | Change the active spec. |
| `/curdx-flow:triage <goal>` | Split a large task into multiple specs. |
| `/curdx-flow:refactor` | Update spec files after implementation learning. |
| `/curdx-flow:cancel` | Stop or remove spec state after confirmation. |

## Useful `/curdx-flow:start` Flags

```text
/curdx-flow:start [name] [goal] [--quick] [--task-granularity standard]
```

| Flag | Beginner meaning |
| --- | --- |
| `--quick` | Ask fewer questions. Best for low-risk work. |
| `--fresh` | Do not resume an old spec. Create a new one. |
| `--task-granularity coarse` | Larger tasks, useful for prototypes. |
| `--task-granularity standard` | Recommended default for most work. |
| `--task-granularity fine` | Smaller tasks, useful when reviews need small diffs. |
| `--specs-dir <path>` | Choose where spec files are stored. |

## Useful `/curdx-flow:implement` Flags

```text
/curdx-flow:implement --manual
/curdx-flow:implement --max-task-iterations 5
```

| Flag | Beginner meaning |
| --- | --- |
| `--manual` | Do one resumable pass without native `/goal` continuation. |
| `--max-task-iterations 5` | Retry one task at most 5 times. |
| `--max-global-iterations 30` | Advance the whole run at most 30 turns. |
| `--recovery-mode` | Try to create fix tasks when execution fails. |

## npm CLI In The Terminal

| Command | Purpose |
| --- | --- |
| `npm exec -- @curdx/flow@latest install curdx-flow --yes` | Install curdx-flow. |
| `npm exec -- @curdx/flow@latest install --all --yes` | Install all known companion capabilities. |
| `npm exec -- @curdx/flow@latest status` | Show install state. |
| `npm exec -- @curdx/flow@latest update` | Update installed plugins. |
| `npm exec -- @curdx/flow@latest analyze --out report.md` | Analyze Claude Code session logs. |
| `npm exec -- @curdx/flow@latest check` | Check active spec verification evidence. |

## Runtime CLI For Debugging

These are mostly for plugin internals or troubleshooting:

```bash
curdx-flow doctor
curdx-flow specs list
curdx-flow specs resolve
curdx-flow verify-blocks
```

For beginners, start with `curdx-flow doctor`. It tells you which plugin, MCP, or browser capability is missing.
