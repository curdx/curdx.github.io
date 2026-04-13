# cxb-ask

Send an async request to any AI provider.

## Overview

`cxb-ask` is the core communication skill. It sends a message to a specified AI provider and returns control immediately — the provider processes the request asynchronously in its own pane.

This is the foundation that other skills build on. When Claude needs to send a review request to Codex or ask Gemini for ideas, it uses `cxb-ask` under the hood.

## Usage

```
/cxb-ask <provider> "<message>"
```

### Providers

| Provider | Description |
|----------|-------------|
| `codex` | OpenAI Codex CLI |
| `gemini` | Google Gemini CLI |
| `opencode` | OpenCode CLI |
| `claude` | Claude Code (for cross-pane communication) |

### Examples

```
/cxb-ask codex "Review the following diff for correctness and security"
/cxb-ask gemini "Suggest three alternative API designs for user authentication"
/cxb-ask opencode "What's your assessment of this architecture?"
```

## How It Works

1. Claude calls `cxb-ask` with the provider name and message
2. The message is delivered to the provider's tmux pane
3. If the submission succeeds (output contains `CURDX_ASYNC_SUBMITTED`), Claude ends its turn and waits
4. The provider processes the request in its own pane — you can watch in real time
5. Claude retrieves the response later using `/cxb-reply`

## Async Guardrail

When `cxb-ask` submits successfully, Claude follows a strict protocol:

1. Reply with one line: `<Provider> processing...`
2. End the turn immediately
3. Do not poll, sleep, or add follow-up text

This prevents duplicate requests and ensures clean async handoffs.
