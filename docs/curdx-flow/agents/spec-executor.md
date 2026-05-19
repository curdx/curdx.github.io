# spec-executor

**Implements one bounded task — and only one.** Lives in its own worktree so it can't widen scope by accident.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `high` |
| Success | `TASK_COMPLETE` |
| Failure | `TASK_FAILED`, `TASK_MODIFICATION_REQUEST` |
| Isolation | `worktree` |

## Responsibilities

- Read only the task, relevant spec context, and assigned files.
- Make the requested code change without widening scope.
- Run the task's verify command and surface exit code + changed files.
- Request task modification when a task is unsafe, underspecified, or needs splitting.

## Boundaries

`spec-executor` does not own `[VERIFY]` gates — those belong to `qa-engineer`. It also doesn't edit specs by itself; that goes through `/curdx-flow:refactor`.
