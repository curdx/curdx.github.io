# Troubleshooting

## Common Issues

| Problem | Solution |
|---------|----------|
| `curdx: command not found` | Add `~/.local/bin` to your `$PATH` |
| No panes appear | Install tmux: `brew install tmux` or `apt install tmux` |
| Provider unreachable | Run the provider CLI standalone first (e.g., `codex`) to verify it works |
| `Another instance running` | Run `curdx kill` then retry |
| Provider not responding | Check with `cxb-ping <provider>` to test connectivity |
| Session won't resume | Delete `.curdx/` in your project directory and start fresh |

## Debug Mode

Enable verbose logging to diagnose issues:

```bash
CURDX_DEBUG=1 curdx
```

This prints detailed logs for:
- Provider startup and shutdown
- Message routing between panes
- Async request/response cycles
- Session state changes

## Checking Provider Status

Verify which providers are mounted and responsive:

```bash
# Check all providers
curdx-mounted

# Ping a specific provider
cxb-ping codex
cxb-ping gemini
```

A provider is considered "mounted" when it has both an active session and an online daemon.

## Resetting State

If things get into a bad state:

```bash
# Kill all sessions
curdx kill

# Force kill a specific provider
curdx kill codex -f

# Clean up stale files
curdx-cleanup

# Start fresh
curdx
```

## Platform-Specific Notes

### macOS

- Requires tmux or WezTerm as the terminal multiplexer
- Apple Silicon and Intel are both supported
- If using Homebrew: `brew install tmux`

### Linux

- Supports x86-64 and ARM64
- Install tmux via your package manager: `apt install tmux` or `yum install tmux`

### Windows

- Requires WSL (Windows Subsystem for Linux)
- Install tmux inside WSL: `apt install tmux`
- Run `curdx` from within WSL

## Getting Help

- [GitHub Issues](https://github.com/curdx/curdx-bridge/issues) — Report bugs or request features
- [Releases](https://github.com/curdx/curdx-bridge/releases) — Check for updates
