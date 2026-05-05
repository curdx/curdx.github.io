# research-analyst

The research phase owner. Investigates the goal through web search, documentation lookup, and codebase exploration — and runs as a **parallel team**, not a single agent.

`research-analyst` is the first specialist invoked when you run `/curdx-flow:start` or `/curdx-flow:research`. Its core principle is **"verify-first, assume-never"** — never guess, always check.

## Trigger Conditions

| Trigger | Behavior |
| --- | --- |
| `/curdx-flow:start` | Runs once after the goal interview, before pausing for approval |
| `/curdx-flow:research` | Re-runs the research phase for the active spec |

The coordinator dispatches the team based on the goal's complexity and surface area. Quick mode runs the same dispatch but skips the human approval gate.

## Inputs

Each `research-analyst` instance receives via `Task` delegation:

| Field | Source | Purpose |
| --- | --- | --- |
| `basePath` | Coordinator | Spec directory path (e.g., `./specs/oauth-login`). Used for ALL file operations — never hardcoded. |
| `specName` | Coordinator | Spec name token. |
| Topic | Topic identification | The single research angle this teammate is responsible for. |
| Goal Interview Context | `.progress.md` | The full Q&A transcript from the start interview, plus chosen approach. |

## Parallel Dispatch

The research command is a **coordinator, not a researcher**. It MUST delegate ALL research work to subagents:

- `Explore` subagent for codebase analysis (read-only, runs on Haiku — fast, cheap)
- `research-analyst` subagent for web research (needs WebSearch + WebFetch tools)

### Topic Identification

Before invoking any subagents, the coordinator analyzes the goal and breaks it into independent research areas:

| Category | Agent Type | Examples |
|----------|-----------|----------|
| External / Best Practices | `research-analyst` | Industry standards, library docs, RFC patterns |
| Codebase Analysis | `Explore` | Existing implementations, conventions |
| Related Specs | `Explore` | Other specs in `./specs/` that may overlap |
| Domain-Specific (web) | `research-analyst` | Specialized topics needing focused web research |
| Domain-Specific (code) | `Explore` | Specialized topics needing codebase exploration |
| Quality Commands | `Explore` | Project lint/test/build commands discovery |
| Verification Tooling | `Explore` | Dev server, test runner, browser deps, E2E configs, ports |

**Minimum requirement: 2 topics** (1 `research-analyst` + 1 `Explore`). Zero exceptions.

### Scaling By Complexity

| Scenario | Agent Count |
|----------|-------------|
| Simple, focused goal | 2: 1 research-analyst (web) + 1 Explore (codebase) |
| Goal spans multiple domains | 3–5: 2–3 research-analyst (different topics) + 1–2 Explore |
| Goal involves external APIs + codebase | 2+ research-analyst (API docs/best practices) + 1+ Explore |
| Multiple components touched | One Explore per component + one research-analyst per external topic |
| Complex architecture question | 5+: 3–4 research-analyst (different topics) + 2–3 Explore (different code areas) |

### Dispatch Sequence

```text
1. TeamDelete()                              # release any stale team
2. TeamCreate(team_name: "research-$spec")   # new team
3. TaskCreate per topic                      # one native task per teammate
4. ALL Task(...) calls in ONE message        # true parallelism
5. Wait for teammate idle notifications
6. SendMessage(shutdown_request) per teammate
7. TeamDelete()
```

A real dispatch message looks like this (one Task per teammate, all in the same message):

```typescript
Task({
  subagent_type: "research-analyst",
  team_name: "research-oauth-login",
  name: "researcher-1",
  prompt: `You are a research teammate.
Topic: OAuth 2.0 best practices and refresh token strategies
Spec: oauth-login | Path: ./specs/oauth-login/
Output: ./specs/oauth-login/.research-oauth-patterns.md

Goal context: [from .progress.md interview]
Chosen approach: B - new auth module with refresh rotation

Instructions:
1. WebSearch for OAuth refresh-token rotation patterns 2024
2. Research RFC 6819 + OAuth WG drafts
3. Identify pitfalls (token reuse, race conditions)
4. Write findings to output file
Do NOT explore codebase — Explore teammates handle that.`,
});

Task({
  subagent_type: "Explore",
  team_name: "research-oauth-login",
  name: "explorer-1",
  prompt: `Analyze codebase for spec: oauth-login
Output: ./specs/oauth-login/.research-codebase.md
Find existing patterns, dependencies, constraints related to authentication.
Sections: Existing Patterns, Dependencies, Constraints, Recommendations.`,
});
```

The coordinator merges all `.research-*.md` partial files into the unified `research.md` after every teammate completes, then deletes the partials.

## Internal Workflow (Per Teammate)

Each `research-analyst` instance follows the verify-first methodology:

1. **Understand the request** — parse what's being asked, identify knowledge gaps.
2. **Research externally first** — `WebSearch` for current best practices, library docs, known issues.
3. **Research internally** — `Glob`, `Grep`, `Read` to find existing patterns, dependencies, constraints.
4. **Cross-reference** — verify findings across multiple sources, identify gaps and conflicts.
5. **Synthesize** — write `research.md` (or partial `.research-<topic>.md`) or surface clarifying questions.
6. **Append learnings** — record discoveries in `<basePath>/.progress.md` under `## Learnings`.
7. **Set `awaitingApproval: true`** — final action, signals coordinator to pause.

What gets appended to `## Learnings`:
- Unexpected technical constraints discovered.
- Useful patterns found in codebase.
- External best practices that differ from current implementation.
- Dependencies or limitations that affect future tasks.
- "Gotchas" future agents should know about.

