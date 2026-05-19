# Configuration

Most people only ever touch two things: install flags and task granularity. Everything else is opt-in.

## Install flags

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

| Flag | Effect |
| --- | --- |
| `--yes` | Skip confirmation, install or reinstall directly. |
| `--all` | Install every known companion capability. |
| `--lang en` / `--lang zh` | Installer language. |
| `--no-claude-md` | Don't update the managed block in `~/.claude/CLAUDE.md`. |
| `--no-refresh` | Skip plugin cache refresh (usually only for debugging). |

## Task granularity

The lever you'll actually want to tune:

```text
/curdx-flow:start todo-app build a Todo app --task-granularity standard
```

| Value | Use it for |
| --- | --- |
| `auto` | Let Flow decide. |
| `standard` | Most product work. |
| `fine` | Smaller tasks; easier review and rollback. |
| `coarse` | Prototyping; you accept larger tasks. |

## Where specs live

Default:

```text
specs/
```

Monorepo? Split by package and pick the location at start time:

```yaml
specs_dirs:
  - "./specs"
  - "./packages/web/specs"
  - "./packages/api/specs"
```

```text
/curdx-flow:start checkout-ui build checkout UI --specs-dir ./packages/web/specs
```

## What to commit

| Usually commit | Commit with care |
| --- | --- |
| `research.md` | `.curdx-state.json` (runtime state — useful for audit, noisy in PRs) |
| `requirements.md` | `.progress.md` (runtime breadcrumbs — usually `.gitignore`) |
| `design.md` | |
| `tasks.md` | |

Rule of thumb: **commit context, gitignore runtime**.

## Companion capabilities

```bash
curdx-flow doctor
```

| Capability | Why it matters |
| --- | --- |
| `chrome-devtools-mcp` | Real browser evidence for frontend work. |
| `claude-mem` | History of prior decisions and failures. |
| `pua` | Recovery and advanced workflow assistance. |
| `ui-ux-pro-max` | UI/UX quality checks. |
| `context7` *(external MCP)* | Current library / framework documentation. |
| `sequential-thinking` *(external MCP)* | Explicit reasoning for high-risk tasks. |

Missing one degrades a specific signal — `doctor` will tell you which.

## Release versioning *(maintainers only)*

If you're maintaining the `@curdx/flow` project itself:

```bash
node scripts/bump-version.mjs patch
```

Releases need both tags pushed together:

```text
vX.Y.Z                  # triggers npm publish
curdx-flow--vX.Y.Z      # Claude Code plugin marketplace tag
```

Regular users can ignore this section.
