# Getting Started

This page is the fastest path from zero to your first approved spec.

## Prerequisites

| Requirement | Why it matters | Install |
|-------------|----------------|---------|
| **Node.js ≥ 20.12** | The installer and `analyze` CLI run on Node | [nodejs.org](https://nodejs.org) |
| **Claude Code CLI** | flow is a plugin that runs inside Claude Code | `npm install -g @anthropic-ai/claude-code` |
| **Git** | Specs live in your repo and the executor commits per task | Standard install |
| *(Optional)* **Bun ≥ 1.0** | Auto-detected; the installer offers to install it if you choose `claude-mem` | See [bun.sh](https://bun.sh) |

Verify Claude Code is on your `PATH` before installing:

```bash
claude --version
```

If that fails, fix it first. flow is an orchestration layer, not a replacement for Claude Code itself.

## Install

```bash
npx @curdx/flow
```

On first run, you pick a language (English / 中文), then select what to install. The bundled `curdx-flow` plugin (the spec workflow itself) is always installed. Everything else is opt-in.

### Non-interactive install

```bash
# Install everything available, skipping confirmations
npx @curdx/flow install --all --yes

# Install only specific items
npx @curdx/flow install claude-mem context7
```

### Verify the install

```bash
claude plugin list                    # should show curdx-flow@curdx
claude mcp list                       # any MCP servers you opted in to
npx @curdx/flow status                # green checkmarks for installed items
```

In Claude Code, type `/curdx-flow:` and you should see autocomplete for all commands.

## Your First Spec

In any project:

```bash
cd ~/projects/my-app
claude
```

Then in the Claude Code prompt:

```text
/curdx-flow:start
```

When prompted, describe your goal:

```text
> I want to add a rate-limited /api/upload endpoint with S3 multipart support.
```

What flow does on `start`:

1. Creates `specs/upload-api/` and a `.curdx-state.json` execution-state file.
2. Runs a 60-second interview (≈3 clarifying questions tuned to your goal).
3. Detects relevant skills from your installed plugins and pre-loads them.
4. Dispatches a parallel research team — one agent investigates S3 multipart, one investigates rate-limiting, one surveys your codebase for upload patterns.
5. Merges results into `research.md` and **pauses for approval**.

Read `specs/upload-api/research.md`. If it looks right, advance:

```text
/curdx-flow:requirements
/curdx-flow:design
/curdx-flow:tasks
/curdx-flow:implement
```

Each command pauses for your approval. The last one — `implement` — runs the autonomous loop and does not stop until every task in `tasks.md` is checked off (or a verification gate fails too many times in a row).

## Your First Five Minutes

A realistic first session usually looks like this:

```text
You:    /curdx-flow:start
        > Add OAuth login with token refresh.
flow:   Interview... (3 short clarifying questions)
        Research dispatched: 3 parallel investigators.
        → research.md created. Approve to continue.

You:    /curdx-flow:requirements
flow:   product-manager → requirements.md (US, FR, NFR sections).

You:    /curdx-flow:design
flow:   architect-reviewer → design.md (decisions, risks, file plan).

You:    /curdx-flow:tasks
flow:   task-planner → tasks.md (12 tasks across 4 phases with VERIFY gates).

You:    /curdx-flow:implement
flow:   ⟳ task 1.1 → verify → commit ✓
        ⟳ task 1.2 → verify → commit ✓
        ...
        ✓ ALL_TASKS_COMPLETE.
```

The mental model is simple: you write a goal in English, flow writes the spec, you approve, flow writes the code.

## Starter Patterns

### Solo small feature

```text
/curdx-flow:start
> Refactor the cache helper to use the new TTL config.
```

Best when the change is bounded and you want quick spec discipline without ceremony.

### Cross-cutting feature

```text
/curdx-flow:triage
> We need server-side webhooks: ingestion, retry queue, dead-letter UI.
```

`triage` decomposes the feature into multiple dependency-aware specs (an epic). Each child spec runs through the normal five phases.

### Quick mode

```text
/curdx-flow:start --quick
> Add a /healthz endpoint that returns version and uptime.
```

`--quick` runs all phases sequentially without pausing for approval. Best for low-risk changes you will review in one pass at the end.

## Useful Flags

| Flag | Effect |
| --- | --- |
| `--quick` | Run all phases sequentially without pausing |
| `--commit-spec` / `--no-commit-spec` | Commit spec artifacts after each phase (default: on) |
| `--specs-dir <path>` | Write specs to a non-default directory (e.g. `packages/api/specs/`) |
| `--tasks-size fine` / `coarse` | Granularity of `tasks.md` decomposition |

See [Configuration](/curdx-flow/configuration) for the full list and per-project overrides.

## Daily Driver Commands

```bash
# Inside Claude Code
/curdx-flow:start         # smart entry point: new spec or resume
/curdx-flow:status        # see all specs and their phase
/curdx-flow:switch        # change the active spec
/curdx-flow:implement     # resume autonomous execution

# At the shell
npx @curdx/flow           # interactive menu (install / update / status)
npx @curdx/flow status    # what is installed and whether anything is stale
npx @curdx/flow update    # update to the latest version
npx @curdx/flow analyze   # generate the observability report
```

## Best Practices

- **Commit the four canonical artifacts.** `research.md`, `requirements.md`, `design.md`, `tasks.md` belong in version control. State files (`.curdx-state.json`, `.progress.md`) are gitignored by default.
- **Approve thoughtfully.** Each pause is your chance to redirect before the next subagent starts. Cheaper than rewriting later.
- **Keep specs small.** A spec that creates 30+ tasks is usually two specs in disguise. Use `/curdx-flow:triage`.
- **Use `--quick` sparingly.** It works for low-stakes changes but skips the gates that protect higher-risk work.
- **Run `npx @curdx/flow status` after upgrades.** It surfaces drift before you find it the hard way.

## Next Steps

- Read [How It Works](/curdx-flow/how-it-works) for the architecture and execution model
- Configure flags and the managed `CLAUDE.md` block in [Configuration](/curdx-flow/configuration)
- Browse [Commands](/curdx-flow/commands) for the full slash and CLI surface
- Meet the team in [Subagents](/curdx-flow/agents/)
