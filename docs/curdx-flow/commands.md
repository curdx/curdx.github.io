# Commands

CurdX Flow has two command surfaces: **slash commands** inside Claude Code (the workflow) and the **`npx @curdx/flow` CLI** outside Claude Code (installer + observability).

Each slash command has a defined behavior matrix: what state it reads, what it writes, which subagent it spawns, what completion signal it emits. This page documents both.

## Quick Reference

```text
# Inside Claude Code (workflow)
/curdx-flow:start               # smart entry — interview, research, pause
/curdx-flow:new <name>          # force-create new spec
/curdx-flow:research            # re-run research phase
/curdx-flow:requirements        # generate requirements.md
/curdx-flow:design              # generate design.md
/curdx-flow:tasks               # generate tasks.md
/curdx-flow:implement           # start/resume autonomous loop
/curdx-flow:status              # show all specs
/curdx-flow:switch              # change active spec
/curdx-flow:cancel              # halt loop, clean state
/curdx-flow:refactor            # walk requirements → design → tasks
/curdx-flow:index               # build searchable spec metadata
/curdx-flow:triage              # decompose feature into multiple specs
/curdx-flow:help                # show plugin help
/curdx-flow:feedback            # submit feedback

# At the shell (installer + observability)
npx @curdx/flow                 # interactive menu
npx @curdx/flow install         # install marketplace items
npx @curdx/flow update          # update to latest
npx @curdx/flow uninstall       # remove cleanly
npx @curdx/flow status          # what is installed
npx @curdx/flow status --json   # machine-readable
npx @curdx/flow analyze         # 7-section observability report
```

## Slash Commands (Inside Claude Code)

### `/curdx-flow:start`

The smart entry point. Use this 90% of the time.

**What it does:**

1. Branch check — if on default branch, prompts to create new branch / use worktree / continue.
2. Argument parsing — extracts `name`, `goal`, `--fresh`, `--quick`, `--specs-dir`, `--tasks-size`.
3. Intent classification — runs goal text through keyword matcher, picks BUG_FIX / TRIVIAL / REFACTOR / GREENFIELD / MID_SIZED.
4. Resume detection — if name provided and spec exists (and no `--fresh`), asks resume vs fresh.
5. Spec scan — finds related specs in `./specs/` for context.
6. New flow:
   - `mkdir -p` spec directory
   - Initialize `.curdx-state.json`
   - Write `.progress.md` with goal
   - Update `.current-spec`
   - Run Skill Discovery Pass 1
   - Run goal interview (depth varies by intent)
   - Run Skill Discovery Pass 2 (post-interview)
   - Dispatch parallel research team (≥2 subagents)
   - Merge into `research.md`
   - Set `awaitingApproval: true`, STOP
7. Resume flow: read state, jump to current phase.

**Reads:** `.curdx-state.json`, `.current-spec`, `.progress.md`, all installed `SKILL.md` files
**Writes:** `<basePath>/research.md`, `.curdx-state.json`, `.progress.md`, `./specs/.index/`
**Spawns:** parallel team — `research-analyst` + `Explore` subagents (min 2, typically 3–5)
**Stops at:** `awaitingApproval: true` after research.md is merged

**Examples:**

```text
# Auto-detect (resume active or ask for new)
/curdx-flow:start

# Resume or create user-auth
/curdx-flow:start user-auth

# Create user-auth with goal
/curdx-flow:start user-auth Add OAuth2

# Force new, overwrite if exists
/curdx-flow:start user-auth --fresh

# Quick mode with goal
/curdx-flow:start "Build auth with JWT" --quick

# Quick mode with plan file
/curdx-flow:start ./my-plan.md --quick

# Coarse granularity
/curdx-flow:start my-feature "Add logging" --tasks-size coarse
```

### `/curdx-flow:new`

Force-create a new spec, skipping resume detection. Use when the smart entry point would resume something you no longer want.

**Reads:** none required
**Writes:** new spec directory, state file, progress file
**Spawns:** none (creates skeleton; research happens via `/curdx-flow:research`)
**Stops at:** prompts for name and goal if not provided

```text
/curdx-flow:new oauth-login
> Goal: Add OAuth login with Google + Microsoft
```

### `/curdx-flow:research`

Run or re-run the research phase. Useful when the goal sharpened and you want updated research.

