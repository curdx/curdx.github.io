# cxb-task-plan

Create executable task artifacts from a confirmed plan.

## Overview

`cxb-task-plan` bridges the gap between a high-level plan and executable steps. It runs the full collaborative planning flow ([`cxb-plan`](/curdx-bridge/skills/cxb-plan)), then converts the approved plan into structured task artifacts that [`cxb-task-run`](/curdx-bridge/skills/cxb-task-run) can execute.

## Workflow

### 1. Initialize

- Receives your requirement
- Analyzes the project's tech stack and structure
- Researches unfamiliar technologies if needed

### 2. Collaborative Planning

Invokes [`cxb-plan`](/curdx-bridge/skills/cxb-plan) to run the full design flow:
- Requirement clarification (5-Dimension readiness model)
- Inspiration brainstorming
- Plan creation
- Scored review

### 3. User Confirmation

Presents the plan summary for your approval:
- Goal statement
- Implementation steps
- Acceptance criteria

### 4. Generate Task Artifacts

Creates three files in `.curdx/`:

| File | Purpose |
|------|---------|
| `state.json` | Execution state — current step, attempt count, status |
| `todo.md` | Task list with status markers for progress tracking |
| `plan_log.md` | Execution log for decisions and history |

### 5. Start Execution

Optionally starts the auto-loop daemon to begin executing steps immediately via [`cxb-task-run`](/curdx-bridge/skills/cxb-task-run).

## Design Principles

- **Collaborative design** — Uses all three roles (designer, inspiration, reviewer)
- **Coarse-grained steps** — Step titles only, detailed design happens at execution time
- **Research-driven** — Investigates unfamiliar technologies before planning
