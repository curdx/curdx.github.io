# Configuration

CurdX Flow keeps configuration small. Most behavior is inferred from the current repository, active spec, installed Claude Code capabilities, and command flags.

## Installer Options

The npm CLI accepts these global options:

| Option | Meaning |
| --- | --- |
| `--lang zh|en` | Override display language. |
| `--no-claude-md` | Do not update the managed `@curdx/flow` block in `~/.claude/CLAUDE.md`. |

Install command options:

| Option | Meaning |
| --- | --- |
| `--all` | Install all known items. |
| `--yes` | Skip reinstall confirmation. |
| `--no-refresh` | Skip marketplace cache refresh. |

Examples:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
npm exec -- @curdx/flow@latest install --all --yes
npm exec -- @curdx/flow@latest install --lang zh --no-claude-md
```

## Workflow Flags

The most important workflow flags are on `/curdx-flow:start`:

| Flag | Default | Meaning |
| --- | --- | --- |
| `--mode auto|fast|deep` | `auto` | Routing depth and context budget. |
| `--task-granularity auto|coarse|standard|fine` | `auto` | Size of generated value-slice tasks. |
| `--review minimal|standard|strict` | route-dependent | Review cadence stored in `autoPolicy.reviewCadence`. |
| `--quick` | off | Reduce prompts for low-risk or pre-approved work. |
| `--fresh` | off | Create a new spec instead of resuming. |
| `--commit-spec` / `--no-commit-spec` | route-dependent | Whether phase artifacts should be committed. |
| `--specs-dir <path>` | default specs dir | Select an allowed spec root. |

`--task-granularity` replaces the old `--tasks-size` wording. Use `standard` for normal production work, `fine` when each task needs a smaller reviewable diff, and `coarse` for prototypes or spikes.

## Spec Roots

CurdX Flow supports multiple spec roots. The shipped template uses:

```yaml
specs_dirs: ["./specs"]
```

In monorepos, add explicit roots such as:

```yaml
specs_dirs:
  - "./specs"
  - "./packages/frontend/specs"
  - "./packages/api/specs"
```

Then create in a specific root:

```text
/curdx-flow:start checkout-ui "Build checkout UI" --specs-dir ./packages/frontend/specs
```

## State Files

| File | Purpose |
| --- | --- |
| `research.md` | Facts, existing patterns, current docs, constraints, risks. |
| `requirements.md` | User stories, acceptance criteria, boundaries. |
| `design.md` | Architecture, decisions, file scope, verification strategy. |
| `tasks.md` | Ordered value-slice tasks and `[VERIFY]` checkpoints. |
| `.curdx-state.json` | Phase, active task, policy, `verificationBlocks`, recovery state. |
| `.progress.md` | Runtime progress, learning, failed attempts, continuation notes. |

Only update `.curdx-state.json` through runtime helpers when working inside the plugin:

```bash
curdx-flow state merge <state-file> <json-patch>
```

## Verification Blocks

`verificationBlocks` are the completion contract. A completion claim is not trusted unless the relevant block contains fresh evidence.

Typical evidence sources:

| Evidence | Examples |
| --- | --- |
| Command | `npm test`, `npm run build`, `npm run verify`, exit code and timestamp. |
| Browser | DOM state, console/network status, screenshot, Chrome DevTools MCP evidence. |
| Review | `spec-reviewer`, `code-quality-reviewer`, or `qa-engineer` verdicts. |
| Release | tag parity, plugin validation, npm package, GitHub release. |

Validate the active spec:

```bash
npm exec -- @curdx/flow@latest check
```

## Dependencies

The plugin manifest declares these Claude Code plugin dependencies:

| Dependency | Marketplace |
| --- | --- |
| `pua` | `pua-skills` |
| `claude-mem` | `thedotmack` |
| `chrome-devtools-mcp` | `chrome-devtools-plugins` |
| `ui-ux-pro-max` | `ui-ux-pro-max-skill` |

Expected external MCP servers:

| MCP | Ownership |
| --- | --- |
| `context7` | External setup, used for current docs. |
| `sequential-thinking` | External setup, used for explicit high-risk reasoning. |

CurdX Flow should diagnose these capabilities, not duplicate or vendor them.

## Release Configuration

For the `@curdx/flow` project itself, version fields must stay aligned across the npm package, package lock, plugin manifest, and marketplace metadata. Use the version script:

```bash
node scripts/bump-version.mjs patch
```

Release requires both tag surfaces:

```bash
vX.Y.Z
curdx-flow--vX.Y.Z
```

The npm tag publishes the package. The plugin tag is required for Claude Code plugin resolution.
