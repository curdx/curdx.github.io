# Configuration

CurdX Flow can be configured through CLI flags (per invocation), environment variables (per shell or session), and the managed `~/.claude/CLAUDE.md` block (global, shared by every Claude Code session).

## CLI Flags

### Installer flags (`npx @curdx/flow`)

| Flag | Effect |
| --- | --- |
| `--all` | Apply to every available item (with `install` or `update`) |
| `--yes` | Skip all confirmations (non-interactive) |
| `--lang en` / `--lang zh` | Override the language for the current invocation |
| `--no-claude-md` | Do not write the managed block to `~/.claude/CLAUDE.md` |
| `--json` | Output machine-readable JSON (with `status`) |

Practical examples:

```bash
# Install everything available, no prompts
npx @curdx/flow install --all --yes

# Install in Chinese, skip the CLAUDE.md block
npx @curdx/flow install --lang zh --no-claude-md

# Machine-readable status for shell scripts and CI
npx @curdx/flow status --json
```

### Plugin flags (slash commands)

These are passed to `/curdx-flow:start` or `/curdx-flow:new`:

| Flag | Effect |
| --- | --- |
| `--quick` | Run all phases sequentially without pausing for approval |
| `--commit-spec` / `--no-commit-spec` | Commit spec artifacts after each phase (default: `true`) |
| `--specs-dir <path>` | Write specs to a non-default directory (e.g. `packages/api/specs/`) |
| `--tasks-size fine` / `--tasks-size coarse` | Granularity of the `tasks.md` decomposition |
| `--fresh` | Force-create a new spec even if a related one exists |

Practical examples:

```text
# Quick mode for a low-risk change
/curdx-flow:start --quick
> Add /healthz with version + uptime.

# Coarse tasks for prototyping speed
/curdx-flow:start --tasks-size coarse
> Spike a webhook receiver to validate the contract.

# Per-package specs in a monorepo
/curdx-flow:start --specs-dir packages/api/specs
> Add OAuth login.
```

## Environment Variables

| Variable | Effect | Equivalent flag |
| --- | --- | --- |
| `CURDX_FLOW_NO_CLAUDE_MD=1` | Skip writing the managed `CLAUDE.md` block | `--no-claude-md` |
| `CURDX_FLOW_LANG=en` / `=zh` | Default language for the installer | `--lang` |
| `CONTEXT7_API_KEY` | Optional API key for the `context7` MCP server | n/a |

Recommended uses:

- Set `CURDX_FLOW_LANG` once in your shell profile if you always want the same language.
- Set `CURDX_FLOW_NO_CLAUDE_MD=1` if your team manages `~/.claude/CLAUDE.md` by hand and does not want flow to touch it.
- Set `CONTEXT7_API_KEY` only if you actually installed the `context7` MCP server and want higher rate limits.

## Granularity: `--tasks-size`

`fine` is the default and produces small tasks that each map to one verifiable step:

```markdown
- [ ] 1.1 Add OAuth provider config schema
- [ ] 1.2 [VERIFY] Schema typechecks and validates sample input
- [ ] 1.3 Implement token exchange handler
- [ ] 1.4 [VERIFY] Unit tests pass
```

`coarse` produces fewer, broader tasks:

```markdown
- [ ] 1 Implement OAuth provider scaffolding
- [ ] 2 [VERIFY] Provider scaffolding boots and accepts a sample request
```

Use `fine` for production work where each task should commit independently. Use `coarse` for spikes or prototypes where commit granularity is not the goal.

## State Files

Per spec, flow keeps two working files alongside the four canonical artifacts:

| File | Purpose | Committed? |
| --- | --- | --- |
| `research.md` | Research output — facts, references, recommendations | Yes |
| `requirements.md` | User stories, FR / NFR, acceptance criteria | Yes |
| `design.md` | Decisions, risks, components, file-change manifest | Yes |
| `tasks.md` | Sequenced task list with `[VERIFY]` gates | Yes |
| `.curdx-state.json` | Current phase, task index, iteration counters | No (gitignored) |
| `.progress.md` | Phase notes, skill discovery log | No (gitignored) |

The default `.gitignore` flow generates includes:

```text
specs/.current-spec
specs/.current-epic
**/.curdx-state.json
**/.progress.md
```

Treat the four canonical artifacts as part of your codebase. Treat the state and progress files as working memory.

## The Managed `CLAUDE.md` Block

After install, `~/.claude/CLAUDE.md` contains a block bracketed by markers:

```markdown
<!-- BEGIN @curdx/flow v1 -->
... installer-managed manifest ...
<!-- END @curdx/flow v1 -->
```

What it does:

- Tells Claude Code which plugins and MCP servers are installed.
- Lists the available `/curdx-flow:*` commands so completion works in fresh sessions.
- Provides minimal usage hints for opt-in marketplace items.

What flow guarantees:

- **It only ever rewrites the block between the markers.** Content outside the markers is preserved verbatim.
- **It is idempotent.** Re-running `npx @curdx/flow` produces a stable diff (same install state → same block).
- **You can opt out.** Pass `--no-claude-md` or set `CURDX_FLOW_NO_CLAUDE_MD=1`.

