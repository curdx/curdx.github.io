# spec-executor

The implement phase owner — and the only autonomous subagent in the workflow. Runs the execution loop that picks up unchecked tasks from `tasks.md`, implements them in fresh contexts, verifies, commits, and advances until every box is checked.

## What It Does

`spec-executor` is invoked when you run `/curdx-flow:implement` after `tasks.md` is approved. Unlike the other phase owners, it does not exit after producing one artifact. It runs a loop until either:

- Every task in `tasks.md` is checked off (`ALL_TASKS_COMPLETE`), or
- A verification gate fails beyond the per-task retry budget (the loop halts and surfaces the failure).

This is what the brochure means when it says "walk away, come back, read the diff."

## When It Runs

| Trigger | Behavior |
| --- | --- |
| `/curdx-flow:implement` | Starts (or resumes) the autonomous loop |
| `/curdx-flow:cancel` | Stops the active loop and cleans up state |

## The Execution Loop

```text
while unchecked tasks exist:
    pick next unchecked task from tasks.md
    open fresh context
    inject: task description, design.md excerpt, relevant files
    if [VERIFY] task:
        run verification command
        on PASS → mark [x], commit progress, advance
        on FAIL → increment retry; if budget exhausted, halt
    else:
        implement the task
        mark [x]
        commit (one commit per task by default)
        advance
end
emit ALL_TASKS_COMPLETE
```

Three properties make this trustworthy:

1. **Fresh context per task.** Long sessions and rate-limit resets do not pollute later tasks. The executor only sees what the task needs.
2. **Verification before advance.** A `[VERIFY]` task fails the loop, not the previous task. Mistakes are caught at the next gate.
3. **Halt on persistent failure.** If retries exhaust, the loop stops. You fix the underlying issue and resume; flow does not silently paper over real failures.

## Output: Code, Tests, And Commits

Unlike other phase owners, the executor's output is your codebase. By default:

- One commit per task (configurable via `--commit-spec` / `--no-commit-spec`)
- Commits include the task number and description in the message
- `tasks.md` is updated to mark completed tasks `[x]`
- `.curdx-state.json` tracks the current task index and retry counts

## Retry Budget And Halt Behavior

The executor has two budgets, both stored in `.curdx-state.json`:

| Counter | Default | Purpose |
| --- | --- | --- |
| `maxTaskIterations` | 5 | Per-task retry budget when `[VERIFY]` fails |
| `maxGlobalIterations` | 100 | Hard ceiling across the whole spec |

When a task fails:

1. The executor analyzes the failure (verification stderr, command output).
2. Attempts a fix within the same context.
3. Re-runs verification.
4. Repeats up to `maxTaskIterations` times.
5. If still failing, marks the loop halted and surfaces the failure for human intervention.

The right response to a halt is almost never "raise the budget". It is "fix the underlying issue or revise the spec".

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

## What The Executor Does Not Do

- It does not edit files outside the design's manifest. If the manifest is wrong, the spec needs revision.
- It does not skip `[VERIFY]` gates. A failing gate is a failing task.
- It does not invent new tasks. It only executes what is in `tasks.md`.
- It does not run interactive commands. Verification commands must be non-interactive.

This narrow scope is a feature. It is what makes the loop trustworthy enough to leave running.

## Practical Examples

### Normal completion

```text
You:    /curdx-flow:implement
flow:   ⟳ task 1.1 → verify → commit ✓
        ⟳ task 1.2 → verify → commit ✓
        ⟳ task 1.3 → verify → commit ✓
        ...
        ✓ ALL_TASKS_COMPLETE  (12/12 tasks, 47 commits)
You:    git log --oneline | head
```

### Halt on failure

```text
You:    /curdx-flow:implement
flow:   ⟳ task 1.1 → verify → commit ✓
        ⟳ task 1.2 → verify FAIL (retry 1/5)
        ⟳ task 1.2 → verify FAIL (retry 2/5)
        ⟳ task 1.2 → verify FAIL (retry 5/5)
        ✗ HALT — task 1.2 verification failed beyond retry budget
        Last error: TypeError: cannot read property 'sub' of undefined at oauth-provider.ts:42
You:    [reads tasks.md, fixes the issue or refactors]
        /curdx-flow:implement   # resumes from task 1.2
```

### Resume after a long break

```text
You:    /curdx-flow:status
flow:   spec: oauth-login (8/12 tasks complete)
        last task: 2.4 [VERIFY] integration tests pass
You:    /curdx-flow:implement
flow:   ⟳ task 3.1 → verify → commit ✓
        ...
```

## Reading The Output

After the loop completes:

- **Read `git log` first.** One commit per task tells you what shipped.
- **Read the diff per phase, not per task.** Phase boundaries are usually the right granularity for review.
- **Verify your own way.** The executor ran the spec's verification commands. Run your project's test suite end-to-end before merging.

## Best Practices

- Approve `tasks.md` carefully. The executor commits to it. If a task is wrong, you cancel and refactor.
- Do not run `/curdx-flow:implement` from CI. It expects an interactive Claude Code session.
- Keep verification commands fast. The loop runs them constantly; a slow verifier multiplies the wait.
- Treat halts as signals. The loop is designed to stop when it cannot make safe progress — investigate before resuming.
- Use `--commit-spec` (default) so the spec artifacts are committed alongside the code. Reviewers should be able to read both.
