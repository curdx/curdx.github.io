# Getting Started

This page uses the current `@curdx/flow` v7.3.3 command surface.

## Prerequisites

- Claude Code installed and logged in.
- Node.js 20.12 or newer.
- A project directory where you want to run Claude Code.
- Chrome installed if you expect browser evidence through `chrome-devtools-mcp`.

Run this once to confirm Claude Code is callable:

```bash
claude --version
```

## 1. Install CurdX Flow

Recommended:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

Install every known companion item if you want the full environment in one pass:

```bash
npm exec -- @curdx/flow@latest install --all --yes
```

Check status:

```bash
npm exec -- @curdx/flow@latest status
npm exec -- @curdx/flow@latest status --json
claude plugin list
```

## 2. Start Claude Code In Your Project

```bash
cd /path/to/project
claude
```

Inside Claude Code:

```text
/curdx-flow:help
/curdx-flow:status
```

If the slash commands do not autocomplete, restart Claude Code and re-run:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

## 3. Run A First Spec

Use `/curdx-flow:start`; it decides whether the work needs direct handling, a lite spec, a full spec, or epic triage.

```text
/curdx-flow:start todo-app Build a todo app with create, edit, complete, delete, local persistence, and browser verification
```

For low-risk work where you want fewer prompts:

```text
/curdx-flow:start todo-app Build the todo app --quick --task-granularity standard
```

For a large feature:

```text
/curdx-flow:triage customer-portal Build the customer portal with auth, billing, dashboard, and admin workflows
```

## 4. Review The Artifacts

Most specs create these files:

```text
specs/<name>/
  research.md
  requirements.md
  design.md
  tasks.md
  .curdx-state.json
  .progress.md
```

Treat the Markdown files as project context worth committing. Treat `.curdx-state.json` and `.progress.md` as runtime state unless your team has chosen to track them.

## 5. Execute

After tasks are ready:

```text
/curdx-flow:implement
```

The default execution path uses Claude Code native `/goal` when `curdx-flow doctor` reports it as ready. Use manual mode when the environment cannot support native goal continuation:

```text
/curdx-flow:implement --manual
```

Useful caps:

```text
/curdx-flow:implement --max-task-iterations 5 --max-global-iterations 30 --goal-turns 30
```

## 6. Verify

Run the checks that match your project. For the curdx-flow repository itself, release-quality verification is:

```bash
npm run verify
claude plugin validate ./plugins/curdx-flow
CURDX_FLOW_CLAUDE_BIN=claude npm run test:claudecc
```

For any project using curdx-flow, the plugin-side gate is:

```bash
npm exec -- @curdx/flow@latest check
```

`check` validates active spec `verificationBlocks` and exits `2` when required evidence is missing, stale, or failed.

## 7. Keep It Updated

```bash
npm exec -- @curdx/flow@latest update
npm exec -- @curdx/flow@latest status
```

If a Claude Code update changes plugin, hook, or MCP behavior, rerun install and status before trusting an old session.
