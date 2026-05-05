# How It Works

CurdX Flow is built around one principle: **the spec is the contract, not the prompt.** Before any code is written, the work is described in four versioned Markdown files. Then a single specialist agent executes one task at a time, with a 3-layer verification protocol between every task.

This page walks through every internal mechanism: the five-phase model, intent classification, the goal interview, parallel research dispatch, the coordinator pattern, the autonomous loop, the verification layers, the recovery loop, hooks, and state.

## The Five-Phase Workflow

Each phase has exactly one owner subagent and exactly one output artifact. Phases are sequential by design — skipping or reordering is not supported.

| Phase | Owner | Output | Pauses for approval? |
| --- | --- | --- | --- |
| Research | `research-analyst` (parallel team) | `research.md` | Yes |
| Requirements | `product-manager` | `requirements.md` | Yes |
| Design | `architect-reviewer` | `design.md` | Yes |
| Tasks | `task-planner` | `tasks.md` | Yes |
| Implement | `spec-executor` | code, tests, commits | No — autonomous |

The first four phases are pause-and-review. The fifth is the autonomous loop.

## Spec-Driven Architecture

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 420" role="img" aria-label="CurdX Flow spec-driven architecture" style="max-width: 100%; height: auto;">
<defs>
<marker id="arch-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="400" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<text x="40" y="48" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Spec lifecycle inside one repo</text>
<text x="40" y="74" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Goal → four artifacts → autonomous execution → committed code.</text>

<rect x="40" y="106" width="220" height="76" rx="16" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<text x="64" y="138" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">/curdx-flow:start</text>
<text x="64" y="162" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">Goal + interview + skills</text>

<rect x="290" y="106" width="640" height="76" rx="16" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<text x="312" y="138" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">Phases (paused between)</text>
<text x="312" y="162" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">research.md → requirements.md → design.md → tasks.md</text>

<rect x="40" y="208" width="890" height="86" rx="16" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<text x="64" y="240" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">/curdx-flow:implement (autonomous loop)</text>
<text x="64" y="266" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">pick next task → fresh context → implement → 3-layer verify → commit → mark [x] → repeat until ALL_TASKS_COMPLETE</text>

<rect x="40" y="320" width="890" height="76" rx="16" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<text x="64" y="352" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">specs/&lt;name&gt;/  + .curdx-state.json + .progress.md</text>
<text x="64" y="376" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">artifacts committed to git · state and progress gitignored · resumable across sessions</text>

<path d="M260 144 L286 144" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow)" />
<path d="M610 184 L610 204" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow)" />
<path d="M484 296 L484 316" style="fill: none; stroke: var(--vp-c-divider); stroke-width: 2; stroke-dasharray: 4 5;" />
</svg>
</div>

## Intent Classification: How Workflow Is Selected

`/curdx-flow:start` runs intent classification on the goal text BEFORE the interview, to decide question depth and downstream workflow.

| Intent | Min / Max Questions | Workflow | Trigger Keywords |
| --- | --- | --- | --- |
| `BUG_FIX` | 5 / 5 | Bug TDD (Phase 0 + 4) | fix, resolve, debug, broken, failing, error, bug, crash, regression, reproduce |
| `TRIVIAL` | 1 / 2 | TDD | typo, spelling, small change, minor, quick, simple, tiny, rename, update text |
| `REFACTOR` | 3 / 5 | TDD | refactor, restructure, reorganize, clean up, simplify, extract, consolidate, modularize |
| `GREENFIELD` | 5 / 10 | POC-first | new feature, new system, new module, add, build, implement, create, integrate, from scratch |
| `MID_SIZED` | 3 / 7 | TDD | (default if no clear match) |

Confidence levels:

| Match Count | Confidence | Action |
| --- | --- | --- |
| 3+ keywords | High | Use matched category |
| 1–2 keywords | Medium | Use matched category |
| 0 keywords | Low | Default to MID_SIZED |

