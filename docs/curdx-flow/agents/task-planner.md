# task-planner

The tasks phase owner. Breaks an approved design into a sequenced, checkable task list with verification gates between work units.

`task-planner` is invoked when you run `/curdx-flow:tasks` after `design.md` is approved. It produces `tasks.md` — the contract the `spec-executor` will execute autonomously, one task at a time, until every box is checked.

The agent supports two granularity modes (`fine` / `coarse`) and three workflows (POC-first / TDD / Bug TDD), selected by intent classification.

## Trigger Conditions

| Trigger | Behavior |
| --- | --- |
| `/curdx-flow:tasks` | Generates `tasks.md` from `design.md` (workflow auto-selected by intent) |
| `/curdx-flow:tasks --tasks-size coarse` | Coarse granularity: 10–20 tasks instead of 40–60+ |

## Inputs

| Field | Source | Purpose |
| --- | --- | --- |
| `basePath` | Coordinator | Spec directory |
| `requirements.md` | Phase 2 | User stories, FR, NFR, AC for traceability |
| `design.md` | Phase 3 | File manifest, decisions, risks |
| `research.md` | Phase 1 | Quality Commands and Verification Tooling |
| `Intent Classification` | `.progress.md` | Selects workflow (POC / TDD / Bug TDD) |
| `granularity` | Delegation | `fine` (default) or `coarse` |

## Workflow Selection

The agent reads `Intent Classification` from `.progress.md` and selects the workflow:

| Intent | Workflow | Rationale |
| --- | --- | --- |
| `GREENFIELD` | POC-first (5 phases) | New feature needs fast validation before investing in tests |
| `TRIVIAL` | TDD Red-Green-Yellow | Existing code has tests to build on |
| `REFACTOR` | TDD | Restructuring — tests guard against regressions |
| `MID_SIZED` | TDD | Extending feature — tests define expected behavior first |
| `BUG_FIX` | Bug TDD (Phase 0 + 4 phases) | Reproduce first, then TDD to lock in the fix |

If intent is missing, the agent infers from goal keywords: "new", "create", "build", "from scratch" → POC-first; "fix", "extend", "refactor", "update" → TDD.

## Granularity Sizing

| Mode | POC target | TDD target | Max Do steps | Max files | `[VERIFY]` cadence |
| --- | --- | --- | --- | --- | --- |
| `fine` (default) | 40–60+ | 30–50+ | 4 | 3 | every 2–3 tasks |
| `coarse` | 10–20 | 8–15 | 8–10 | 5–6 | every 2–3 tasks |

`fine` is the production default — each task is small enough that the diff per task is reviewable. `coarse` is for spikes and prototypes where commit granularity is not the goal.

### Split / Combine Rules

**Split when (fine):**
- Do section > 4 steps
- Files section > 3 files
- Task mixes creation + testing
- Task mixes more than one logical concern

**Combine when (fine):**
- Task A creates a file, Task B adds a single import to that file
- Both tasks touch the same file with trivially related changes
- Neither task is meaningful alone

## Task Format Contract

The `update-spec-index.mjs` hook parses tasks via regex. Any deviation breaks progress tracking. Every task MUST be a top-level list-item with a checkbox and a recognized id token immediately after:

```markdown
- [ ] 1.1 Task title
- [x] 1.2 [P] Parallel task
- [ ] V1 [VERIFY] Quality checkpoint
- [ ] VE1 [VERIFY] E2E startup
- [ ] VF [VERIFY] Goal verification
```

Recognized id tokens: `\d+\.\d+`, `V\d+`, `VE\d+`, `VF`. Anything else is **not tracked**.

**Reserved tokens that MUST NOT appear after a `- [ ]` checkbox**: `AC-…`, `FR-…`, `NFR-…`, `US-…`. These are reference IDs, not units of execution work — putting them after a checkbox makes the progress tracker count requirements as tasks (real-world breakage caused 0/N progress reports for fully-completed specs).

Inside any task body, AC/FR/NFR/US lists must be plain bullets (`- AC-1.1 — covered by …`) or numbered (`1. AC-1.1 — …`).

