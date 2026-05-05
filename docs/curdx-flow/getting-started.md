# Getting Started

Zero to your first approved spec, with **real artifact fragments** at each step so you know what the output looks like before you ever run the command.

## Prerequisites

| Requirement | Why it matters | Install |
|-------------|----------------|---------|
| **Node.js ≥ 20.12** | The installer and `analyze` CLI run on Node | [nodejs.org](https://nodejs.org) |
| **Claude Code CLI** | flow is a plugin that runs inside Claude Code | `npm install -g @anthropic-ai/claude-code` |
| **Git** | Specs live in your repo; the executor commits per task | Standard install |
| *(Optional)* **Bun ≥ 1.0** | Auto-detected; the installer offers to install it if you choose `claude-mem` | [bun.sh](https://bun.sh) |

Verify Claude Code is on `PATH`:

```bash
claude --version
# Claude Code 1.x.x
```

If that fails, fix it first. flow is an orchestration layer, not a replacement for Claude Code itself.

## Install

```bash
npx @curdx/flow
```

On first run you pick a language (English / 中文), then select what to install. The bundled `curdx-flow` plugin is always installed; everything else is opt-in.

### Non-interactive

```bash
# Install everything available, no prompts
npx @curdx/flow install --all --yes

# Install specific items only
npx @curdx/flow install claude-mem context7
```

### Verify

```bash
claude plugin list                    # should show curdx-flow@curdx
claude mcp list                       # MCP servers you opted in to
npx @curdx/flow status                # green checkmarks for installed items
```

In Claude Code, type `/curdx-flow:` and you should see autocomplete for all commands.

## Your First Spec, End-to-End

This walkthrough builds an OAuth login feature start-to-finish, showing real fragments of every artifact.

```bash
cd ~/projects/my-app
claude
```

### Step 1: `/curdx-flow:start`

```text
/curdx-flow:start
```

When prompted, describe your goal:

```text
> I want to add OAuth login (Google + Microsoft) with refresh token rotation.
```

What you'll see in the next 60 seconds:

```text
Branch check: on main (default branch)
  → create new branch? [Y/n] Y
  → branch name: feat/oauth-login
  → switched to feat/oauth-login

Intent classification: GREENFIELD (high confidence, 3 keywords matched)
  → Min/Max questions: 5/10

Goal Interview (1/5): What pain point is driving this?
> Users complain about password fatigue; we have JWT but no SSO.

Goal Interview (2/5): Constraints and must-haves?
> Existing JWT system stays. Refresh tokens must rotate. Cannot break sessions.

Goal Interview (3/5): How will you know this works?
> First-time login under 5s. Silent refresh. No regressions in existing auth tests.

Goal Interview (4/5): What's out of scope?
> Passkey support. SAML. Account linking UI.

Goal Interview (5/5): What do you already know vs need discovered?
> JWT pattern is in src/auth/jwt.ts. OAuth provider details are unknown.

Approach proposals:
  (A) Extend existing JWT module with OAuth bolted in
  (B) New auth module with refresh rotation, JWT for legacy paths
  (C) Lightweight integration using existing primitives

> B

Skill Discovery Pass 1:
  - claude-mem:make-plan: matched (keywords: build, plan, implement)
  - context7: matched (keywords: oauth, library, docs)

Dispatching parallel research team (3 teammates):
  ⟳ researcher-1: OAuth 2.0 best practices and refresh token strategies
  ⟳ researcher-2: PKCE patterns and security considerations
  ⟳ explorer-1: Codebase analysis for existing auth patterns

[~45 seconds later]
  ✓ All teammates complete. Merging into research.md.
  ✓ research.md written (148 lines, 9 references, 4 risks)

Skill Discovery Pass 2:
  - pua:pua-loop: no match (already invoked: false)
  - frontend-design: no match (no UI in scope)

awaitingApproval: true. Stopping for review.

→ Next: review specs/oauth-login/research.md, then run /curdx-flow:requirements
```

A real `research.md` excerpt at this point:

```markdown
# Research: oauth-login

## Executive Summary
OAuth 2.0 authorization-code flow with PKCE and refresh token rotation is the
correct pattern. Existing codebase has JWT primitives that can be reused for
session management. Main risk is refresh token race condition during rotation.

## External Research

### Best Practices
- Use PKCE for all OAuth flows even server-side — source: RFC 7636
- Refresh token rotation per RFC 6819 §5.2.2.3 — source: oauth.net/2/refresh-tokens/

### Pitfalls to Avoid
- Token reuse without revocation creates phishing window — source: portswigger.net OAuth research
- Provider clock skew → use 30s tolerance on iat/exp claims

## Codebase Analysis

### Existing Patterns
- JWT issuance via `src/auth/jwt.ts:42` (HS256)
- Auth middleware chain: `src/server/middleware/auth.ts`
- Session cookie helper: `src/lib/session.ts`

### Constraints
- Postgres uses `citext` for case-insensitive lookups (consistent pattern)
- All middleware must register via `src/server/middleware-registry.ts`

## Quality Commands
| Type | Command | Source |
|------|---------|--------|
| Lint | `pnpm run lint` | package.json |
| TypeCheck | `pnpm run check-types` | package.json |
| Unit Test | `pnpm test` | package.json |
| E2E Test | `pnpm test:e2e` | package.json |

## Verification Tooling
| Tool | Command | Detected From |
|------|---------|---------------|
| Dev Server | `pnpm run dev` | package.json scripts.dev |
| Browser Automation | `playwright` | devDependencies |
| Port | `3000` | .env |

## Feasibility Assessment
| Aspect | Assessment | Notes |
|--------|------------|-------|
| Technical Viability | High | All deps exist |
| Effort Estimate | M | ~1 week for 1 engineer |
| Risk Level | Medium | Token rotation race (R-2) |
```

### Step 2: `/curdx-flow:requirements`

```text
/curdx-flow:requirements

⟳ product-manager: generating requirements.md
  ✓ Done. (3.2s)

awaitingApproval: true.
→ Next: review specs/oauth-login/requirements.md, then /curdx-flow:design
```

A real `requirements.md` excerpt:

```markdown
# Requirements: oauth-login

## Goal
Add OAuth 2.0 sign-in (Google + Microsoft) with refresh token rotation,
preserving existing JWT-based session continuity.

## User Stories

### US-1: First-time OAuth Login
**As a** new user
**I want to** sign in with my Google or Microsoft account
**So that** I do not have to manage another password

**Acceptance Criteria:**
- [ ] AC-1.1: User can complete OAuth code flow with Google in <5s
- [ ] AC-1.2: First successful login auto-creates a user account from provider data
- [ ] AC-1.3: Provider account is linked to the user record (one user, multiple providers)

### US-2: Session Continuity Without Re-Auth
**As an** authenticated user
**I want to** stay signed in across browser sessions
**So that** I do not re-enter credentials every visit

**Acceptance Criteria:**
- [ ] AC-2.1: Refresh token issued at login is valid for 30 days
- [ ] AC-2.2: Access token refreshes silently without user interaction
- [ ] AC-2.3: Refresh token rotates on every refresh; reused token rejected

## Functional Requirements

| ID | Requirement | Priority | AC |
|----|-------------|----------|----|
| FR-1 | OAuth code flow with PKCE for Google + Microsoft | High | AC-1.1 |
| FR-2 | Issue access token (15min) + refresh token (30d) on auth | High | AC-2.1 |
| FR-3 | Rotate refresh token on every refresh; reject reused | High | AC-2.3 |
| FR-4 | Auto-create user record on first OAuth login | High | AC-1.2 |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | Auth latency | p99 (code exchange) | <200ms |
| NFR-2 | Refresh token storage | Encryption | At-rest via KMS |
| NFR-3 | Token rotation | Concurrent safety | SELECT FOR UPDATE |

## Out of Scope
- Passkey support
- SAML
- Account linking UI

## Success Criteria
- 95% of users complete first-time login under 5s
- Zero refresh-token reuse incidents in production telemetry
```

### Step 3: `/curdx-flow:design`

```text
/curdx-flow:design

⟳ architect-reviewer: spawning 3 Explore subagents in parallel
  ✓ Existing auth patterns analyzed
  ✓ Interfaces and types catalogued
  ✓ Data flow traced
  ✓ design.md written (9 decisions, 7 risks, mermaid diagrams)

awaitingApproval: true.
→ Next: review specs/oauth-login/design.md, then /curdx-flow:tasks
```

A real `design.md` excerpt:

```markdown
# Design: oauth-login

## Overview
New auth module under src/auth/oauth/ implementing PKCE-protected code flow
for Google + Microsoft. Refresh tokens stored in Postgres with rotation
locking. Existing JWT module remains untouched for legacy paths.

## Components

### oauth-provider
**Purpose**: Adapter pattern over Google + Microsoft providers
**Responsibilities**:
- Build authorization URL with PKCE challenge
- Exchange code for tokens
- Validate ID token signatures

**Interfaces**:
```typescript
interface OAuthProvider {
  getAuthorizeUrl(state: string, codeChallenge: string): string;
  exchangeCode(code: string, codeVerifier: string): Promise<TokenSet>;
  validateIdToken(idToken: string): Promise<UserClaims>;
}
```

### token-store
**Purpose**: Refresh token persistence with rotation
**Responsibilities**:
- Insert new token family on login
- Rotate token atomically (SELECT FOR UPDATE)
- Detect reuse, revoke entire family

## Technical Decisions

| ID | Decision | Options | Choice | Rationale |
|----|----------|---------|--------|-----------|
| D-1 | OAuth client | (a) custom, (b) openid-client, (c) provider SDKs | (b) | Already transitive dep; RFC-compliant |
| D-2 | Email collation | (a) lowercase write, (b) citext, (c) lower() | (b) | Existing pattern; preserves index |
| D-3 | Token table layout | (a) shared with tenant_id, (b) per-tenant | (a) | Simpler queries; RLS handles tenancy |

## Known Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R-1 | Provider outage breaks login | Existing sessions continue until refresh |
| R-2 | Refresh rotation race condition | SELECT FOR UPDATE; ~5ms p99 lock |
| R-3 | PKCE verifier leaks via referer | `Referrer-Policy: strict-origin-when-cross-origin` |

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| src/auth/oauth/provider.ts | Create | Provider adapter interface |
| src/auth/oauth/google.ts | Create | Google provider implementation |
| src/auth/oauth/microsoft.ts | Create | Microsoft provider implementation |
| src/auth/oauth/token-store.ts | Create | Token persistence with rotation |
| src/auth/oauth/callback.ts | Create | POST /auth/callback handler |
| src/server/middleware/auth.ts | Modify | Wire OAuth into chain |
| migrations/2026-05-05-oauth-tokens.sql | Create | Token table + indexes |
```

### Step 4: `/curdx-flow:tasks`

```text
/curdx-flow:tasks

⟳ task-planner: generating POC-first task list (granularity: fine)
  ✓ Spawned 2 Explore agents to verify Files paths and Verify commands
  ✓ tasks.md written (4 phases, 18 tasks, 8 [VERIFY] checkpoints, 3 VE tasks)

awaitingApproval: true.
→ Next: review specs/oauth-login/tasks.md, then /curdx-flow:implement
```

A real `tasks.md` excerpt:

```markdown
# Tasks: oauth-login

## Phase 1: Make It Work (POC)

- [ ] 1.1 [P] Create OAuth provider config schema
  - **Do**:
    1. Create src/auth/oauth/config-schema.ts with Zod schema
    2. Add Google + Microsoft provider entries
  - **Files**: src/auth/oauth/config-schema.ts
  - **Done when**: Schema parses sample config without error
  - **Verify**: `pnpm tsc --noEmit src/auth/oauth/config-schema.ts && node -e "require('./src/auth/oauth/config-schema').schema.parse(require('./test-fixtures/oauth-config.json'))" && echo PASS`
  - **Commit**: `feat(auth): add OAuth provider config schema`
  - _Requirements: FR-1_
  - _Design: Component oauth-provider, D-1_

- [ ] 1.2 [P] Add token storage with rotation lock
  - **Do**:
    1. Create src/auth/oauth/token-store.ts
    2. Add insertToken / rotateToken using SELECT FOR UPDATE
  - **Files**: src/auth/oauth/token-store.ts, migrations/2026-05-05-oauth-tokens.sql
  - **Done when**: rotateToken locks and rotates atomically
  - **Verify**: `pnpm tsc --noEmit && node scripts/test-rotation.mjs && echo PASS`
  - **Commit**: `feat(auth): add token storage with rotation lock`
  - _Requirements: FR-3, NFR-3_
  - _Design: Component token-store, D-2, R-2_

- [ ] 1.3 [VERIFY] Quality checkpoint: pnpm lint && pnpm tsc --noEmit
  - **Do**: Run quality commands and verify all pass
  - **Verify**: All commands exit 0
  - **Done when**: No lint errors, no type errors
  - **Commit**: `chore(auth): pass quality checkpoint` (if fixes needed)

[... 12 more implementation/verify tasks across phases 1-3 ...]

## Phase 4: Quality Gates

- [ ] V4 [VERIFY] Full local CI: pnpm lint && pnpm tsc --noEmit && pnpm test && pnpm test:e2e && pnpm build
  - **Do**: Run complete local CI suite including E2E
  - **Verify**: All commands pass
  - **Done when**: Build succeeds, all tests pass, E2E green
  - **Commit**: `chore(auth): pass local CI` (if fixes needed)

- [ ] V5 [VERIFY] CI pipeline passes
  - **Do**: Verify GitHub Actions/CI passes after push
  - **Verify**: `gh pr checks` shows all green
  - **Done when**: CI pipeline passes
  - **Commit**: None

- [ ] V6 [VERIFY] AC checklist
  - **Do**: Read requirements.md, programmatically verify each AC-* is satisfied
  - **Verify**:
    - AC-1.1 — covered by tests/e2e/oauth-login.spec.ts:42
    - AC-1.2 — covered by src/auth/oauth/user-create.ts + tests
    - AC-2.3 — covered by tests/auth-rotation.test.ts (token reuse rejection)
  - **Done when**: All ACs traced to code/tests
  - **Commit**: None

- [ ] VE1 [VERIFY] E2E startup: start dev server and wait for ready
- [ ] VE2 [VERIFY] E2E check: complete OAuth flow against sandbox
- [ ] VE3 [VERIFY] E2E cleanup: stop server and free port
```

### Step 5: `/curdx-flow:implement`

```text
/curdx-flow:implement

Reading state. Resuming spec oauth-login at task 1.1 (0/18).

⟳ task 1.1 [P] Create OAuth provider config schema
  TASK_COMPLETE
  status: pass
  commit: 7f3a9c2
  verify: schema parses sample, tsc clean

⟳ task 1.2 [P] Add token storage with rotation lock
  TASK_COMPLETE
  status: pass
  commit: 8e1b4d5
  verify: rotation test passed (3/3 concurrent)

⟳ task 1.3 [VERIFY] Quality checkpoint
  qa-engineer: VERIFICATION_PASS

⟳ task 1.4 Implement authorization code exchange handler
  TASK_COMPLETE
  status: pass
  commit: 1c2d3e4
  verify: e2e-oauth.mjs passed against google-sandbox

[phase boundary — pushing 4 commits]
Pushed 4 commits (reason: phase boundary)

⟳ task 2.1 Extract token-family revocation helper
  ...

⟳ task V4 [VERIFY] Full local CI
  qa-engineer: VERIFICATION_PASS

⟳ task V5 [VERIFY] CI pipeline passes
  qa-engineer: gh pr checks shows all green
  VERIFICATION_PASS

⟳ task VE1 [VERIFY] E2E startup
  qa-engineer: dev server up on port 3000
  VERIFICATION_PASS

⟳ task VE2 [VERIFY] E2E check: complete OAuth flow against sandbox
  qa-engineer: full sandbox flow completed
  VERIFICATION_PASS

⟳ task VE3 [VERIFY] E2E cleanup
  qa-engineer: port 3000 free
  VERIFICATION_PASS

✓ ALL_TASKS_COMPLETE  (18/18 tasks, 41 commits)

PR: https://github.com/curdx/my-app/pull/142
```

You walk away during the loop. Come back, read the diff, merge.

## Recovery: When A Task Fails

A halt looks like this:

```text
⟳ task 1.4 Implement authorization code exchange handler
  Verify failed: e2e-oauth.mjs exited 1
  Last error: TypeError: cannot read property 'sub' of undefined at oauth-provider.ts:42
  Retry 1/5...
  Retry 2/5...
  Retry 5/5...
  ✗ HALT — task 1.4 verification failed beyond retry budget

Resume by running /curdx-flow:implement after fixing the issue.
Or run /curdx-flow:refactor if the spec needs revision.
```

Three recovery paths:

**Path A — implementation bug.** Reproduce the verify command in your shell. If the error is real, fix the code, then `/curdx-flow:implement` resumes from task 1.4.

**Path B — spec is wrong.** If the design assumed something untrue (e.g., token field name is `subject` not `sub`), run `/curdx-flow:refactor`. The `refactor-specialist` walks `requirements.md` → `design.md` → `tasks.md` and lets you methodically update each. Then `/curdx-flow:implement`.

**Path C — restart.** If the spec is fundamentally wrong: `/curdx-flow:cancel`, then `/curdx-flow:start` with a corrected goal.

## Quick Mode

For a small, low-risk spec you trust to review at the end:

```text
/curdx-flow:start --quick
> Add /healthz endpoint that returns version and uptime.
```

What changes:

- All four phases run sequentially without pause-for-approval gates.
- Each artifact gets a 3-iteration review loop (`spec-reviewer` validates and revises).
- The autonomous loop starts immediately after `tasks.md` is generated.
- Branch is auto-created if you're on `main`.
- VE tasks are auto-enabled (no skip prompt).

What stays the same:

- All four artifacts are still generated and committed.
- All `[VERIFY]` gates still run.
- Halt-on-persistent-failure still applies.

Best for changes you can review in one pass at the end.

## Starter Patterns

### Solo small feature

```text
/curdx-flow:start
> Refactor cache helper to use new TTL config.
```

Use when the change has bounded surface area and you want spec discipline without ceremony. Intent classification will pick `REFACTOR` and run the TDD workflow.

### Cross-cutting feature

```text
/curdx-flow:triage
> Server-side webhooks: ingestion, retry queue, dead-letter UI.
```

`triage-analyst` decomposes the feature into multiple dependency-aware specs (an epic). Each child spec runs through the normal five phases. The epic is stored at `specs/_epics/<name>/epic.md`.

### Bug fix

```text
/curdx-flow:start
> Login returns 500 instead of 401 for invalid credentials.
```

Intent classification picks `BUG_FIX`. The interview becomes 5 focused questions about reproduction. Phase 0 reproduces the bug and writes the BEFORE state. The mandatory `VF` task at the end re-runs the reproduction and verifies the fix.

## Useful Flags

| Flag | Effect |
| --- | --- |
| `--quick` | Run all phases sequentially without pausing |
| `--commit-spec` / `--no-commit-spec` | Commit spec artifacts after each phase (default: on) |
| `--specs-dir <path>` | Write specs to a non-default directory (e.g. `packages/api/specs/`) |
| `--tasks-size fine` / `coarse` | Granularity of `tasks.md` decomposition |
| `--fresh` | Force-create a new spec even if a related one exists |

See [Configuration](/curdx-flow/configuration) for the full list and per-project overrides.

## Daily Driver Commands

```bash
# Inside Claude Code
/curdx-flow:start         # smart entry point: new spec or resume
/curdx-flow:status        # see all specs and their phase
/curdx-flow:switch        # change the active spec
/curdx-flow:implement     # resume autonomous execution

# At the shell
npx @curdx/flow           # interactive menu (install / update / status)
npx @curdx/flow status    # what is installed and whether anything is stale
npx @curdx/flow update    # update to the latest version
npx @curdx/flow analyze   # generate the observability report
```

## Best Practices

- **Commit the four canonical artifacts.** `research.md`, `requirements.md`, `design.md`, `tasks.md` belong in version control. State files (`.curdx-state.json`, `.progress.md`) are gitignored by default.
- **Approve thoughtfully.** Each pause is your chance to redirect before the next subagent starts. Cheaper than rewriting later.
- **Keep specs small.** A spec that creates 30+ tasks is usually two specs in disguise. Use `/curdx-flow:triage`.
- **Use `--quick` sparingly.** It works for low-stakes changes but skips the gates that protect higher-risk work.
- **Run `npx @curdx/flow status` after upgrades.** It surfaces drift before you find it the hard way.
- **Read `.progress.md` after a halt.** The `## Learnings` section is where the executor records the actual failure context.

## Next Steps

- Read [How It Works](/curdx-flow/how-it-works) for the architecture and execution model
- Configure flags and the managed `CLAUDE.md` block in [Configuration](/curdx-flow/configuration)
- Browse [Commands](/curdx-flow/commands) for the full slash and CLI surface
- Meet the team in [Subagents](/curdx-flow/agents/)