The classification is stored in `.progress.md` and read later by `task-planner` to select POC-first vs TDD vs Bug TDD workflow.

## The Goal Interview

After classification, the coordinator runs an adaptive Q&A based on intent depth. Areas probed:

- **Problem being solved** — what pain point or need is driving this goal?
- **Constraints and must-haves** — performance, compatibility, timeline, integration requirements
- **Success criteria** — how will the user know this feature works correctly?
- **Scope boundaries** — what is explicitly in and out of scope?
- **User's existing knowledge** — what does the user already know vs what needs discovery?

For `BUG_FIX` intent the interview is replaced with five focused questions:

1. Walk me through the exact steps to reproduce this bug. What do you do, in what order?
2. What did you expect to happen? What actually happened instead?
3. When did this start? Was it working before?
4. Is there an existing failing test that captures this bug, or do we need to write one?
5. What is the fastest command to reproduce the failure?

After the dialogue, the coordinator proposes 2–3 high-level approaches and stores responses in `.progress.md`:

```markdown
## Interview Format
- Version: 1.0

## Intent Classification
- Type: GREENFIELD
- Confidence: high (3 keywords matched)
- Min questions: 5
- Max questions: 10
- Keywords matched: add, build, implement

## Interview Responses

### Goal Interview (from start.md)
- Problem: Users want SSO with Google + Microsoft
- Constraints: Must support refresh token rotation; existing JWT system stays
- Success: First-time login under 5s; refresh silent
- Scope: Out — passkey support, SAML
- Existing knowledge: Codebase has JWT pattern; OAuth is new
- Chosen approach: B - new auth module with refresh rotation

## Skill Discovery
- claude-mem:make-plan: matched (keywords: feature, plan, implement)
- pua:pua-loop: no match
```

For `BUG_FIX`, the BEFORE state is captured immediately:

```markdown
## Reality Check (BEFORE)
- Reproduction command: `pnpm test -- --grep 'login flow'`
- Exit code: 1
- Output: Expected 401, got 500
- Confirmed failing: yes
- Timestamp: 2026-05-05T12:30:00Z
```

## Skill Auto-Discovery

Flow scans the active environment for installed Claude Code skills (project skills, `.agents/skills/`, plugin skills) and matches them semantically against the goal. Relevant skills are pre-loaded into the active context before each subagent runs.

The detection happens twice:

1. **Pass 1** — at `/curdx-flow:start`, against just the goal text.
2. **Pass 2** — after research completes, against goal + research executive summary. Catches skills that only become relevant once the problem is better understood.

Token matching algorithm:

1. Read each `SKILL.md` file's YAML frontmatter (`name`, `description`).
2. Tokenize: lowercase, replace hyphens with spaces, strip punctuation, split on whitespace.
3. Remove stopwords: a, an, the, to, for, with, and, or, in, on, by, is, be, that, this, of, it, should, used, when, asks, needs, about.
4. Count word overlap between goal/context tokens and description tokens.
5. If overlap ≥ 2 AND skill not already invoked → invoke `Skill({ skill: "..." })`.
6. Record match details in `.progress.md` under `## Skill Discovery`.

Both passes record matches so you can see what got loaded and why.

## Parallel Research Dispatch

The research command is a **coordinator, not a researcher**. It MUST delegate ALL research work to subagents:

- `Explore` subagent for codebase analysis (read-only, runs on Haiku — fast, cheap)
- `research-analyst` subagent for web research (needs WebSearch + WebFetch)

### Topic Identification

Before invoking, the coordinator analyzes the goal and breaks it into independent research areas:

| Category | Agent Type |
| --- | --- |
| External / Best Practices | `research-analyst` |
| Codebase Analysis | `Explore` |
| Related Specs | `Explore` |
| Domain-Specific (web) | `research-analyst` |
| Domain-Specific (code) | `Explore` |
| Quality Commands | `Explore` |
| Verification Tooling | `Explore` |

