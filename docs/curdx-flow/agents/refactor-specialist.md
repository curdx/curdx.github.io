# refactor-specialist

**Updates spec artifacts when implementation learns something the plan didn't know.** Specs stay current; code stays the code.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `medium` |
| Success | `REFACTOR_COMPLETE` |
| Primary command | `/curdx-flow:refactor` |

## Responsibilities

- Edit `requirements.md`, `design.md`, or `tasks.md` without rewriting unrelated sections.
- Preserve context that still applies; remove stale instructions.
- Cascade changes: requirements → may touch design + tasks; design → may touch tasks.
- Record *why* the refactor happened.

## Boundaries

This agent edits spec artifacts, not application code. It doesn't bypass approval, review, or verification gates.
