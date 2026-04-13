# cxb-review

Dual assessment for step-level and task-level review.

## What It Does

`cxb-review` provides a second layer of quality control by combining Claude's local assessment with a cross-review from another provider, usually Codex.

This matters because a single model can miss:

- hidden regressions
- requirement drift
- weak tests
- incomplete acceptance criteria coverage

## Review Modes

| Mode | When it runs | What it checks |
|------|--------------|----------------|
| `step` | After one execution step | Done conditions for that step |
| `task` | After all steps are complete | Full acceptance criteria and overall quality |

## Decision Flow

### 1. Claude Assessment

Claude evaluates the work first and assigns one of:

- `PASS`
- `FIX`
- `UNCERTAIN`

### 2. Cross-Review Assessment

The cross-review provider answers:

1. Does it agree with Claude's verdict?
2. What did Claude miss?
3. Should the work pass or be fixed?

### 3. Final Decision

| Claude | Cross-review | Result |
|--------|--------------|--------|
| PASS | PASS | **PASS** |
| PASS | FIX | **FIX** |
| FIX | PASS | **FIX** |
| FIX | FIX | **FIX** |
| UNCERTAIN | any | Claude makes the final call |

The system intentionally biases toward fixing when there is disagreement.

## Step Mode Checklist

For a single execution step, review should answer:

- Were the done conditions met exactly?
- Did the code change stay within scope?
- Was any obvious regression introduced?
- Were tests run if this step required them?

## Task Mode Checklist

For the whole task, review should answer:

- Are all acceptance criteria satisfied?
- Are docs or config updates missing?
- Are there remaining correctness or maintainability problems?
- Are follow-up tasks needed rather than silent compromises?

## Example Review Output

```json
{
  "mode": "step",
  "target": "Add audit logging to admin mutations",
  "verdict": "FIX",
  "claudeAssessment": {
    "verdict": "PASS",
    "reason": "Done conditions appear satisfied"
  },
  "crossAssessment": {
    "verdict": "FIX",
    "agreedWithClaude": false,
    "missedIssues": [
      "DELETE mutations are not logged",
      "No test covers actor attribution"
    ],
    "fixItems": [
      "Log destructive admin actions",
      "Add regression test for actor_id capture"
    ]
  },
  "finalDecision": {
    "verdict": "FIX",
    "reason": "Cross-review found requirement gaps"
  }
}
```

## Best Practices

- Keep review binary: pass or fix. Avoid soft "mostly good" conclusions.
- Require specific fix items, not vague advice.
- Use task-mode review before reporting completion on anything user-visible or risky.
- If Claude and Codex disagree, inspect the disagreement. That is often where the real issue is.

## Good Requests To Trigger `cxb-review`

- "Run a step-level review against the done conditions."
- "Review this completed task against the original acceptance criteria."
- "Have Codex challenge the implementation and only pass if tests and docs are complete."
