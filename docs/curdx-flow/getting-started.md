# Getting Started

This page does one job: get you through your first CurdX Flow task.

![CurdX Flow beginner path](/images/curdx-flow/curdx-flow-loop.en.svg)

## What You Need

Make sure you have:

- Claude Code
- Node.js 20.12 or newer
- A project directory
- Chrome installed if you want browser verification for frontend work

Check Claude Code first:

```bash
claude --version
```

If you see a version number, continue.

## Step 1: Install The Plugin

Run:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

Check the result:

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

You should see `curdx-flow`.

## Step 2: Open Your Project

```bash
cd /path/to/your/project
claude
```

Inside Claude Code, type:

```text
/curdx-flow:help
```

If the command does not autocomplete, restart Claude Code. If it still does not appear, reinstall:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

## Step 3: Run A Todo Example

Inside Claude Code:

```text
/curdx-flow:start todo-app Build a todo app with create, edit, complete, delete, and browser verification
```

Flow decides how much process the task needs. It may create or update:

```text
specs/todo-app/research.md
specs/todo-app/requirements.md
specs/todo-app/design.md
specs/todo-app/tasks.md
```

Follow the prompts. If you are unsure, review `requirements.md` and `tasks.md` first and check that the goal is still correct.

## Step 4: Execute

When `tasks.md` is ready:

```text
/curdx-flow:implement
```

If native `/goal` is unavailable in your Claude Code environment, use manual mode:

```text
/curdx-flow:implement --manual
```

## Step 5: Check The Result

After execution, start with:

```text
/curdx-flow:status
```

Then run your project's normal checks, for example:

```bash
npm test
npm run build
```

For frontend work, also check browser evidence. Flow tries to use `chrome-devtools-mcp` for DOM, console, network, and screenshot proof.

## Common First-Time Problems

| Problem | Fix |
| --- | --- |
| `/curdx-flow:*` is missing | Restart Claude Code and run `claude plugin list`. |
| You do not know the next step | Run `/curdx-flow:status`. |
| The task is too large | Use `/curdx-flow:triage <goal>` first. |
| Verification fails | Fix the failure, then verify again. Do not mark it done. |

Next: [Commands](/curdx-flow/commands).
