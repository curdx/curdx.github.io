# Troubleshooting

When CurdX Flow misbehaves, the issue is almost always one of six things: install drift, missing prerequisites, a stuck autonomous loop, a spec out of sync with reality, hook failures, or contradiction-detection rejections. Each has a real error signature and a recovery sequence.

## Quick Triage

Run these in order. Fix the first failing layer.

```bash
node --version                 # need ≥ 20.12
claude --version               # Claude Code on PATH
claude plugin list             # curdx-flow visible?
claude mcp list                # opt-in MCP servers visible?
npx @curdx/flow status         # green checkmarks for everything you installed
```

In Claude Code:

```text
/curdx-flow:help               # confirms plugin loaded and responsive
/curdx-flow:status             # shows every spec and its phase
```

If `/curdx-flow:help` does not autocomplete, the plugin is not loaded for this session. Restart Claude Code or re-run `npx @curdx/flow install`.

## Real Error Signatures (And What They Mean)

These messages come from the coordinator and subagents. Each maps to a specific recovery path.

### `ERROR: State file missing or corrupt at $SPEC_PATH/.curdx-state.json`

**Cause:** State file was deleted or contains invalid JSON.
**Fix:** Run `/curdx-flow:implement` — the coordinator detects this and reinitializes execution state from `tasks.md`.
**Prevent:** Don't manually edit `.curdx-state.json` unless you know the schema. Treat it as opaque working memory.

### `ERROR: Tasks file missing at $SPEC_PATH/tasks.md`

**Cause:** Reached `/curdx-flow:implement` without running `/curdx-flow:tasks` first, or `tasks.md` was deleted.
**Fix:** Run `/curdx-flow:tasks` to generate the task list, then `/curdx-flow:implement`.

### `ERROR: Spec directory missing at $SPEC_PATH/`

**Cause:** Spec directory was deleted but `.current-spec` still points to it.
**Fix:** Either restore from git (`git checkout HEAD -- specs/<name>`) or run `/curdx-flow:new <name>` to create a fresh one.

### `CONTRADICTION: claimed completion while admitting failure`

**Cause:** Layer 1 verification rejected the executor's `TASK_COMPLETE`. The executor said something like "task complete but cannot be automated" — these phrases trigger contradiction detection:

- "requires manual"
- "cannot be automated"
- "could not complete"
- "needs human"
- "manual intervention"

**Fix:** This is a sign the task itself can't be completed autonomously. Run `/curdx-flow:refactor` to either:
- Replace the manual step with an automated `Verify` command (e.g., curl/Playwright/MCP browser).
- Split the task and put the manual part outside the autonomous loop.

**Prevent:** The `task-planner` already enforces "no manual verification" — but if a task slipped through, this is where it gets caught.

### `ERROR: Max retries reached for task $taskIndex after $maxTaskIterations attempts`