## Output: `research.md`

The merged `research.md` follows this structure (each section sourced from one or more teammates):

```markdown
---
spec: oauth-login
phase: research
created: 2026-05-05T12:30:00Z
---

# Research: oauth-login

## Executive Summary
2–3 sentence synthesis. This is what every reviewer reads first.

## External Research

### Best Practices
- [Finding] — source: <URL>
- [Finding] — source: <URL>

### Prior Art
- [Similar solution] — <project name>, <URL>

### Pitfalls to Avoid
- [Common mistake from community]

## Codebase Analysis

### Existing Patterns
- [Pattern] — `src/auth/jwt.ts:42`

### Dependencies
- [Existing dep that can be leveraged]

### Constraints
- [Technical limitation discovered]

## Related Specs

| Spec | Relevance | Relationship | May Need Update |
| --- | --- | --- | --- |
| user-profile | High | Shares auth middleware | Yes |
| audit-log | Medium | Will log auth events | No |

## Quality Commands

| Type | Command | Source |
| --- | --- | --- |
| Lint | `pnpm run lint` | package.json scripts.lint |
| TypeCheck | `pnpm run check-types` | package.json scripts.check-types |
| Unit Test | `pnpm test:unit` | package.json scripts.test:unit |
| Integration Test | `pnpm test:integration` | package.json scripts.test:integration |
| Build | `pnpm run build` | package.json scripts.build |

**Local CI**: `pnpm run lint && pnpm run check-types && pnpm test && pnpm run build`

## Verification Tooling

| Tool | Command | Detected From |
| --- | --- | --- |
| Dev Server | `pnpm run dev` | package.json scripts.dev |
| Browser Automation | `playwright` | devDependencies |
| E2E Config | `playwright.config.ts` | project root |
| Port | `3000` | .env / package.json |
| Health Endpoint | `/api/health` | src/routes/ |

**Project Type**: Web App
**Verification Strategy**: Start dev server on port 3000, curl health endpoint, playwright for critical user flows.

## Feasibility Assessment

| Aspect | Assessment | Notes |
| --- | --- | --- |
| Technical Viability | High | All deps exist; no library constraints |
| Effort Estimate | M | ~1 week for 1 engineer |
| Risk Level | Medium | Token rotation race condition (R-2) |

## Recommendations for Requirements

1. Use refresh token rotation with SELECT FOR UPDATE locking.
2. Encrypt refresh tokens at rest using existing KMS pattern.
3. Add NFR for 99th-percentile auth latency under 200ms.

## Open Questions
- Should refresh tokens be tenant-scoped or user-scoped?

## Sources
- https://datatracker.ietf.org/doc/html/rfc6819
- https://oauth.net/2/refresh-tokens/
- src/auth/jwt.ts
- src/middleware/auth.ts
```

## Quality Checklist

Before completing, every teammate verifies:

- [ ] Searched web for current information
- [ ] Read relevant internal code/docs
- [ ] Cross-referenced multiple sources
- [ ] Cited all sources used (URLs and file paths)
- [ ] Identified uncertainties — listed in Open Questions
- [ ] Provided actionable recommendations
- [ ] Set `awaitingApproval: true` in `.curdx-state.json`

## Why Parallel

A single research agent serializes investigation. A parallel team:

- **Completes faster** on goals with multiple distinct unknowns.
- **Keeps each teammate focused** on one angle (no context bloat).
- **Surfaces conflicts early** — when two investigators disagree, the merge step makes the disagreement explicit.

The minimum 2-agent dispatch is non-negotiable: every spec needs at least one external investigation and one codebase survey.

## Anti-Patterns

| Don't | Why |
| --- | --- |
| Guess | Research is the entire point. If you don't know, search or ask. |
| Skip web search | External info may be more current than training data. |
| Skip internal docs | Project may have specific patterns that override external best practices. |
| Provide unsourced claims | Every finding needs a source URL or file:line reference. |
| Hide uncertainty | Be explicit about confidence level. Open Questions are first-class output. |
| Combine multiple external topics into one teammate | Each teammate handles ONE external topic. Splitting is the parallelism. |
| Coordinator does the work itself | Coordinator only dispatches and merges. Never reads docs or grep itself. |

## Reading The Output

`research.md` is the cheapest place in the workflow to redirect. When you review it:

- **Risks that contradict your goal** — if research surfaces a constraint that makes the goal impractical, redirect now, not after `tasks.md`.
- **Vague references** — specific URLs and section anchors are good; "various blog posts" is not.
- **Missing angles** — if the team did not investigate something you know matters, run `/curdx-flow:research` again with that angle named in the goal.
- **Quality Commands table** — verify these match what your project actually runs. Wrong commands here propagate into wrong `[VERIFY]` gates downstream.
- **Verification Tooling section** — the dev server / port / health endpoint extracted here drive every VE task in the implement phase. If your project does not run on port 3000, fix it now.

## Best Practices

- Be specific in the goal. "Add OAuth" is one angle. "Add OAuth with refresh tokens, scoped per-tenant" is three.
- Read the executive summary first. If it does not match what you asked for, the research is misaligned and the rest of the spec will inherit that drift.
- Treat the risk list as a TODO. Every unaddressed risk in `research.md` should be addressed by the time `design.md` is approved.
- The `Quality Commands` and `Verification Tooling` tables are not optional decoration — they are the contract that the `task-planner` builds `[VERIFY]` and `VE` tasks from. Verify them carefully.
