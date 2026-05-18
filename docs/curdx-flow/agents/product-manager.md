# product-manager

Turns research and the user goal into testable requirements.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `medium` |
| Success | `REQUIREMENTS_COMPLETE` |
| Failure | `REQUIREMENTS_BLOCKED` |
| Primary output | `requirements.md` |

## Responsibilities

- Write concise user stories and acceptance criteria.
- Preserve explicit non-goals and scope boundaries.
- Convert ambiguity into questions or assumptions that can be reviewed.
- Keep requirements testable enough for `task-planner` and `qa-engineer`.
- Avoid implementation design; that belongs to `architect-reviewer`.

## Coordinator Use

`/curdx-flow:requirements` delegates to this agent after research or goal context exists. The coordinator verifies artifact existence and review status before moving to design.
