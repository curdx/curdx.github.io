# cxb-task-run

Execute task steps via the AutoFlow pipeline.

## Overview

`cxb-task-run` is the execution engine of CurdX Bridge. It works through task steps one at a time, delegating file operations to the executor (typically Codex), running reviews after each step, and advancing automatically until the task is complete.

## The 10-Step Pipeline

### Step 1: Sync State

Reads `.curdx/state.json` to determine the current step. Validates attempt limits and checks for stop conditions:

- No plan exists → prompts you to create one
- All steps done → shows completion summary

### Step 2: Step Design (Dual Independent)

Both Claude and Codex independently design the approach for the current step:

- Claude produces a local design
- Codex produces an independent design via `/cxb-ask`
- Claude merges the two: union of conditions, risks, and approach

The merged design includes:
- Approach description
- Done conditions (max 2, verifiable)
- Risks and mitigations
- Whether the step needs splitting into substeps

### Step 3: Split Check

If the step is too large:
- Validates proposed substeps (3-7 items, atomic, ordered)
- Splits the step in the task state
- Restarts from Step 1 with the first substep

### Steps 4-5: Build and Send FileOpsREQ

Constructs a structured file operation request and sends it to the executor via `/cxb-file-op`. Claude never directly edits files — all modifications go through the executor.

### Step 6: Execute

The executor performs the file operations. Routing depends on configuration:

| Executor Config | Behavior |
|----------------|----------|
| `codex` | Codex executes directly |
| `opencode` | Codex supervises OpenCode |
| `codex+opencode` | Codex handles reads, OpenCode handles writes |

### Step 7: Handle Response

| Response Status | Action |
|----------------|--------|
| `ok` | Proceed to review |
| `ask` | Surface questions to you |
| `fail` | Mark step as blocked with reason |

### Step 8: Review

Invokes [`cxb-review`](/curdx-bridge/skills/cxb-review) in step mode for dual assessment (Claude + cross-reviewer).

### Step 8.5: Testing (Optional)

Claude decides if testing is needed based on the change type. If so:
- Runs tests via the executor
- Analyzes failures: Fix, Known Issue, or Block

### Step 9: Finalize

- Marks the step as done
- Advances to the next step
- Updates `todo.md` and `plan_log.md`
- Triggers auto-loop for the next step

### Step 10: Final Review (Task Completion)

When all steps are done, runs [`cxb-review`](/curdx-bridge/skills/cxb-review) in task mode:

- **Minor issues** — Codex fixes them directly
- **Medium issues** — Appends 1-2 additional steps
- **Large issues** — Creates a follow-up task

Generates a final report with execution summary.

## Design Principles

- **Shortest path** — Minimize steps and iterations
- **Binary review** — PASS or FIX, no ambiguity
- **Limited iterations** — Max 2 attempts per step before escalation
- **Auto-advance** — Automatically moves to the next step on success
