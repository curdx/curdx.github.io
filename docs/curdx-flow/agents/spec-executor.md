# spec-executor

The implement phase owner — and the only autonomous subagent in the workflow. Picks up unchecked tasks from `tasks.md`, implements them in fresh contexts, verifies, commits, and advances until every box is checked.

## Trigger Conditions

| Trigger | Behavior |
| --- | --- |
| `/curdx-flow:implement` | Starts (or resumes) the autonomous loop |
| `/curdx-flow:cancel` | Stops the active loop and cleans up state |

The loop runs until either:

- Every task in `tasks.md` is checked off (`ALL_TASKS_COMPLETE`), or
- A verification gate fails beyond the per-task retry budget (the loop halts and surfaces the failure).

## Inputs (Per Task)

The coordinator delegates ONE task per invocation via `Task` tool:

| Field | Source | Purpose |
| --- | --- | --- |
| `basePath` | Coordinator | Spec directory — used for ALL file ops |
| `specName` | Coordinator | Spec name token |
| Task index | `.curdx-state.json` | 0-based index into `tasks.md` |
| Task block | `tasks.md` | Full Do/Files/Done when/Verify/Commit block |
| Context from `.progress.md` | Prior progress | Completed tasks, learnings |
| `progressFile` (optional) | Parallel mode | `.progress-task-N.md` instead of `.progress.md` |

## Critical Operating Rules

The executor operates under a strict role definition. These rules are restated at the start AND end of its system prompt:

1. **"Complete" means verified working in a real environment with proof** — API response, log output, real behavior. "Code compiles" or "tests pass" alone is insufficient.
2. **No user interaction.** Never use `AskUserQuestion`. Use `Explore`, `Bash`, `WebFetch`, MCP browser tools instead.
3. **Never modify `.curdx-state.json`.** State is read-only for the executor. The coordinator owns state transitions.
4. **Never output `TASK_COMPLETE`** unless: verify passed, done-when met, changes committed, task marked `[x]`.
5. **Always commit spec files** (`tasks.md` + progress file) with every task.

## The Execution Loop

```text
while unchecked tasks exist:
    pick next unchecked task from tasks.md (taskIndex from state)
    open fresh context (Task delegation = new context window)
    inject: task description, design.md excerpt, relevant files

    if [VERIFY] task:
        delegate to qa-engineer (not spec-executor)
        on VERIFICATION_PASS → mark [x], commit, advance
        on VERIFICATION_FAIL → increment retry; halt if budget exhausted

    else if [P] parallel batch:
        spawn N spec-executor instances in parallel (all in ONE message)
        each writes to .progress-task-N.md
        merge progress after batch completes

    else:
        spec-executor implements the task
        runs Verify command
        commits (one commit per task by default)
        marks [x] in tasks.md
        outputs TASK_COMPLETE

    coordinator runs verification layers (see below)
    on pass → advance taskIndex, push if phase boundary or 5+ commits
    on fail → retry or generate fix task

emit ALL_TASKS_COMPLETE
```

Three properties make this trustworthy:

1. **Fresh context per task.** Long sessions and rate-limit resets do not pollute later tasks. The executor only sees what the task needs.
2. **Verification before advance.** A `[VERIFY]` task fails the loop, not the previous task. Mistakes are caught at the next gate.
3. **Halt on persistent failure.** If retries exhaust, the loop stops. You fix the underlying issue and resume; flow does not silently paper over real failures.

## Verification Layers (Coordinator Side)

After every `TASK_COMPLETE`, the coordinator runs three layers BEFORE advancing:

### Layer 1: Contradiction Detection

Scans executor output for contradiction patterns alongside `TASK_COMPLETE`:

- "requires manual"
- "cannot be automated"
- "could not complete"
- "needs human"
- "manual intervention"

If any contradiction phrase appears with `TASK_COMPLETE`:
- REJECT the completion
- Log: `CONTRADICTION: claimed completion while admitting failure`
- Increment `taskIteration` and retry

### Layer 2: Signal Verification

Verifies the executor explicitly output `TASK_COMPLETE` (or `ALL_TASKS_COMPLETE` for the final task). Silent completion is invalid — partial completion is invalid.

If `TASK_COMPLETE` missing:
- Do NOT advance
- Increment `taskIteration` and retry

