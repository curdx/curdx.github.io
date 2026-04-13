# CurdX Bridge

多 AI 分屏终端 — Claude、Codex、Gemini、OpenCode 并肩协作。

![CurdX Bridge 截图](/images/curdx-bridge/screenshot.png)

## CurdX Bridge 是什么？

CurdX Bridge 把多个 AI 编程助手放进终端分屏。Claude 是你的主要界面 — 需要代码审查、第二意见或创意灵感时，用自然语言说一句就行。Claude 在幕后协调其他 AI。

不用切标签页，不用复制粘贴上下文。直接说。

![CurdX Bridge 布局](/images/curdx-bridge/layout.svg)

## 核心特性

**自然语言调度** — 说"让 Codex 审查下"或"问问 Gemini 有什么想法"，Claude 自动处理其余部分。

**角色协作** — 每个 AI 有明确职责：Claude 设计实现，Codex 用评分 Rubric 审查，Gemini 发散思路，OpenCode 提供额外视角。

**质量门禁** — 代码和方案必须在多维度 Rubric 上达到 ≥ 7/10 才能通过。最多 3 轮审查，之后交由你决定。

**会话持久化** — 使用 `-r` 参数恢复之前的会话，上下文完整保留。

**跨平台** — 支持 macOS（Intel/Apple Silicon）、Linux（x86-64/ARM64）、Windows（x86-64 + WSL）。

## 快速导航

- [快速开始](/zh/curdx-bridge/getting-started) — 2 分钟内完成安装和运行
- [工作原理](/zh/curdx-bridge/how-it-works) — 架构、角色和通信模型
- [配置](/zh/curdx-bridge/configuration) — 自定义 Provider、参数和环境
- [命令参考](/zh/curdx-bridge/commands) — 完整 CLI 参考
- [Skills](/zh/curdx-bridge/skills/) — 内置技能系统：规划、审查、执行
- [故障排除](/zh/curdx-bridge/troubleshooting) — 常见问题和解决方法
