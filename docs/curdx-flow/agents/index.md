# Agents

Beginners do not need to learn these first. You can start with `/curdx-flow:start`.

This page explains why Flow uses different agents: each role owns one part of the workflow, so one model is not writing requirements, writing code, and approving its own work all at once.

## One-Line Map

| Agent | What it does |
| --- | --- |
| `research-analyst` | Checks facts and risks first. |
| `product-manager` | Writes requirements and acceptance criteria. |
| `architect-reviewer` | Writes the technical plan. |
| `task-planner` | Turns the plan into tasks. |
| `spec-executor` | Implements one concrete task. |
| `qa-engineer` | Verifies that the task really passed. |
| `spec-reviewer` | Checks whether spec artifacts are complete. |
| `code-quality-reviewer` | Checks code-quality risk. |
| `refactor-specialist` | Updates specs after implementation learning. |
| `triage-analyst` | Splits large goals into multiple specs. |

## Why Split Roles

Complex tasks usually fail in three ways:

- coding starts before facts are checked;
- the original goal is forgotten midway;
- the implementer says it passed without real evidence.

Separate roles help Flow keep requirements, design, tasks, implementation, and verification distinct.

## When To Read Individual Agent Pages

Usually only when:

- you are debugging Flow internals;
- you want to understand why a phase failed;
- you maintain the `@curdx/flow` plugin itself.

Regular users can go back to [Getting Started](/curdx-flow/getting-started).
