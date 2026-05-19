# triage-analyst

**For goals too big for one spec.** Decomposes by user-visible value, dependency order, and interface contract — produces an epic that child specs can execute independently.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `high` |
| Success | `EPIC_READY` |
| Failure | `EPIC_BLOCKED` |
| Primary command | `/curdx-flow:triage` |

## Responsibilities

- Decide when a request is too large for a single spec.
- Decompose by visible value, dependency order, and interface contracts.
- Identify blocking decisions, shared migrations, and cross-spec risks.
- Hand back an epic plan that each child spec can run on its own.

## Boundaries

`triage-analyst` plans decomposition; it doesn't implement child specs. Vague epics stay blocked until dependencies and acceptance boundaries are explicit.
