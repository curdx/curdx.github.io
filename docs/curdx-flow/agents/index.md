# Agents

CurdX Flow v7.3.3 ships 10 specialist Claude Code agents. They are not a chat roster; each one owns a bounded workflow role and returns protocol markers that the coordinator verifies before state changes.

## Agent Map

| Agent | Primary role | Success marker |
| --- | --- | --- |
| [research-analyst](/curdx-flow/agents/research-analyst) | Discover repository facts, current docs, patterns, risks. | `RESEARCH_COMPLETE` |
| [product-manager](/curdx-flow/agents/product-manager) | Turn facts into user stories and acceptance criteria. | `REQUIREMENTS_COMPLETE` |
| [architect-reviewer](/curdx-flow/agents/architect-reviewer) | Produce technical design, file scope, risk decisions. | `DESIGN_COMPLETE` |
| [task-planner](/curdx-flow/agents/task-planner) | Convert design into value-slice tasks and verification gates. | `TASKS_READY` |
| [spec-executor](/curdx-flow/agents/spec-executor) | Implement one isolated task and report concrete evidence. | `TASK_COMPLETE` |
| [qa-engineer](/curdx-flow/agents/qa-engineer) | Execute `[VERIFY]` gates and evidence checks. | `VERIFICATION_PASS` |
| [spec-reviewer](/curdx-flow/agents/spec-reviewer) | Review artifacts for spec compliance. | `REVIEW_PASS` |
| [code-quality-reviewer](/curdx-flow/agents/code-quality-reviewer) | Review implementation/code-quality risks. | `REVIEW_PASS` |
| [refactor-specialist](/curdx-flow/agents/refactor-specialist) | Update spec files after implementation learning. | `REFACTOR_COMPLETE` |
| [triage-analyst](/curdx-flow/agents/triage-analyst) | Split large work into dependency-aware specs. | `EPIC_READY` |

## Coordination Rules

- Phase commands coordinate; they do not silently replace the specialist.
- Agent outputs must end with exact markers.
- The coordinator verifies claimed artifacts, commands, and evidence before merging state.
- `spec-reviewer` and `code-quality-reviewer` review separate axes and should not receive each other's findings as prompt context.
- `qa-engineer` verifies; `spec-executor` implements. `[VERIFY]` tasks should not be implemented by the executor.

## Where Agents Run

| Workflow moment | Agents |
| --- | --- |
| Discovery | `research-analyst`, plus bounded explorer-style codebase inspection when needed. |
| Planning | `product-manager`, `architect-reviewer`, `task-planner`. |
| Review gates | `spec-reviewer`, `code-quality-reviewer`, `qa-engineer`. |
| Execution | `spec-executor`, with `qa-engineer` for verification. |
| Recovery/change | `refactor-specialist`, `triage-analyst`. |
