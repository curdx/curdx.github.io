# cxb-plan

Collaborative planning with inspiration brainstorming and scored review.

## What It Does

`cxb-plan` produces an implementation plan that is good enough to execute, not just good enough to discuss. It keeps one designer accountable, uses a separate inspiration source for option generation, and runs a scored review gate before the plan is considered approved.

Default role mapping:

- **Designer**: Claude
- **Inspiration**: Gemini
- **Reviewer**: Codex

## Workflow

### Phase 1: Requirement Clarification

The designer uses a five-dimension readiness model before writing the actual plan.

| Dimension | Weight | What it answers |
|-----------|--------|-----------------|
| Problem Clarity | 30 pts | What problem are we solving and why now? |
| Functional Scope | 25 pts | What exactly is in scope? |
| Success Criteria | 20 pts | How will we verify completion? |
| Constraints | 15 pts | What limits the solution space? |
| Priority / MVP | 10 pts | What is the smallest acceptable slice? |

If readiness stays below the threshold, Claude keeps asking questions unless you explicitly say to proceed anyway.

### Phase 2: Inspiration Brainstorming

Claude asks the inspiration provider for alternatives, tradeoffs, or patterns worth considering.

Each idea is classified as:

- **Adopt**
- **Adapt**
- **Discard**

This classification step matters because Gemini is there to expand option space, not to become the final authority.

### Phase 3: Plan Creation

The plan normally includes:

- problem statement
- proposed approach and rationale
- implementation steps
- dependencies and sequencing
- risk and mitigation table
- acceptance criteria

### Phase 4: Scored Review

The reviewer evaluates the plan with Rubric A.

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Clarity | 20% | Another developer can execute it without guessing |
| Completeness | 25% | Requirements and edge cases are covered |
| Feasibility | 25% | It matches the real codebase and tooling |
| Risk Assessment | 15% | Risks are concrete and mitigated |
| Requirement Alignment | 15% | It maps to the stated request |

Pass rule:

- weighted score `>= 7.0`
- no dimension `<= 3`

If it fails, Claude revises and resubmits, up to the configured retry limit.

### Phase 5: Output

The approved plan is written to something like:

```text
plans/add-bulk-export-plan.md
```

A good plan output preserves:

- the final approved approach
- reviewer scores
- unresolved risks
- inspiration credits or discarded options

## Real-World Example

Prompt:

```text
Plan a safe migration from ad hoc webhook retries to a persisted retry queue.
```

Strong output characteristics:

- compares in-memory vs persisted queue designs
- calls out replay and deduplication risks
- defines rollout and rollback steps
- includes observability and testing requirements
- receives a passing score before implementation starts

## Best Practices

- Ask for explicit acceptance criteria in the planning phase.
- Require rollback thinking for migrations, auth, billing, and schema work.
- Treat inspiration as a source of options, not approval.
- If Codex flags feasibility issues, fix them before writing code.

## Good Requests To Trigger `cxb-plan`

- "Design a rollout plan for moving uploads to signed URLs."
- "Plan this refactor and have Codex score it before implementation."
- "Give me a reviewed MVP plan with clear acceptance criteria."
