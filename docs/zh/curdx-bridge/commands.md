# 命令参考

CurdX Bridge 提供一套 CLI 命令。大多数时候 Claude 会自动使用它们，但你也可以直接调用。

## 核心命令

### curdx

主入口。启动分屏终端会话。

```bash
curdx                                  # 默认 Provider
curdx claude codex gemini opencode     # 指定 Provider
curdx -r                               # 恢复上次会话
curdx -r claude codex gemini           # 恢复指定 Provider 的会话
```

| 参数 | 说明 |
|------|------|
| `-r` | 恢复上次会话 |
| `--no-auto` | 关闭自动审批模式 |

### curdx kill

终止运行中的会话。

```bash
curdx kill                # 终止所有会话
curdx kill codex -f       # 强制终止指定 Provider
```

## Provider 通信

### cxb-ask

向 Provider 发送异步请求。这是 Agent 间通信的基础。

```bash
cxb-ask codex "审查这个 diff 的安全性"
cxb-ask gemini "建议几个替代的 API 设计方案"
cxb-ask opencode "你怎么看这个架构？"
cxb-ask claude "总结一下当前状态"
```

### Provider 专用快捷命令

每个 Provider 有独立的 ask、reply、ping 命令：

| Provider | 发送 | 回复 | 连通性测试 |
|----------|------|------|-----------|
| Claude | `cxb-claude-ask` | `cxb-claude-pend` | `cxb-claude-ping` |
| Codex | `cxb-codex-ask` | `cxb-codex-pend` | `cxb-codex-ping` |
| Gemini | `cxb-gemini-ask` | `cxb-gemini-pend` | `cxb-gemini-ping` |
| OpenCode | `cxb-opencode-ask` | `cxb-opencode-pend` | `cxb-opencode-ping` |

### cxb-pend

查看 Provider 的最新回复。

```bash
cxb-pend codex           # Codex 最新回复
cxb-pend gemini 3        # Gemini 最近 3 条对话
```

### cxb-ping

测试与 Provider 的连通性。

```bash
cxb-ping codex           # 检查 Codex 是否可达
```

## 会话管理

### curdx-mounted

报告当前已挂载的 Provider（会话存在且守护进程在线）。

```bash
curdx-mounted            # JSON 格式输出 Provider 状态
```

### cxb-autonew

为 Provider 启动新会话，不注入上下文。

```bash
cxb-autonew codex        # 全新的 Codex 会话
```

## AutoFlow 命令

### cxb-autoloop

驱动自动任务执行流水线的守护进程。

```bash
cxb-autoloop start       # 启动执行循环
cxb-autoloop stop        # 停止循环
```

### cxb-ctx-transfer

在会话之间传递上下文以保持连续性。

```bash
cxb-ctx-transfer         # 传递当前上下文
```

## 工具命令

| 命令 | 用途 |
|------|------|
| `curdx-arch` | 显示架构信息 |
| `curdx-cleanup` | 清理过期会话和临时文件 |
| `curdx-completion-hook` | Shell 补全钩子 |
| `curdx-installer-helper` | 安装辅助工具 |
| `curdx-mcp-delegation` | MCP 服务器委派 |
