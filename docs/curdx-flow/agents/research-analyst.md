# research-analyst

**Kills the "coded before we checked" failure mode.** Surfaces facts, risks, and constraints before a single line of code is planned.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `high` |
| Success | `RESEARCH_COMPLETE` |
| Failure | `RESEARCH_BLOCKED` |
| Primary output | `research.md` |

## Responsibilities

- Verify facts instead of guessing — inspect repo structure, existing patterns, current official docs.
- Surface risks, constraints, unknowns, and concrete next investigations.
- Pull current documentation when library or framework behavior may have changed.
- Stay actionable for `product-manager` — not a generic research essay.

## Boundaries

`/curdx-flow:research` and `/curdx-flow:start` delegate here. The coordinator verifies `research.md` exists and that claimed sources or commands are real before advancing.
