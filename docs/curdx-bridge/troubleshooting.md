# Troubleshooting

When CurdX Bridge fails, the issue is usually one of four things: shell path setup, provider authentication, stale session state, or a broken provider process.

## Common Issues

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| `curdx: command not found` | `~/.local/bin` is not on `PATH` | Add it to your shell profile |
| No panes appear | `tmux` is missing or not starting correctly | Install `tmux`, then retry |
| Provider unreachable | Provider CLI is not authenticated or its daemon is unhealthy | Run the provider directly, then `cxb-ping <provider>` |
| `Another instance running` | Stale session or orphaned process | Run `curdx kill`, then `curdx-cleanup` |
| Session will not resume | `.curdx/` state is inconsistent with the current workspace | Clean up state or start a fresh session |
| Replies never come back | Async request sent, but provider never completed or reply retrieval failed | Inspect provider pane and use `cxb-pend <provider>` |

## Fast Triage Checklist

Run these in order:

```bash
which curdx
curdx-mounted
cxb-ping codex
cxb-ping gemini
```

Then verify the provider CLIs themselves:

```bash
claude
codex
gemini
opencode
```

If the standalone CLI does not work, CurdX Bridge cannot fix that for you.

## Debug Mode

Enable verbose logging:

```bash
CURDX_DEBUG=1 curdx
```

Debug output is most useful for:

- provider startup and shutdown failures
- message routing problems between panes
- async request and pending-reply failures
- session state corruption or bad resume behavior

## Check Mounted Providers

```bash
curdx-mounted
```

A provider is only truly "mounted" when:

- its session exists
- its daemon is online
- it can answer pings or replies

If the pane exists but the daemon is dead, restart only that provider instead of resetting everything.

## Resetting State Safely

Start with the least destructive step:

```bash
curdx kill codex -f
cxb-autonew codex
```

If the whole session is bad:

```bash
curdx kill
curdx-cleanup
curdx
```

If resume still keeps restoring a broken state, delete the repo-local `.curdx/` directory and start fresh. Do this only after you are sure you do not need the saved task state.

## Provider-Specific Advice

### Claude pane is fine, side provider is broken

- Run `cxb-ping <provider>`
- Inspect that pane directly
- Restart only that provider

### Provider answers, but answer quality is poor

- Start a fresh provider session with `cxb-autonew`
- Reduce request size and make the task more specific
- Ask Claude to repackage the request with better constraints

### `cxb-ask` succeeds, but nothing useful returns

- Use `cxb-pend <provider>` to inspect the raw reply
- Check whether the provider drifted into an unrelated task
- Reissue the request with a tighter prompt and explicit expected output

## Platform Notes

### macOS

- `tmux` via Homebrew is the simplest path: `brew install tmux`
- Both Intel and Apple Silicon are supported

### Linux

- Confirm your package manager installed a recent enough `tmux`
- Keep provider CLIs on the same shell `PATH` seen by `tmux`

### Windows

- Run through WSL
- Install `tmux` inside the Linux environment, not in PowerShell
- Launch `curdx` from WSL so the providers share the same environment

## Best Practices To Avoid Problems

- Test each provider CLI once after upgrading it.
- Prefer restarting one provider over deleting all state.
- Use `--no-auto` when experimenting in unfamiliar or production-like repos.
- Keep `.curdx/` project-local so resume behavior is predictable.

## Getting Help

- [GitHub Issues](https://github.com/curdx/curdx-bridge/issues) for reproducible bugs and feature requests
- [Releases](https://github.com/curdx/curdx-bridge/releases) to confirm whether you are on an old build
