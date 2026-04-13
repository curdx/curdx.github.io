# cxb-task-plan

Create executable task artifacts from a confirmed plan.

## What It Does

`cxb-task-plan` converts design intent into execution state. It is the bridge between a reviewed plan and a resumable, automatable task pipeline.

In practice it does three things:

1. ensures the plan is good enough
2. breaks the work into execution-sized steps
3. writes state files that `cxb-task-run` can advance safely

## Workflow

### 1. Initialize Context

Before generating artifacts, Claude inspects the repository:

- project structure
- main languages and frameworks
- testing approach
- unfamiliar dependencies that may require research

This prevents a generic plan from being turned into unrealistic tasks.

### 2. Run Collaborative Planning

`cxb-task-plan` typically invokes [`cxb-plan`](/curdx-bridge/skills/cxb-plan) first so the task starts from an approved plan rather than a vague prompt.

### 3. Confirm With The User

Claude summarizes:

- the goal
- the major steps
- the acceptance criteria

This is the right moment to tighten scope before execution artifacts are generated.

### 4. Generate `.curdx/` Artifacts

| File | Purpose |
|------|---------|
| `.curdx/state.json` | Machine-readable execution state and retry tracking |
| `.curdx/todo.md` | Human-readable step list with status markers |
| `.curdx/plan_log.md` | Running log of decisions, changes, and review outcomes |

Typical `todo.md` characteristics:

- coarse-grained steps
- clear sequencing
- steps that can be reviewed independently

### 5. Optionally Start Execution

After artifact generation, the task can be handed to [`cxb-task-run`](/curdx-bridge/skills/cxb-task-run) immediately or resumed later.

## Example

If the approved plan is "introduce audit logging for admin actions", `cxb-task-plan` might generate steps like:

1. add an audit event model and storage contract
2. wire logging into admin write paths
3. expose query tooling for support staff
4. add tests and docs

These are execution-sized. They are not implementation micro-steps like "add field" or "rename function".

## Best Practices

- Keep steps large enough to matter, small enough to review.
- Prefer 3 to 7 steps for a medium feature.
- Put testing or validation in explicit steps when the task is risky.
- If user approval is still fuzzy, do not generate execution artifacts yet.

## Good Requests To Trigger `cxb-task-plan`

- "Turn this reviewed plan into a resumable task list."
- "Break this feature into executable steps and prepare AutoFlow state."
- "Create the `.curdx` task artifacts, but wait for my approval before running them."