### Layer 3: Periodic Artifact Review

The coordinator invokes the `spec-reviewer` agent when ANY of these is true:

- **Phase boundary**: phase number in task ID changed.
- **Every 5th task**: `taskIndex > 0 && taskIndex % 5 == 0`.
- **Final task**: `taskIndex == totalTasks - 1`.

The reviewer reads the changed files (via `git diff --name-only $TASK_START_SHA HEAD`), `design.md`, and `requirements.md`, then outputs `REVIEW_PASS` or `REVIEW_FAIL` (max 3 review iterations per task; on failure, a fix task is auto-generated and inserted).

## Commit Discipline

**One task = one commit.** The exact commit message comes from the task's `Commit` field. Conventional commit prefixes:

| Prefix | When |
| --- | --- |
| `feat(scope):` | New feature |
| `fix(scope):` | Bug fix |
| `refactor(scope):` | Code restructuring |
| `test(scope):` | Adding tests |
| `docs(scope):` | Documentation |
| `chore(scope):` | Maintenance, quality checkpoints |

**Every task commit MUST include:**

```bash
# Sequential execution:
git add <task files>
git add <basePath>/tasks.md          # marked [x]
git add <basePath>/.progress.md      # learnings appended
git commit -m "<exact commit message from task>"

# Parallel execution (progressFile provided):
git add <basePath>/<progressFile>    # NOT .progress.md
```

Failure to commit spec files breaks progress tracking across sessions. The coordinator additionally commits index updates (`./specs/.index/`) after each state advance.

### Push Strategy

Commit per task; push in batches:

| When to push | Why |
| --- | --- |
| Phase boundary | Stable checkpoint |
| 5+ commits since last push | Avoid losing work |
| Before creating PR (Phase 4/5) | Required for `gh pr create` |
| When `awaitingApproval` is set | User gate requires remote state |

## File Modification Safety

The executor uses surgical edits:

- **Existing files**: `Edit` tool (targeted replacement). Never `Write` on existing files — `Write` replaces entire content and silently reverts prior task commits.
- **New files only**: `Write` tool when creating a file that does not exist.
- **If `Edit` fails** (`old_string` not found): re-read the file, retry with correct `old_string`. Never fall back to `Write`.
- **Post-commit check**: `git diff HEAD~1 --stat` after commit. If unexpected deletions appear, investigate before outputting `TASK_COMPLETE`.

The executor touches **ONLY files listed in the task's `Files` section**. No "while you're in there" improvements. No reformatting adjacent code.

## TDD Triplet Behavior

When a task contains `[RED]`, `[GREEN]`, or `[YELLOW]`, the executor switches mode:

### `[RED]` — Write Failing Test Only

- Write test code only. NO implementation code.
- Verify confirms the test FAILS. A passing test is an ERROR (behavior already exists or test is wrong).
- Commit only test files.
- Verify pattern: `<test cmd> 2>&1 | grep -q "FAIL\|fail\|Error" && echo RED_PASS`

### `[GREEN]` — Make Test Pass

- Write minimum code to make the failing test pass.
- No refactoring, no extras. Ugly but passing is correct.
- Verify pattern: `<test cmd>`

### `[YELLOW]` — Refactor

- Refactor freely: rename, extract, restructure.
- Verify ALL tests pass after every refactoring step. If a test breaks, revert that refactoring.
- Verify pattern: `<test cmd> && <lint cmd>`

## `[VERIFY]` Tasks Are Delegated

`[VERIFY]` tasks are **never executed by spec-executor directly**. The coordinator delegates them to `qa-engineer`:

```text
Task: Execute verification task $taskIndex for spec $spec
Subagent: qa-engineer

Task body:
[Full Do, Verify, Done-when sections]

Instructions:
1. Execute verification as specified
2. If issues found, attempt to fix them
3. Output VERIFICATION_PASS if verification succeeds
4. Output VERIFICATION_FAIL if verification fails and cannot be fixed
```

`VERIFICATION_PASS` is treated as `TASK_COMPLETE`. `VERIFICATION_FAIL` does not advance — coordinator increments `taskIteration` and retries.

## Parallel Execution

When the current task has `[P]` and adjacent tasks share the marker, the coordinator builds a parallel batch (max 5 tasks) and dispatches all instances **in ONE message**:

