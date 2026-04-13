# 故障排除

当 CurdX Bridge 出问题时，通常根因集中在四类：Shell 路径设置、Provider 认证、残留会话状态，或者某个 Provider 进程本身异常。

## 常见问题

| 问题 | 常见原因 | 解决方法 |
|------|---------|---------|
| `curdx: command not found` | `~/.local/bin` 没加到 `PATH` | 把它加入 shell 配置 |
| 没有出现分屏 | `tmux` 未安装或启动失败 | 安装 `tmux` 后重试 |
| Provider 不可达 | Provider CLI 未认证或守护进程异常 | 先单独运行 Provider，再执行 `cxb-ping <provider>` |
| `Another instance running` | 残留会话或孤儿进程 | 运行 `curdx kill`，再执行 `curdx-cleanup` |
| 无法恢复会话 | `.curdx/` 状态与当前工作区不一致 | 清理状态或重新开新会话 |
| 回复迟迟不返回 | 异步请求已发出，但 Provider 未完成或回复路径失败 | 查看对应面板，并用 `cxb-pend <provider>` 排查 |

## 快速排查清单

按顺序运行：

```bash
which curdx
curdx-mounted
cxb-ping codex
cxb-ping gemini
```

然后确认各 Provider CLI 本身是否正常：

```bash
claude
codex
gemini
opencode
```

如果 Provider 独立运行都失败，CurdX Bridge 无法替你修复底层问题。

## 调试模式

打开详细日志：

```bash
CURDX_DEBUG=1 curdx
```

调试日志尤其适合定位：

- Provider 启动或关闭失败
- 面板间消息路由异常
- 异步请求与 pending-reply 取回失败
- 会话状态损坏或恢复异常

## 检查已挂载 Provider

```bash
curdx-mounted
```

一个 Provider 只有在以下条件都满足时，才算真正“已挂载”：

- 会话存在
- 守护进程在线
- 能响应 ping 或回复请求

如果只是 pane 还在，但 daemon 已死，优先只重启该 Provider。

## 安全地重置状态

先从破坏性最小的动作开始：

```bash
curdx kill codex -f
cxb-autonew codex
```

如果整场会话都已经异常：

```bash
curdx kill
curdx-cleanup
curdx
```

如果恢复逻辑持续把坏状态带回来，再删除仓库本地 `.curdx/` 目录重新开始。但在执行这一步之前，先确认你不再需要旧的任务状态。

## Provider 级建议

### Claude 正常，但侧边 Provider 坏了

- 运行 `cxb-ping <provider>`
- 直接观察该 pane
- 只重启这个 Provider

### Provider 能回答，但质量很差

- 用 `cxb-autonew` 启动新 Provider 会话
- 缩小请求范围，把任务说得更具体
- 让 Claude 重新打包请求并加上更明确的约束

### `cxb-ask` 成功，但拿不到有用结果

- 用 `cxb-pend <provider>` 查看原始回复
- 检查 Provider 是否已经偏离任务
- 用更窄的请求和明确输出格式重新发起

## 平台说明

### macOS

- 最简单的路径是通过 Homebrew 安装 `tmux`：`brew install tmux`
- 同时支持 Intel 和 Apple Silicon

### Linux

- 确认包管理器安装的是足够新的 `tmux`
- 确保 Provider CLI 的 `PATH` 在 `tmux` 环境里也可见

### Windows

- 建议通过 WSL 运行
- 在 Linux 环境里安装 `tmux`，不要装在 PowerShell 里
- 从 WSL 内启动 `curdx`，让所有 Provider 共享同一环境

## 避免问题的最佳实践

- 每次升级 Provider CLI 后，先单独跑一遍确认没坏。
- 优先重启单个 Provider，不要动不动就清空所有状态。
- 在陌生仓库或生产相关仓库里优先使用 `--no-auto`。
- 让 `.curdx/` 保持项目级，确保恢复行为可预期。

## 获取帮助

- [GitHub Issues](https://github.com/curdx/curdx-bridge/issues)：提交可复现 bug 或功能请求
- [Releases](https://github.com/curdx/curdx-bridge/releases)：确认是否仍在使用旧版本
