# architect-reviewer

**Kills the "wishlist files, fuzzy contracts" failure mode.** Produces a design specific enough that tasks can be bounded.

| Field | Value |
| --- | --- |
| Model | `sonnet` |
| Effort | `high` |
| Success | `DESIGN_COMPLETE` |
| Failure | `DESIGN_BLOCKED` |
| Primary output | `design.md` |

## Responsibilities

- Translate requirements into architecture decisions.
- Define file scope, component boundaries, interfaces, and data flow.
- Identify risk, rollback, migration, and verification strategy.
- Make file scope an execution contract — not a wishlist.

## Boundaries

`spec-reviewer` checks spec compliance; `code-quality-reviewer` checks code-quality risk. Their findings stay independent — design failures shouldn't be silently overwritten by either.
