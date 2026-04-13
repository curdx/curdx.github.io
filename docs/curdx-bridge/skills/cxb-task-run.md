# cxb-task-run

Execute task steps via the AutoFlow pipeline.

## What It Does

`cxb-task-run` is the execution engine for larger, resumable work. It advances exactly one step at a time, reviews that step, updates task state, and decides whether the pipeline can continue.

This keeps long tasks from dissolving into an untracked stream of edits.

## AutoFlow 10-Step Pipeline

<div style="margin: 1rem 0 1.5rem;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 440" role="img" aria-label="AutoFlow 10-step execution pipeline" style="max-width: 100%; height: auto;">
    <defs>
      <marker id="auto-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
      </marker>
    </defs>
    <rect x="10" y="10" width="960" height="420" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />

    <g style="font: 600 15px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-1);">
      <rect x="36" y="64" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
      <rect x="220" y="64" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
      <rect x="404" y="64" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
      <rect x="588" y="64" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
      <rect x="772" y="64" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />

      <rect x="772" y="254" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-green-1) 14%, transparent); stroke: var(--vp-c-green-1); stroke-width: 2;" />
      <rect x="588" y="254" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-green-1) 14%, transparent); stroke: var(--vp-c-green-1); stroke-width: 2;" />
      <rect x="404" y="254" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-yellow-1) 18%, transparent); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
      <rect x="220" y="254" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-red-1) 12%, transparent); stroke: var(--vp-c-red-1); stroke-width: 2;" />
      <rect x="36" y="254" width="158" height="86" rx="16" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />

      <text x="56" y="94">1. Sync State</text>
      <text x="56" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Read `.curdx/state.json`</text>

      <text x="240" y="94">2. Design Step</text>
      <text x="240" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Claude + Codex draft</text>

      <text x="424" y="94">3. Split Check</text>
      <text x="424" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Break oversized work</text>

      <text x="608" y="94">4. Build Request</text>
      <text x="608" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Prepare FileOpsREQ</text>

      <text x="792" y="94">5. Send Request</text>
      <text x="792" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Dispatch to executor</text>

      <text x="792" y="284">6. Execute</text>
      <text x="792" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Code, files, tests</text>

      <text x="608" y="284">7. Handle Reply</text>
      <text x="608" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">`ok`, `ask`, or `fail`</text>

      <text x="424" y="284">8. Review</text>
      <text x="424" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Dual assessment</text>

      <text x="240" y="284">8.5 Test</text>
      <text x="240" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Run when needed</text>

      <text x="56" y="284">9-10 Finalize</text>
      <text x="56" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Advance and final review</text>
    </g>

    <path d="M194 107 L210 107" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow)" />
    <path d="M378 107 L394 107" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow)" />
    <path d="M562 107 L578 107" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow)" />
    <path d="M746 107 L762 107" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow)" />
    <path d="M852 150 C940 176, 940 230, 852 254" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow)" />
    <path d="M772 297 L756 297" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow)" />
    <path d="M588 297 L572 297" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow)" />
    <path d="M404 297 L388 297" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow)" />
    <path d="M220 297 L204 297" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow)" />
  </svg>
</div>

## Step-By-Step Detail

### 1. Sync State

Read `.curdx/state.json`, determine the current step, check retry limits, and stop immediately if the task is already complete or blocked.

### 2. Step Design

Claude and Codex independently propose the implementation approach for the current step. Claude then merges:

- approach
- done conditions
- risks
- split recommendation

This reduces blind spots before any edits happen.

### 3. Split Check

If the step is too large, it is split into smaller substeps. Good substeps are:

- ordered
- reviewable
- individually meaningful

### 4. Build FileOps Request

Claude prepares a structured execution request rather than editing ad hoc.

### 5. Send To Executor

The request is routed to the configured executor, often Codex.

### 6. Execute

Execution mode depends on configuration:

| Executor config | Behavior |
|----------------|----------|
| `codex` | Codex handles the whole step |
| `opencode` | Codex supervises OpenCode |
| `codex+opencode` | Codex reads, OpenCode writes |

### 7. Handle Response

| Status | Meaning | Next action |
|--------|---------|-------------|
| `ok` | Work completed | Continue to review |
| `ask` | Executor needs clarification | Surface question to the user |
| `fail` | Executor cannot proceed | Mark blocked and explain why |

### 8. Review

[`cxb-review`](/curdx-bridge/skills/cxb-review) runs in step mode to decide PASS or FIX.

### 8.5. Testing

Testing is conditional, not automatic for every trivial change. Claude decides whether tests are necessary based on:

- change surface
- risk
- presence of relevant tests

### 9. Finalize Step

On success, update:

- `.curdx/state.json`
- `.curdx/todo.md`
- `.curdx/plan_log.md`

Then move to the next step.

### 10. Final Review

When all steps are complete, [`cxb-review`](/curdx-bridge/skills/cxb-review) runs in task mode.

Possible outcomes:

- minor issues get fixed directly
- medium issues create a small follow-up step
- large issues become a follow-up task

## Real-World Example

For a task like "add audit logging to admin mutations", `cxb-task-run` might:

1. design the schema addition
2. implement the storage path
3. review the write flow
4. run tests for admin mutation paths
5. finalize and append docs if needed

## Best Practices

- Use AutoFlow for medium or large tasks, not tiny one-file changes.
- Keep done conditions verifiable and concrete.
- Stop automation when the task becomes ambiguous; ask the user instead of guessing.
- Review failures are signals, not annoyances. Fix the cause, not just the score.
