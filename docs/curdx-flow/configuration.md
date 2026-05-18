# Configuration

Beginners usually do not need to change configuration. Learn `/curdx-flow:start` and `/curdx-flow:status` first.

This page only covers settings you are likely to touch.

## Install Options

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

| Option | What it does |
| --- | --- |
| `--yes` | Skip confirmation and install or reinstall directly. |
| `--all` | Install all known companion capabilities. |
| `--lang en` | Use English in the installer. |
| `--no-claude-md` | Do not update the managed block in `~/.claude/CLAUDE.md`. |
| `--no-refresh` | Skip plugin cache refresh. Usually only for troubleshooting. |

## Task Granularity

The option you are most likely to use:

```text
/curdx-flow:start todo-app Build a Todo app --task-granularity standard
```

| Value | Use it when |
| --- | --- |
| `auto` | Let Flow decide. |
| `standard` | Most product work. |
| `fine` | You want smaller tasks and easier review. |
| `coarse` | You are prototyping and accept larger tasks. |

## Where Specs Live

By default:

```text
specs/
```

For monorepos, you can split specs by package:

```yaml
specs_dirs:
  - "./specs"
  - "./packages/web/specs"
  - "./packages/api/specs"
```

Choose the location when starting:

```text
/curdx-flow:start checkout-ui Build checkout UI --specs-dir ./packages/web/specs
```

## Which Files To Commit

Usually commit:

- `research.md`
- `requirements.md`
- `design.md`
- `tasks.md`

Commit with care:

- `.curdx-state.json`
- `.progress.md`

The last two are runtime state. Commit them if your team wants execution history; skip them for ordinary feature work.

## Companion Capabilities

CurdX Flow checks these capabilities:

| Capability | Why it matters |
| --- | --- |
| `chrome-devtools-mcp` | Real browser evidence for frontend work. |
| `claude-mem` | Historical context and prior decisions. |
| `pua` | Recovery and advanced workflow assistance. |
| `ui-ux-pro-max` | Frontend UI/UX quality checks. |
| `context7` | Current library/framework documentation. |
| `sequential-thinking` | Explicit reasoning for high-risk tasks. |

Check them with:

```bash
curdx-flow doctor
```

## Release Versioning

If you maintain the `@curdx/flow` project itself, bump with:

```bash
node scripts/bump-version.mjs patch
```

Releases need two tags:

```text
vX.Y.Z
curdx-flow--vX.Y.Z
```

Regular users do not need this section.