**Reads:** `.progress.md` for goal context, all installed `SKILL.md` files
**Writes:** `<basePath>/research.md`, `.progress.md` (skill discovery section), partial `.research-*.md` (cleaned up after merge)
**Spawns:** parallel research team via `TeamCreate` / `TaskCreate` / `Task` (all in one message)
**Stops at:** `awaitingApproval: true` after merge

### `/curdx-flow:requirements`

Generate `requirements.md` from goal + research.

**Reads:** `.progress.md`, `research.md`
**Writes:** `<basePath>/requirements.md`
**Spawns:** `product-manager` subagent (single)
**Stops at:** `awaitingApproval: true` after `requirements.md` written

The agent uses `Explore` for any codebase analysis it needs (e.g., user-facing terminology, existing AC patterns). Stable IDs (`US-N`, `AC-N.M`, `FR-N`, `NFR-N`) are first-class — downstream artifacts reference them.

### `/curdx-flow:design`

Generate `design.md` from requirements.

**Reads:** `requirements.md`, `research.md` (for codebase patterns)
**Writes:** `<basePath>/design.md`
**Spawns:** `architect-reviewer` subagent + multiple parallel `Explore` agents for architecture analysis
**Stops at:** `awaitingApproval: true`

The most important pause point. Once `design.md` is approved, the file-change manifest becomes the contract for `tasks.md` and `spec-executor`.

### `/curdx-flow:tasks`

Break design into checked task list.

**Reads:** `design.md`, `requirements.md`, `research.md` (for Quality Commands and Verification Tooling), `.progress.md` (for Intent Classification → workflow selection)
**Writes:** `<basePath>/tasks.md`, `.curdx-state.json` (sets `totalTasks`)
**Spawns:** `task-planner` subagent + 2–3 parallel `Explore` agents
**Stops at:** `awaitingApproval: true`

Workflow selected by intent:

- `GREENFIELD` → POC-first (5 phases, 40–60+ tasks fine, 10–20 coarse)
- `TRIVIAL` / `REFACTOR` / `MID_SIZED` → TDD Red-Green-Yellow (4 phases, 30–50+ tasks fine, 8–15 coarse)
- `BUG_FIX` → Bug TDD (Phase 0 + 4 phases, mandatory VF task)

```text
# Default fine granularity
/curdx-flow:tasks

# Coarse for prototypes
/curdx-flow:tasks --tasks-size coarse
```

### `/curdx-flow:implement`

Begin/resume the autonomous execution loop.

**Reads:** `.curdx-state.json` (taskIndex, totalTasks, taskIteration, fixTaskMap, modificationMap, nativeTaskMap), `tasks.md`, `.progress.md`
**Writes:**
- `.curdx-state.json` (taskIndex, taskIteration, globalIteration, completed, completedAt)
- `tasks.md` ([x] checkmarks)
- `.progress.md` (completed tasks, learnings, fix task history)
- `./specs/.index/` (via `update-spec-index.mjs` after each state advance)
- code, tests, migrations (per task `Files` section)

**Spawns:**
- `spec-executor` for normal/`[P]`/`[RED]`/`[GREEN]`/`[YELLOW]` tasks
- `qa-engineer` for `[VERIFY]` / `VE` / `VF` tasks
- `spec-reviewer` periodically (phase boundary, every 5th task, final task)
- Parallel batches use `TeamCreate` / `Task` (max 5 in one message)

**Loop runs until ANY of:**
- `taskIndex >= totalTasks` and all tasks marked `[x]` → emit `ALL_TASKS_COMPLETE`
- `taskIteration > maxTaskIterations` (default 5) → halt with error
- `globalIteration > maxGlobalIterations` (default 100) → halt with error
- Phase 5 PR Lifecycle timeouts: 48h max, 20 CI cycles max → halt

**Emits:**
- `TASK_COMPLETE` (per task) — from `spec-executor`
- `VERIFICATION_PASS` / `VERIFICATION_FAIL` — from `qa-engineer`
- `REVIEW_PASS` / `REVIEW_FAIL` — from `spec-reviewer`
- `TASK_MODIFICATION_REQUEST` — when executor surfaces a plan mismatch
- `ALL_TASKS_COMPLETE` (terminal) — from coordinator
- Optional: PR URL after `ALL_TASKS_COMPLETE`

