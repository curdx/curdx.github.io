# Skills

CurdX Bridge 内置了一套技能系统，Claude 用这些技能与其他 AI Provider 协调工作。当你说"让 Codex 审查下"，Skills 就是把这句自然语言转化为结构化跨 Agent 通信的机制。

## Skills 如何运作

当你让 Claude 与其他 Provider 交互时，Claude 调用相应的 Skill。例如：

- "让 Codex 审查下" → Claude 使用 `/cxb-ask` 发送审查请求
- "规划这个功能" → Claude 使用 `/cxb-plan` 运行协作规划流程
- "执行下一步" → Claude 使用 `/cxb-task-run` 推进 AutoFlow 流水线

你不需要直接调用 Skills — Claude 根据你的对话自动调用。但了解它们能帮你更好地利用这个系统。

## Skill 参考

### 通信

| Skill | 用途 |
|-------|------|
| [cxb-ask](/zh/curdx-bridge/skills/cxb-ask) | 向任意 AI Provider 发送异步请求 |

### 规划与执行

| Skill | 用途 |
|-------|------|
| [cxb-plan](/zh/curdx-bridge/skills/cxb-plan) | 包含灵感发散和评分审查的协作规划 |
| [cxb-task-plan](/zh/curdx-bridge/skills/cxb-task-plan) | 从方案生成可执行的任务制品 |
| [cxb-task-run](/zh/curdx-bridge/skills/cxb-task-run) | 通过 AutoFlow 流水线执行任务步骤 |

### 质量保障

| Skill | 用途 |
|-------|------|
| [cxb-review](/zh/curdx-bridge/skills/cxb-review) | 步骤级和任务级的双重评估 |

## 工作流总览

各 Skill 串联成完整的开发工作流：

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  cxb-plan   │ ──→ │ cxb-task-plan│ ──→ │ cxb-task-run │
│   (设计)    │     │  (拆分任务)   │     │   (执行)     │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                          ┌─────▼──────┐
                                          │ cxb-review │
                                          │   (验证)   │
                                          └────────────┘
```

1. **规划** — `/cxb-plan` 设计方案，融入 Gemini 灵感，由 Codex 评分审查
2. **拆分** — `/cxb-task-plan` 将方案转化为可执行步骤，配合状态追踪
3. **执行** — `/cxb-task-run` 逐步执行，将文件操作委托给 Codex
4. **审查** — `/cxb-review` 在每步完成后和任务完成后运行双重评估
