# Commands

CurdX Flow has three command surfaces:

| Surface | Where it runs | Purpose |
| --- | --- | --- |
| Slash skills | Inside Claude Code | Spec workflow and task execution. |
| npm CLI `@curdx/flow` | Shell | Install, update, status, analyze, evidence check. |
| Runtime CLI `curdx-flow` | Plugin runtime | Internal routing, state, doctor, dev runtime, verification helpers. |

## Slash Skills

| Command | Use |
| --- | --- |
| `/curdx-flow:help` | Show current commands and recommended next action. |
| `/curdx-flow:start [name] [goal]` | Smart route, create, or resume. Prefer this when unsure. |
| `/curdx-flow:new <name> [goal]` | Explicitly create a new spec. |
| `/curdx-flow:research [spec]` | Run or rerun discovery research for the active spec. |
| `/curdx-flow:requirements [spec]` | Generate requirements and acceptance criteria. |
| `/curdx-flow:design [spec]` | Generate technical design. |
| `/curdx-flow:tasks [spec]` | Generate implementation tasks from design. |
| `/curdx-flow:implement` | Execute ready tasks with native `/goal` when available. |
| `/curdx-flow:status` | Inspect specs, active state, progress, and health. |
| `/curdx-flow:switch <spec>` | Change the active spec. |
| `/curdx-flow:triage [epic] [goal]` | Split oversized work into dependency-aware specs. |
| `/curdx-flow:refactor [spec]` | Update spec files after implementation learnings. |
| `/curdx-flow:prompt-optimize [draft]` | Improve a prompt and recommend routing without executing. |
| `/curdx-flow:index` | Generate component specs in `specs/.index/`. |
| `/curdx-flow:cancel [spec]` | Stop execution or remove spec state after confirmation. |
| `/curdx-flow:feedback [message]` | Submit feedback or bug reports. |

### Start Flags

```text
/curdx-flow:start [name] [goal] [--fresh] [--quick] [--mode auto|fast|deep] [--task-granularity auto|coarse|standard|fine] [--review minimal|standard|strict] [--commit-spec] [--no-commit-spec] [--specs-dir <path>]
```

| Flag | Meaning |
| --- | --- |
| `--fresh` | Create a new spec instead of resuming a matching unfinished one. |
| `--quick` | Reduce approval prompts where the route still needs a spec. |
| `--mode auto|fast|deep` | Override routing depth. |
| `--task-granularity auto|coarse|standard|fine` | Override value-slice task granularity. |
| `--review minimal|standard|strict` | Override review cadence. |
| `--commit-spec` / `--no-commit-spec` | Control spec artifact commits. |
| `--specs-dir <path>` | Create or resolve specs from an allowed spec root. |

### Implement Flags

```text
/curdx-flow:implement [--max-task-iterations 5] [--max-global-iterations 30] [--goal-turns 30] [--manual] [--quick] [--recovery-mode]
```

| Flag | Meaning |
| --- | --- |
| `--max-task-iterations` | Retry cap for the current task. |
| `--max-global-iterations` | Overall execution loop cap. |
| `--goal-turns` | Native `/goal` turn cap. |
| `--manual` | Do one resumable coordinator pass without native goal continuation. |
| `--quick` | Skip prompts where the stored policy allows it. |
| `--recovery-mode` | Generate fix tasks on execution failure instead of stopping immediately. |

## npm CLI

```bash
npm exec -- @curdx/flow@latest --help
```

Current commands:

| Command | Purpose |
| --- | --- |
| `install [IDS]` | Install or reinstall plugins / MCP entries. |
| `uninstall [IDS]` | Remove installed plugins / MCP entries. |
| `update [IDS]` | Update installed plugins. |
| `status` | Show install state. |
| `analyze` | Analyze Claude Code session jsonl and curdx-flow errors. |
| `check` | Verify active spec `verificationBlocks`. |

Common examples:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
npm exec -- @curdx/flow@latest install --all --yes
npm exec -- @curdx/flow@latest status --json
npm exec -- @curdx/flow@latest analyze --out flow-report.md
npm exec -- @curdx/flow@latest check
```

Global options:

| Option | Purpose |
| --- | --- |
| `--lang zh|en` | Override installer language. |
| `--no-claude-md` | Skip syncing the managed `@curdx/flow` block in `~/.claude/CLAUDE.md`. |

## Runtime CLI

The plugin ships a runtime executable used by skills and hooks:

```bash
curdx-flow doctor
curdx-flow route --compile --goal "ship a Claude Code plugin release"
curdx-flow snapshot
curdx-flow specs list
curdx-flow specs resolve
curdx-flow state merge <state-file> <json-patch>
curdx-flow verify run --phase execution --command "npm test"
curdx-flow verify-blocks
curdx-flow dev detect
curdx-flow dev up
curdx-flow dev health
curdx-flow dev verify
curdx-flow dev down
```

Use this surface inside curdx-flow skills or when debugging an installed plugin. Prefer the npm CLI for normal user installation and status checks.
