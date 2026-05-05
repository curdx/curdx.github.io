# Subagents

CurdX Flow ships nine specialist subagents. Each one has a narrow responsibility, runs in its own context window, and is invoked automatically by the coordinator commands. You do not call them directly — but understanding what they do helps you write better goals and review their output.

## Why Specialist Subagents

Most multi-agent frameworks layer many generic agents over a single conversation. The result is more tokens, longer waits, and a pipeline that is hard to audit when something goes wrong.

Flow makes a different bet: **one specialist per phase, fresh context each time.** Each subagent gets only the inputs it needs (goal, prior artifacts, relevant skills), produces exactly one output, and then exits. No multi-agent orchestration salad.

## Subagent Pipeline

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 280" role="img" aria-label="CurdX Flow subagent pipeline" style="max-width: 100%; height: auto;">
<defs>
<marker id="agent-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="260" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />

<rect x="34" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<rect x="220" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<rect x="406" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<rect x="592" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<rect x="778" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-red-soft); stroke: var(--vp-c-red-1); stroke-width: 2;" />

<text x="40" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">research-analyst</text>
<text x="62" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">parallel team</text>
<text x="62" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ research.md</text>

<text x="240" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">product-manager</text>
<text x="248" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">US, FR, NFR</text>
<text x="240" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ requirements.md</text>

<text x="416" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">architect-reviewer</text>
<text x="426" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">decisions, risks</text>
<text x="442" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ design.md</text>

<text x="624" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">task-planner</text>
<text x="624" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">[VERIFY] gates</text>
<text x="624" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ tasks.md</text>

<text x="794" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">spec-executor</text>
<text x="800" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">implement, verify,</text>
<text x="800" y="172" style="fill: var(--vp-c-red-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">commit, advance</text>

<path d="M204 140 L216 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#agent-arrow)" />
<path d="M390 140 L402 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#agent-arrow)" />
<path d="M576 140 L588 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#agent-arrow)" />
<path d="M762 140 L774 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#agent-arrow)" />

<text x="40" y="58" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">Five phase owners. Each writes one artifact and exits.</text>
<text x="40" y="220" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">Auxiliary subagents (spec-reviewer, qa-engineer, refactor-specialist, triage-analyst) support the pipeline.</text>
</svg>
</div>

## The Nine Subagents

### Phase Owners

These five own a phase end-to-end and produce a canonical artifact.

| Subagent | Phase | Output |
| --- | --- | --- |
| [research-analyst](/curdx-flow/agents/research-analyst) | Research | `research.md` |
| [product-manager](/curdx-flow/agents/product-manager) | Requirements | `requirements.md` |
| [architect-reviewer](/curdx-flow/agents/architect-reviewer) | Design | `design.md` |
| [task-planner](/curdx-flow/agents/task-planner) | Tasks | `tasks.md` |
| [spec-executor](/curdx-flow/agents/spec-executor) | Implement | code, tests, commits |

### Auxiliary

These four support the pipeline at quality gates and during epic decomposition.

| Subagent | Role |
| --- | --- |
| `spec-reviewer` | Read-only reviewer that validates artifacts against type-specific rubrics. Outputs `REVIEW_PASS` or `REVIEW_FAIL`. |
| `qa-engineer` | Runs verification commands at quality gates. Outputs `VERIFICATION_PASS` or `VERIFICATION_FAIL`. |
| `refactor-specialist` | Updates spec files section-by-section after execution surfaces design drift. Used by `/curdx-flow:refactor`. |
| `triage-analyst` | Decomposes a large feature into multiple dependency-aware specs (an epic graph). Used by `/curdx-flow:triage`. |

## Recommended Mental Model

Think of the pipeline like a small team:

1. The **research analyst** reads everything and writes the briefing.
2. The **product manager** turns the briefing into testable requirements.
3. The **architect** decides how the requirements will be built.
4. The **task planner** breaks the design into a checklist with verification gates.
5. The **executor** runs the checklist and commits the code.

The auxiliary agents are quality and process — they review, verify, and reshape the spec when reality intervenes.

## Common Workflows

### A normal spec walkthrough

```text
/curdx-flow:start         # interview + research-analyst (parallel team)
/curdx-flow:requirements  # product-manager
/curdx-flow:design        # architect-reviewer
/curdx-flow:tasks         # task-planner
/curdx-flow:implement     # spec-executor (autonomous loop with qa-engineer at every VERIFY gate)
```

### When the spec needs revision after execution starts

```text
/curdx-flow:cancel        # halt the loop
/curdx-flow:refactor      # refactor-specialist walks requirements → design → tasks
/curdx-flow:implement     # resume
```

### Decomposing a feature too big for one spec

```text
/curdx-flow:triage        # triage-analyst produces epic.md and child specs
/curdx-flow:start         # work the first child spec normally
```

## Power User Tips

- Ask for the *outcome* in plain English. The coordinator picks the right subagent.
- If a subagent's output disappoints, the issue is usually upstream. Bad research → bad requirements → bad design.
- Use `/curdx-flow:refactor` rather than editing artifacts by hand. The auxiliary `refactor-specialist` walks the chain consistently.
- Keep tasks fine-grained. The `spec-executor` is happiest when each task maps to a single, verifiable change.