## Five Task Markers

The agent uses these markers to control coordinator behavior:

| Marker | Effect | Delegated to |
| --- | --- | --- |
| (none) | Sequential implementation task | `spec-executor` |
| `[P]` | Parallel-eligible (zero file overlap with adjacent `[P]`) | `spec-executor` (parallel batch) |
| `[VERIFY]` | Quality gate; runs verification commands | `qa-engineer` |
| `[RED]` / `[GREEN]` / `[YELLOW]` | TDD triplet (test → impl → refactor) | `spec-executor` |
| `[FIX X.Y]` | Auto-generated fix task from recovery loop | `spec-executor` |

`[P]` rules (auto-detected by the planner):

1. Zero file overlap with adjacent tasks (different `Files:` sections).
2. Does NOT depend on output of adjacent tasks.
3. NOT a `[VERIFY]` checkpoint (those break parallel groups).
4. Does NOT modify shared config files (package.json, tsconfig.json, etc.).
5. Max group size: 5 tasks per parallel batch.

## Standard Task Structure

Every task uses this exact format:

```markdown
- [ ] 1.2 [P] Create user service
  - **Do**:
    1. Create src/services/user.ts with UserService class
    2. Implement findById and create methods
    3. Add basic JSDoc
  - **Files**: src/services/user.ts
  - **Done when**: UserService is exported with findById/create methods
  - **Verify**: `pnpm tsc --noEmit && grep -q 'export class UserService' src/services/user.ts && echo PASS`
  - **Commit**: `feat(services): add UserService`
  - _Requirements: FR-1, AC-1.1_
  - _Design: Component A, D-1_
```

Required fields:
- **Do** — numbered steps the executor follows exactly (max 4 in `fine` mode)
- **Files** — concrete paths the task may modify (max 3 in `fine` mode)
- **Done when** — testable success criterion
- **Verify** — runnable command, NOT description
- **Commit** — exact conventional-commit message
- **Requirements / Design** — traceability backref

## POC-First Workflow (Greenfield)

Five phases with this distribution:

| Phase | % of tasks | Focus |
| --- | --- | --- |
| 1: Make It Work (POC) | 50–60% | Validate end-to-end with real external systems. Skip tests. |
| 2: Refactoring | 15–20% | Clean up code, add error handling, follow project patterns |
| 3: Testing | 15–20% | Unit + integration + E2E tests |
| 4: Quality Gates | 10–15% (combined) | Local CI, PR creation, V4–V6 + VE1–VE3 |
| 5: PR Lifecycle | — | CI monitoring, review resolution, autonomous until criteria met |

Phase 1 ends with a `POC Checkpoint` task that proves the integration works against real external systems (not just compiles).

## TDD Workflow (Non-Greenfield)

Each unit of work is a 3-task triplet:

```markdown
- [ ] 1.1 [RED] Failing test: refresh token rotation rejects reused token
  - **Do**: Write test asserting reused refresh token returns 401
  - **Files**: src/auth/__tests__/refresh.test.ts
  - **Done when**: Test exists AND fails with expected assertion error
  - **Verify**: `pnpm test -- --grep "rotation rejects reused" 2>&1 | grep -q "FAIL\|fail\|Error" && echo RED_PASS`
  - **Commit**: `test(auth): red - failing test for refresh token reuse rejection`
  - _Requirements: FR-3, AC-2.3_

- [ ] 1.2 [GREEN] Pass test: minimal token reuse detection
  - **Do**: Add reuse check in refresh handler; return 401 on second use
  - **Files**: src/auth/refresh.ts
  - **Done when**: Previously failing test now passes
  - **Verify**: `pnpm test -- --grep "rotation rejects reused"`
  - **Commit**: `feat(auth): green - implement refresh token reuse rejection`
  - _Requirements: FR-3, AC-2.3_

- [ ] 1.3 [YELLOW] Refactor: extract token-family revocation helper
  - **Do**: Extract revokeFamily helper; both reuse-detection and explicit-logout use it
  - **Files**: src/auth/refresh.ts, src/auth/__tests__/refresh.test.ts
  - **Done when**: Code is clean AND all tests pass
  - **Verify**: `pnpm test && pnpm lint`
  - **Commit**: `refactor(auth): yellow - extract revokeFamily helper`
```

