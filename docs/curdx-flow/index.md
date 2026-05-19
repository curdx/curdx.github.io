# CurdX Flow

> **Spec-driven delivery for Claude Code.**
> Turn `"build this feature"` into reviewable specs, traceable tasks, and proof — instead of "it says it's done."

<picture>
  <source media="(max-width: 700px)" srcset="/images/curdx-flow/curdx-flow-overview-mobile.en.svg" />
  <img class="curdx-flow-figure" src="/images/curdx-flow/curdx-flow-overview.en.svg" alt="CurdX Flow overview" />
</picture>

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

```text
/curdx-flow:start todo-app  build a todo app with create/edit/delete, browser-verified
```

That's it. The plugin classifies the goal, writes specs into your repo, executes task-by-task, and refuses to call it done without evidence.

## The problem it kills

Three failure modes show up the moment Claude Code works on something real:

| Without Flow | With Flow |
| --- | --- |
| Context rots across turns — the model forgets the original ask. | Goal pinned to `requirements.md`. Survives every restart. |
| "Done" arrives without proof — no command output, no browser run. | Completion requires `verificationBlocks`. No silent passes. |
| Big features either crush small flows or are tackled in one chaotic pass. | `/start` auto-routes: quick fix, light spec, full spec, resume, or triage into multiple specs. |

This isn't another planning ceremony. It's an **execution discipline layer** for Claude Code.

## What lands in your repo

Every real feature run ends with these artifacts — committable, reviewable, resumable:

```text
specs/todo-app/
├── research.md         # facts, risks, existing assumptions
├── requirements.md     # what to build · what counts as done
├── design.md           # how to build · what's in scope
├── tasks.md            # bounded steps, each with a verify command
├── .curdx-state.json   # phase, verificationBlocks, recovery
└── .progress.md        # runtime breadcrumbs (usually gitignored)
```

Plus the code diff. Plus test/build/browser/CI/release evidence stored in state. The PR carries the **goal, the plan, and the proof** — not just the diff.

## 3-minute tour

```bash
# 1. Install (also installs companion plugins + ~/.claude/CLAUDE.md block)
npm exec -- @curdx/flow@latest install curdx-flow --yes

# 2. Open your project in Claude Code
cd /path/to/your/project && claude
```

Inside Claude Code:

```text
/curdx-flow:start todo-app build a todo app with create/edit/delete, browser-verified
/curdx-flow:status       # → "ready to /implement"
/curdx-flow:implement    # runs tasks, captures evidence
```

Lost mid-session? Run `/curdx-flow:status` — it tells you the active spec, phase, missing capabilities, and the exact next command.

## Why teams adopt it

- **Reviewable AI work.** `requirements.md` + `design.md` go into the PR. Reviewers see intent, not just diffs.
- **Resumable across sessions.** Close the laptop, come back tomorrow — `status` and `start` reattach to the spec.
- **Provable completion.** Tests, build, browser DOM, CI runs, npm releases — all captured into `verificationBlocks`.
- **Right-sized process.** Tiny edit? Direct execution. Cross-module epic? Triage into linked specs.
- **No vendor lock-in.** It's a Claude Code plugin. Specs are plain Markdown. Walk away anytime.

## Best fit · not a fit

| Use it when | Skip it when |
| --- | --- |
| Frontend page, CLI, plugin, API, or release work | One-shot Q&A — "what does this snippet do?" |
| The task needs requirements before code | Throwaway script with no review path |
| You want browser/test/CI/release evidence | You explicitly want answers without file edits |
| The work may pause and resume mid-session | A 1-line fix where ceremony is dead weight |
| You want PRs that carry plan + proof | — |

## Pitch it in one breath

> CurdX Flow turns a Claude Code prompt into spec files, traceable tasks, and verified evidence — so AI-assisted features become reviewable, resumable, and trustworthy, not just "it says done."

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

## Next

- [Getting Started](/curdx-flow/getting-started) — your first run, end-to-end.
- [Commands](/curdx-flow/commands) — what to type, when.
- [How It Works](/curdx-flow/how-it-works) — the mental model and the internals.
- [Configuration](/curdx-flow/configuration) — flags worth knowing.
- [Troubleshooting](/curdx-flow/troubleshooting) — when something looks off.
