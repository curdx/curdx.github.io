# product-manager

The requirements phase owner. Translates the user's goal plus research findings into structured, testable requirements with stable identifiers.

`product-manager` is invoked when you run `/curdx-flow:requirements` after `research.md` is approved. It runs once, produces `requirements.md`, sets `awaitingApproval: true`, and exits.

## Trigger Conditions

| Trigger | Behavior |
| --- | --- |
| `/curdx-flow:requirements` | Generates `requirements.md` from goal + `research.md` |

The agent does **not** invent product features. Its job is to take what research surfaced and structure it into a contract that `design.md` can be built against.

## Inputs

| Field | Source | Purpose |
| --- | --- | --- |
| `basePath` | Coordinator | Spec directory (e.g., `./specs/oauth-login`) |
| `specName` | Coordinator | Spec name token |
| `research.md` | Prior phase | Findings, constraints, recommendations |
| `.progress.md` | Goal interview | Original goal + interview Q&A |

## Use Of `Explore` For Codebase Analysis

The agent prefers spawning the `Explore` subagent (read-only, runs on Haiku) over manual `Glob` / `Grep` for any codebase analysis. Common uses:

- Finding existing patterns for similar features.
- Discovering code conventions the requirements should respect.
- Searching for user-facing terminology already used in the codebase.

A typical Explore invocation:

```text
Task tool with subagent_type: Explore
thoroughness: medium

Prompt:
"Search codebase for existing user story implementations and patterns.
Look for how acceptance criteria are typically verified in tests.
Output: list of patterns with file paths."
```

This keeps results out of the main context window and runs 3–5× faster than sequential Glob/Grep.

## Internal Workflow

1. Read `research.md` and `.progress.md` thoroughly.
2. Identify users, behaviors, and quality attributes.
3. Spawn `Explore` agents for codebase pattern analysis (in parallel if multiple angles).
4. Draft user stories that anchor every requirement to a person and a goal.
5. Write functional requirements (testable behavior) and non-functional requirements (cross-cutting properties).
6. Define acceptance criteria — the contract for "done" that the `task-planner` will turn into `[VERIFY]` gates.
7. Append discoveries to `<basePath>/.progress.md` under `## Learnings`.
8. Set `awaitingApproval: true` in `.curdx-state.json`.

## Output: `requirements.md`

The full structure:

```markdown
# Requirements: <Feature Name>

## Goal
1–2 sentence description of what this feature accomplishes and why it matters.

## User Stories

### US-1: [Story Title]
**As a** [user type]
**I want to** [action/capability]
**So that** [benefit/value]

**Acceptance Criteria:**
- [ ] AC-1.1: [Specific, testable criterion]
- [ ] AC-1.2: [Specific, testable criterion]

### US-2: [Story Title]
...

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-1 | [description] | High/Medium/Low | [how to verify] |
| FR-2 | [description] | High/Medium/Low | [how to verify] |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | Performance | p99 latency | <200ms under 1000 RPS |
| NFR-2 | Security | OWASP ASVS | Level 2 |

## Glossary
- **Term**: Definition relevant to this feature

## Out of Scope
- [Item explicitly not included]

## Dependencies
- [External dependency or prerequisite]

## Success Criteria
- [Measurable outcome that defines success]

## Unresolved Questions
- [Ambiguity needing clarification]

## Next Steps
1. Review requirements with stakeholders
2. Run `/curdx-flow:design` to generate technical design
```

## Stable IDs Are A Contract

Every requirement has a stable ID:

- `US-N` — user story
- `AC-N.M` — acceptance criterion (nested under user story)
- `FR-N` — functional requirement
- `NFR-N` — non-functional requirement

Downstream artifacts reference them:

- `design.md` cites which requirements each component satisfies via `_Requirements: FR-1, AC-1.1_`
- `tasks.md` cites which acceptance criteria each `[VERIFY]` task tests
- The final `V6 [VERIFY] AC checklist` task reads `requirements.md` and programmatically verifies each `AC-*` is satisfied