TDD rules:
- `[RED]` writes ONLY test code. The test MUST fail.
- `[GREEN]` writes minimum code to pass. No extras, no refactor.
- `[YELLOW]` is optional per triplet (skip if code is already clean).

## Bug TDD Workflow (BUG_FIX)

Phase 0 prepends two reproduce-first tasks before any code change:

```markdown
- [ ] 0.1 [VERIFY] Reproduce bug: login returns 500 instead of 401 for invalid creds
  - **Do**: Run reproduction command and confirm it fails as described
  - **Done when**: Command fails with expected error
  - **Verify**: `curl -s -o /dev/null -w '%{http_code}' -X POST localhost:3000/auth/login -d 'user=x&pass=y' | grep -q '500' && echo REPRO_PASS`
  - **Commit**: None (no code changes in Phase 0)

- [ ] 0.2 [VERIFY] Confirm repro consistency: bug fails reliably 3/3 times
  - **Do**: Run reproduction command 3 times to confirm consistent failure
  - **Done when**: Failure consistent; document BEFORE state in .progress.md
  - **Verify**: `for i in 1 2 3; do curl ... | grep -q '500' || exit 1; done && echo CONSISTENT_PASS`
  - **Commit**: `chore(login): document reality check before`
```

Phase 0 writes `## Reality Check (BEFORE)` to `.progress.md`:

```markdown
## Reality Check (BEFORE)
- Reproduction command: `curl -s -o /dev/null -w '%{http_code}' -X POST localhost:3000/auth/login -d 'user=x&pass=y'`
- Exit code: 0 (curl succeeded; HTTP code captured separately)
- HTTP code observed: 500 (expected 401)
- Confirmed failing: yes
- Timestamp: 2026-05-05T12:30:00Z
```

The first `[RED]` task in Phase 1 references this BEFORE state to lock in the exact failure mode. The mandatory final `VF` task re-runs the reproduction and verifies the fix:

```markdown
- [ ] VF [VERIFY] Goal verification: original failure now passes
  - **Do**:
    1. Read BEFORE state from .progress.md
    2. Re-run reproduction command from Reality Check (BEFORE)
    3. Compare output with BEFORE failure
    4. Document AFTER state in .progress.md
  - **Verify**: HTTP 401 returned (was 500)
  - **Done when**: Command that failed before now passes correctly
  - **Commit**: `chore(login): verify fix resolves original issue`
```

## Verification Layers (V Tasks)

The final verification sequence — always last 3 tasks of every spec:

```markdown
- [ ] V4 [VERIFY] Full local CI: lint && typecheck && test && e2e && build
  - **Do**: Run complete local CI suite including E2E
  - **Verify**: All commands pass
  - **Done when**: Build succeeds, all tests pass, E2E green
  - **Commit**: `chore(scope): pass local CI` (if fixes needed)

- [ ] V5 [VERIFY] CI pipeline passes
  - **Do**: Verify GitHub Actions/CI passes after push
  - **Verify**: `gh pr checks` shows all green
  - **Done when**: CI pipeline passes
  - **Commit**: None

- [ ] V6 [VERIFY] AC checklist
  - **Do**: Read requirements.md, programmatically verify each AC-* is satisfied
  - **Verify**: Grep codebase for AC implementation, run relevant test commands
  - **Done when**: All acceptance criteria confirmed met via automated checks
  - **Commit**: None
```

Intermediate `V1`, `V2`, `V3` checkpoints fire every 2–3 implementation tasks across all phases.

## VE Tasks (E2E Verification)

VE tasks spin up real infrastructure and test the built feature end-to-end. They appear after `V6` and before Phase 5:

