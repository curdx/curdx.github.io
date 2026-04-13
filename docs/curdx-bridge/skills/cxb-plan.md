# cxb-plan

Collaborative planning with inspiration brainstorming and scored review.

## Overview

`cxb-plan` runs a structured planning workflow that uses multiple AI providers:

- **Designer** (Claude) — Owns the plan from start to finish
- **Inspiration** (Gemini) — Brainstorms creative alternatives for reference
- **Reviewer** (Codex) — Scores the plan using Rubric A

The result is a reviewed, scored implementation plan saved to your project.

## Workflow

### Phase 1: Requirement Clarification

The designer uses a **5-Dimension Planning Readiness Model** to ensure requirements are clear before planning:

| Dimension | Weight | What it covers |
|-----------|--------|---------------|
| Problem Clarity | 30pts | What problem are we solving? Why? |
| Functional Scope | 25pts | What does it do? Key features? |
| Success Criteria | 20pts | How do we verify it's done? |
| Constraints | 15pts | Time, resources, compatibility limits? |
| Priority / MVP | 10pts | What's the phased delivery approach? |

Questions are asked until readiness reaches ≥ 80 points, or you say "proceed anyway".

### Phase 2: Inspiration Brainstorming

The designer consults the **inspiration** provider (Gemini) for creative ideas. Each suggestion is classified:

- **Adopt** — Use as-is
- **Adapt** — Modify and incorporate
- **Discard** — Not applicable

::: warning
The inspiration provider is often unreliable. Its suggestions are treated as reference material, never followed blindly.
:::

### Phase 3: Plan Creation

The designer drafts a complete plan covering:

- Architecture approach and rationale
- Key components
- Implementation steps with actions, deliverables, and dependencies
- Technical considerations
- Risk/mitigation table
- Acceptance criteria

### Phase 4: Scored Review

The plan is submitted to the **reviewer** (Codex) for evaluation against **Rubric A**:

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Clarity | 20% | Steps are unambiguous; another developer can follow without questions |
| Completeness | 25% | All requirements, edge cases, and deliverables covered |
| Feasibility | 25% | Steps are achievable with the current codebase |
| Risk Assessment | 15% | Risks identified with concrete mitigations |
| Requirement Alignment | 15% | Every step traces to stated requirements |

**Pass**: Overall ≥ 7.0 AND no dimension ≤ 3

If the review fails, the designer fixes the issues and resubmits (max 3 rounds). After 3 failures, results are escalated to you.

### Phase 5: Output

The approved plan is saved to `plans/{feature-name}-plan.md` with all sections including review scores and inspiration credits.