**Minimum: 2 agents** (1 research-analyst + 1 Explore). Zero exceptions.

### Dispatch Sequence

```text
1. TeamDelete()                              # release any stale team
2. TeamCreate(team_name: "research-$spec")
3. TaskCreate per topic                      # one native task per teammate
4. ALL Task(...) calls in ONE message        # true parallelism
5. Wait for teammate idle notifications
6. SendMessage(shutdown_request) per teammate
7. TeamDelete()
```

A real dispatch (one Task per teammate, all in same message):

```typescript
Task({
  subagent_type: "research-analyst",
  team_name: "research-oauth-login",
  name: "researcher-1",
  prompt: `Topic: OAuth 2.0 best practices and refresh token strategies
    Spec: oauth-login | Path: ./specs/oauth-login/
    Output: ./specs/oauth-login/.research-oauth-patterns.md
    Goal context: [...]
    Instructions:
    1. WebSearch for OAuth refresh-token rotation patterns 2024
    2. Research RFC 6819 + OAuth WG drafts
    3. Identify pitfalls (token reuse, race conditions)
    Do NOT explore codebase — Explore teammates handle that.`,
});

Task({
  subagent_type: "Explore",
  team_name: "research-oauth-login",
  name: "explorer-1",
  prompt: `Analyze codebase for spec: oauth-login
    Output: ./specs/oauth-login/.research-codebase.md
    Find existing auth patterns, dependencies, constraints.`,
});

// + more Task(...) calls in same message for additional topics
```

### Merging Results

After ALL teammates complete, the coordinator reads each `.research-<topic>.md`, synthesizes a unified `research.md` with these sections:

- Executive Summary
- External Research (Best Practices / Prior Art / Pitfalls)
- Codebase Analysis (Existing Patterns / Dependencies / Constraints)
- Related Specs
- Quality Commands
- Verification Tooling
- Feasibility Assessment
- Recommendations for Requirements
- Open Questions
- Sources

Then deletes partial files: `rm ./specs/$spec/.research-*.md`.

## Coordinator Pattern

The implement command is a **coordinator, not an implementer**. Its loop:

```text
1. Read .curdx-state.json (taskIndex, totalTasks, taskIteration)
2. If taskIndex >= totalTasks → emit ALL_TASKS_COMPLETE, STOP
3. Parse current task at taskIndex from tasks.md
4. Detect markers:
   - [P]: build parallel batch (max 5)
   - [VERIFY]: delegate to qa-engineer
   - default: delegate to spec-executor
5. Record TASK_START_SHA = git rev-parse HEAD
6. Delegate via Task tool
7. Wait for response
8. Run 3 verification layers
9. Update state (advance taskIndex)
10. Push if phase boundary, 5+ commits, or awaitingApproval
11. Loop (re-invoke via stop-watcher hook)
```

Integrity rules:

- NEVER lie about completion — verify actual state before claiming done
- NEVER remove tasks — if tasks fail, ADD fix tasks; total task count only increases
- NEVER skip verification layers (all 3 must pass)
- NEVER trust subagent claims without independent verification
- If a continuation prompt fires but no active execution found: stop cleanly, do not fabricate state

## Three Verification Layers

After every `TASK_COMPLETE`, the coordinator runs three layers BEFORE advancing.

### Layer 1: Contradiction Detection

Scans executor output for contradiction patterns alongside `TASK_COMPLETE`:

- "requires manual"
- "cannot be automated"
- "could not complete"
- "needs human"
- "manual intervention"

If any phrase appears with `TASK_COMPLETE`:
- REJECT the completion
- Log: `CONTRADICTION: claimed completion while admitting failure`
- Increment `taskIteration` and retry

### Layer 2: Signal Verification

Verifies the executor explicitly output `TASK_COMPLETE` (or `ALL_TASKS_COMPLETE` for the final task). Silent or partial completion is invalid.

