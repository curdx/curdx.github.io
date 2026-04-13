# cxb-review

Dual assessment for step-level and task-level review.

## Overview

`cxb-review` provides quality verification using two independent assessments — one from Claude and one from a cross-review provider (typically Codex). This dual approach reduces blind spots and provides higher confidence in review outcomes.

## Modes

| Mode | When used | What it evaluates |
|------|-----------|------------------|
| `step` | After each step execution | Single step against its done conditions |
| `task` | After all steps complete | Entire task against acceptance criteria |

## Workflow

### Step 1: Claude Assessment

Claude evaluates the work against done conditions (step mode) or acceptance criteria (task mode) and produces a verdict:

- **PASS** — All conditions met
- **FIX** — Issues found, with specific items to fix
- **UNCERTAIN** — Needs second opinion

### Step 2: Cross-Review

The work is sent to the cross-review provider (default: Codex) for an independent assessment:

1. Does it agree with Claude's verdict?
2. Any issues Claude missed?
3. Final recommendation: PASS or FIX?

### Step 3: Final Decision

| Claude | Cross-Review | Result |
|--------|-------------|--------|
| PASS | PASS | **PASS** |
| PASS | FIX | **FIX** (Claude decides on items) |
| FIX | PASS | **FIX** (merge items) |
| FIX | FIX | **FIX** (merge items) |
| UNCERTAIN | any | Claude makes final call |

## Step Mode Checklist

When reviewing a single step:

- Are all done conditions satisfied?
- Are code changes correct?
- No regressions introduced?

## Task Mode Checklist

When reviewing the entire task:

- All acceptance criteria met?
- Any gaps or missing pieces?
- Code quality issues?
- Documentation complete?
- Tests passing?

## Review Output

The review produces a structured JSON result:

```json
{
  "mode": "step",
  "target": "Implement user authentication",
  "verdict": "PASS",
  "claudeAssessment": {
    "verdict": "PASS",
    "reason": "All done conditions verified"
  },
  "crossAssessment": {
    "verdict": "PASS",
    "agreedWithClaude": true,
    "missedIssues": [],
    "fixItems": []
  },
  "finalDecision": {
    "verdict": "PASS",
    "reason": "Both assessments agree"
  }
}
```

## Integration

`cxb-review` is called automatically by [`cxb-task-run`](/curdx-bridge/skills/cxb-task-run):

- **Step 8** — After each step execution (step mode)
- **Step 10** — After task completion (task mode)

It can also be invoked manually when you want a structured review of any work.
