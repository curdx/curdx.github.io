# spec-executor

Implements one bounded task from `tasks.md`.

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
- Run the task's verify command.
- Report changed files, commit evidence when applicable, and verify exit code.
- Request task modification when the task is unsafe, underspecified, or needs splitting.

## Boundaries

`spec-executor` does not own `[VERIFY]` tasks; those go to `qa-engineer`. It also does not rewrite the spec by itself; changes to requirements, design, or tasks go through `/curdx-flow:refactor`.