```markdown
- [ ] VE1 [VERIFY] E2E startup: start dev server and wait for ready
  - **Do**:
    1. Start dev server in background: `pnpm run dev &`
    2. Record PID: `echo $! > /tmp/ve-pids.txt`
    3. Wait for ready (60s timeout): `for i in $(seq 1 60); do curl -s localhost:3000/api/health && break || sleep 1; done`
  - **Verify**: `curl -sf localhost:3000/api/health && echo VE1_PASS`
  - **Done when**: Dev server responding on 3000
  - **Commit**: None

- [ ] VE2 [VERIFY] E2E check: complete OAuth flow against provider sandbox
  - **Do**:
    1. Hit /auth/start, follow redirect, complete sandbox auth
    2. Verify session cookie present and access token works
  - **Verify**: `node scripts/e2e-oauth.mjs && echo VE2_PASS`
  - **Done when**: User flow produces signed-in session
  - **Commit**: None

- [ ] VE3 [VERIFY] E2E cleanup: stop server and free port
  - **Do**:
    1. Kill by PID: `kill $(cat /tmp/ve-pids.txt) 2>/dev/null; sleep 2; kill -9 $(cat /tmp/ve-pids.txt) 2>/dev/null || true`
    2. Kill by port fallback: `lsof -ti :3000 | xargs -r kill 2>/dev/null || true`
    3. Remove PID file: `rm -f /tmp/ve-pids.txt`
    4. Verify port free: `! lsof -ti :3000`
  - **Verify**: `! lsof -ti :3000 && echo VE3_PASS`
  - **Done when**: No process on 3000, PID file removed
  - **Commit**: None
```

VE rules:
- Always sequential (never `[P]`) — infrastructure state is shared.
- Always `[VERIFY]` tagged — delegated to `qa-engineer`.
- VE3 (cleanup) MUST always run, even if VE1 or VE2 fail. The coordinator skips forward to VE-cleanup on max retries.
- Commands come from `research.md` "Verification Tooling" section — never hardcoded.
- Library projects get a minimal VE (build + import check, no dev server).

## Forbidden Patterns

The agent enforces hard prohibitions:

### No Manual Verification

`Verify` fields must be **automated commands**. The executor cannot ask questions or wait for human input. Forbidden patterns:

- "Manual test..."
- "Manually verify..."
- "Check visually..."
- "Ask user to..."

If verification seems to require manual testing, find an automated alternative:
- Visual checks → DOM element assertions, screenshot comparison CLI
- User flow testing → Browser automation (Playwright/Puppeteer via MCP)
- Dashboard verification → API queries to the dashboard backend
- Extension testing → `web-ext lint`, manifest validation, build output checks

### No New Spec Directories

Tasks NEVER create new spec directories for testing. The executor operates within the current spec directory. Creating new spec dirs pollutes the codebase, causes cleanup issues, and breaks the single-spec model.

For POC/testing within a spec:
- Test within the current spec's context
- Use `.test-temp/` inside the current spec
- Create test fixtures inside the current spec

## Real Sample Output

Excerpt from a real `tasks.md` for OAuth login (POC-first, fine granularity):