```text
Step 1: TeamDelete()                       # release stale team
Step 2: TeamCreate("exec-$spec")           # new team
Step 3: TaskCreate per task in batch
Step 4: ALL Task(...) calls in ONE message
        Each spec-executor writes to .progress-task-N.md
Step 5: Wait for idle notifications
Step 6: SendMessage(shutdown_request) per teammate
Step 7: Merge .progress-task-N.md files into .progress.md
Step 8: TeamDelete()
```

In parallel mode, executors use `flock` to coordinate writes:

```bash
# tasks.md updates (marking [x]):
( flock -x 200; sed -i 's/- \[ \] X.Y/- [x] X.Y/' "$BASE/tasks.md" ) 200>"$BASE/.tasks.lock"

# git commits:
( flock -x 200; git add <files>; git commit -m "msg" ) 200>"$BASE/.git-commit.lock"
```

Lock files (`.tasks.lock`, `.git-commit.lock`) are temporary; the coordinator cleans them up after the batch.

## Output Protocol

Success template (used for every task completion):

```text
TASK_COMPLETE
status: pass
commit: a1b2c3d
verify: all tests passed (12/12)
```

Constraints:

- One-line `verify:` result.
- 7-character commit hash from `git rev-parse --short HEAD`.
- No reasoning narration ("First I'll...").
- No celebration ("Great news!").
- No full stack traces (one line max).
- No file listings (commit hash suffices).
- No "why" explanations (those go in commit messages).

On final task: output `ALL_TASKS_COMPLETE` instead. The coordinator emits `ALL_TASKS_COMPLETE` (with optional PR URL) only when:

- `taskIndex >= totalTasks`
- All tasks marked `[x]`
- Zero test regressions verified
- Code modular/reusable (documented in `.progress.md`)
- Phase 5 PR Lifecycle complete (if applicable)

## `TASK_MODIFICATION_REQUEST` Protocol

When the task plan needs adjustment, the executor outputs `TASK_MODIFICATION_REQUEST` instead of improvising:

```text
TASK_MODIFICATION_REQUEST
```
```json
{
  "type": "SPLIT_TASK" | "ADD_PREREQUISITE" | "ADD_FOLLOWUP",
  "originalTaskId": "X.Y",
  "reasoning": "Why this modification is needed",
  "proposedTasks": [
    "- [ ] X.Y.1 Task name\n  - **Do**:\n    1. Step\n  - **Files**: path\n  - **Done when**: Criteria\n  - **Verify**: command\n  - **Commit**: `type(scope): message`"
  ]
}
```

| Type | When | TASK_COMPLETE in same response? |
| --- | --- | --- |
| `SPLIT_TASK` | Current task too complex | Yes (original done, sub-tasks inserted) |
| `ADD_PREREQUISITE` | Missing dependency discovered | No (blocked until prereq completes) |
| `ADD_FOLLOWUP` | Cleanup/extension needed | Yes (current task done, followup added) |

Limits: max 3 modifications per task; nested depth max 2 levels (e.g., `1.3.1.1` allowed, `1.3.1.1.1` rejected).

## Recovery Loop (Fix Tasks)

When `recoveryMode: true` is set in state and a task fails, the coordinator generates a fix task automatically:

```text
1. Parse failure output (extract taskId, error, attemptedFix)
2. Check fix limits (maxFixTasksPerOriginal, default 3)
3. Generate fix task markdown:
   - [ ] X.Y.N [FIX X.Y] Fix: <error summary>
4. Insert fix task into tasks.md (after original task block)
5. Update state.fixTaskMap[taskId]:
   { attempts: N, fixTaskIds: [...], lastError: "..." }
6. Increment totalTasks
7. Delegate fix task to spec-executor
8. On fix TASK_COMPLETE → retry original task
9. On fix failure → generate fix-of-fix (depth max 2)
```

Fix task chain in `.progress.md`:

```markdown
## Fix Task History
- Task 1.3: 2 fixes attempted (1.3.1, 1.3.2) - Final: PASS
- Task 2.1: 1 fix attempted (2.1.1) - Final: PASS
- Task 3.4: 3 fixes attempted (3.4.1, 3.4.2, 3.4.3) - Final: FAIL (max limit)
```

