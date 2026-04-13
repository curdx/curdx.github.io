# Skills

Skills are the operational layer behind natural-language orchestration in CurdX Bridge. They turn a request like "let Codex review this plan" into a repeatable workflow with clear responsibilities and state transitions.

## Why Skills Matter

Without skills, a multi-provider session becomes ad hoc very quickly. Skills give Claude a structured way to:

- send async requests
- run planning loops
- build execution artifacts
- enforce review gates
- advance automated task pipelines

Most users never need to type a skill name manually, but understanding the workflow helps you ask for better outcomes.

## Skill Families

### Communication

| Skill | Purpose |
|-------|---------|
| [cxb-ask](/curdx-bridge/skills/cxb-ask) | Send an async request to a provider |

### Planning And Execution

| Skill | Purpose |
|-------|---------|
| [cxb-plan](/curdx-bridge/skills/cxb-plan) | Build a reviewed implementation plan |
| [cxb-task-plan](/curdx-bridge/skills/cxb-task-plan) | Convert an approved plan into task artifacts |
| [cxb-task-run](/curdx-bridge/skills/cxb-task-run) | Execute the next task step through AutoFlow |

### Quality

| Skill | Purpose |
|-------|---------|
| [cxb-review](/curdx-bridge/skills/cxb-review) | Run dual assessment for a step or a whole task |

## Skill Workflow Pipeline

<div style="margin: 1rem 0 1.5rem;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 280" role="img" aria-label="Skill workflow pipeline from planning to review" style="max-width: 100%; height: auto;">
    <defs>
      <marker id="skills-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
      </marker>
    </defs>
    <rect x="10" y="10" width="940" height="260" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
    <rect x="46" y="88" width="176" height="104" rx="18" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
    <rect x="276" y="88" width="182" height="104" rx="18" style="fill: color-mix(in srgb, var(--vp-c-green-1) 14%, transparent); stroke: var(--vp-c-green-1); stroke-width: 2;" />
    <rect x="512" y="88" width="182" height="104" rx="18" style="fill: color-mix(in srgb, var(--vp-c-yellow-1) 18%, transparent); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
    <rect x="748" y="88" width="164" height="104" rx="18" style="fill: color-mix(in srgb, var(--vp-c-red-1) 12%, transparent); stroke: var(--vp-c-red-1); stroke-width: 2;" />

    <text x="90" y="128" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">cxb-plan</text>
    <text x="84" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Clarify, design,</text>
    <text x="93" y="176" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">score the plan</text>

    <text x="302" y="128" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">cxb-task-plan</text>
    <text x="319" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Create state,</text>
    <text x="307" y="176" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">todo, and logs</text>

    <text x="552" y="128" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">cxb-task-run</text>
    <text x="548" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Execute one step,</text>
    <text x="540" y="176" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">test, and advance</text>

    <text x="779" y="128" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">cxb-review</text>
    <text x="786" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">PASS or FIX</text>
    <text x="765" y="176" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">with dual review</text>

    <path d="M222 140 L266 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#skills-arrow)" />
    <path d="M458 140 L502 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#skills-arrow)" />
    <path d="M694 140 L738 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#skills-arrow)" />
    <path d="M830 202 C800 240, 592 252, 366 226 C240 212, 164 206, 134 200" style="fill: none; stroke: var(--vp-c-divider); stroke-width: 2; stroke-dasharray: 6 6;" marker-end="url(#skills-arrow)" />
    <text x="390" y="248" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">If review fails, fix items loop back into planning or execution</text>
  </svg>
</div>

## Recommended Mental Model

Think of the skill stack like this:

1. `cxb-plan` decides what should be done.
2. `cxb-task-plan` converts that decision into durable execution state.
3. `cxb-task-run` performs the next unit of work.
4. `cxb-review` decides whether the work passes or needs correction.

`cxb-ask` is the transport layer that makes all of the provider collaboration possible.

## Common Workflows

### Plan before coding

- Ask Claude to draft a plan
- Have Codex review the plan
- Only then start implementation

### Break a feature into resumable steps

- Run the planning workflow
- Generate `.curdx/` artifacts
- Resume later with `curdx -r` and continue execution

### Use Gemini safely

- Ask Gemini for options
- Require Claude to classify each suggestion as adopt, adapt, or discard
- Send the final chosen direction to Codex for review

## Power User Tips

- Ask for the skill outcome, not just the skill name. "Create a reviewed task plan for this migration" is better than "run cxb-task-plan".
- Keep review binary. Ask whether the result is ready to pass or what exact fix items remain.
- Use the task pipeline for larger work only. Small edits often do not need full AutoFlow.
