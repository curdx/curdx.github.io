# Troubleshooting

Do not guess first. Check in this order.

## Run These First

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

## `/curdx-flow:*` Does Not Appear

Most common cause: the current Claude Code session has not loaded the plugin.

Fix:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

Then fully quit and reopen Claude Code.

Check again:

```bash
claude plugin list
```

## Install State Looks Wrong

Check:

```bash
npm exec -- @curdx/flow@latest status
```

If a plugin is missing or the version looks wrong, reinstall:

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

To install all companion capabilities:

```bash
npm exec -- @curdx/flow@latest install --all --yes
```

## Browser Verification Fails

Check three things:

1. Chrome is installed.
2. `chrome-devtools-mcp` is installed and enabled.
3. The project's dev server starts successfully.

Run:

```bash
curdx-flow doctor
```

If the project already has Playwright, run the project's e2e command too.

## You Do Not Know The Current Step

Inside Claude Code:

```text
/curdx-flow:status
```

If the active spec is wrong:

```text
/curdx-flow:switch <spec-name-or-path>
```

You can also inspect from the terminal:

```bash
curdx-flow specs list
curdx-flow specs resolve
```

## Verification Fails

Do not mark a failed verification as done. Start with the failing command.

Common checks:

```bash
npm test
npm run build
```

After fixing it, record verification through Flow:

```bash
curdx-flow verify run --phase execution --command "npm test"
```

Then check:

```bash
npm exec -- @curdx/flow@latest check
```

## External MCP Is Missing

`context7` and `sequential-thinking` are external MCP servers. CurdX Flow does not bundle them.

If `curdx-flow doctor` says they are missing:

- current documentation lookup may be degraded;
- high-risk reasoning may be degraded;
- you need to fix your Claude MCP setup.

After fixing it:

```bash
curdx-flow doctor
```

## Before Releasing CurdX Flow Itself

If you maintain `@curdx/flow`, run:

```bash
npm run verify
claude plugin validate ./plugins/curdx-flow
CURDX_FLOW_CLAUDE_BIN=claude npm run test:claudecc
```

Regular projects do not need this section.
