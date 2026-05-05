# research-analyst

The research phase owner. Investigates the goal through web search, documentation lookup, and codebase exploration — and runs as a **parallel team**, not a single agent.

## What It Does

`research-analyst` is the first specialist invoked when you run `/curdx-flow:start` or `/curdx-flow:research`. Its job is to turn an under-specified goal into a researched briefing that subsequent phases can rely on.

Concretely, the research phase:

1. Decomposes the goal into 2–4 investigation angles (one per teammate).
2. Dispatches that many `research-analyst` instances in parallel.
3. Each instance searches docs, web, and the codebase for its assigned angle.
4. The coordinator merges results into `research.md`.

## When It Runs

| Trigger | Behavior |
| --- | --- |
| `/curdx-flow:start` | Runs once after the goal interview, before pausing for approval |
| `/curdx-flow:research` | Re-runs the research phase for the active spec |

## Output: `research.md`

A typical `research.md` contains:

- **Executive summary** (1–3 sentences a senior reviewer can read in 10 seconds)
- **Findings** organized by investigation angle
- **References** with source URLs and doc anchors
- **Risks** identified during investigation, each with a brief mitigation hint
- **Feasibility / risk / effort** ratings for the overall direction
- **Recommendations** for the next phase

## Why Parallel

A single research agent serializes investigation. A parallel team:

- Completes faster on goals with multiple distinct unknowns
- Keeps each teammate focused on one angle (no context bloat)
- Surfaces conflicts early — when two investigators disagree, the merge step makes the disagreement explicit

## Practical Examples

### Goal with multiple unknowns

```text
> Add OAuth login with token refresh.
```

Likely teammates:

1. OAuth flow specifics (provider docs)
2. Token refresh strategies and security trade-offs
3. Codebase survey for existing auth patterns

### Goal that is mostly codebase work

```text
> Refactor cache helper to use the new TTL config.
```

Likely teammates:

1. Cache helper current state + callers
2. New TTL config schema and existing usages

### Goal that is mostly external research

```text
> Add support for the new Anthropic message batching API.
```

Likely teammates:

1. Anthropic batching API docs and limits
2. Comparable batching patterns in adjacent SDKs

## Reading The Output

`research.md` is the cheapest place to redirect the spec. Look for:

- **Risks that contradict your goal.** If the research surfaces a constraint that makes the goal impractical, redirect now — not after `tasks.md`.
- **Vague references.** Specific URLs and section anchors are good; "various blog posts" is not.
- **Missing angles.** If the team did not investigate something you know matters, ask for `/curdx-flow:research` again with that angle named.

## Best Practices

- Be specific in the goal. "Add OAuth" is one angle. "Add OAuth with refresh tokens, scoped per-tenant" is three.
- Read the executive summary first. If it does not match what you asked for, the research is misaligned and the rest of the spec will inherit that drift.
- Treat the risk list as a TODO. Every unaddressed risk in `research.md` should be addressed by the time `design.md` is approved.
