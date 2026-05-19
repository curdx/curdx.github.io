# How It Works

Skip on day one — `/curdx-flow:start` doesn't require any of this. Come back when you want to understand why Flow makes the choices it does.

## Mental model

Asking Claude Code to ship a real feature directly is like planning *while* coding. Flow writes the plan first, then executes against it:

```text
goal ─► spec files ─► task list ─► execution ─► verified evidence
```

Three guarantees follow from that order:

1. **Reviewable.** Specs are Markdown in your repo. PRs carry the plan, not just the diff.
2. **Resumable.** State lives on disk, not in chat. Close the window — `/status` reattaches.
3. **Provable.** "Done" requires `verificationBlocks` — command output, browser checks, CI runs, release tags.

## Step 1 · Route the goal

`/curdx-flow:start` classifies before it acts:

- Tiny edit or real feature?
- Frontend, backend, CLI, plugin, monorepo?
- Is there an existing spec to resume?
- Does completion need browser / test / release evidence?

That's why a single command handles "rename a variable" and "ship a Claude Code plugin" without forcing the same ceremony on both.

## Step 2 · Pin the plan to files

Real features produce four artifacts:

| File | Question it answers |
| --- | --- |
| `research.md` | What's already true in this project? Where are the risks? |
| `requirements.md` | What exactly is being built? What counts as done? |
| `design.md` | How is it built? Which files are in scope? |
| `tasks.md` | What are the bounded steps? How is each step verified? |

Move the plan from chat memory into the repo — and the work becomes reviewable, resumable, and far less fragile.

## Step 3 · Execute task-by-task

`/curdx-flow:implement` reads `tasks.md` and runs **one bounded task at a time**. Roles are deliberately split:

- `spec-executor` writes the code change.
- `qa-engineer` runs the verify step.
- `architect-reviewer`, `code-quality-reviewer`, `spec-reviewer` weigh in at the right gates.

Separating implementer from verifier kills the "I wrote it, therefore it passed" failure mode.

## Step 4 · Demand evidence

Flow refuses to claim "done" without:

- the verify command actually running,
- exit code 0 (or its equivalent),
- a real browser page if the work is visual,
- clean console / network where relevant,
- real release tags, npm packages, or CI runs — not described, observed.

All of this lands in `verificationBlocks` inside `.curdx-state.json` for later audit.

## Step 5 · Resume later

Close the laptop, come back tomorrow:

```text
/curdx-flow:status     # show phase, missing capabilities, next command
/curdx-flow:start      # re-attach to the existing spec
```

Flow rebuilds context from the spec files and state — not from chat memory.

## Internal pieces

| Piece | What it does |
| --- | --- |
| **skills** | The `/curdx-flow:*` commands Claude Code surfaces. |
| **agents** | Specialist roles: research, PM, architect, task-planner, executor, QA, reviewer, refactor, triage. |
| **hooks** | Record state and block completion claims without evidence. |
| **runtime CLI** | `curdx-flow doctor`, `curdx-flow specs list`, `curdx-flow route`. |
| **npm CLI** | `@curdx/flow` — install, status, update, analyze, check. |

## Companion capabilities Flow orchestrates

Flow is a Claude Code plugin, but it also detects and uses these when present:

| Capability | Role |
| --- | --- |
| `chrome-devtools-mcp` | Real browser DOM, console, network, screenshots for frontend evidence. |
| `claude-mem` | Historical decisions and prior failure modes. |
| `pua` | Multi-attempt recovery, parallel planning, Chinese-language skills. |
| `ui-ux-pro-max` | UI/UX quality judgment for visible work. |
| `context7` (external MCP) | Current library / framework documentation. |
| `sequential-thinking` (external MCP) | Explicit hypothesis decomposition for high-risk tasks. |

Missing one? `curdx-flow doctor` reports the degraded state and the fix — it won't silently skip critical evidence.