```text
# Start or resume
/curdx-flow:implement

# After fixing a halt, resume from same task
/curdx-flow:implement
```

### `/curdx-flow:status`

Show all specs, phases, and progress.

**Reads:** `./specs/.index/` (built by `update-spec-index.mjs` hook), every `.curdx-state.json` it finds
**Writes:** none
**Spawns:** none
**Output:** table with spec name, phase, task progress (`N/M`), last activity

```text
/curdx-flow:status

Active: oauth-login
Spec               Phase         Progress  Last activity
oauth-login        execution     7/12      2 minutes ago
upload-api         design        —         3 hours ago
audit-log          completed     22/22     yesterday
```

### `/curdx-flow:switch`

Change the active spec for resume / continuation.

**Reads:** `./specs/.index/`
**Writes:** `./specs/.current-spec`
**Spawns:** none

```text
/curdx-flow:switch
> Choose: upload-api
```

### `/curdx-flow:cancel`

Halt the active loop and clean state.

**Reads:** `.curdx-state.json`
**Writes:** removes `.curdx-state.json` (or marks `cancelled: true`); optionally removes the spec directory
**Spawns:** none

Use when the spec is fundamentally wrong and you want to start over with a corrected goal.

```text
/curdx-flow:cancel
> Remove spec directory? [y/N] N   # keep spec for reference, just halt loop
```

### `/curdx-flow:refactor`

Methodically walk `requirements.md` → `design.md` → `tasks.md` after execution surfaced design drift.

**Reads:** all four artifacts, `.progress.md`
**Writes:** updates to `requirements.md`, `design.md`, `tasks.md` (section-by-section)
**Spawns:** `refactor-specialist` subagent

When to use: the executor halted because the spec assumed something untrue. Refactoring is preferable to bulldozing through with retries.

```text
# After a halt:
/curdx-flow:refactor

# Walks each artifact section, asks: "keep, edit, or invalidate?"
# After approval, updates downstream artifacts to align.

/curdx-flow:implement   # resume execution
```

### `/curdx-flow:index`

Index codebase + external resources into searchable spec metadata. Used internally by `/curdx-flow:status` and `/curdx-flow:triage`. Run manually after big repo restructures or when status reports go stale.

**Reads:** all `./specs/<name>/` directories, optionally external sources
**Writes:** `./specs/.index/`
**Spawns:** none (pure file scan)

### `/curdx-flow:triage`

Decompose a large feature into multiple dependency-aware specs (an epic).

**Reads:** `.progress.md` (for context), `./specs/.index/` (for related specs)
**Writes:**
- `./specs/_epics/<epic-name>/epic.md`
- `./specs/_epics/<epic-name>/.epic-state.json`
- `./specs/.current-epic`
- One `./specs/<child-spec>/` skeleton per child spec
**Spawns:** `triage-analyst` subagent

```text
/curdx-flow:triage
> Server-side webhooks: ingestion, retry queue, dead-letter UI.

triage-analyst:
  Decomposed into 3 specs:
    1. webhook-ingestion (no deps, start here)
    2. webhook-retry (depends on: webhook-ingestion)
    3. webhook-dead-letter (depends on: webhook-retry)

  Epic: specs/_epics/webhooks/epic.md

→ Next: /curdx-flow:start to begin the first unblocked child spec
```

### `/curdx-flow:help` / `/curdx-flow:feedback`

`help` shows plugin help and a workflow overview. `feedback` posts feedback to the GitHub issue tracker without leaving Claude Code.

## CLI Commands (Outside Claude Code)

### `npx @curdx/flow`

Interactive menu. The most common entry point.

**What it does:**

- On first run: pick language (English / 中文).
- Show the menu: install / update / uninstall / status / exit.
- Each action confirms before executing.

### `npx @curdx/flow install`

Install marketplace items.

```bash
# Interactive picker
npx @curdx/flow install

# All available, no prompts
npx @curdx/flow install --all --yes

# Specific items
npx @curdx/flow install claude-mem context7

# Different language
npx @curdx/flow install --lang en
```

**Effect per item:**

- For plugins: `claude plugin install curdx/<plugin-id>`
- For MCP servers: `claude mcp add <name> <transport-config>`
- Updates managed block in `~/.claude/CLAUDE.md` (unless `--no-claude-md`)