**Cause:** A non-`[VERIFY]` task failed `taskIteration > maxTaskIterations` (default 5) times consecutively.
**Fix:** Three paths — see [Recovering From A Stuck Autonomous Loop](#recovering-from-a-stuck-autonomous-loop) below.

### `ERROR: Max fix attempts (3) reached for task $taskId`

**Cause:** Recovery mode generated 3 fix tasks (`X.Y.1`, `X.Y.2`, `X.Y.3`), all failed.
**Output also includes:**

```text
Fix attempts: 1.3.1, 1.3.2, 1.3.3
```

**Fix:** This is a strong signal the spec is wrong, not the implementation. Run `/curdx-flow:refactor`.

### `ERROR: Max fix task depth ($maxFixTaskDepth) exceeded for task $taskId`

**Cause:** Fix-of-fix nesting exceeded depth limit (default 2). E.g., generating `1.3.1.1.1`.
**Fix:** Manual intervention required. The fix chain became too deep, almost always indicating the spec needs fundamental revision.

### `VE-check failed after N retries — skipping to VE-cleanup`

**Cause:** A `VE1` (E2E startup) or `VE2` (E2E check) task failed past retry budget.
**Behavior:** The coordinator does NOT stop immediately — it scans forward to the `VE3` (E2E cleanup) task, runs cleanup to free the dev server port, then halts.
**Fix:** After cleanup runs, fix the underlying issue (often: dev server didn't start, port collision, health endpoint wrong) and resume.

### `VE-cleanup failed after N retries — aborting`

**Cause:** Even `VE3` cleanup failed.
**Risk:** Orphaned processes (dev server, browser) may still be running. Manual cleanup needed:

```bash
# Read the PID file the VE tasks wrote
cat /tmp/ve-pids.txt

# Kill by PID
kill -9 $(cat /tmp/ve-pids.txt)

# Kill by port as fallback (replace 3000 with your project's port)
lsof -ti :3000 | xargs kill -9

# Remove PID file
rm -f /tmp/ve-pids.txt
```

### Native sync warnings (`Native sync disabled after 3 consecutive failures`)

**Cause:** `TaskCreate` or `TaskUpdate` calls failed 3 times in a row. Common when running in a non-interactive environment that doesn't support Claude Code native tasks.
**Fix:** No action required. The coordinator gracefully degrades by setting `nativeSyncEnabled: false` and continues without native task UI mirroring.

## Recovering From A Stuck Autonomous Loop

The loop halts on purpose when verification fails repeatedly. That is a feature.

### Step 1: Read the failing task

```bash
cat specs/<active-spec>/tasks.md
```

The last unchecked task is the one that failed. Read its `Do` and `Verify` sections.

### Step 2: Read .progress.md learnings

```bash
cat specs/<active-spec>/.progress.md
```

The `## Learnings` section is what the executor recorded about the failure. Look for `## Fix Task History` if recovery mode was active.

### Step 3: Reproduce the failure manually

Run the same `Verify` command at your shell. If it fails the same way → the spec is correct, implementation is broken.

```bash
# Example: a task with Verify: pnpm test -- --grep "rotation"
pnpm test -- --grep "rotation"
```

### Step 4: Pick a recovery path

**Path A — implementation bug.** Fix the code, then resume:

```text
/curdx-flow:implement
```

The loop picks up at the same task and re-runs verification.

**Path B — spec is wrong.** Run `/curdx-flow:refactor`:

```text
/curdx-flow:refactor
```

This walks the spec methodically:

1. Re-reads `requirements.md` against your current understanding.
2. Updates `design.md` to reflect what is actually true.
3. Updates `tasks.md` to align with the new design.

After the spec is corrected, resume:

```text
/curdx-flow:implement
```

**Path C — start over.** If the spec is fundamentally wrong:

```text
/curdx-flow:cancel
> Remove spec directory? [y/N] y

/curdx-flow:start
> [corrected goal]
```

## Inspecting Hook Failures

Hooks are the silent rails of the workflow. When they break, the symptom is usually "things should be advancing but aren't."

### Read the error log

```bash
cat ~/.claude/curdx-flow/errors.jsonl | tail -20
```

Each entry is JSON:

```json
{"hookName":"update-spec-index","exitCode":1,"stderr":"ENOENT: no such file or directory, scandir './specs/.index/'","timestamp":"2026-05-05T12:30:00Z","durationMs":42}
```

Look for repeated non-zero `exitCode` from the same `hookName`.

### Generate a structured report

```bash
npx @curdx/flow analyze
```

The report includes:

- **Hook Failures** — top hooks by failure count
- **Hook Duration** — P50/P95/P99 latency per hook (slow hooks may time out)
- **Schema Drift** — unknown event types or parse errors

### Disable hook error logging

```json
// ~/.claude/settings.json
{
  "errorLogEnabled": false
}
```

Disabling logging silences the symptom but does not fix the root cause. Use only after ruling out the hooks themselves.

## Spec Out Of Sync With Reality

The most common subtle failure: implementation reveals the design assumed something not actually true.

### Symptoms

- `[VERIFY]` keeps failing for tasks that *look* correct.
- Multiple tasks in a row need the same out-of-band fix.
- The executor produces code that contradicts a constraint you remember mentioning during research.
- `## Fix Task History` shows multiple fixes for related tasks.

### Fix

```text
/curdx-flow:refactor
```

`refactor-specialist` walks `requirements.md` → `design.md` → `tasks.md` section by section. For each section: keep / edit / invalidate.

This is preferable to bulldozing through with retries.

## Install And Marketplace Issues

### `claude plugin install` fails

```bash
npx @curdx/flow install --yes 2>&1 | tee install.log
```

Common causes:

- `claude` CLI is on `PATH` for your shell but not for the spawned subprocess. Common with `~/.zprofile` vs `~/.zshrc` vs `~/.bashrc` mismatches.
- Plugin requires a Claude Code version newer than installed. Check `claude --version`.

### MCP server listed but not responding

```bash
claude mcp list
```

If a server is listed but not working, check whether it requires an API key. For example, `context7` accepts `CONTEXT7_API_KEY`. Without it, the server still installs but rate limits aggressively.

### Drift after Claude Code upgrade

```bash
npx @curdx/flow update
npx @curdx/flow status
```

Updates are idempotent. Re-running them after a Claude Code upgrade is the right reflex.

### `claude mcp list` is empty after install

Check `~/.claude/curdx-flow/errors.jsonl` for install errors. Re-run `npx @curdx/flow install <mcp-id>` for the specific MCP that failed.

## State File Corruption Recovery

If `.curdx-state.json` is corrupt (invalid JSON) and `/curdx-flow:implement` cannot recover:

```bash
# Inspect corruption
cat specs/<spec>/.curdx-state.json

# Manual reset — remove state and let coordinator reinitialize
rm specs/<spec>/.curdx-state.json
```

Then run `/curdx-flow:implement` — the coordinator will reinitialize from `tasks.md`. You'll lose `taskIteration` / `globalIteration` / `fixTaskMap` history but the four canonical artifacts and `tasks.md` `[x]` checkmarks are preserved.

## Branch Issues

### "Currently on default branch (main/master)"

The executor stops if it detects it's still on the default branch. Branch is supposed to be set at `/curdx-flow:start`.

**Fix:**

```bash
git checkout -b feat/<spec-name>
```

Then resume:

```text
/curdx-flow:implement
```

### "git push -u origin failed"

Almost always a remote permission issue or branch conflict. Check:

```bash
git remote -v
gh auth status
git pull origin main --rebase   # if branch is stale
```

## Platform Notes

### macOS

- Both Intel and Apple Silicon supported.
- Node via `nvm` works fine; system Node tends to be too old.
- `flock` is not native on macOS — parallel batches use a Node-based lock helper instead.

### Linux

- Tested on Ubuntu 22.04+ and Fedora 39+.
- Make sure `bash` and `node` paths are consistent for both your shell and any spawned subprocesses.

### Windows

- Use WSL2 (Ubuntu LTS recommended).
- The `analyze` CLI is **declared supported but not extensively tested** on Windows — `~/.claude/curdx-flow/errors.jsonl` write atomicity on NTFS is not guaranteed (POSIX `PIPE_BUF` 4KB only applies to POSIX).
- Native PowerShell paths for `claude` may not match WSL paths. Run flow inside WSL for consistency.

## Best Practices To Avoid Problems

- Run `npx @curdx/flow status` after Claude Code upgrades and after long breaks.
- Commit the four canonical artifacts. Reviewers can audit the spec without a flow install.
- Keep `.curdx-state.json` and `.progress.md` gitignored. Committed state pollutes future sessions.
- Treat retry-budget exhaustion as a signal, not a quota. The right response is "fix the underlying issue", not "raise the limit".
- Use `/curdx-flow:refactor` instead of editing `design.md` by hand. It walks all downstream artifacts consistently.
- Save `npx @curdx/flow analyze` reports alongside release tags — they're a clean audit of how the spec executed.
- For BUG_FIX specs, sanity-check Phase 0 reproduction locally before approving — if you cannot reproduce the bug, the AFTER verification cannot prove the fix.

## Getting Help

- [GitHub Issues](https://github.com/curdx/curdx-flow/issues) for reproducible bugs and feature requests
- [Releases](https://github.com/curdx/curdx-flow/releases) to confirm whether you are on an old build
- `/curdx-flow:feedback` inside Claude Code to send feedback without leaving the session