If you maintain `~/.claude/CLAUDE.md` by hand, opt out and add the manifest yourself. Otherwise let flow manage it.

## Per-project Overrides

Project-specific Claude Code settings live in `.claude/settings.json`. Flow does not write to this file by default. If you want project-level error logging configured:

```json
{
  "errorLogEnabled": false
}
```

Set `errorLogEnabled: false` to disable hook error logging entirely. Default is on (writes to `~/.claude/curdx-flow/errors.jsonl`).

## Iteration Limits And Recovery State

The autonomous loop has multiple counters and maps in `.curdx-state.json`. A typical mid-execution state:

```json
{
  "source": "spec",
  "name": "oauth-login",
  "basePath": "./specs/oauth-login",
  "phase": "execution",
  "taskIndex": 7,
  "totalTasks": 12,
  "taskIteration": 1,
  "maxTaskIterations": 5,
  "globalIteration": 23,
  "maxGlobalIterations": 100,
  "commitSpec": true,
  "quickMode": false,
  "granularity": "fine",
  "discoveredSkills": [
    {"name": "claude-mem:make-plan", "matchedAt": "start", "invoked": true}
  ],
  "fixTaskMap": {
    "1.4": {
      "attempts": 1,
      "fixTaskIds": ["1.4.1"],
      "lastError": "TypeError: cannot read property 'sub' of undefined"
    }
  },
  "modificationMap": {},
  "nativeTaskMap": {"0": "task-7f3a9c2", "1": "task-8e1b4d5"},
  "recoveryMode": false,
  "maxFixTasksPerOriginal": 3,
  "maxFixTaskDepth": 2,
  "nativeSyncEnabled": true,
  "awaitingApproval": false,
  "completed": false
}
```

### Counter reference

| Field | Default | Purpose |
| --- | --- | --- |
| `taskIteration` | 1 | Current task's retry attempt (resets on success) |
| `maxTaskIterations` | 5 | Per-task retry budget when verification fails |
| `globalIteration` | 1 | Total tasks executed across the spec (incl. retries) |
| `maxGlobalIterations` | 100 | Hard ceiling for the whole spec |
| `maxFixTasksPerOriginal` | 3 | Max recovery fix tasks per original task (e.g., 1.3.1, 1.3.2, 1.3.3) |
| `maxFixTaskDepth` | 2 | Max nesting depth for fix-of-fix (`1.3.1.1` allowed, `1.3.1.1.1` rejected) |

If `maxTaskIterations` is reached on a single task, the loop halts and surfaces the failure. If `maxGlobalIterations` is reached, the loop halts even if no individual task hit its retry budget.

### Map reference

| Field | Purpose |
| --- | --- |
| `discoveredSkills` | Skills auto-loaded by skill discovery (Pass 1 + Pass 2) |
| `fixTaskMap` | Per-task fix attempt history when `recoveryMode: true` |
| `modificationMap` | Per-task `TASK_MODIFICATION_REQUEST` history (max 3 per task) |
| `nativeTaskMap` | Maps `taskIndex` → Claude Code native task ID for UI mirroring |

Both `taskIndex` and counters can be edited directly if a long spec needs more headroom — but a runaway counter is usually a sign the spec needs revision, not more retries.

### Always preserve existing fields

The coordinator uses a deep-merge helper to update state — never write a new object from scratch. To manually adjust:

```bash
node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/lib/merge-state.mjs" \
     "$SPEC_PATH/.curdx-state.json" \
     '{"maxTaskIterations": 8}'
```

This preserves `source`, `name`, `basePath`, `commitSpec`, `relatedSpecs`, and all other fields.

## Recommended Patterns

### Solo developer, small repos

- Install the bundled plugin and one or two marketplace items (`claude-mem` and `context7` are the common picks).
- Default flags. Use `--quick` only on throwaway specs.
- Let flow manage `~/.claude/CLAUDE.md`.

### Team monorepo

- Use `--specs-dir <package>/specs` to keep specs scoped per package.
- Commit `.gitignore` entries for state files.
- Document the `[VERIFY]` command set in your project README so subagents know what to run.
- Pick `--tasks-size fine` so commits stay reviewable.

### CI integration

- Run `npx @curdx/flow status --json` in CI to detect install drift.
- Run `npx @curdx/flow analyze` against a session jsonl to surface hook regressions before they bite a real session.
- Do **not** run `/curdx-flow:implement` from CI. The loop expects an interactive Claude Code session.

## Best Practices

- Commit the four canonical artifacts. Reviewers should be able to read the spec without a flow install.
- Keep state files out of git. The `.gitignore` defaults exist for a reason — committed state confuses future-you.
- Use `--quick` only when the spec is small enough for a single end-to-end review. The pause gates are not bureaucracy; they catch alignment errors early.
- If the retry budget keeps tripping, fix the underlying issue rather than raising the limit. Persistent verification failures are a signal, not noise.
