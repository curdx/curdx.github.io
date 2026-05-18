# Troubleshooting

Start with facts:

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

Inside Claude Code:

```text
/curdx-flow:status
```

For plugin runtime health:

```bash
curdx-flow doctor
```

## Slash Commands Do Not Appear

Check whether the plugin is installed and enabled:

```bash
claude plugin list
```

Reinstall through the npm installer:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

Then restart Claude Code. If manual marketplace debugging is needed:

```bash
claude plugin marketplace add curdx/curdx-flow
claude plugin install curdx-flow@curdx
```

## Companion Plugin Missing Or Disabled

Run:

```bash
curdx-flow doctor
```

The manifest expects:

| Plugin | Marketplace |
| --- | --- |
| `pua` | `pua-skills` |
| `claude-mem` | `thedotmack` |
| `chrome-devtools-mcp` | `chrome-devtools-plugins` |
| `ui-ux-pro-max` | `ui-ux-pro-max-skill` |

If a dependency is missing, disabled, or in the wrong scope, rerun:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

Then check `claude plugin list` again.

## External MCP Not Ready

`context7` and `sequential-thinking` are expected external MCPs. They are not vendored by curdx-flow.

Symptoms:

- current documentation lookup is unavailable;
- high-risk reasoning evidence is degraded;
- `curdx-flow doctor` reports external MCP readiness as `unknown` or `missing`.

Fix the user's Claude MCP setup, then rerun:

```bash
curdx-flow doctor
```

Use official docs or manual confirmation as a fallback only when the workflow explicitly accepts degraded evidence.

## Browser Verification Fails

CurdX Flow prefers real browser evidence for UI work.

Check:

```bash
curdx-flow doctor
```

Expected pieces:

- `chrome-devtools-mcp` installed and enabled;
- Chrome installed locally;
- a project dev server can start;
- console and network output are clean enough to satisfy the task.

If Playwright exists in the project, use the project Playwright script. If not, Chrome DevTools MCP can provide DOM, screenshot, console, and network evidence.

## Native `/goal` Is Not Available

`/curdx-flow:implement` uses Claude Code native `/goal` when `curdx-flow doctor` reports it ready.

If native goal is blocked:

```text
/curdx-flow:implement --manual
```

Manual mode performs a resumable coordinator pass. After fixing the environment, rerun:

```bash
curdx-flow doctor
```

## Active Spec Is Wrong

List and resolve specs:

```bash
curdx-flow specs list
curdx-flow specs resolve
```

Inside Claude Code:

```text
/curdx-flow:status
/curdx-flow:switch <spec-name-or-path>
```

If multiple spec roots are configured, pass the exact path or use `--specs-dir` when creating a new spec.

## Verification Blocks Are Missing Or Stale

Run:

```bash
npm exec -- @curdx/flow@latest check
```

Exit code `2` means at least one required block is missing, stale, or failed. Rerun the real verification command and record evidence through curdx-flow:

```bash
curdx-flow verify run --phase execution --command "npm test"
```

Do not bypass this in CI or release work. `CURDX_VERIFY_SKIP_BLOCKS=1` exists only as a human escape hatch.

## Release Checks Fail

For the curdx-flow repository itself, run:

```bash
npm run check-versions
npm run verify
claude plugin validate ./plugins/curdx-flow
CURDX_FLOW_CLAUDE_BIN=claude npm run test:claudecc
```

Before publishing, verify both release tags:

```bash
git ls-remote --tags origin "vX.Y.Z" "curdx-flow--vX.Y.Z"
```

`vX.Y.Z` is the npm package tag. `curdx-flow--vX.Y.Z` is the Claude Code plugin tag.

## Analyze A Session

Generate a report from Claude Code session logs:

```bash
npm exec -- @curdx/flow@latest analyze --out flow-report.md
```

Use `--include-prompts` only for local debugging where prompt redaction is intentionally disabled.
