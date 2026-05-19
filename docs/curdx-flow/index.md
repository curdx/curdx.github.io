# CurdX Flow

CurdX Flow is a workflow plugin for Claude Code. It turns "build this feature" into a reviewable, resumable, and verifiable delivery record.

You do not need to understand agents, hooks, or MCP before trying it. For the first run, remember three things:

1. Install the plugin with one command.
2. Describe the goal with `/curdx-flow:start`.
3. Use `/curdx-flow:status` for the next step.
4. Use `/curdx-flow:implement` to execute.

<picture>
  <source media="(max-width: 700px)" srcset="/images/curdx-flow/curdx-flow-overview-mobile.en.svg" />
  <img class="curdx-flow-figure" src="/images/curdx-flow/curdx-flow-overview.en.svg" alt="CurdX Flow product overview" />
</picture>

## Understand It In 30 Seconds

Without CurdX Flow, you might ask Claude Code directly:

```text
Build a Todo app with create, edit, complete, and delete.
```

That is fine for small edits. Real feature work has different failure modes: requirements drift, context gets lost, partial work is hard to resume, and "done" may not include proof.

With CurdX Flow, you start with this:

```text
/curdx-flow:start todo-app Build a todo app with create, edit, complete, delete, and browser verification
```

Flow writes the goal into files before execution:

| Output | Why it matters |
| --- | --- |
| `requirements.md` | What should be built and what counts as done. |
| `design.md` | How it should be built and which files are in scope. |
| `tasks.md` | Small execution steps with checks. |
| Verification evidence | Tests, build output, browser checks, CI, or release proof. |

## Why You Would Use It

CurdX Flow is not about making the model write more. It is about making AI-assisted work easier to review, continue, and trust.

| What you care about | What CurdX Flow gives you |
| --- | --- |
| Not re-explaining context | Spec files stay in the project and can be resumed. |
| Not letting the model drift | Requirements, design, and tasks are written before execution. |
| Not trusting a final "done" message | Completion needs command, browser, CI, or release evidence. |
| Making AI work reviewable | Markdown artifacts can go into the PR. |
| Splitting large work | Big goals can be decomposed into multiple specs. |

## Try It In 3 Minutes

1. Install:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

2. Open a project:

```bash
cd /path/to/your/project
claude
```

3. Run inside Claude Code:

```text
/curdx-flow:start todo-app Build a todo app with create, edit, complete, delete, and browser verification
```

4. If you do not know the next step:

```text
/curdx-flow:status
```

5. Execute when the spec is ready:

```text
/curdx-flow:implement
```

## What Done Looks Like

A normal feature run is done only when these are present:

- `specs/<name>/requirements.md`: requirements and acceptance criteria.
- `specs/<name>/design.md`: implementation plan and file scope.
- `specs/<name>/tasks.md`: task list and verification approach.
- Project code changes.
- Test, build, browser, CI, or release evidence.

If the spec files or verification evidence are missing, treat the work as incomplete. The core value is turning "the AI says it is done" into "the files, code, and proof are here."

## Best Fit

Use it for:

- frontend pages, CLIs, plugins, backend endpoints, and cross-module features;
- tasks that need requirements before implementation;
- work that needs browser, test, CI, or release evidence;
- tasks that may span multiple turns or pause midway;
- PRs where design and verification should be visible.

Skip it for:

- explaining a snippet;
- tiny throwaway scripts;
- situations where you only want an answer and no file changes.

## How To Recommend It

Short version:

> CurdX Flow is a Claude Code workflow plugin. It turns a development goal into requirements, design, tasks, and verification evidence, so real AI-assisted work is easier to review and resume.

Slightly fuller version:

> We can use CurdX Flow to manage Claude Code development work. Instead of letting the model change everything in one pass, it first creates `requirements.md`, `design.md`, and `tasks.md`, then executes task by task and requires test or browser evidence. A PR gets the goal, plan, and proof alongside the code diff.

Install command:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

## Next

1. [Getting Started](/curdx-flow/getting-started): run the first Todo example.
2. [Commands](/curdx-flow/commands): learn common commands and flags.
3. [Troubleshooting](/curdx-flow/troubleshooting): fix missing commands, failed verification, and browser issues.
4. [How It Works](/curdx-flow/how-it-works): read this when you want the internals.
