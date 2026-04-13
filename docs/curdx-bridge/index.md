# CurdX Bridge

Multi-AI split-pane terminal for Claude, Codex, Gemini, and OpenCode.

![CurdX Bridge screenshot](/images/curdx-bridge/screenshot.png)

## What Is CurdX Bridge?

CurdX Bridge turns a single terminal window into a coordinated multi-agent workspace. You stay in Claude as the main conversation pane, then ask for a review, alternative design, or implementation support in plain English. Claude routes the request, waits for the async reply, and brings the answer back into the same conversation.

That means:

- No manual tab juggling between CLIs
- No copy-pasting the same context into four tools
- No guessing which model should handle planning, review, or brainstorming
- Full visibility because every provider still works in its own pane

## Architecture At A Glance

<div style="margin: 1rem 0 1.5rem;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 430" role="img" aria-label="CurdX Bridge architecture overview" style="max-width: 100%; height: auto;">
    <defs>
      <marker id="arch-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
      </marker>
    </defs>
    <rect x="8" y="8" width="904" height="414" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
    <text x="40" y="48" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">CurdX Bridge session</text>
    <text x="40" y="76" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">One terminal, one conversation surface, multiple live provider panes.</text>

    <rect x="42" y="106" width="390" height="268" rx="20" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
    <text x="68" y="148" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">Claude</text>
    <text x="68" y="176" style="fill: var(--vp-c-text-2); font: 500 14px ui-sans-serif, system-ui, sans-serif;">Main pane</text>
    <text x="68" y="214" style="fill: var(--vp-c-text-1); font: 400 15px ui-sans-serif, system-ui, sans-serif;">You type here.</text>
    <text x="68" y="240" style="fill: var(--vp-c-text-1); font: 400 15px ui-sans-serif, system-ui, sans-serif;">Claude orchestrates roles, packages context,</text>
    <text x="68" y="264" style="fill: var(--vp-c-text-1); font: 400 15px ui-sans-serif, system-ui, sans-serif;">sends async requests, and merges responses.</text>

    <rect x="494" y="106" width="384" height="78" rx="16" style="fill: color-mix(in srgb, var(--vp-c-green-1) 14%, transparent); stroke: var(--vp-c-green-1); stroke-width: 2;" />
    <rect x="494" y="201" width="384" height="78" rx="16" style="fill: color-mix(in srgb, var(--vp-c-yellow-1) 18%, transparent); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
    <rect x="494" y="296" width="384" height="78" rx="16" style="fill: color-mix(in srgb, var(--vp-c-red-1) 12%, transparent); stroke: var(--vp-c-red-1); stroke-width: 2;" />

    <text x="520" y="137" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Codex</text>
    <text x="520" y="162" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Scored review, implementation, deeper code reasoning</text>

    <text x="520" y="232" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Gemini</text>
    <text x="520" y="257" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Alternative designs, naming ideas, option generation</text>

    <text x="520" y="327" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">OpenCode</text>
    <text x="520" y="352" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Additional implementation perspective on demand</text>

    <rect x="294" y="28" width="336" height="46" rx="12" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 1.5;" />
    <text x="318" y="57" style="fill: var(--vp-c-text-1); font: 600 16px ui-sans-serif, system-ui, sans-serif;">Async router, session state, role policy, AutoFlow</text>

    <path d="M432 155 L484 145" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow)" />
    <path d="M432 240 L484 240" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow)" />
    <path d="M432 326 L484 336" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow)" />
  </svg>
</div>

## When It Works Best

CurdX Bridge is most valuable when you want one agent to stay accountable while still using specialists:

- Feature work where Claude owns the end-to-end implementation and Codex acts as a review gate
- Refactors where Gemini can generate alternatives without taking over the final decision
- Complex debugging sessions where you want parallel viewpoints but a single operator interface
- Long-running tasks where `-r` session resume matters more than one-shot prompts

## Key Features

**Natural-language orchestration** lets you say things like "have Codex score this plan" or "ask Gemini for three migration options" without leaving the Claude pane.

**Role-based collaboration** separates planning, inspiration, review, and execution so each provider has a defined job instead of overlapping randomly.

**Observable async execution** keeps provider panes visible. You can watch work in real time instead of waiting on a hidden background call.

**Quality gates** enforce scored review loops for plans and code. A weak answer does not silently pass just because a model sounds confident.

**Session persistence** restores pane state and prior context with `curdx -r`, which matters for multi-step work that spans hours or days.

**Cross-platform support** targets macOS, Linux, and Windows through WSL, making the same operator workflow portable.

## A Typical Operator Workflow

1. Launch `curdx` with the providers you want active.
2. Explain the task to Claude in the main pane.
3. Ask Claude to delegate planning, brainstorming, or review as needed.
4. Watch the side panes while Claude waits for async responses.
5. Accept the merged result, then continue iterating in the same session.

## Power User Tips

- Start with fewer providers for focused tasks. `curdx claude codex` is often enough for implementation plus review.
- Use Gemini intentionally for divergent thinking, not as a final authority on code correctness.
- Keep Claude accountable. Ask it to explain why it accepted or rejected another provider's suggestion.
- Use `curdx -r` for work that spans multiple commits so each provider keeps useful context.
- If a provider goes noisy or drifts off task, restart only that provider instead of throwing away the whole session.

## Quick Links

- [Getting Started](/curdx-bridge/getting-started) for install, first launch, and initial workflows
- [How It Works](/curdx-bridge/how-it-works) for architecture, communication, roles, and review rules
- [Configuration](/curdx-bridge/configuration) for `curdx.config`, environment variables, and role overrides
- [Commands](/curdx-bridge/commands) for direct CLI usage and shell-level examples
- [Skills](/curdx-bridge/skills/) for planning, execution, and review pipelines
- [Troubleshooting](/curdx-bridge/troubleshooting) for common failure modes and recovery steps
