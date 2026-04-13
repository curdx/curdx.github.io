# 快速开始

## 前置条件

| 需要 | 安装方式 |
|------|---------|
| **tmux**（或 WezTerm） | `brew install tmux` / `apt install tmux` |
| **Claude Code** | `npm install -g @anthropic-ai/claude-code` |
| **Codex CLI**（可选） | `npm install -g @openai/codex` |
| **Gemini CLI**（可选） | 参考 [Gemini CLI 文档](https://github.com/google-gemini/gemini-cli) |
| **OpenCode CLI**（可选） | 参考 [OpenCode 文档](https://github.com/opencode-ai/opencode) |

确保每个 Provider CLI 能单独运行。

## 安装

```bash
curl -fsSL https://raw.githubusercontent.com/curdx/curdx-bridge/main/install.sh | bash
```

脚本会下载适合你平台的最新版本，放到 `~/.local/bin`。

## 启动

```bash
curdx                                  # 默认：Claude + Codex + Gemini
curdx claude codex gemini opencode     # 全部四个 Provider
curdx claude codex                     # 只启动两个
```

终端分屏出现，各 Provider 启动，在左侧面板和 Claude 聊天。

## 恢复会话

```bash
curdx -r                               # 恢复上次会话，保持上下文
curdx -r claude codex gemini           # 恢复指定 Provider 的会话
```

`-r` 参数恢复之前的会话，让你从上次中断的地方继续。

## 第一次对话

面板启动后，和 Claude 正常对话：

```
你:     帮我重构这个认证模块。
Claude: [写出重构后的代码]

你:     让 Codex 审查下。
Claude: [把 diff 发给 Codex，等评分]
        Codex 评分 8.5/10，建议：...

你:     问问 Gemini 有没有更好的命名方案。
Claude: [异步询问 Gemini]
        Gemini 建议：...

你:     不错，采纳 Codex 的建议然后提交。
Claude: [修改代码，提交]
```

就是这样。Claude 是你的主界面 — Codex、Gemini 和 OpenCode 是它按需调用的协作者。

## 参数

| 参数 | 说明 |
|------|------|
| `-r` | 恢复上次会话（保持上下文） |
| `--no-auto` | 关闭自动审批模式 |

## 平台支持

| 平台 | 架构 |
|------|------|
| macOS | Intel、Apple Silicon |
| Linux | x86-64、ARM64 |
| Windows | x86-64（通过 WSL） |

## 从源码构建

```bash
git clone https://github.com/curdx/curdx-bridge.git
cd curdx-bridge
./scripts/build-all.sh
```

## 下一步

- 了解[工作原理](/zh/curdx-bridge/how-it-works)
- 通过[配置](/zh/curdx-bridge/configuration)自定义你的环境
- 探索 [Skills 技能系统](/zh/curdx-bridge/skills/)的规划和审查工作流
