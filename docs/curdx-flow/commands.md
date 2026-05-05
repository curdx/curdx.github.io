# Commands

CurdX Flow has two command surfaces: **slash commands** inside Claude Code (the workflow) and the **`npx @curdx/flow` CLI** outside Claude Code (the installer and observability).

## Slash Commands (Inside Claude Code)

The bundled plugin exposes these `/curdx-flow:*` commands. Most users only need three of them day to day: `start`, `status`, and `implement`.

### Workflow Commands

| Command | Purpose |
| --- | --- |
| `/curdx-flow:start` | Smart entry point. Detects new vs resume, runs the interview, dispatches research. **Use this 90% of the time.** |
| `/curdx-flow:new` | Force-create a new spec, skipping resume detection. |
| `/curdx-flow:research` | Run or re-run the research phase for the active spec. |
| `/curdx-flow:requirements` | Generate `requirements.md` via the `product-manager` subagent. |
| `/curdx-flow:design` | Generate `design.md` via the `architect-reviewer` subagent. |
| `/curdx-flow:tasks` | Break the design into a checked task list (`tasks.md`) via the `task-planner`. |
| `/curdx-flow:implement` | Begin the autonomous execution loop. Runs every unchecked task until completion or unrecoverable failure. |

Practical examples:

```text
# Start a new spec — interview, research, pause
/curdx-flow:start
> Add OAuth login with token refresh.

# Quick mode for a small change
/curdx-flow:start --quick
> Add /healthz returning version + uptime.

# Resume the autonomous loop after fixing an issue
/curdx-flow:implement

# Re-run research after the goal sharpened
/curdx-flow:research
```

### Spec Management Commands

| Command | Purpose |
| --- | --- |
| `/curdx-flow:status` | Show all specs, their phase, and progress. |
| `/curdx-flow:switch` | Switch the active spec for resume / continuation. |
| `/curdx-flow:cancel` | Cancel the active execution loop, clean up state, and (optionally) remove the spec. |
| `/curdx-flow:refactor` | Methodically update spec files (`requirements.md` → `design.md` → `tasks.md`) after execution has revealed they need revision. |
| `/curdx-flow:index` | Index the codebase and external resources into searchable spec metadata. |

Practical examples:

```text
# See where every spec is in the workflow
/curdx-flow:status

# Switch focus to a different in-progress spec
/curdx-flow:switch
> upload-api

# After the executor revealed a design gap, walk back through specs
/curdx-flow:refactor
```

### Epic And Decomposition

| Command | Purpose |
| --- | --- |
| `/curdx-flow:triage` | Decompose a large feature into multiple dependency-aware specs. Produces `specs/_epics/<name>/epic.md` and a per-spec graph. |

```text
/curdx-flow:triage
> Server-side webhooks: ingestion, retry queue, dead-letter UI.
```

### Help And Feedback

| Command | Purpose |
| --- | --- |
| `/curdx-flow:help` | Show plugin help and a workflow overview. |
| `/curdx-flow:feedback` | Submit feedback or report a plugin issue. |

## CLI Commands (Outside Claude Code)

Run these at the shell. The most common is plain `npx @curdx/flow`, which opens an interactive menu.

### Installer

```bash
# Interactive menu (install / update / uninstall / status)
npx @curdx/flow

# Non-interactive: install everything available
npx @curdx/flow install --all --yes

# Install only specific items
npx @curdx/flow install claude-mem context7

# Update everything to the latest version
npx @curdx/flow update

# Uninstall everything cleanly (also removes the managed CLAUDE.md block)
npx @curdx/flow uninstall

# Override the language for a single invocation
npx @curdx/flow --lang en
```

### Status

```bash
# What is installed and whether anything is stale
npx @curdx/flow status

# Machine-readable for scripts and CI
npx @curdx/flow status --json
```

Returns the list of marketplace items, install state per item, and any version drift between installed and available.

### Analyze (Plugin Observability)

```bash
# Generate the markdown report from your most recent Claude Code session
npx @curdx/flow analyze

# Include prompts in the report (local debugging only)
npx @curdx/flow analyze --include-prompts
```

The analyze CLI parses Claude Code session jsonl (`~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl`) merged with curdx-flow `~/.claude/curdx-flow/errors.jsonl` and outputs a 7-section markdown report:

| Section | Tells you |
| --- | --- |
| Hook Failures | Top hook entries by `exitCode ≠ 0` count |
| Slash Commands | `/curdx-flow:*` invocation frequency |
| Subagents | `Task` / `Agent` dispatch heat |
| Spec Funnel | research → requirements → design → tasks → execution completion ratios |
| Hook Duration | P50 / P95 / P99 latency per hook |
| Schema Drift | Unknown event types and parse errors |
| Parent UUID Chain | `parentUuid` chain integrity rate |

By default the report does **not** contain prompt full text, full file paths, or `file-history-snapshot` contents. Use `--include-prompts` to opt in for local debugging only.

## Command Recipes

### Start a feature, walk through every phase

```text
/curdx-flow:start
> Describe the feature in plain English.

# Approve research → run the next phase, repeat:
/curdx-flow:requirements
/curdx-flow:design
/curdx-flow:tasks
/curdx-flow:implement
```

### Resume after a long break

```text
/curdx-flow:status
/curdx-flow:switch
/curdx-flow:implement
```

### Recover from a stuck loop

```text
# 1. Cancel the loop and inspect state
/curdx-flow:cancel

# 2. Fix the underlying issue (usually in design.md or tasks.md)
/curdx-flow:refactor

# 3. Resume execution
/curdx-flow:implement
```

### Audit your install

```bash
npx @curdx/flow status
claude plugin list
claude mcp list
```

### Generate a session debrief

```bash
npx @curdx/flow analyze
```

## Power User Tips

- **Use `start` not `new`.** `start` does the right thing for both new specs and resume; `new` only matters when the smart detection picks the wrong path.
- **Approve thoughtfully between phases.** Each pause is your cheapest opportunity to redirect.
- **Use `--quick` only for low-risk specs.** It skips the gates that protect higher-risk work.
- **Run `/curdx-flow:status` before resuming.** Especially after a break — it tells you exactly where every spec is.
- **Keep `analyze` reports.** Saved alongside a release tag, they are a clean audit of how the spec went through.
- **Do not run `implement` from CI.** It expects interactive Claude Code; CI should run your project's normal verification commands instead.
