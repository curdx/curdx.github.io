# 快速开始

本页帮助你从零到可用，尽快启动一个多面板协作会话。

## 前置条件

| 依赖 | 作用 | 安装方式 |
|------|------|---------|
| **tmux**（或 WezTerm） | 提供分屏终端布局 | `brew install tmux` / `apt install tmux` |
| **Claude Code** | 主操作界面 | `npm install -g @anthropic-ai/claude-code` |
| **Codex CLI**（推荐） | 默认最适合做审查与实现协作 | `npm install -g @openai/codex` |
| **Gemini CLI**（可选） | 适合头脑风暴和替代思路 | 参考 [Gemini CLI 文档](https://github.com/google-gemini/gemini-cli) |
| **OpenCode CLI**（可选） | 补充实现视角 | 参考 [OpenCode 文档](https://github.com/opencode-ai/opencode) |

安装 CurdX Bridge 之前，先确认你计划使用的 Provider CLI 都能单独启动，并且已经完成认证。

## 快速自检

先分别运行一次你要用的工具：

```bash
claude
codex
gemini
opencode
```

如果这里就报错，优先修复 Provider 本身。CurdX Bridge 是调度层，不会替你完成底层环境初始化。

## 安装

```bash
curl -fsSL https://raw.githubusercontent.com/curdx/curdx-bridge/main/install.sh | bash
```

安装脚本会下载适合你平台的最新发行版，并将 `curdx` 放到 `~/.local/bin`。

如果 `~/.local/bin` 还没加入 `PATH`，请补上：

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## 首次启动

```bash
curdx
```

默认会启动 `claude`、`codex`、`gemini`。

常见启动模式：

```bash
curdx claude codex                     # 精简组合：实现 + 审查
curdx claude codex gemini opencode     # 四 Provider 全开
curdx --no-auto                        # 关闭自动审批，适合高风险仓库
```

启动后，你通常会看到：

1. 终端被切成多个面板
2. 每个 Provider 在自己的面板中启动
3. Claude 位于左侧主面板
4. 你从 Claude 开始对话

## 前五分钟应该怎么用

一个更真实的首轮会话通常像这样：

```text
你:     先扫一下这个仓库，告诉我认证流程里最危险的部分。
Claude: [本地阅读代码并总结]

你:     让 Codex 审一下你的结论，并给修复方案打分。
Claude: [异步发送给 Codex]
        Codex processing...

你:     在 Codex 处理时，再问 Gemini 两种替代 API 方案。
Claude: [发送第二个异步请求]

你:     汇总这两个结果，并推荐一个方向。
Claude: [整合 Codex 审查和 Gemini 的发散建议]
```

核心心智模型很简单：你始终和 Claude 对话，其余 Provider 由 Claude 负责调用。

## 恢复会话

```bash
curdx -r
curdx -r claude codex gemini
```

当你希望保留之前的 pane 上下文时，使用 `-r`。尤其适合：

- 多步骤功能开发
- 长时间审查循环
- 跨多个终端或多个提交的排障任务

如果你只想给某个 Provider 一个全新上下文，可以改用 [命令参考](/zh/curdx-bridge/commands) 中的会话命令。

## 推荐的入门组合

### 单人实现

```bash
curdx claude codex
```

适合需要主实现与一位强审查者的日常开发。

### 设计探索

```bash
curdx claude codex gemini
```

适合需要评审者和一个发散型模型的场景。

### 广角调查

```bash
curdx claude codex gemini opencode
```

适合迁移、架构决策、复杂调试等需要多视角的任务。

## 常用自然语言指令

这些说法之所以有效，是因为它们能稳定映射到内置 Skill：

- “让 Codex 在写代码前先审一下这个方案。”
- “让 Gemini 给三个更轻量的备选方案。”
- “让 Codex 检查这个 diff 是否有回归和测试缺口。”
- “把各个 Provider 的结论汇总一下，并推荐下一步。”
- “从上次中断的地方继续，执行下一步。”

## 参数

| 参数 | 说明 | 常见用途 |
|------|------|----------|
| `-r` | 恢复上次会话 | 持续性任务 |
| `--no-auto` | 关闭自动审批行为 | 陌生仓库或高风险变更 |

## 从源码构建

```bash
git clone https://github.com/curdx/curdx-bridge.git
cd curdx-bridge
./scripts/build-all.sh
```

## 最佳实践

- 第一轮会话先保持简单。两到三个 Provider 比四个更容易管理。
- 审查请求要写清标准。“按安全性和迁移风险审查”比“帮我看看”有效得多。
- 把 Provider 面板当作可观察的 worker。看到漂移就及时重定向。
- 恢复会话要有意识。如果仓库变化很大，重新开一局可能比 `-r` 更干净。

## 下一步

- 阅读 [工作原理](/zh/curdx-bridge/how-it-works) 了解架构和异步模型
- 在 [配置](/zh/curdx-bridge/configuration) 中设置默认 Provider 与角色
- 在 [Skills](/zh/curdx-bridge/skills/) 中了解完整规划与执行流水线
