# 故障排除

## 常见问题

| 问题 | 解决方法 |
|------|---------|
| `curdx: command not found` | 把 `~/.local/bin` 加到 `$PATH` |
| 面板没出现 | 安装 tmux：`brew install tmux` 或 `apt install tmux` |
| Provider 连不上 | 先单独运行该 Provider（如 `codex`）确认它能正常工作 |
| 提示已有实例运行 | 运行 `curdx kill` 后重试 |
| Provider 无响应 | 用 `cxb-ping <provider>` 测试连通性 |
| 会话无法恢复 | 删除项目目录下的 `.curdx/`，重新启动 |

## 调试模式

启用详细日志排查问题：

```bash
CURDX_DEBUG=1 curdx
```

会输出以下详细信息：
- Provider 启动和关闭过程
- 面板间的消息路由
- 异步请求/响应周期
- 会话状态变化

## 检查 Provider 状态

查看哪些 Provider 已挂载且可响应：

```bash
# 检查所有 Provider
curdx-mounted

# 测试特定 Provider
cxb-ping codex
cxb-ping gemini
```

Provider "已挂载"意味着它同时有活跃会话和在线守护进程。

## 重置状态

当状态异常时：

```bash
# 终止所有会话
curdx kill

# 强制终止指定 Provider
curdx kill codex -f

# 清理过期文件
curdx-cleanup

# 重新开始
curdx
```

## 平台相关说明

### macOS

- 需要 tmux 或 WezTerm 作为终端复用器
- 同时支持 Apple Silicon 和 Intel
- 使用 Homebrew 安装：`brew install tmux`

### Linux

- 支持 x86-64 和 ARM64
- 通过包管理器安装 tmux：`apt install tmux` 或 `yum install tmux`

### Windows

- 需要 WSL（Windows Subsystem for Linux）
- 在 WSL 中安装 tmux：`apt install tmux`
- 从 WSL 内运行 `curdx`

## 获取帮助

- [GitHub Issues](https://github.com/curdx/curdx-bridge/issues) — 报告问题或提交功能请求
- [Releases](https://github.com/curdx/curdx-bridge/releases) — 查看更新
