# Troubleshooting

This page helps you get back to a working state quickly. Do not guess first. Check in order.

## Identify The Problem

| Symptom | Start here |
| --- | --- |
| `/curdx-flow:*` does not appear | [Commands do not appear](#commands-do-not-appear) |
| Install state looks wrong | [Install state looks wrong](#install-state-looks-wrong) |
| You do not know the next step | [You do not know the next step](#you-do-not-know-the-next-step) |
| Frontend browser verification fails | [Browser verification fails](#browser-verification-fails) |
| Flow says verification failed | [Verification fails](#verification-fails) |
| context7 or sequential-thinking is missing | [External MCP is missing](#external-mcp-is-missing) |

## Run Health Checks First

In your terminal:

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

`doctor` tells you whether a plugin, MCP, browser capability, or continuation feature is missing.

## Commands Do Not Appear

Most common cause: the current Claude Code session has not reloaded the plugin.

Fix in this order:

1. Reinstall:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

2. Fully quit Claude Code.
3. Open Claude Code again.
4. Type:

```text
/curdx-flow:help
```

If it still does not appear, check:

```bash
claude plugin list
```

Confirm `curdx-flow` is listed and enabled.

## Install State Looks Wrong

If `status` reports a missing plugin, wrong version, or disabled dependency, reinstall curdx-flow first:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

To install all companion capabilities:

```bash
npm exec -- @curdx/flow@latest install --all --yes
```

Then check again:

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

## You Do Not Know The Next Step

Inside Claude Code:

```text
/curdx-flow:status
```

It shows the active spec, current phase, and recommended next command.

If the active spec is wrong:

```text
/curdx-flow:switch <spec-name-or-path>
```

You can also inspect from the terminal:

```bash
curdx-flow specs list
curdx-flow specs resolve
```

## Browser Verification Fails

For frontend work, check three things:

| Check | How |
| --- | --- |
| Chrome is installed | Open Chrome locally. |
| `chrome-devtools-mcp` is enabled | Check `claude plugin list`. |
| The project starts | For example, `npm run dev` opens the app. |

Then run:

```bash
curdx-flow doctor
```

If the project has Playwright, run the project's e2e command too. Do not replace browser evidence with "looks fine."

## Verification Fails

A failed verification is useful: it means Flow did not silently pass a broken task.

Process:

1. Find the failed command or evidence.
2. Reproduce it in the terminal, for example:

```bash
npm test
npm run build
```

3. Fix the issue.
4. Record verification again:

```bash
curdx-flow verify run --phase execution --command "npm test"
```

5. Check again:

```bash
npm exec -- @curdx/flow@latest check
```

## External MCP Is Missing

`context7` and `sequential-thinking` are external MCP servers. CurdX Flow does not bundle them.

Missing them affects:

| Capability | Impact |
| --- | --- |
| `context7` | Current library/framework documentation lookup is degraded. |
| `sequential-thinking` | Explicit reasoning for high-risk work is degraded. |

After fixing your Claude MCP setup:

```bash
curdx-flow doctor
```

## Still Stuck?

Collect these before reporting the issue:

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
curdx-flow doctor
```

If a task failed, also include:

- the spec name;
- the failed command;
- the relevant parts of `requirements.md` and `tasks.md`;
- test or browser verification output.
