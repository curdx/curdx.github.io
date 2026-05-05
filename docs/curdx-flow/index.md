# CurdX Flow

Spec-driven development for Claude Code, with autonomous task execution.

## What Is CurdX Flow?

`@curdx/flow` is a single npm package that delivers two products built around Claude Code:

1. **A spec-driven development plugin.** Provides the `/curdx-flow:*` slash commands. Turns an unstructured feature request into a research report, requirements document, technical design, and a task list — then executes the task list autonomously in fresh contexts, one task at a time, with verification gates between every task.
2. **A curated plugin and MCP marketplace.** A single interactive installer that picks, installs, updates, and uninstalls a complementary tool set for Claude Code (cross-session memory, browser automation, live documentation lookup, and more). It maintains a managed manifest in `~/.claude/CLAUDE.md` so Claude knows what is available.

The plugin and the installer ship in the same npm package and share a single version number. Run `npx @curdx/flow` once and you have a fully wired Claude Code environment.

```text
You:    /curdx-flow:start "Add OAuth login with token refresh"
flow:   ✓ Interview: 3 clarifying questions answered (60s)
flow:   ✓ Parallel research team dispatched (3 specialist agents)
        → research.md  (148 lines, 9 references, 4 risks identified)
You:    review · approve  →  /curdx-flow:requirements
flow:   ✓ product-manager agent
        → requirements.md  (US-1..US-9, FR-1..FR-23, NFR-1..NFR-12)
You:    review · approve  →  /curdx-flow:design
flow:   ✓ architect-reviewer
        → design.md  (9 decisions, 7 risks, component diagram)
You:    review · approve  →  /curdx-flow:tasks
flow:   ✓ task-planner
        → tasks.md  (12 tasks across 4 phases, with VERIFY gates)
You:    review · approve  →  /curdx-flow:implement
flow:   ⟳ task 1.1 → verify → commit ✓
        ⟳ task 1.2 → verify → commit ✓
        …
        ✓ ALL_TASKS_COMPLETE  (12/12 tasks, 47 commits, all green)
```

## Workflow At A Glance

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 280" role="img" aria-label="CurdX Flow five-phase workflow" style="max-width: 100%; height: auto;">
<defs>
<marker id="flow-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="260" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />

<rect x="34" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<rect x="220" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<rect x="406" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<rect x="592" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<rect x="778" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-red-soft); stroke: var(--vp-c-red-1); stroke-width: 2;" />

<text x="64" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Research</text>
<text x="62" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">parallel team</text>
<text x="62" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ research.md</text>

<text x="232" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Requirements</text>
<text x="248" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">product-manager</text>
<text x="240" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ requirements.md</text>

<text x="448" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Design</text>
<text x="426" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">architect-reviewer</text>
<text x="442" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ design.md</text>

<text x="638" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Tasks</text>
<text x="624" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">task-planner</text>
<text x="624" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ tasks.md</text>

<text x="804" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Implement</text>
<text x="804" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">spec-executor</text>
<text x="800" y="172" style="fill: var(--vp-c-red-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">autonomous loop</text>

<path d="M204 140 L216 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow)" />
<path d="M390 140 L402 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow)" />
<path d="M576 140 L588 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow)" />
<path d="M762 140 L774 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow)" />

<text x="46" y="220" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">human approves between phases</text>
<text x="788" y="220" style="fill: var(--vp-c-red-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">runs to completion</text>

<text x="40" y="62" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">Five phases. One artifact each. One subagent each.</text>
</svg>
</div>

The workflow has **five phases**. Each phase is owned by a specialist subagent, produces exactly one Markdown artifact, and pauses for human approval before the next phase begins. The final phase, `implement`, runs an autonomous loop — execute task, verify, commit, advance — until every task in `tasks.md` is checked off.

| Phase | Command | Subagent | Output |
| --- | --- | --- | --- |
| Research | `/curdx-flow:research` | research-analyst (parallel team) | `research.md` |
| Requirements | `/curdx-flow:requirements` | product-manager | `requirements.md` |
| Design | `/curdx-flow:design` | architect-reviewer | `design.md` |
| Tasks | `/curdx-flow:tasks` | task-planner | `tasks.md` |
| Implement | `/curdx-flow:implement` | spec-executor (autonomous loop) | code, tests, commits |

All artifacts live under `specs/<spec-name>/` in your repository. They are plain Markdown, version-controlled, and survive across sessions.

## When It Works Best

CurdX Flow pays off most when:

- **You ship code others will read.** Specs become a paper trail your reviewers and future self can audit.
- **Your codebase has conventions and constraints.** The research and design phases force these to surface before code is written, not after review.
- **You context-switch.** Every task starts with a clean context window, so you do not have to manually re-explain the project after a long pause or a rate-limit reset.
- **You delegate, then come back.** The autonomous loop runs unattended; you review the diff when it finishes.

It is less useful for one-off scripts or five-line tweaks. For those, plain Claude Code is faster.

## Key Features

**Five-phase spec workflow** turns an unstructured request into research, requirements, design, and tasks before any code is written. Every phase is reviewable Markdown.

**Autonomous execution loop** runs every approved task end-to-end with verification gates. Walk away. Come back. Read the diff.

**Specialist subagents** assign a single owner to each phase. Every subagent runs in a fresh context window so reasoning stays sharp.

**Quality gates** with `[VERIFY]` tasks run typecheck, tests, and smoke checks between work units. A weak step does not silently pass.

**Skill auto-discovery** scans your installed Claude Code skills, semantically matches them to the goal, and pre-loads the relevant ones into the active context.

**Curated marketplace** installs `claude-mem`, `chrome-devtools-mcp`, `context7`, and other proven tools through a single interactive picker. The same package, the same version, one command.

**Plugin observability** ships an `analyze` CLI that parses session jsonl and produces a 7-section markdown report covering hook failures, command frequency, agent dispatch heat, spec funnel, and schema drift.

## A Typical Operator Workflow

1. Run `npx @curdx/flow` once to install the bundled plugin and pick optional marketplace items.
2. Inside a project, type `/curdx-flow:start` and describe the feature in plain English.
3. Approve the research output, then advance through requirements, design, and tasks.
4. Hit `/curdx-flow:implement` and walk away while the loop ticks through every task.
5. Come back, read the diff, open the PR.

## Power User Tips

- Commit the four canonical artifacts (`research.md`, `requirements.md`, `design.md`, `tasks.md`). Reviewers will thank you.
- Use `--quick` only on low-risk specs you can fully review at the end. The pause-for-approval gates exist for a reason.
- Pass `--tasks-size coarse` for quick prototypes, `fine` for production work where each task should map to one verifiable step.
- Run `/curdx-flow:status` before resuming. It tells you where every spec is in the workflow.
- Use `/curdx-flow:triage` for features that obviously need multiple specs. It produces an epic with declared dependencies.
- If a task fails verification repeatedly, fix the underlying issue rather than retrying. The loop halts on purpose.

## Quick Links

- [Getting Started](/curdx-flow/getting-started) for install, first spec, and the five-minute walkthrough
- [How It Works](/curdx-flow/how-it-works) for the spec model, subagents, and autonomous loop architecture
- [Configuration](/curdx-flow/configuration) for flags, environment variables, state files, and the managed CLAUDE.md block
- [Commands](/curdx-flow/commands) for every slash command and CLI invocation
- [Subagents](/curdx-flow/agents/) for the nine specialist agents that own each phase
- [Troubleshooting](/curdx-flow/troubleshooting) for common failure modes and recovery steps
