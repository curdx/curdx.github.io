# Troubleshooting

Don't guess. Match the symptom, run the check, fix in order.

## Pick your symptom

| Symptom | Jump to |
| --- | --- |
| `/curdx-flow:*` doesn't appear | [Commands do not appear](#commands-do-not-appear) |
| Install state looks off | [Install state looks wrong](#install-state-looks-wrong) |
| Don't know the next step | [You do not know the next step](#you-do-not-know-the-next-step) |
| Browser verification fails | [Browser verification fails](#browser-verification-fails) |
| Verification reports a failure | [Verification fails](#verification-fails) |
| `context7` / `sequential-thinking` missing | [External MCP is missing](#external-mcp-is-missing) |

## Run health checks first

Terminal:

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

Inside Claude Code:

```text
/curdx-flow:status
```

If the issue is still unclear:

```bash
curdx-flow doctor
```

`doctor` reports whether a plugin, MCP, browser dependency, or continuation feature is missing.

## Commands do not appear

Most likely cause: the current Claude Code session hasn't reloaded the plugin.

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

Then **fully quit** Claude Code (not just close the window). Reopen, then:

```text
/curdx-flow:help
```

Still gone? Confirm it's actually installed:

```bash
claude plugin list
```

`curdx-flow` should be present and enabled.

## Install state looks wrong

If `status` says a plugin is missing, the wrong version, or a dependency is disabled:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

For every companion capability:

```bash
npm exec -- @curdx/flow@latest install --all --yes
```

Re-check:

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

## You do not know the next step

Inside Claude Code:

```text
/curdx-flow:status
```

Shows active spec, current phase, and the recommended next command.

Wrong spec is active?

```text
/curdx-flow:switch <spec-name-or-path>
```

From the terminal:

```bash
curdx-flow specs list
curdx-flow specs resolve
```

## Browser verification fails

For frontend work, check three things in order:

| Check | How |
| --- | --- |
| Chrome installed | Open Chrome locally. |
| `chrome-devtools-mcp` enabled | `claude plugin list` should include it. |
| Project actually starts | `npm run dev` (or equivalent) opens the app. |

Then:

```bash
curdx-flow doctor
```

If the project has Playwright, run its own e2e too. **Do not replace browser evidence with "looks fine."**

## Verification fails

A failed verification is the system working — it caught something. Don't bypass it.

```text
1. Read which command or evidence failed.
2. Reproduce it in the terminal:
     npm test
     npm run build
3. Fix the underlying issue.
4. Re-record verification:
     curdx-flow verify run --phase execution --command "npm test"
5. Re-check:
     npm exec -- @curdx/flow@latest check
```

## External MCP is missing

`context7` and `sequential-thinking` are external MCP servers — Flow detects but does not bundle them.

| Capability | Impact when missing |
| --- | --- |
| `context7` | Current library/framework documentation lookup is degraded. |
| `sequential-thinking` | Explicit reasoning for high-risk work is degraded. |

After fixing your Claude MCP setup:

```bash
curdx-flow doctor
```

## Still stuck?

Bundle this when reporting an issue:

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
curdx-flow doctor
```

If a task failed, also include:

- the spec name,
- the failed command,
- the relevant snippets from `requirements.md` / `tasks.md`,
- the test or browser verification output.
