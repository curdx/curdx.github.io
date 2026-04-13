# 命令参考

大多数用户会通过 Claude 面板里的自然语言来操作 CurdX Bridge，但 CLI 仍然非常重要，尤其适用于排障、自动化和进阶工作流。

## 核心会话命令

### `curdx`

启动分屏会话。

```bash
curdx
curdx claude codex
curdx claude codex gemini opencode
curdx -r
curdx -r claude codex gemini
curdx --no-auto
```

| 参数 | 说明 | 备注 |
|------|------|------|
| `-r` | 恢复上次会话 | 适合持续性任务 |
| `--no-auto` | 关闭自动审批行为 | 陌生仓库里更稳妥 |

实际例子：

```bash
# 用精简组合做实现 + 审查
curdx claude codex

# 恢复昨天的三 Provider 会话
curdx -r claude codex gemini

# 在高风险迁移里启用全量可观察面板
curdx claude codex gemini opencode --no-auto
```

### `curdx kill`

终止活动面板。

```bash
curdx kill
curdx kill codex -f
curdx kill gemini -f
```

当某个 Provider 卡住、认证失效或输出明显跑偏时，优先只重启该 Provider，而不是重置整个会话。

## Provider 通信命令

### `cxb-ask`

向某个 Provider 发送异步请求。

```bash
cxb-ask codex "Review the current diff for correctness, security, and missing tests"
cxb-ask gemini "Suggest three alternative API shapes for a webhook retry queue"
cxb-ask opencode "Challenge this refactor plan and look for rollback risk"
```

更贴近真实场景的用法：

```bash
# 写代码前先要一个评分审查
cxb-ask codex "Review this implementation plan using the standard plan rubric"

# 让 Gemini 负责发散，而不是接管决策
cxb-ask gemini "Give me 5 naming directions for a feature flag cleanup command"

# 当 Claude 和 Codex 观点不一致时，用 OpenCode 做第三视角
cxb-ask opencode "Compare these two migration strategies and highlight hidden costs"
```

最佳实践：明确说明它的工作类型。把审查维度、约束条件、输出格式一并写清。

### `cxb-pend`

读取某个 Provider 最近的回复。

```bash
cxb-pend codex
cxb-pend gemini 3
cxb-pend opencode 5
```

当你想跳过 Claude 面板，直接查看原始 Provider 输出，或排查异步请求是否真的完成时，这个命令很有用。

### Provider 专用快捷命令

| Provider | 发送 | 查看回复 | Ping |
|----------|------|----------|------|
| Claude | `cxb-claude-ask` | `cxb-claude-pend` | `cxb-claude-ping` |
| Codex | `cxb-codex-ask` | `cxb-codex-pend` | `cxb-codex-ping` |
| Gemini | `cxb-gemini-ask` | `cxb-gemini-pend` | `cxb-gemini-ping` |
| OpenCode | `cxb-opencode-ask` | `cxb-opencode-pend` | `cxb-opencode-ping` |

这些命令在脚本场景里更方便，因为不需要反复传 provider 名称。

### `cxb-ping`

验证某个 Provider 是否可连通。

```bash
cxb-ping codex
cxb-ping gemini
```

如果面板还在，但你怀疑守护进程已经不可用，先跑这个命令。

## 会话与状态命令

### `curdx-mounted`

显示哪些 Provider 已挂载且可响应。

```bash
curdx-mounted
```

该命令返回 JSON，适合用于 shell 脚本或编辑器集成。

### `cxb-autonew`

为某个 Provider 启动全新会话，不注入旧上下文。

```bash
cxb-autonew codex
cxb-autonew gemini
```

当某个 Provider 上下文漂移过重，但你不想丢掉整个工作区时，这个命令特别有用。

### `cxb-ctx-transfer`

在会话之间传递上下文。

```bash
cxb-ctx-transfer
```

主要用于 AutoFlow 或 Provider 重启后仍需保留任务连续性的场景。

## AutoFlow 命令

### `cxb-autoloop`

驱动自动执行流水线。

```bash
cxb-autoloop start
cxb-autoloop stop
```

典型用法：

```bash
# 先创建任务制品，再让自动循环推进步骤
cxb-autoloop start

# 需要人工检查或重定向时，先暂停自动循环
cxb-autoloop stop
```

## 工具命令

| 命令 | 用途 | 何时使用 |
|------|------|---------|
| `curdx-arch` | 显示当前架构信息 | 快速确认活动环境 |
| `curdx-cleanup` | 清理过期会话和临时文件 | 崩溃或残留状态后 |
| `curdx-completion-hook` | Shell 补全集成 | 提升 CLI 手感 |
| `curdx-installer-helper` | 安装辅助工具 | 打包或环境初始化 |
| `curdx-mcp-delegation` | MCP 委派助手 | 高级集成场景 |

## 命令配方

### 在合并前审查高风险改动

```bash
cxb-ask codex "Review the staged diff for correctness, rollback risk, and missing tests"
cxb-pend codex
```

### 重启单个 Provider，不影响其他面板

```bash
curdx kill gemini -f
cxb-autonew gemini
```

### 恢复前先确认 Provider 状态

```bash
curdx-mounted
cxb-ping codex
```

## 进阶建议

- 日常编码优先使用 `curdx claude codex`，只有在明确需要时再加更多 Provider。
- 遇到异步传输问题时，先用 `cxb-pend` 排查，不要立即认定是模型能力问题。
- 某个 Provider 低信号持续出现时，用 `cxb-autonew` 清理它的上下文，而不是污染整个会话。
- 如果你在做编辑器集成，可以围绕 `curdx-mounted` 和 `cxb-ping` 写轻量脚本。