If `TASK_COMPLETE` missing → do NOT advance, increment `taskIteration`, retry.

### Layer 3: Periodic Artifact Review

The coordinator invokes the `spec-reviewer` agent when ANY of these is true:

- **Phase boundary**: phase number changed (1.4 → 2.1).
- **Every 5th task**: `taskIndex > 0 && taskIndex % 5 == 0`.
- **Final task**: `taskIndex == totalTasks - 1`.

Review loop:

```text
Set reviewIteration = 1

WHILE reviewIteration <= 3:
  1. Collect changed files via `git diff --name-only $TASK_START_SHA HEAD`
  2. Read $SPEC_PATH/design.md and requirements.md
  3. Invoke spec-reviewer via Task tool
  4. Parse last line for signal:
     - REVIEW_PASS: log, proceed to State Update
     - REVIEW_FAIL (iteration < 3):
       a. Path A (code-level): generate fix task, insert after current,
          delegate to spec-executor, re-run Layer 3
       b. Path B (spec-level): append suggestions under "## Review Suggestions"
          in .progress.md, break loop
     - REVIEW_FAIL (iteration >= 3):
       Log warning, proceed with best available implementation
     - NEITHER signal (reviewer error):
       Treat as REVIEW_PASS (permissive)
```

## Recovery Loop (Fix Tasks)

When `recoveryMode: true` and a task fails:

```text
1. Parse failure output
   - Match `Task \d+\.\d+:.*FAILED`
   - Extract Error / Attempted fix / Status
2. Check fix limits (maxFixTasksPerOriginal, default 3)
3. Check fix depth (max 2 nesting levels)
4. Generate fix task markdown:
   - [ ] X.Y.N [FIX X.Y] Fix: <error summary>
     - **Do**: Address error
     - **Files**: original task's Files
     - **Verify**: original task's Verify
     - **Commit**: fix(scope): address <errorType> from task X.Y
5. Insert into tasks.md after original task block
6. Update state.fixTaskMap[taskId]:
   { attempts: N, fixTaskIds: [...], lastError: "..." }
7. Increment totalTasks
8. Delegate fix to spec-executor
9. On fix TASK_COMPLETE → retry original task
10. On fix failure → generate fix-of-fix (depth max 2)
```

Recovery sequence example:

```text
Task 1.3 fails → Generate 1.3.1
1.3.1 completes
Retry 1.3 → completes → Success!

# Or with nested fix:
Task 1.3 fails → Generate 1.3.1
1.3.1 fails → Generate 1.3.1.1 (fix for the fix)
1.3.1.1 completes
Retry 1.3.1 → completes
Retry 1.3 → completes → Success!
```

When the budget is exhausted, the coordinator stops with:

```text
ERROR: Max fix attempts (3) reached for task 3.4
Fix attempts: 3.4.1, 3.4.2, 3.4.3
```

## Native Task Sync

Each spec task is mirrored to a Claude Code native task (visible in the UI). The coordinator maintains `nativeTaskMap[taskIndex] → nativeTaskId` in state.

Sync points:

- **Initial setup** — on first invocation, `TaskCreate` per spec task with subject `"1.1 Task title"` (or `"[P] 2.1 Task"`, `"[VERIFY] 1.4 Quality"`).
- **Pre-delegation** — `TaskUpdate(status: "in_progress", activeForm: "Executing 1.1 ...")`.
- **Post-verification** — `TaskUpdate(status: "completed")`.
- **On failure** — `TaskUpdate(subject: "1.3 Task title [retry 2/5]", activeForm: "Retrying ...")`.

Graceful degradation: after 3 consecutive failures of `TaskCreate`/`TaskUpdate`, the coordinator sets `nativeSyncEnabled: false` and continues without sync.

## Hooks Orchestration

Flow ships four hooks bound to Claude Code lifecycle events:

| Hook | Event | Purpose |
| --- | --- | --- |
| `update-spec-index` | `Stop` | Maintains `./specs/.index/` for `/curdx-flow:status` and triage |
| `quick-mode-guard` | `PreToolUse` | Enforces guardrails when `--quick` is active |
| `stop-watcher` | `Stop` | Detects autonomous-loop completion and continues to the next task |
| `load-spec-context` | `SessionStart` | Pre-loads the active spec into Claude Code on session start |

Hooks are TypeScript sources bundled to `.mjs` at build time. They are pure shell-driven scripts — no agent inside the hook itself.

The `stop-watcher` hook is what makes the autonomous loop *autonomous*: when the coordinator's response ends, the hook detects whether `ALL_TASKS_COMPLETE` was emitted; if not, it auto-continues the loop.

Hook errors are logged to `~/.claude/curdx-flow/errors.jsonl`:

```json
{"hookName":"update-spec-index","exitCode":1,"stderr":"...","timestamp":"2026-05-05T12:30:00Z"}
```

## Commit Discipline

**One task = one commit.** Per task, the executor commits:

```bash
git add <task files from Files section>
git add <basePath>/tasks.md          # marked [x]
git add <basePath>/.progress.md      # learnings appended
git commit -m "<exact commit message from task>"
```

The coordinator additionally commits index updates after each state advance:

```bash
git add "$SPEC_PATH/tasks.md" "$SPEC_PATH/.progress.md" ./specs/.index/
git diff --cached --quiet || git commit -m "chore(spec): update progress for task $taskIndex"
```

### Push Strategy

Commits are batched into pushes:

| When to push | Why |
| --- | --- |
| Phase boundary | Stable checkpoint |
| 5+ commits since last push | Avoid losing work |
| Before creating PR (Phase 4/5) | Required for `gh pr create` |
| When `awaitingApproval` is set | User gate requires remote state |

| When NOT to push | Why |
| --- | --- |
| After every individual task | Excessive remote operations |
| Mid-phase with fewer than 5 pending commits | Wait for batch threshold |

### Branch Rules

- NEVER push directly to default branch (main/master)
- Branch is set at `/curdx-flow:start` (new branch / worktree / continue)
- Only push to feature branches: `git push -u origin <branch>`
- If somehow on default branch during execution, STOP and alert user

### State File Protection

`.curdx-state.json` is **never committed**. It carries execution state (taskIndex, iteration counters, fixTaskMap, modificationMap, nativeTaskMap) and would pollute history.

The `spec-executor` is **read-only** for state. Only the coordinator (the implement command loop) writes to it via the deep-merge helper:

```bash
node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/lib/merge-state.mjs" \
     "$SPEC_PATH/.curdx-state.json" \
     '{"taskIndex":5,"taskIteration":1,"globalIteration":17}'
```

The merge preserves all existing fields (source, name, basePath, commitSpec, relatedSpecs, etc.) — never write a new object from scratch.

## State And Persistence

Per spec:

```text
specs/<spec-name>/
├── research.md              # committed
├── requirements.md          # committed
├── design.md                # committed
├── tasks.md                 # committed
├── .curdx-state.json        # gitignored — execution state
└── .progress.md             # gitignored — phase notes, learnings, skill discovery
```

Per repo:

```text
specs/
├── .current-spec            # active spec name (gitignored)
├── .current-epic            # active epic name (gitignored)
└── .index/                  # search index for triage
```

A typical `.curdx-state.json`:

```json
{
  "source": "spec",
  "name": "oauth-login",
  "basePath": "./specs/oauth-login",
  "phase": "execution",
  "taskIndex": 7,
  "totalTasks": 12,
  "taskIteration": 1,
  "maxTaskIterations": 5,
  "globalIteration": 23,
  "maxGlobalIterations": 100,
  "commitSpec": true,
  "quickMode": false,
  "granularity": "fine",
  "discoveredSkills": [
    {"name": "claude-mem:make-plan", "matchedAt": "start", "invoked": true},
    {"name": "pua:pua-loop", "matchedAt": "post-research", "invoked": true}
  ],
  "fixTaskMap": {
    "1.4": {
      "attempts": 1,
      "fixTaskIds": ["1.4.1"],
      "lastError": "TypeError: cannot read property 'sub' of undefined"
    }
  },
  "modificationMap": {},
  "nativeTaskMap": {
    "0": "task-7f3a9c2",
    "1": "task-8e1b4d5"
  },
  "awaitingApproval": false,
  "completed": false
}
```