Idempotent — re-running produces the same final state.

### `npx @curdx/flow update`

Update everything to the latest version.

```bash
npx @curdx/flow update
```

Compares installed versions against the marketplace catalog, updates anything stale. Re-runs hooks bundling step internally to ensure `.mjs` outputs match TypeScript sources.

### `npx @curdx/flow uninstall`

Remove cleanly.

```bash
npx @curdx/flow uninstall
```

For each installed item: `claude plugin uninstall` / `claude mcp remove`. Removes the managed block from `~/.claude/CLAUDE.md` (content outside markers preserved).

### `npx @curdx/flow status`

```bash
# Human-readable
npx @curdx/flow status

# Machine-readable for scripts and CI
npx @curdx/flow status --json
```

Returns the marketplace items, install state per item, and any version drift between installed and available. Sample JSON output:

```json
{
  "version": "7.1.2",
  "items": [
    {"id": "curdx-flow", "type": "plugin", "installed": true, "version": "7.1.2", "available": "7.1.2", "drift": "none"},
    {"id": "claude-mem", "type": "plugin", "installed": true, "version": "0.4.1", "available": "0.5.0", "drift": "minor"},
    {"id": "context7", "type": "mcp", "installed": false, "version": null, "available": "latest", "drift": "missing"}
  ]
}
```

Use this in CI to detect drift after Claude Code upgrades.

### `npx @curdx/flow analyze`

Generate a 7-section markdown report parsing Claude Code session jsonl.

```bash
# Default — includes everything except prompt full text
npx @curdx/flow analyze

# Include prompts (local debugging only)
npx @curdx/flow analyze --include-prompts
```

**Inputs:**
- `~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl` (Claude Code session log)
- `~/.claude/curdx-flow/errors.jsonl` (hook errors)
- `plugins/curdx-flow/schemas/transcript-events.json` (event whitelist; falls back to builtin if missing)

**Sections:**

| Section | Tells you |
| --- | --- |
| Hook Failures | Top hook entries by `exitCode ≠ 0` count |
| Slash Commands | `/curdx-flow:*` invocation frequency (with `<command-name>` XML fallback) |
| Subagents | `Task` / `Agent` dispatch heat |
| Spec Funnel | research → requirements → design → tasks → execution completion ratios |
| Hook Duration | P50 / P95 / P99 latency per hook |
| Schema Drift | Unknown event types and parse errors |
| Parent UUID Chain | `parentUuid` chain integrity rate (`withParent / total`) |

By default the report does **not** contain prompt full text, full file paths, or `file-history-snapshot` contents. `--include-prompts` opts in for local debugging only.

## Command Recipes

### Walk through a complete feature

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
/curdx-flow:status            # see all specs
/curdx-flow:switch            # change active spec
/curdx-flow:implement         # resume autonomous loop
```

### Recover from a stuck loop

```text
# 1. Halt and inspect state
/curdx-flow:cancel            # or just stop the loop manually

# 2. Reproduce verify command at shell
cat specs/oauth-login/tasks.md
pnpm test -- --grep "rotation"

# 3a. If implementation bug: fix code, resume
/curdx-flow:implement

# 3b. If spec is wrong: refactor first
/curdx-flow:refactor
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

Save the report alongside a release tag for clean audit history.

### Detect install drift in CI

```bash
# In CI
npx @curdx/flow status --json | jq -e '.items[] | select(.drift != "none")' && \
  echo "DRIFT detected" && exit 1
```

## Power User Tips

- **Use `start` not `new`.** `start` does the right thing for both new specs and resume; `new` only matters when smart detection picks the wrong path.
- **Approve thoughtfully between phases.** Each pause is your cheapest opportunity to redirect.
- **Use `--quick` only for low-risk specs.** It skips the gates that protect higher-risk work.
- **Run `/curdx-flow:status` before resuming.** Especially after a break — it tells you exactly where every spec is.
- **Keep `analyze` reports.** Saved alongside a release tag, they are a clean audit of how the spec went through.
- **Do not run `implement` from CI.** It expects interactive Claude Code; CI should run your project's normal verification commands instead.
- **Read `.progress.md` after a halt.** The `## Learnings` and `## Fix Task History` sections tell you exactly why the loop stopped.
