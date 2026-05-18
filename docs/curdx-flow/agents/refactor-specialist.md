# refactor-specialist

Updates spec artifacts after implementation learning.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `medium` |
| Success | `REFACTOR_COMPLETE` |
| Primary command | `/curdx-flow:refactor` |

## Responsibilities

- Update `requirements.md`, `design.md`, or `tasks.md` without rewriting unrelated sections.
- Preserve useful context and remove stale instructions.
- Detect cascade needs: requirements changes may affect design and tasks; design changes may affect tasks.
- Record why the refactor happened.

## Boundaries

This agent edits spec artifacts, not application code. It does not bypass approval, review, or verification gates.