```markdown
# Tasks: oauth-login

## Phase 1: Make It Work (POC)

- [ ] 1.1 [P] Add OAuth provider config schema
  - **Do**:
    1. Create src/auth/config-schema.ts with Zod schema for provider config
    2. Add Google + Microsoft provider entries
  - **Files**: src/auth/config-schema.ts
  - **Done when**: Schema parses sample config without error
  - **Verify**: `pnpm tsc --noEmit src/auth/config-schema.ts && node -e "require('./src/auth/config-schema').schema.parse(require('./test-fixtures/oauth-config.json'))" && echo PASS`
  - **Commit**: `feat(auth): add OAuth provider config schema`
  - _Requirements: FR-1_
  - _Design: Component A, D-1_

- [ ] 1.2 [P] Add token storage with rotation lock
  - **Do**:
    1. Create src/auth/token-store.ts with insertToken / rotateToken using SELECT FOR UPDATE
    2. Add tenant_id column for RLS
  - **Files**: src/auth/token-store.ts
  - **Done when**: rotateToken locks and rotates atomically
  - **Verify**: `pnpm tsc --noEmit && node scripts/test-rotation.mjs && echo PASS`
  - **Commit**: `feat(auth): add token storage with rotation lock`
  - _Requirements: FR-3, NFR-3_
  - _Design: Component B, D-2, R-2_

- [ ] 1.3 [VERIFY] Quality checkpoint: pnpm lint && pnpm tsc --noEmit
  - **Do**: Run quality commands and verify all pass
  - **Verify**: All commands exit 0
  - **Done when**: No lint errors, no type errors
  - **Commit**: `chore(auth): pass quality checkpoint` (if fixes needed)

- [ ] 1.4 Implement authorization code exchange handler
  - **Do**:
    1. Create POST /auth/callback handler
    2. Verify state, exchange code with provider, store tokens
    3. Issue session cookie
  - **Files**: src/auth/callback.ts, src/server/routes.ts
  - **Done when**: Sandbox auth completes and lands on /dashboard
  - **Verify**: `node scripts/e2e-oauth.mjs --provider=google-sandbox && echo PASS`
  - **Commit**: `feat(auth): implement OAuth callback handler`
  - _Requirements: FR-1, AC-1.1_
  - _Design: Component A_

...

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
    - AC-1.2 — covered by src/auth/user-create.ts + tests/auth-user-create.test.ts
    - AC-2.3 — covered by tests/auth-rotation.test.ts (token reuse rejection)
  - **Done when**: All ACs traced to code/tests
  - **Commit**: None

- [ ] VE1 [VERIFY] E2E startup
  - **Do**: Start dev server, wait for /api/health
  - ...
- [ ] VE2 [VERIFY] E2E check: full OAuth flow against sandbox
- [ ] VE3 [VERIFY] E2E cleanup

## Notes
- POC shortcuts: hardcoded provider client IDs in Phase 1 → replaced in Phase 2.
- Production TODOs: refresh token cleanup job, audit log integration.
```

## Quality Checklist

- [ ] All tasks use `- [ ] <task-id> …` list-item format (no `### Task` headlines)
- [ ] No `- [ ]` checkbox lines reference AC/FR/NFR/US ids
- [ ] All tasks have ≤ 4 Do steps (fine) or ≤ 10 (coarse)
- [ ] All tasks touch ≤ 3 files (fine) or ≤ 6 (coarse)
- [ ] All tasks reference requirements/design
- [ ] No Verify field contains "manual", "visually", or "ask user"
- [ ] Each task has a runnable Verify command
- [ ] Quality checkpoints inserted every 2–3 tasks
- [ ] Final V4–V6 always present
- [ ] VE tasks present (per project type from research.md)
- [ ] Tasks ordered by dependency
- [ ] `[P]` groups have max 5 tasks, broken by `[VERIFY]`
- [ ] BUG_FIX includes Phase 0 (reproduce) + mandatory VF task

## Anti-Patterns

| Don't | Why |
| --- | --- |
| Headline tasks (`### Task X.Y: …`) | Not parsed by the index hook. Tracker reports 0/N. |
| Checkbox AC/FR/NFR/US lines | Tracker counts them as tasks. Real-world breakage exists. |
| Manual verification | Executor cannot ask questions. Find an automated path. |
| Speculative features | Each task = one logical concern. No "while we're in there". |
| Task dependencies hidden in Do steps | Make dependencies explicit via task ordering and Files. |
| `[P]` on tasks that share files | Race conditions, lost edits, broken commits. |

## Best Practices

- Read `tasks.md` carefully before `/curdx-flow:implement`. Once the loop starts, fixing a wrong task means cancelling and refactoring.
- Push back if you see implementation work without verification. Ask the planner to add a `[VERIFY]` gate.
- Use `coarse` only when you accept that revert granularity will be coarse too. A bad coarse task means rolling back a big diff.
- For long specs, consider triaging into smaller specs rather than producing a 30-task `tasks.md`.
- Verify commands should be ones your project actually runs. The Quality Commands table in `research.md` is the source of truth.
- For BUG_FIX specs, sanity-check Phase 0 reproduction before approving — if you cannot reproduce locally, the AFTER verification cannot prove the fix.
