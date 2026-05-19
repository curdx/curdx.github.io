# Getting Started

This page gets you through your first CurdX Flow task. The goal is not to learn every concept. The goal is to complete this path in a real project:

```text
Install plugin -> Describe goal -> Generate specs -> Execute tasks -> Keep verification evidence
```

<picture>
  <source media="(max-width: 700px)" srcset="/images/curdx-flow/curdx-flow-loop-mobile.en.svg" />
  <img class="curdx-flow-figure" src="/images/curdx-flow/curdx-flow-loop.en.svg" alt="CurdX Flow beginner path" />
</picture>

## Success Criteria

We will use a Todo app as the example. By the end, you need to see:

- `/curdx-flow:*` commands available in Claude Code.
- A `specs/todo-app/` directory in your project.
- `requirements.md`, `design.md`, and `tasks.md` inside that directory.
- `/curdx-flow:status` reporting the current stage and next step.
- Test, build, or browser verification evidence once execution starts.

## 0. Prepare The Environment

Make sure you have:

| Dependency | Purpose |
| --- | --- |
| Claude Code | Runs the plugin and slash commands. |
| Node.js 20.12+ | Runs the npm installer. |
| Chrome | Used for browser verification on frontend work. |

Check:

```bash
claude --version
node --version
```

If both commands print versions, continue.

If you do not have a project ready for testing, create a clean Vite project:

```bash
npm create vite@latest curdx-flow-todo -- --template react-ts
cd curdx-flow-todo
npm install
```

## 1. Install CurdX Flow

Run:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

Then check installation state:

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

Confirm:

- `claude plugin list` shows `curdx-flow`.
- `status` does not say curdx-flow is missing.

If the command fails, see [Troubleshooting](/curdx-flow/troubleshooting).

## 2. Open A Project

Open the project you want to test in:

```bash
cd /path/to/your/project
claude
```

Inside Claude Code, type:

```text
/curdx-flow:help
```

If `/curdx-flow:*` does not autocomplete, fully quit Claude Code and reopen it. Plugin changes usually require a new Claude Code session.

## 3. Create The First Task

Inside Claude Code:

```text
/curdx-flow:start todo-app Build a todo app with create, edit, complete, delete, and browser verification
```

The command has two parts:

| Part | Meaning |
| --- | --- |
| `todo-app` | The task name. It also affects the spec directory name. |
| The text after it | The actual goal. |

Flow first decides how much process the task needs. For a Todo feature, it writes spec files before execution.

## 4. Review The Files Flow Creates

You will see a directory like this:

```text
specs/todo-app/
  research.md
  requirements.md
  design.md
  tasks.md
```

For your first run, focus on two files:

| File | What to check |
| --- | --- |
| `requirements.md` | Does it include create, edit, complete, delete, and browser verification? |
| `tasks.md` | Are tasks small enough to run step by step? Do they include verification? |

If the requirements are wrong, fix the spec before executing. This matters: a wrong spec will produce the wrong implementation.

## 5. Execute

When `tasks.md` is ready, run:

```text
/curdx-flow:implement
```

If your environment cannot use native continuation, run:

```text
/curdx-flow:implement --manual
```

You can check progress at any time:

```text
/curdx-flow:status
```

## 6. Decide Whether It Is Really Done

Do not trust the final sentence alone. Done requires at least one kind of evidence:

| Project type | Common evidence |
| --- | --- |
| Frontend page | Browser opens, DOM/screenshot/console/network checks pass. |
| Node/CLI | `npm test`, `npm run build`, or real CLI output. |
| Plugin/release | Plugin validation, tests, tags, or npm release result. |

You can also run:

```bash
npm exec -- @curdx/flow@latest check
```

If this fails, treat the work as incomplete: add evidence, fix the failed command, then check again.

## 7. What To Share With Your Team

If you want to show the result to teammates, do not only say "AI built it." Share:

- the code diff;
- `requirements.md`;
- `design.md`;
- `tasks.md`;
- test or browser verification output.

That gives reviewers the goal, the plan, and proof that it ran.

## Next

- For command choices, read [Commands](/curdx-flow/commands).
- For missing commands or failed verification, read [Troubleshooting](/curdx-flow/troubleshooting).
- For internals, read [How It Works](/curdx-flow/how-it-works).
