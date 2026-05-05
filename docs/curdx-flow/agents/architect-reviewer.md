# architect-reviewer

The design phase owner. Turns approved requirements into a concrete technical design — components, decisions, risks, and a file-level change manifest.

## What It Does

`architect-reviewer` is invoked when you run `/curdx-flow:design` after `requirements.md` is approved. It produces `design.md` — the document the `task-planner` will break into a checked task list, and the document the `spec-executor` will reference for every task it implements.

It is the single most important pause point in the workflow. Once `design.md` is approved, the rest of the pipeline downstream commits to it.

## When It Runs

| Trigger | Behavior |
| --- | --- |
| `/curdx-flow:design` | Generates `design.md` from `requirements.md` (and `research.md` for context) |

## Output: `design.md`

A typical `design.md` contains:

### Components

A list of the code units (modules, services, files, classes) the spec will introduce or modify. Each component has a brief description of its responsibility.

### Data flow

How requests, events, or data move through the components — usually with a diagram or a numbered sequence.

### API / contract

The interfaces the components expose. Parameters, return types, error conditions.

### Decisions (`D-1`, `D-2`, …)

Numbered design decisions with rationale.

```markdown
**D-3**: Token storage uses Postgres `citext` for case-insensitive lookups.
Rationale: Existing codebase uses `citext` for similar fields. Avoids introducing a new collation policy.
Alternatives considered: lowercase-on-write (rejected — requires a migration), `lower()` on every query (rejected — defeats indexing).
```

### Risks (`R-1`, `R-2`, …)

Numbered risks with mitigation plans.

```markdown
**R-2**: Refresh token rotation introduces a race between near-simultaneous refresh requests.
Mitigation: Use SELECT FOR UPDATE on the token row during rotation; document the lock contention bound.
```

### File-change manifest

A list of files that will be created, modified, or deleted. This is what the `task-planner` uses to scope each task.

## Why The Manifest Matters

The file-change manifest is not a wishlist — it is a contract. The `spec-executor` will reference it for every task to know which files are in scope. If a file is missing from the manifest, the executor will not edit it without being told to revise the design.

This is what keeps the autonomous loop disciplined: it cannot drift into rewriting unrelated code, because the manifest tells it what is and is not in scope.

## Practical Examples

### Greenfield component

```text
Components:
- src/auth/oauth-provider.ts (new) — adapter pattern over Google/Microsoft providers
- src/auth/token-store.ts (new) — refresh token persistence
- src/auth/middleware.ts (modify) — wire OAuth into existing auth chain
```

### Refactor

```text
Components:
- src/cache/index.ts (modify) — extract TTL strategy interface
- src/cache/strategies/static-ttl.ts (new)
- src/cache/strategies/dynamic-ttl.ts (new)
- src/cache/legacy-ttl.ts (delete after migration)
```

### Cross-cutting feature

```text
Components:
- packages/shared/observability/index.ts (new) — instrumentation primitives
- packages/api/src/middleware/observability.ts (modify)
- packages/worker/src/observability.ts (modify)
```

## Reading The Output

When you review `design.md`:

- **Decisions should have rationale.** A decision without a "why" is just a guess.
- **Risks should have mitigations.** "Possible race condition" with no plan is a known unknown bomb.
- **The manifest should be specific.** Glob patterns or "various files" mean the executor will not have a clear scope.
- **Decisions should reference requirements.** A decision that does not satisfy any FR/NFR is suspicious — either the decision is unnecessary or the requirement is missing.

## Best Practices

- Push back hard on vague designs. The architect-reviewer is the last cheap pause point — once `tasks.md` exists, revising the design is a `/curdx-flow:refactor` walk through three artifacts.
- Read the risks list against your own knowledge. The architect cannot know everything you know about your codebase. If you can name a risk that is not in the list, add it.
- Check the manifest matches your mental model. If you are surprised by a file in the list (or its absence), that is the moment to redirect.
- For complex changes, ask for an explicit data-flow diagram. A bullet list is fine for small changes; ASCII or SVG diagrams pay off for anything cross-component.
