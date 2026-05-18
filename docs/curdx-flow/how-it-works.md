# How It Works

This page is for people who want the internals. Beginners can skip it at first.

## A Simple Mental Model

Asking Claude Code to do a complex task directly is like planning while coding. CurdX Flow writes the plan first, then executes the plan.

The flow is:

```text
goal -> spec files -> task list -> execution -> verification evidence
```

## Step 1: Decide How Big The Task Is

`/curdx-flow:start` first checks:

- Is this a tiny edit or a complex feature?
- Is the project frontend, backend, CLI, plugin, or monorepo?
- Is there an old spec to resume?
- Does this need browser, test, release, or CI evidence?

That is why one `/curdx-flow:start` command can handle different jobs instead of always forcing a full workflow.

## Step 2: Write Spec Files

Complex tasks usually create four files:

| File | Question it answers |
| --- | --- |
| `research.md` | What is true in this project? Where are the risks? |
| `requirements.md` | What exactly should be built? What counts as done? |
| `design.md` | How should it be built? Which files are in scope? |
| `tasks.md` | What are the steps? How is each step verified? |

These files make the work reviewable, resumable, and less dependent on chat memory.

## Step 3: Execute By Task

`/curdx-flow:implement` reads `tasks.md`. It works on one bounded task at a time.

Implementation tasks usually go to `spec-executor`. Verification tasks go to `qa-engineer`. This reduces the chance of "I wrote it, therefore I say it passed."

## Step 4: Require Evidence

CurdX Flow does not treat "done" as proof. It looks for:

- Did the command run?
- Was the exit code 0?
- Did the browser page actually work?
- Were console and network clean enough?
- Do release tags, npm packages, or CI results really exist?

Flow stores this evidence in its state file so it can be checked later.

## Step 5: Resume Later

If you close Claude Code, come back and run:

```text
/curdx-flow:status
/curdx-flow:start
```

Flow reads the spec files and state, then recommends the next step.

## Internal Pieces

| Piece | What it does |
| --- | --- |
| skills | The `/curdx-flow:*` commands inside Claude Code. |
| agents | Specialist roles for research, requirements, design, tasks, execution, and verification. |
| hooks | Record state and block completion claims without evidence. |
| runtime CLI | Internal tools such as `curdx-flow doctor` and `curdx-flow specs list`. |
| npm CLI | Install, update, status, and log analysis. |
