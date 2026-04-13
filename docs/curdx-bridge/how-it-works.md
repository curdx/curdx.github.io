# How It Works

CurdX Bridge is built around one principle: keep one accountable primary agent while still using specialist models in parallel.

## Split-Pane Architecture

Each provider runs in its own terminal pane. Claude is the operator-facing pane, while the other panes are specialist workers that can be observed directly.

- **Claude** owns the conversation, plans the next move, and integrates replies.
- **Codex** is usually the reviewer or execution peer.
- **Gemini** is usually the inspiration source.
- **OpenCode** adds another implementation perspective when needed.

Unlike a hidden background integration, this layout makes the system legible. You can see whether a provider is thinking, stuck, or responding off-target.

## Communication Flow

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 280" role="img" aria-label="Async request and response flow in CurdX Bridge" style="max-width: 100%; height: auto;">
<defs>
<marker id="flow-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="260" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<rect x="34" y="88" width="140" height="96" rx="18" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 1.5;" />
<rect x="224" y="62" width="188" height="148" rx="18" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<rect x="470" y="62" width="188" height="148" rx="18" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<rect x="714" y="88" width="220" height="96" rx="18" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 1.5;" />

<text x="71" y="126" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">You</text>
<text x="51" y="154" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Natural-language</text>
<text x="72" y="174" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">request</text>

<text x="283" y="104" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">Claude</text>
<text x="251" y="136" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Packages context, chooses</text>
<text x="256" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">provider, sends `cxb-ask`</text>
<text x="270" y="184" style="fill: var(--vp-c-brand-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">Main pane stays responsive</text>

<text x="524" y="104" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">Provider Pane</text>
<text x="507" y="136" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Codex, Gemini, or OpenCode</text>
<text x="505" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">processes request asynchronously</text>
<text x="520" y="184" style="fill: var(--vp-c-green-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">You can watch the pane work</text>

<text x="748" y="126" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Merged Reply</text>
<text x="740" y="154" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Claude retrieves result</text>
<text x="737" y="174" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">via `cxb-pend` reply path</text>

<path d="M174 136 L214 136" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow)" />
<path d="M412 136 L460 136" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow)" />
<path d="M714 192 C648 238, 528 240, 414 204" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3; stroke-dasharray: 8 7;" marker-end="url(#flow-arrow)" />
<path d="M412 92 C516 26, 676 28, 814 82" style="fill: none; stroke: var(--vp-c-divider); stroke-width: 2; stroke-dasharray: 5 6;" />
<text x="486" y="40" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">Async request</text>
<text x="500" y="246" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">Async response</text>
</svg>
</div>

When you say "let Codex review this", the flow is:

1. Claude interprets your intent and selects the appropriate provider.
2. Claude sends a structured request through the async ask path.
3. The provider works in its own pane without blocking your main conversation.
4. Claude later retrieves the reply through the pending-reply path and integrates it.
5. You continue talking to Claude, not to the transport layer.

## Why The Async Model Matters

- Providers do not block one another.
- Claude can keep the high-level thread coherent while side work continues.
- You can issue sequential or overlapping requests without losing observability.
- Each provider retains its own conversational context over time.

This is the difference between "I asked another model for help" and "I am running a visible multi-agent session."

## Role System

CurdX Bridge is easier to operate when you treat providers as roles, not interchangeable models.

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 400" role="img" aria-label="CurdX Bridge role system visualization" style="max-width: 100%; height: auto;">
<defs>
<marker id="role-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="380" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<circle cx="490" cy="196" r="74" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<text x="452" y="186" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">Claude</text>
<text x="438" y="214" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Coordinator</text>

<rect x="84" y="54" width="230" height="94" rx="18" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<text x="112" y="92" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Designer</text>
<text x="112" y="118" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Defines approach, owns the final answer</text>

<rect x="662" y="54" width="238" height="94" rx="18" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<text x="692" y="92" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Reviewer</text>
<text x="692" y="118" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Usually Codex, scores plans and code</text>

<rect x="78" y="250" width="248" height="94" rx="18" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<text x="108" y="288" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Inspiration</text>
<text x="108" y="314" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Usually Gemini, generates options not authority</text>

<rect x="654" y="250" width="256" height="94" rx="18" style="fill: var(--vp-c-red-soft); stroke: var(--vp-c-red-1); stroke-width: 2;" />
<text x="684" y="288" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Collaborator</text>
<text x="684" y="314" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">OpenCode or another execution-side partner</text>

<path d="M314 120 L405 164" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#role-arrow)" />
<path d="M662 120 L575 164" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#role-arrow)" />
<path d="M326 278 L411 232" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#role-arrow)" />
<path d="M654 278 L569 232" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#role-arrow)" />
</svg>
</div>

| Role | Default provider | Responsibility |
|------|------------------|----------------|
| **Designer** | Claude | Interprets the user request, creates plans, owns decisions |
| **Reviewer** | Codex | Runs scored review gates and surfaces concrete defects |
| **Inspiration** | Gemini | Produces alternatives, naming, and architecture options |
| **Collaborator** | OpenCode | Adds an extra implementation or reasoning perspective |
| **Executor** | Claude or Codex | Performs concrete file or testing actions in AutoFlow |

### Role Assignment In `CLAUDE.md`

Roles are typically declared in your project-level `CLAUDE.md`:

```markdown
| Role | Provider | Description |
|------|----------|-------------|
| designer | claude | Primary planner and orchestrator |
| inspiration | gemini | Brainstorming and alternatives |
| reviewer | codex | Scored review gate |
| executor | codex | File operations and test execution |
```

Changing the provider in that table changes how the orchestration behaves. The role name is the contract; the provider is the implementation choice.

## Review Framework

CurdX Bridge uses explicit rubrics so "looks good" is not the only gate.

### Rubric A: Plan Review

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| Clarity | 20% | Another developer can follow the plan without back-and-forth |
| Completeness | 25% | Requirements, edge cases, and deliverables are covered |
| Feasibility | 25% | The plan can be executed in the current repo and tooling |
| Risk Assessment | 15% | Risks are named with concrete mitigation ideas |
| Requirement Alignment | 15% | The plan maps back to the user request |

### Rubric B: Code Review

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| Correctness | 25% | Behavior matches the approved plan |
| Security | 15% | Validation, secrets, and unsafe patterns are handled well |
| Maintainability | 20% | Naming, structure, and conventions remain healthy |
| Performance | 10% | No obvious avoidable regressions |
| Test Coverage | 15% | Changed paths are verified by tests where needed |
| Plan Adherence | 15% | Implementation still matches the agreed design |

### Pass Criteria

- Weighted score must be at least `7.0`
- No single dimension may be `3` or lower
- Failed reviews can be revised and resubmitted, up to the configured limit

## Session Management

Every session keeps project-local state in `.curdx/`, including things like current execution state and resumable context.

Typical lifecycle:

- `curdx [providers...]` starts a fresh split-pane session
- `curdx -r` resumes the last session
- `curdx kill` stops all panes
- `curdx kill codex -f` force-restarts only the noisy or stuck provider

## Practical Operating Advice

- Keep Claude responsible for the final recommendation even when another provider produced the best raw answer.
- Use review requests with constraints. "Check for migration safety and rollback risk" gives better results than "review this".
- Reassign roles only when you have a reason. Random provider swaps usually reduce consistency.
- Watch the side panes. The best debugging signal is often seeing where a provider got confused.
