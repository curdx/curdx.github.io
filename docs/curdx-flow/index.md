# CurdX Flow

CurdX Flow is a workflow plugin for Claude Code. You describe what you want, it turns the work into clear spec files, executes the work step by step, and requires real evidence before calling the task done.

![CurdX Flow product overview](/images/curdx-flow/curdx-flow-overview.en.svg)

## When To Use It

Use it when:

- You are building a feature, not editing one line.
- The task needs requirements, design, and verification before coding.
- You are building a frontend page and need real browser checks.
- You are shipping a plugin, CLI, release, or cross-file change.
- You may pause midway and resume later.

Skip it when:

- You only want an explanation.
- You are writing a tiny throwaway script.
- You explicitly want Claude Code to answer only, without changing files.

## First Time: Remember Three Steps

### 1. Install

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

### 2. Open Claude Code In Your Project

```bash
cd /path/to/your/project
claude
```

### 3. Start With One Goal

```text
/curdx-flow:start todo-app Build a todo app with create, edit, complete, delete, and browser verification
```

If you do not know the next step, run:

```text
/curdx-flow:status
```

## What It Creates

Most projects get a spec folder like this:

```text
specs/todo-app/
  research.md       # current project facts and risks
  requirements.md   # requirements and acceptance criteria
  design.md         # technical plan
  tasks.md          # implementation tasks
```

These files let Claude Code continue from a written plan instead of relying on memory or guesswork.

## Why It Is Safer

CurdX Flow does four simple things:

| Behavior | Problem it solves |
| --- | --- |
| Routes first | Small tasks stay light; large tasks get planned. |
| Writes specs | You can stop and resume without explaining everything again. |
| Splits tasks | Each step is smaller and easier to verify. |
| Requires evidence | "Done" needs command, browser, or release proof. |

## Names You Will See

| Name | Beginner meaning |
| --- | --- |
| `/curdx-flow:start` | Main entry point. It decides what route to use. |
| `/curdx-flow:status` | Shows where you are and what to do next. |
| `/curdx-flow:implement` | Executes tasks from `tasks.md`. |
| `chrome-devtools-mcp` | Real browser verification for frontend work. |
| `claude-mem` | History and context memory for Claude Code. |

Everything else can wait until you need it.

## Next

- [Getting Started](/curdx-flow/getting-started): install and run a first Todo example
- [Commands](/curdx-flow/commands): the commands you actually need
- [Troubleshooting](/curdx-flow/troubleshooting): fix install, slash command, and verification issues
- [How It Works](/curdx-flow/how-it-works): read this when you want internals
