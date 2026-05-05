# How It Works

CurdX Flow is built around one principle: **the spec is the contract, not the prompt.** Before any code is written, the work is described in four versioned Markdown files. Then a single specialist agent executes one task at a time, with verification between every task.

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
<text x="64" y="266" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">pick next task → fresh context → implement → verify gate → commit → mark [x] → repeat until ALL_TASKS_COMPLETE</text>

<rect x="40" y="320" width="890" height="76" rx="16" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<text x="64" y="352" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">specs/&lt;name&gt;/  + .curdx-state.json + .progress.md</text>
<text x="64" y="376" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">artifacts committed to git · state and progress gitignored · resumable across sessions</text>

<path d="M260 144 L286 144" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow)" />
<path d="M610 184 L610 204" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow)" />
<path d="M484 296 L484 316" style="fill: none; stroke: var(--vp-c-divider); stroke-width: 2; stroke-dasharray: 4 5;" />
</svg>
</div>

## Why Subagents

Most multi-agent frameworks add agents and orchestration as you add features. The result is more tokens spent, longer wait times, and a harder-to-audit pipeline.

Flow makes a different bet: **one specialist per phase, fresh context each time.**

- The `product-manager` does not see the implementation details. It only sees the goal and research output.
- The `architect-reviewer` does not see the research raw notes. It only sees requirements.
- The `spec-executor` does not load the entire spec into one prompt. It pulls only the task description, design excerpt, and relevant files for that single task.

This keeps every phase reasoning sharp and prevents prompt bloat that degrades large-context models.

## The Autonomous Execution Loop

After `tasks.md` is approved, `spec-executor` takes over:

```text
loop:
  pick next unchecked task from tasks.md
  open fresh context with task description, design.md excerpt, relevant files
  implement → run verification command → commit on success
  mark task [x] in tasks.md
  if verification fails → retry up to N times → if still failing, halt and surface
  repeat until ALL_TASKS_COMPLETE
```

The loop has three properties that make it trustworthy:

1. **Fresh context per task.** Long sessions and rate-limit resets do not pollute later tasks.
2. **Verification before commit.** A `[VERIFY]` task fails the loop, not the previous task. Mistakes are caught early.
3. **Halt on persistent failure.** If retries exhaust, the loop stops. You fix the underlying issue and resume; flow does not silently paper over real failures.

## Verification Layers

`tasks.md` interleaves implementation tasks with `[VERIFY]` tasks. The verification step runs real commands — typecheck, unit tests, smoke tests, linters — not a "looks good to me" model judgment.

Typical verification stack (defined per project, configurable):

| Layer | Command | Runs after |
| --- | --- | --- |
| Type safety | `npm run typecheck` | every code change |
| Unit tests | `npm test` | every implementation task |
| Bundle / build | `npm run build` | structural changes |
| Smoke / e2e | project-defined | phase boundaries |

If a `[VERIFY]` step fails, the executor reports it as `VERIFICATION_FAIL`. The retry budget kicks in. After the budget is exhausted, the loop halts.

## Skill Auto-Discovery

Flow scans the active environment for installed Claude Code skills (your project skills, `.agents/skills/`, plugin skills) and matches them semantically against the goal. Relevant skills are pre-loaded into the active context before each subagent runs.

The detection happens twice:

1. **Pass 1** — at `/curdx-flow:start`, against just the goal text.
2. **Pass 2** — after research completes, against goal + research executive summary. This catches skills that only become relevant once the problem is better understood.

Both passes record matches in `.progress.md` so you can see what got loaded and why.

## Hooks

Flow ships four hooks that run at Claude Code lifecycle events:

| Hook | Event | Purpose |
| --- | --- | --- |
| `update-spec-index` | `Stop` | Maintains the spec index for `/curdx-flow:status` and triage |
| `quick-mode-guard` | `PreToolUse` | Enforces guardrails when `--quick` is active |
| `stop-watcher` | `Stop` | Detects autonomous-loop completion and continues to the next task |
| `load-spec-context` | `SessionStart` | Pre-loads the active spec into Claude Code on session start |

Hooks are TypeScript sources bundled to `.mjs` at build time. They are pure shell-driven scripts — no agent inside the hook itself.

## State And Persistence

Per spec:

```text
specs/<spec-name>/
├── research.md              # committed
├── requirements.md          # committed
├── design.md                # committed
├── tasks.md                 # committed
├── .curdx-state.json        # gitignored — current phase, taskIndex, iteration
└── .progress.md             # gitignored — phase notes, skill discovery log
```

Per repo:

```text
specs/
├── .current-spec            # active spec name (gitignored)
├── .current-epic            # active epic name (gitignored)
└── .index/                  # search index for triage
```

The four artifacts are the durable record of the change. The state files are working memory.

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

## Why It Exists

Claude Code is fast, but on real projects it has predictable failure modes:

- It skips tests unless you keep telling it to write them.
- It loses context between sessions and inside very long sessions.
- It produces inconsistent output across runs of the same task.
- It does not push back on under-specified requirements — it guesses, and you discover the mismatch in code review.

Most workflow frameworks address this by stacking more agents. Flow makes a different trade: write the contract first, run one specialist per phase with fresh context, and let the autonomous loop handle the boring middle once humans have signed off on the plan.

> Claude Code is the engine. CurdX Flow is the chassis.

## Practical Operating Advice

- Treat each pause as a real review checkpoint. The cost of redirecting at `requirements.md` is tiny compared to redirecting at `tasks.md`.
- Read `tasks.md` carefully before `/curdx-flow:implement`. Once the loop starts, it commits per task — reverting is git work, not a one-key undo.
- If you notice the executor drifting, run `/curdx-flow:cancel`, fix the spec, and resume. Do not let it limp through 20 tasks heading the wrong direction.
- Keep specs small enough that you can keep the whole tree in your head. Anything bigger usually wants `/curdx-flow:triage`.
- Use the `analyze` CLI after a multi-day project. It surfaces hook failures and schema drift you would otherwise never see.
