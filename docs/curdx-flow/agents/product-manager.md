# product-manager

**Kills the "scope drifts mid-sprint" failure mode.** Turns the goal and research into testable requirements with explicit non-goals.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `medium` |
| Success | `REQUIREMENTS_COMPLETE` |
| Failure | `REQUIREMENTS_BLOCKED` |
| Primary output | `requirements.md` |

## Responsibilities

- Write concise user stories and acceptance criteria.
- Preserve non-goals and scope boundaries explicitly.
- Convert ambiguity into reviewable questions or assumptions.
- Keep requirements testable enough for `task-planner` and `qa-engineer`.

## Boundaries

This agent does not design implementation — that's `architect-reviewer`. `/curdx-flow:requirements` delegates here once research or goal context is in place.
