# product-manager

The requirements phase owner. Translates the goal plus research output into structured, testable requirements.

## What It Does

`product-manager` is invoked when you run `/curdx-flow:requirements` after `research.md` is approved. It produces `requirements.md` — a structured document with user stories, functional requirements, non-functional requirements, and acceptance criteria.

It does **not** invent product features. Its job is to take what research surfaced and structure it into something `design.md` can be built against.

## When It Runs

| Trigger | Behavior |
| --- | --- |
| `/curdx-flow:requirements` | Generates `requirements.md` from goal + `research.md` |

## Output: `requirements.md`

A typical `requirements.md` contains four sections, each with stable identifiers:

### User stories (`US-1`, `US-2`, …)

```markdown
**US-1**: As an authenticated user, I can log in with OAuth so I do not have to manage a password.
```

User stories anchor every requirement to a person and a goal. If a requirement does not trace back to a user story, it probably should not exist.

### Functional requirements (`FR-1`, `FR-2`, …)

```markdown
**FR-3**: The system must support refresh tokens with at least 30-day validity.
**FR-4**: Token rotation must be enforced on each refresh.
```

Functional requirements describe behavior. They are testable.

### Non-functional requirements (`NFR-1`, `NFR-2`, …)

```markdown
**NFR-1**: 99th-percentile auth latency must be under 200 ms under expected load.
**NFR-2**: Refresh tokens must be stored encrypted at rest.
```

NFRs cover performance, security, durability, accessibility, and other cross-cutting properties.

### Acceptance criteria (`AC-1`, `AC-2`, …)

```markdown
**AC-1**: Given a valid refresh token, when the user calls /auth/refresh, then a new access token is issued and the refresh token is rotated.
```

Acceptance criteria are the contract for "done". The `task-planner` will turn these into `[VERIFY]` gates downstream.

## Why Stable IDs Matter

Every requirement has a stable ID (`US-3`, `FR-7`, `AC-4`). Downstream artifacts reference them:

- `design.md` cites which requirements each component satisfies
- `tasks.md` cites which acceptance criteria each `[VERIFY]` task tests
- Code review can trace any change back to its requirement

If a requirement is dropped or renumbered, the chain breaks. The `refactor-specialist` is the only safe way to revise these IDs after `tasks.md` exists.

## Practical Examples

### Goal with clear users

```text
> Add an admin dashboard for moderating flagged comments.
```

The product-manager will identify at least two user roles (admin, moderator), several user stories per role, functional requirements for the moderation actions, and NFRs around audit logging.

### Goal that is internal infrastructure

```text
> Replace the legacy job queue with the new event bus.
```

User stories may be developer-facing ("As a service author, I can publish an event without knowing the transport"). Internal users still get user stories.

### Goal that is a refactor

```text
> Refactor the cache layer for testability.
```

Most requirements will be NFRs (testability, isolation) and ACs that lock in current behavior so the refactor is provably equivalent.

## Reading The Output

When you review `requirements.md`:

- **Each US should map to a real person.** Vague users like "the system" are a smell.
- **Each FR should be testable.** "Should be performant" is not a requirement; "p99 < 200ms under 1000 RPS" is.
- **NFRs should cover the cross-cutting concerns research surfaced.** If research flagged a security risk and no NFR addresses it, push back.
- **Acceptance criteria should be explicit.** "Works correctly" is not an AC.

## Best Practices

- Read every AC before approving. Each one becomes a `[VERIFY]` gate that the autonomous loop will run.
- Push back early. Adding a forgotten requirement at this phase is a one-line edit. Adding it after `implement` is days of rework.
- Keep IDs stable. If you reorder, downstream traces break.
- For refactors, capture current behavior as ACs first. The refactor must satisfy them before any new behavior is added.
