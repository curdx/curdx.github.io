# CurdX Flow

Spec-driven execution for Claude Code: route an intent, write the right amount of specification, execute task by task, and require real verification evidence before calling work done.

![CurdX Flow product overview](/images/curdx-flow/curdx-flow-overview.en.svg)

## What It Ships

`@curdx/flow` v7.3.3 ships two connected surfaces:

| Surface | What it does |
| --- | --- |
| Claude Code plugin `curdx-flow` | Adds `/curdx-flow:*` slash skills, specialist agents, hooks, schemas, templates, and a plugin-local `curdx-flow` runtime CLI. |
| npm CLI `@curdx/flow` | Installs, updates, checks, and analyzes the Claude Code environment around the plugin. |

The plugin is the product core. The npm CLI is the installer and diagnostic wrapper that keeps the plugin, its companion plugins, and the managed `~/.claude/CLAUDE.md` capability block aligned.

## Install

Use the installer for normal setup:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

Then open Claude Code in a project and run:

```text
/curdx-flow:help
/curdx-flow:start todo-app Build a todo app with create, edit, complete, delete, and browser verification
```

Manual Claude Code plugin installation is useful for marketplace debugging:

```bash
claude plugin marketplace add curdx/curdx-flow
claude plugin install curdx-flow@curdx
```

## Workflow

![CurdX Flow workflow loop](/images/curdx-flow/curdx-flow-loop.en.svg)

`/curdx-flow:start` is the preferred entry point. It inspects the repository, current spec state, user goal, available capabilities, and risk profile, then chooses the lightest safe route:

| Route | When it is used |
| --- | --- |
| Direct change | Tiny, low-risk work where a full spec would add noise. |
| Lite spec | Bounded feature or fix with 1-3 value-slice tasks. |
| Full spec | Cross-module, UI, release, plugin, or high-risk work that needs explicit research, requirements, design, and tasks. |
| Epic triage | Large work that should become multiple dependency-aware specs. |
| Resume | Existing unfinished spec, active session binding, or recoverable execution state. |

The canonical phase files are:

```text
specs/<name>/
  research.md
  requirements.md
  design.md
  tasks.md
  .curdx-state.json
  .progress.md
```

`research.md`, `requirements.md`, `design.md`, and `tasks.md` are reviewable project artifacts. `.curdx-state.json` stores execution state and `verificationBlocks`. `.progress.md` captures runtime progress and lessons.

## What Makes It Different

- **Routes before writing.** Small work stays small; large work is decomposed before implementation starts.
- **Uses native `/goal` when available.** Long execution is driven by Claude Code's native goal loop, with `--manual` as the explicit fallback.
- **Requires evidence.** Commands, browser checks, CI, release, npm, and review results are written into `verificationBlocks`.
- **Coordinates companion capabilities.** `pua`, `claude-mem`, `chrome-devtools-mcp`, `ui-ux-pro-max`, `context7`, and `sequential-thinking` are detected and used where they add evidence.
- **Keeps plugin boundaries current.** The shipped Claude Code plugin follows the current `.claude-plugin/plugin.json` structure, with skills, agents, hooks, schemas, templates, and `bin/` at plugin root.

## Companion Capabilities

| Capability | Type | Role |
| --- | --- | --- |
| `pua` | Claude Code plugin dependency | Recovery patterns and advanced workflow assistance. |
| `claude-mem` | Claude Code plugin dependency | Historical context, prior decisions, and repeated failure memory. |
| `chrome-devtools-mcp` | Claude Code plugin dependency | Real browser DOM, console, network, screenshot, and runtime evidence. |
| `ui-ux-pro-max` | Claude Code plugin dependency | UI/UX judgment for visible frontend work. |
| `context7` | External MCP | Current library/framework documentation lookup. |
| `sequential-thinking` | External MCP | Explicit reasoning for high-risk tasks. |

`curdx-flow` diagnoses missing capabilities and gives remediation. It does not vendor external MCP servers or duplicate their configuration.

## Quick Links

- [Getting Started](/curdx-flow/getting-started)
- [How It Works](/curdx-flow/how-it-works)
- [Configuration](/curdx-flow/configuration)
- [Commands](/curdx-flow/commands)
- [Subagents](/curdx-flow/agents/)
- [Troubleshooting](/curdx-flow/troubleshooting)