The four canonical artifacts are the durable record of the change. The state files are working memory.

## The Marketplace Side

The same npm package that delivers the plugin also ships an interactive installer:

| ID | Type | Purpose |
| --- | --- | --- |
| **`curdx-flow`** | plugin | The spec workflow itself. **Always installed.** |
| `claude-mem` | plugin | Cross-session memory. |
| `pua` | plugin | Anti-failure pressure mode that fires on repeated failures. |
| `chrome-devtools-mcp` | plugin | Drive a real Chrome via MCP. |
| `frontend-design` | plugin | Distinctive, production-grade frontend output. |
| `sequential-thinking` | mcp | Step-by-step reasoning MCP server. |
| `context7` | mcp | Live library documentation over MCP. |

The installer reads its descriptor catalog, executes `claude plugin install` and `claude mcp add` on your behalf, and writes a managed block to `~/.claude/CLAUDE.md` so Claude Code knows what is installed. Everything is idempotent — run again any time to reconcile drift.

The managed block is bracketed:

```markdown
<!-- BEGIN @curdx/flow v1 -->
... installer-managed manifest ...
<!-- END @curdx/flow v1 -->
```

Content outside the markers is preserved verbatim. Pass `--no-claude-md` (or set `CURDX_FLOW_NO_CLAUDE_MD=1`) to opt out.

## Why It Exists

Claude Code is fast, but on real projects it has predictable failure modes:

- It skips tests unless you keep telling it to write them.
- It loses context between sessions and inside very long sessions.
- It produces inconsistent output across runs of the same task.
- It does not push back on under-specified requirements — it guesses, and you discover the mismatch in code review.

Most workflow frameworks address this by stacking more agents. Flow makes a different trade: write the contract first, run one specialist per phase with fresh context, and let the autonomous loop handle the boring middle once humans have signed off on the plan.

The bet:

1. **Specs are the contract, not the prompt.** Every change has `research.md` → `requirements.md` → `design.md` → `tasks.md` written before any implementation begins. They live in your repo. Reviewers can read them. Future-you can read them.
2. **Subagents are specialized, not stacked.** One agent per phase. Each gets a fresh context window. No multi-agent orchestration salad.
3. **The loop runs itself.** Once `tasks.md` is approved, `/curdx-flow:implement` executes the entire task list autonomously, with verification gates between every task. You walk away. You come back. You read the diff.
4. **Installer and plugin in one package.** No separate marketplace registration, no scaffolding, no per-project config. `npx @curdx/flow` once.

> Claude Code is the engine. CurdX Flow is the chassis.

## Practical Operating Advice

- Treat each pause as a real review checkpoint. The cost of redirecting at `requirements.md` is tiny compared to redirecting at `tasks.md`.
- Read `tasks.md` carefully before `/curdx-flow:implement`. Once the loop starts, it commits per task — reverting is git work, not a one-key undo.
- If you notice the executor drifting, run `/curdx-flow:cancel`, fix the spec, and resume. Do not let it limp through 20 tasks heading the wrong direction.
- Keep specs small enough that you can keep the whole tree in your head. Anything bigger usually wants `/curdx-flow:triage`.
- Use the `analyze` CLI after a multi-day project. It surfaces hook failures, schema drift, and slash-command/agent dispatch heat you would otherwise never see.
- Treat retry-budget exhaustion as a signal, not a quota. The loop is designed to halt when it cannot make safe progress.
