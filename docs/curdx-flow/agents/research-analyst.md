# research-analyst

Discovers facts before requirements are written. Use it for codebase patterns, current documentation, feasibility, constraints, and risks.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `high` |
| Success | `RESEARCH_COMPLETE` |
| Failure | `RESEARCH_BLOCKED` |
| Primary output | `research.md` |

## Responsibilities

- Verify facts instead of guessing.
- Inspect repository structure and existing implementation patterns.
- Pull in current official docs when technology behavior may have changed.
- Surface risks, constraints, unknowns, and recommended next investigations.
- Keep findings actionable for `product-manager`, not as a generic research essay.

## Coordinator Use

`/curdx-flow:research` and `/curdx-flow:start` delegate research work to this agent. The coordinator verifies that `research.md` exists and that claimed sources or commands are real before advancing.