When the fix budget is exhausted (`attempts >= maxFixTasksPerOriginal`), the coordinator stops with:

```text
ERROR: Max fix attempts (3) reached for task 3.4
Fix attempts: 3.4.1, 3.4.2, 3.4.3
```

## Real Sample Loop Output

A typical implement run as the user sees it:

```text
You:  /curdx-flow:implement
flow:  Reading state. Resuming spec oauth-login at task 1.1 (0/12).

       ⟳ task 1.1 [P] Add OAuth provider config schema
         TASK_COMPLETE
         status: pass
         commit: 7f3a9c2
         verify: schema parses sample, tsc clean

       ⟳ task 1.2 [P] Add token storage with rotation lock
         TASK_COMPLETE
         status: pass
         commit: 8e1b4d5
         verify: rotation test passed (3/3 concurrent)

       ⟳ task 1.3 [VERIFY] Quality checkpoint: pnpm lint && pnpm tsc --noEmit
         qa-engineer: VERIFICATION_PASS

       ⟳ task 1.4 Implement authorization code exchange handler
         TASK_COMPLETE
         status: pass
         commit: 1c2d3e4
         verify: e2e-oauth.mjs passed against google-sandbox

       [phase boundary — pushing 4 commits]
       Pushed 4 commits (reason: phase boundary)

       ⟳ task 2.1 Extract token-family revocation helper
         ...

       ✓ ALL_TASKS_COMPLETE  (12/12 tasks, 47 commits, all green)

       PR: https://github.com/curdx/oauth-login/pull/42
```

A failure mid-loop:

```text
       ⟳ task 1.4 Implement authorization code exchange handler
         Verify failed: e2e-oauth.mjs exited 1
         Last error: TypeError: cannot read property 'sub' of undefined at oauth-provider.ts:42
         Retry 1/5...
         Retry 2/5...
         Retry 5/5...
         ✗ HALT — task 1.4 verification failed beyond retry budget

       Resume by running /curdx-flow:implement after fixing the issue.
       Or run /curdx-flow:refactor if the spec needs revision.
```

## What The Executor Does NOT Do

- Does not edit files outside the design's manifest. If the manifest is wrong, the spec needs revision.
- Does not skip `[VERIFY]` gates. A failing gate is a failing task.
- Does not invent new tasks (uses `TASK_MODIFICATION_REQUEST` instead).
- Does not run interactive commands. Verification commands must be non-interactive.
- Does not modify `.curdx-state.json`. State is coordinator-only.
- Does not push directly to default branch. Branch is set at `/curdx-flow:start`.

This narrow scope is a feature. It is what makes the loop trustworthy enough to leave running.

## Anti-Patterns

| Don't | Why |
| --- | --- |
| Use `Write` on existing files | Replaces entire content, silently reverts prior commits. |
| Edit files not in `Files` section | Out-of-scope edits break the manifest contract. |
| Output `TASK_COMPLETE` with caveats | Layer 1 contradiction detection rejects this. |
| Skip `tasks.md` / `.progress.md` from commits | Breaks progress tracking. |
| Modify `.curdx-state.json` | Coordinator-only. Verified by Layer 2. |
| Lie about completion | Wastes iterations and breaks the workflow. Be honest about blockers. |

## Resuming After A Halt

```text
# 1. See what halted
/curdx-flow:status

# 2. Read the failing task in tasks.md and reproduce manually
cat specs/<spec>/tasks.md
# run the verify command at your shell

# 3a. If the failure is an implementation bug, fix it and resume:
/curdx-flow:implement

# 3b. If the failure is a spec problem, refactor first:
/curdx-flow:refactor
/curdx-flow:implement
```

## Best Practices

- Approve `tasks.md` carefully. The executor commits to it. If a task is wrong, you cancel and refactor.
- Do not run `/curdx-flow:implement` from CI. It expects an interactive Claude Code session.
- Keep verification commands fast. The loop runs them constantly; a slow verifier multiplies the wait.
- Treat halts as signals. The loop is designed to stop when it cannot make safe progress — investigate before resuming.
- Use `--commit-spec` (default) so the spec artifacts are committed alongside the code. Reviewers should be able to read both.
- Watch for the `TASK_MODIFICATION_REQUEST` signal in your terminal — it means the executor surfaced a real plan mismatch worth your attention.
