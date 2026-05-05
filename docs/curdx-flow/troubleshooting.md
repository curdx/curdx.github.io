# Troubleshooting

When CurdX Flow misbehaves, the issue is almost always one of five things: install drift, missing prerequisites, a stuck autonomous loop, a spec out of sync with reality, or hook failures.

## Common Issues

| Problem | Likely cause | Fix |
| --- | --- | --- |
| `npx @curdx/flow` exits immediately | Node version too old | Upgrade to Node ≥ 20.12 |
| `/curdx-flow:` autocomplete is empty | Plugin not installed for this Claude Code session | `claude plugin list`, then `npx @curdx/flow install` |
| `start` says "no active spec" but a directory exists | `specs/.current-spec` was deleted | `/curdx-flow:switch` to set it explicitly |
| Loop halts mid-execution | Verification failed beyond retry budget | Read the failing task in `tasks.md`, fix the underlying issue, then `/curdx-flow:implement` |
| Same task retries repeatedly with the same error | The fix is needed in the *spec*, not the code | `/curdx-flow:refactor` to revise `design.md` / `tasks.md` |
| Subagent invocation throws | Outdated plugin or bundle drift | `npx @curdx/flow update` |
| `claude mcp list` is empty after install | MCP server install was skipped or failed | `npx @curdx/flow status` to see drift, then re-install the MCP item |

## Fast Triage Checklist

Run these in order:

```bash
node --version                 # need ≥ 20.12
claude --version               # Claude Code on PATH
claude plugin list             # curdx-flow visible?
claude mcp list                # opt-in MCP servers visible?
npx @curdx/flow status         # green checkmarks for everything you installed
```

If any of those fail, fix that layer first. The plugin cannot run if Claude Code itself is not healthy.

## Inside Claude Code: Quick Health Check

```text
/curdx-flow:help               # confirms the plugin is loaded and responsive
/curdx-flow:status             # shows every spec and its phase
```

If `/curdx-flow:help` does not autocomplete, the plugin is not loaded for this session. Restart Claude Code or re-run `npx @curdx/flow install`.

## Recovering From A Stuck Autonomous Loop

The loop halts on purpose when verification fails repeatedly. That is a feature, not a bug.

### Step 1: Read the failing task

Open `specs/<active-spec>/tasks.md`. The last unchecked task is the one that failed. Read its description and the verification command it ran.

### Step 2: Reproduce the failure manually

Run the same verification command at your shell. If it fails the same way, the spec is correct and the implementation is broken — fix the code, then resume:

```text
/curdx-flow:implement
```

### Step 3: If the failure is a spec problem

If reproducing the failure shows that the spec asked for the wrong thing, revise the spec instead of forcing the code to match a bad design:

```text
/curdx-flow:refactor
```

This walks `requirements.md` → `design.md` → `tasks.md` and lets you methodically update them. After the spec is corrected, resume:

```text
/curdx-flow:implement
```

### Step 4: As a last resort, cancel and restart

If the spec is fundamentally wrong and revising it would be more work than starting over:

```text
/curdx-flow:cancel
```

This cleans up `.curdx-state.json` and optionally removes the spec directory. You can then run `/curdx-flow:start` with a corrected goal.

## Install And Marketplace Issues

### `claude plugin install` fails

```bash
# Run the installer with verbose output to see what flow tried
npx @curdx/flow install --yes 2>&1 | tee install.log
```

Common causes:

- `claude` CLI is on `PATH` for your shell but not for the spawned subprocess (rare; usually a `~/.zprofile` vs `~/.zshrc` issue)
- The plugin requires a Claude Code version newer than what is installed — `claude --version` and check the marketplace requirements

### MCP server is listed but not responding

```bash
claude mcp list
```

If a server is listed but not working, check whether it requires an API key. For example, `context7` accepts `CONTEXT7_API_KEY`. Without it, the server still installs but rate limits aggressively.

### Drift after Claude Code upgrade

```bash
npx @curdx/flow update
npx @curdx/flow status
```

Updates are idempotent. Re-running them after a Claude Code upgrade is the right reflex.

## Hook Failures

Hooks are the silent rails of the workflow. When they break, the symptom is usually "things should be advancing but aren't."

### Inspect hook errors

```bash
cat ~/.claude/curdx-flow/errors.jsonl | tail -20
```

Each entry is JSON with `hookName`, `exitCode`, `stderr`, and `timestamp`. Look for repeated non-zero exit codes from the same hook.

### Generate a structured report

```bash
npx @curdx/flow analyze
```

The Hook Failures section ranks hooks by failure count. The Hook Duration section flags hooks that are slow enough to time out.

### Disable hook error logging

```json
// ~/.claude/settings.json
{
  "errorLogEnabled": false
}
```

Disabling logging silences the symptom but does not fix the root cause. Use this only if you have ruled out the hooks themselves and want a quieter terminal.

## Spec Out Of Sync With Reality

This is the most common subtle failure: implementation reveals that the design assumed something that is not actually true.

Symptoms:

- `[VERIFY]` keeps failing for tasks that *look* correct
- Multiple tasks in a row need the same out-of-band fix
- The executor produces code that contradicts a constraint you remember mentioning during research

Fix:

```text
/curdx-flow:refactor
```

This walks the spec methodically:

1. Re-reads `requirements.md` against your current understanding
2. Updates `design.md` to reflect what is actually true
3. Updates `tasks.md` to align with the new design
4. Resumes execution from the next unchecked task

This is preferable to bulldozing through with retries.

## Platform Notes

### macOS

- Both Intel and Apple Silicon are supported
- Node via `nvm` works fine; system Node tends to be too old

### Linux

- Tested on Ubuntu 22.04+ and Fedora 39+
- Make sure `bash` and `node` paths are consistent for both your shell and any spawned subprocesses

### Windows

- Use WSL2 (Ubuntu LTS recommended)
- The `analyze` CLI is **declared supported but not extensively tested** on Windows — `~/.claude/curdx-flow/errors.jsonl` write atomicity on NTFS is not guaranteed
- Report any Windows-specific issue with environment details

## Best Practices To Avoid Problems

- Run `npx @curdx/flow status` after Claude Code upgrades and after long breaks.
- Commit the four canonical artifacts. Reviewers can audit the spec without a flow install.
- Keep `.curdx-state.json` and `.progress.md` gitignored. Committed state pollutes future sessions.
- Treat retry-budget exhaustion as a signal, not a quota. The right response is "fix the underlying issue", not "raise the limit".
- Use `/curdx-flow:refactor` instead of editing `design.md` by hand. It walks all downstream artifacts.

## Getting Help

- [GitHub Issues](https://github.com/curdx/curdx-flow/issues) for reproducible bugs and feature requests
- [Releases](https://github.com/curdx/curdx-flow/releases) to confirm whether you are on an old build
- `/curdx-flow:feedback` inside Claude Code to send feedback without leaving the session
