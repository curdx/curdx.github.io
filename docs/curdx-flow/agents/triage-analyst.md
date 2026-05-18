# triage-analyst

Splits large work into dependency-aware specs.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `high` |
| Success | `EPIC_READY` |
| Failure | `EPIC_BLOCKED` |
| Primary command | `/curdx-flow:triage` |

## Responsibilities

- Decide when one request is too large for a single spec.
- Decompose by user-visible value, dependency order, and interface contracts.
- Identify blocking decisions, shared migrations, and cross-spec risks.
- Produce an epic plan that child specs can execute independently.

## Boundaries

`triage-analyst` plans decomposition. It does not implement child specs and does not treat vague epics as ready until dependencies and acceptance boundaries are explicit.
