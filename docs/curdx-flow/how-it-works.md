# How It Works

CurdX Flow is a Claude Code plugin with a small npm installer around it. The plugin coordinates skills, agents, hooks, runtime scripts, and state files; the installer keeps the environment aligned.

## Plugin Layout

The shipped plugin lives at `plugins/curdx-flow/` in the source repository:

```text
plugins/curdx-flow/
  .claude-plugin/plugin.json
  skills/
  agents/
  hooks/
  schemas/
  templates/
  references/
  bin/curdx-flow
```

This matches the current Claude Code plugin structure: the manifest lives under `.claude-plugin/`, while skills, agents, hooks, and runtime assets live at plugin root.

## Smart Routing

`/curdx-flow:start` does not blindly start a long workflow. It asks the runtime router for a route based on:

- current repository shape;
- active spec and session binding;
- user goal and flags;
- stack profile;
- available capabilities;
- risk and verification needs.

The route can be direct-change, lite-spec, full-spec, triage, resume, or blocked-ask-user. This is why the same command can handle a small README edit, a frontend app, a Claude Code plugin release, or a multi-spec epic.

## Phase Artifacts

The normal full-spec path produces four reviewable Markdown files:

| Artifact | Owner |
| --- | --- |
| `research.md` | `research-analyst` |
| `requirements.md` | `product-manager` |
| `design.md` | `architect-reviewer` |
| `tasks.md` | `task-planner` |

Each phase can use interviews, codebase facts, current official docs, memory, and capability checks. Review agents can run at phase boundaries. Quick mode reduces interaction but still keeps the artifacts and verification contract.

## Execution

`/curdx-flow:implement` is a coordinator. It validates `tasks.md`, initializes state, compiles the goal condition, and then delegates bounded work to specialist agents.

The default driver is Claude Code native `/goal` when readiness checks pass. If native goal support is not available, `--manual` performs a resumable one-turn coordinator path.

Key execution rules:

- `spec-executor` implements isolated tasks.
- `qa-engineer` owns `[VERIFY]` tasks and evidence checks.
- `spec-reviewer` and `code-quality-reviewer` review different axes and must not collapse into one opinion.
- state writes go through runtime merge helpers.
- completion markers are parsed, then checked against artifacts and evidence.

## Verification

CurdX Flow treats verification as data, not prose. `verificationBlocks` store evidence such as:

```json
{
  "execution": {
    "command": "npm test",
    "exitCode": 0,
    "timestamp": "2026-05-18T00:00:00.000Z",
    "srcMtime": "2026-05-18T00:00:00.000Z"
  }
}
```

The Stop hook and `@curdx/flow check` enforce the same rule: do not claim completion when required evidence is missing, stale, or failed.

## Hooks

Hooks are used for workflow safety and context recovery. They inject compact context, record progress, verify task completion markers, and guard expansion or stop events. Hook bundles are generated from TypeScript sources and committed as plugin runtime artifacts.

The key rule is fail-open unless a curdx-flow gate deliberately blocks a false completion claim. Diagnostics belong on stderr; hook protocol output belongs on stdout.

## Capability Diagnosis

`curdx-flow doctor` reports plugin dependencies, external MCP readiness, native `/goal` readiness, browser verification options, hook freshness, and release readiness. Missing capabilities degrade explicitly:

- missing `chrome-devtools-mcp` means browser evidence is degraded;
- missing `context7` means current documentation lookup is degraded;
- missing `sequential-thinking` means high-risk reasoning evidence is degraded;
- disabled plugin dependencies are surfaced with remediation.

## Release Model

For curdx-flow itself, npm and Claude Code plugin releases are separate surfaces:

| Surface | Tag |
| --- | --- |
| npm package | `vX.Y.Z` |
| Claude Code plugin | `curdx-flow--vX.Y.Z` |

Both tags must exist intentionally. A release is not complete just because tests pass; it also needs plugin validation, plugin smoke, hook freshness, version parity, and tag parity.