If a requirement is dropped or renumbered, the chain breaks. After `tasks.md` exists, the only safe way to revise these IDs is `/curdx-flow:refactor`, which delegates to `refactor-specialist` for a coordinated walk through requirements → design → tasks.

## Real Sample Fragment

A real `requirements.md` fragment for an OAuth login feature:

```markdown
## User Stories

### US-1: First-time OAuth Login
**As a** new user
**I want to** sign in with my Google or Microsoft account
**So that** I do not have to manage another password

**Acceptance Criteria:**
- [ ] AC-1.1: User can complete OAuth authorization code flow with Google in <5 seconds
- [ ] AC-1.2: First successful login auto-creates a user account with profile data from provider
- [ ] AC-1.3: Provider account is linked to the user record (one user, multiple providers)

### US-2: Session Continuity Without Re-Auth
**As an** authenticated user
**I want to** stay signed in across browser sessions
**So that** I do not re-enter credentials every visit

**Acceptance Criteria:**
- [ ] AC-2.1: Refresh token issued at login is valid for 30 days
- [ ] AC-2.2: Access token can be silently refreshed without user interaction
- [ ] AC-2.3: Refresh token rotates on every refresh; old token rejected on second use

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-1 | Support Google + Microsoft OAuth providers via authorization code flow with PKCE | High | AC-1.1 |
| FR-2 | Issue access token (15min) + refresh token (30d) on successful auth | High | AC-2.1 |
| FR-3 | Rotate refresh token on every refresh; reject reused tokens | High | AC-2.3 |
| FR-4 | Auto-create user record on first OAuth login | High | AC-1.2 |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | Auth latency | p99 (auth code exchange) | <200ms |
| NFR-2 | Refresh token storage | Encryption | At-rest via KMS |
| NFR-3 | Token rotation | Concurrent refresh safety | SELECT FOR UPDATE on token row |
```

## Quality Checklist

Before completing, the agent verifies:

- [ ] Every user story has testable acceptance criteria
- [ ] No ambiguous language ("fast", "easy", "simple", "better")
- [ ] Clear priority for each requirement
- [ ] Out-of-scope section prevents scope creep
- [ ] Glossary defines domain-specific terms
- [ ] Success criteria are measurable
- [ ] `awaitingApproval: true` set in state

## Anti-Patterns

| Don't | Why |
| --- | --- |
| Use vague language ("user-friendly", "fast") | Untestable. Replace with metrics. |
| Skip out-of-scope section | Without it, scope creeps during design. |
| Combine multiple FRs into one row | Each FR should be independently verifiable. |
| Renumber IDs after generation | Breaks every downstream reference. Use `refactor` if needed. |
| Invent product behavior not in research | If it's not in `research.md`, it's outside the contract. Surface as Open Question instead. |

## Reading The Output

When you review `requirements.md`:

- **Each US should map to a real person.** Vague users like "the system" are a smell.
- **Each FR should be testable.** "Should be performant" is not a requirement; "p99 < 200ms under 1000 RPS" is.
- **NFRs should cover cross-cutting concerns research surfaced.** If research flagged a security risk and no NFR addresses it, push back.
- **Acceptance criteria should be explicit.** "Works correctly" is not an AC.
- **Look at the Out of Scope list.** A short list often means scope was not pinned down — push back.

## Best Practices

- Read every AC before approving. Each one becomes a `[VERIFY]` gate that the autonomous loop will run.
- Push back early. Adding a forgotten requirement at this phase is a one-line edit. Adding it after `implement` is days of rework.
- For refactors, capture current behavior as ACs first. The refactor must satisfy them before any new behavior is added.
- If you find yourself thinking "but I also want X" while reading, that's a signal: either add it now as a new US/FR, or explicitly add it to Out of Scope. Don't leave it ambiguous.
