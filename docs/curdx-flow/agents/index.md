# Agents

Day-one beginners can skip this — `/curdx-flow:start` orchestrates everything for you. Read this when you want to know *why* Flow splits roles instead of letting one model write requirements, code, and "looks good to me" all at once.

## The role map

```text
goal ─► research-analyst ─► product-manager ─► architect-reviewer ─► task-planner
                                                                       │
                                                                       ▼
                                                                 spec-executor
                                                                       │
                                                                       ▼
                                                                  qa-engineer
                                                                       │
                              spec-reviewer  ◄────  code-quality-reviewer
                                       │
                                       ▼
                              refactor-specialist
                                       │
                       triage-analyst (when goal is too big)
```

| Agent | Owns |
| --- | --- |
| [`research-analyst`](/curdx-flow/agents/research-analyst) | Surfaces facts, risks, and assumptions before any code is written. |
| [`product-manager`](/curdx-flow/agents/product-manager) | Turns the goal into requirements + acceptance criteria. |
| [`architect-reviewer`](/curdx-flow/agents/architect-reviewer) | Owns the technical design and file-scope decisions. |
| [`task-planner`](/curdx-flow/agents/task-planner) | Slices the design into bounded, individually verifiable tasks. |
| [`spec-executor`](/curdx-flow/agents/spec-executor) | Implements one task. Code only — never approves itself. |
| [`qa-engineer`](/curdx-flow/agents/qa-engineer) | Runs the verify step. Records evidence into `verificationBlocks`. |
| [`spec-reviewer`](/curdx-flow/agents/spec-reviewer) | Checks the spec artifacts are coherent and complete. |
| [`code-quality-reviewer`](/curdx-flow/agents/code-quality-reviewer) | Reviews code-quality risk independent of the implementer. |
| [`refactor-specialist`](/curdx-flow/agents/refactor-specialist) | Updates spec files when implementation learning forces a change. |
| [`triage-analyst`](/curdx-flow/agents/triage-analyst) | Decomposes oversized goals into linked specs. |

## Why split roles at all

Complex tasks fail in three predictable ways. Each split exists to kill one of them.

| Failure mode | Killed by |
| --- | --- |
| Coding starts before facts are checked | `research-analyst` runs first and outputs `research.md`. |
| The original goal drifts mid-execution | `product-manager` + `architect-reviewer` pin it into `requirements.md` / `design.md`. |
| Implementer says "it passed" with no proof | `spec-executor` and `qa-engineer` are different roles; QA's evidence lands in state. |

## When to read individual pages

- You're debugging a phase that misbehaved.
- You maintain the `@curdx/flow` plugin itself.
- You're curious which agent is responsible for what under the hood.

Otherwise, head back to [Getting Started](/curdx-flow/getting-started) — you don't need to memorize the cast to ship.
