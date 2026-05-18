# task-planner

Converts approved design into executable value-slice tasks.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `high` |
| Success | `TASKS_READY` |
| Failure | `TASKS_BLOCKED` |
| Primary output | `tasks.md` |

## Responsibilities

- Break work into ordered tasks with explicit file scope.
- Use `--task-granularity auto|coarse|standard|fine` when provided.
- Add verification commands and `[VERIFY]` gates where evidence is required.
- Keep tasks small enough for `spec-executor` to complete and verify.
- Mark dependencies and parallel eligibility only when file ownership is clear.

## Coordinator Use

`/curdx-flow:tasks` delegates to this agent after design is approved. The coordinator validates `tasks.md` before `/curdx-flow:implement` can start.
