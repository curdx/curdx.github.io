# cxb-ask

向任意 AI Provider 发送异步请求。

## 概述

`cxb-ask` 是核心通信技能。它向指定的 AI Provider 发送消息并立即返回 — Provider 在自己的面板中异步处理请求。

这是其他 Skills 的基础。Claude 需要向 Codex 发送审查请求或向 Gemini 征求创意时，底层都在用 `cxb-ask`。

## 用法

```
/cxb-ask <provider> "<message>"
```

### 支持的 Provider

| Provider | 说明 |
|----------|------|
| `codex` | OpenAI Codex CLI |
| `gemini` | Google Gemini CLI |
| `opencode` | OpenCode CLI |
| `claude` | Claude Code（跨面板通信） |

### 示例

```
/cxb-ask codex "审查以下 diff 的正确性和安全性"
/cxb-ask gemini "为用户认证设计三种替代 API 方案"
/cxb-ask opencode "你对这个架构怎么看？"
```

## 工作流程

1. Claude 调用 `cxb-ask`，带上 Provider 名称和消息
2. 消息被投递到 Provider 的 tmux 面板
3. 如果提交成功（输出包含 `CURDX_ASYNC_SUBMITTED`），Claude 结束当前回合并等待
4. Provider 在自己的面板中处理请求 — 你可以实时观察
5. Claude 稍后通过 `/cxb-reply` 获取响应

## 异步护栏

当 `cxb-ask` 成功提交后，Claude 遵循严格的协议：

1. 回复一行：`<Provider> processing...`
2. 立即结束回合
3. 不轮询、不等待、不添加后续文字

这防止了重复请求，确保异步交接干净利落。
