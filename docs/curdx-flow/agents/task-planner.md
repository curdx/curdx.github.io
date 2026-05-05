# task-planner

The tasks phase owner. Breaks an approved design into a sequenced, checkable task list with `[VERIFY]` gates between work units.

## What It Does

`task-planner` is invoked when you run `/curdx-flow:tasks` after `design.md` is approved. It produces `tasks.md` — the contract the `spec-executor` will execute autonomously, one task at a time, until every box is checked.

It supports two granularity modes via the `--tasks-size` flag: `fine` (default, small commit-sized tasks) and `coarse` (larger, faster-to-write but harder-to-verify chunks).

## When It Runs

| Trigger | Behavior |
| --- | --- |
| `/curdx-flow:tasks` | Generates `tasks.md` from `design.md` |
| `/curdx-flow:tasks --tasks-size coarse` | Generates fewer, larger tasks for prototyping speed |

## Output: `tasks.md`

A typical `tasks.md` is grouped into phases, with verification gates interleaved:

```markdown
## Phase 1: Schema and storage

- [ ] 1.1 Add OAuth provider config schema
- [ ] 1.2 [VERIFY] Schema typechecks and validates sample input
- [ ] 1.3 Implement token storage with rotation lock
- [ ] 1.4 [VERIFY] Storage unit tests pass

## Phase 2: Token exchange

- [ ] 2.1 Implement authorization code exchange handler
- [ ] 2.2 Implement refresh token rotation handler
- [ ] 2.3 [VERIFY] Auth integration tests pass

## Phase 3: Middleware

- [ ] 3.1 Wire OAuth into existing auth middleware chain
- [ ] 3.2 [VERIFY] End-to-end smoke test passes
- [ ] 3.3 [VERIFY] Typecheck and lint clean across the repo
```

Each task has:

- A unique number (`1.1`, `1.2`, `2.1`, …)
- A short, action-oriented description
- A reference to the relevant `design.md` section (often implicit but always derivable)
- A scoped file list (the executor will not edit outside it)

## Why `[VERIFY]` Tasks

A `[VERIFY]` task is not implementation work — it is a verification command the executor must run. If the command fails, the task fails, and the loop's retry budget kicks in.

This separation matters:

- Implementation tasks describe what to write.
- `[VERIFY]` tasks describe how to know it is correct.

A spec without verification gates is a wish list. A spec with them is testable.

## Granularity: `fine` vs `coarse`

### Fine (default)

```markdown
- [ ] 1.1 Add OAuth provider config schema
- [ ] 1.2 [VERIFY] Schema typechecks
- [ ] 1.3 Implement token exchange handler
- [ ] 1.4 [VERIFY] Unit tests pass
- [ ] 1.5 Implement refresh handler
- [ ] 1.6 [VERIFY] Refresh integration tests pass
```

Best for production work where each task should commit independently and the diff stays reviewable.

### Coarse

```markdown
- [ ] 1 Implement OAuth provider scaffolding (config schema + token exchange + refresh)
- [ ] 2 [VERIFY] Provider scaffolding boots and accepts a sample request
```

Best for spikes and prototypes where commit granularity is not the goal.

| Mode | Avg tasks per spec | Avg commits | Use for |
| --- | --- | --- | --- |
| `fine` | 8–20 | 1 per task | Production work |
| `coarse` | 3–6 | 1 per task | Spikes, prototypes |

## Reading The Output

When you review `tasks.md`:

- **Every implementation task should be followed by a verification task.** A task without a downstream gate is not provable.
- **Tasks should be ordered to minimize broken intermediate states.** If task 1.3 depends on task 1.1, they should be in that order with verification between them.
- **Phase boundaries should be meaningful.** A phase break is a natural place to pause if you want to inspect the diff before letting the loop continue.
- **The total count should feel right.** A 30-task spec is usually two specs in disguise — consider `/curdx-flow:triage`.

## Practical Examples

### Greenfield feature, fine mode

```text
/curdx-flow:tasks
```

Expect 10–20 tasks across 3–5 phases, with 1 verify per 1–2 implementation tasks.

### Refactor, fine mode

```text
/curdx-flow:tasks
```

Expect more verify tasks proportionally — refactors must prove behavior is preserved at each step.

### Spike, coarse mode

```text
/curdx-flow:tasks --tasks-size coarse
```

Expect 3–5 tasks total with one or two final verifies.

## Best Practices

- Read `tasks.md` carefully before `/curdx-flow:implement`. Once the loop starts, fixing a wrong task means cancelling and refactoring.
- Push back if you see implementation work without verification. Ask the planner to add a `[VERIFY]` gate.
- Use `coarse` only when you accept that revert granularity will be coarse too. A bad coarse task means rolling back a big diff.
- For long specs, consider triaging into smaller specs rather than producing a 30-task `tasks.md`.
- Verify commands should be ones your project actually runs. `npm test` is fine if it works locally; references to commands the executor cannot run will halt the loop.
