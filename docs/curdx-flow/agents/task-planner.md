# task-planner

**Kills the "one giant prompt, one chaotic run" failure mode.** Slices design into bounded tasks, each with a verify command.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `high` |
| Success | `TASKS_READY` |
| Failure | `TASKS_BLOCKED` |
| Primary output | `tasks.md` |

## Responsibilities

- Break work into ordered tasks with explicit file scope.
- Honor `--task-granularity auto|coarse|standard|fine` when provided.
- Attach verify commands and `[VERIFY]` gates wherever evidence is required.
- Keep tasks small enough for `spec-executor` to complete and verify.
- Mark dependencies and parallel eligibility only when file ownership is unambiguous.

## Boundaries

`/curdx-flow:tasks` delegates here after design is approved. The coordinator validates `tasks.md` before `/curdx-flow:implement` can start.
