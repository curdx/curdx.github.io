# Skills

CurdX Bridge includes a set of built-in skills that Claude uses to coordinate with other AI providers. Skills are the mechanism behind natural language commands like "let Codex review this" — they translate intent into structured inter-agent communication.

## How Skills Work

When you tell Claude to interact with another provider, Claude invokes the appropriate skill. For example:

- "Let Codex review this" → Claude uses `/cxb-ask` to send a review request
- "Plan this feature" → Claude uses `/cxb-plan` to run the collaborative planning flow
- "Execute the next step" → Claude uses `/cxb-task-run` to advance the AutoFlow pipeline

You don't need to invoke skills directly — Claude handles this automatically based on your conversation. But understanding them helps you get the most out of the system.

## Skill Reference

### Communication

| Skill | Purpose |
|-------|---------|
| [cxb-ask](/curdx-bridge/skills/cxb-ask) | Send an async request to any AI provider |

### Planning & Execution

| Skill | Purpose |
|-------|---------|
| [cxb-plan](/curdx-bridge/skills/cxb-plan) | Collaborative planning with inspiration and scored review |
| [cxb-task-plan](/curdx-bridge/skills/cxb-task-plan) | Create executable task artifacts from a plan |
| [cxb-task-run](/curdx-bridge/skills/cxb-task-run) | Execute task steps via the AutoFlow pipeline |

### Quality

| Skill | Purpose |
|-------|---------|
| [cxb-review](/curdx-bridge/skills/cxb-review) | Dual assessment for step-level and task-level review |

## Workflow Overview

The skills connect into a complete development workflow:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  cxb-plan   │ ──→ │ cxb-task-plan│ ──→ │ cxb-task-run │
│  (design)   │     │ (break down) │     │  (execute)   │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                          ┌─────▼──────┐
                                          │ cxb-review │
                                          │  (verify)  │
                                          └────────────┘
```

1. **Plan** — `/cxb-plan` designs the approach with inspiration from Gemini and review from Codex
2. **Break down** — `/cxb-task-plan` converts the plan into executable steps with state tracking
3. **Execute** — `/cxb-task-run` works through each step, delegating file operations to Codex
4. **Review** — `/cxb-review` runs dual assessment after each step and after task completion
