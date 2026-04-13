# cxb-ask

向任意 AI Provider 发送异步请求。

## 它做什么

`cxb-ask` 是 CurdX Bridge 中几乎所有跨 Provider 动作背后的传输技能。Claude 通过它把任务提交给另一个 pane，然后立即释放主对话控制权，而不是阻塞等待。

这也是整个系统更像“协作”而不是“串行链式提问”的原因。

## 语法

```text
/cxb-ask <provider> "<message>"
```

支持的 Provider：

| Provider | 常见角色 |
|----------|---------|
| `codex` | 审查、实现、深度代码分析 |
| `gemini` | 头脑风暴、命名、替代设计 |
| `opencode` | 补充实现视角 |
| `claude` | 跨 pane 通信或显式自路由 |

## 异步交接是怎么工作的

1. Claude 把消息提交到目标 Provider 面板。
2. 成功提交后，会返回类似 `CURDX_ASYNC_SUBMITTED` 的异步确认。
3. Claude 停止发言，而不是继续补充无意义文本。
4. Provider 在自己的面板中独立处理。
5. Claude 稍后通过 pending-reply 路径取回结果。

真正关键的不是命令名本身，而是这个护栏：提交、停止、等待、取回。

## 示例

### 让 Codex 做评分审查

```text
/cxb-ask codex "Review this plan using the plan rubric. Return scores, top risks, and pass/fail."
```

### 让 Gemini 提供替代方案

```text
/cxb-ask gemini "Give me 4 API shapes for bulk export jobs. Emphasize simplicity and rollback safety."
```

### 让 OpenCode 质疑某个实现

```text
/cxb-ask opencode "Find the weakest assumptions in this caching refactor and suggest a safer path."
```

## 如何写出更好的请求

高质量异步请求通常包含：

- 工作类型：review、brainstorm、compare、implement、summarize
- 作用范围：文件、功能、diff、方案、迁移
- 约束或 rubric：安全、测试、回滚、性能
- 期望输出：要点列表、分数、pass/fail、推荐结论

对比：

- 弱：“帮我看看这个”
- 强：“按认证正确性、测试缺口和回滚风险审查这个 diff，返回 pass/fail 和 fix items。”

## 最佳实践

- 当某个 Provider 有明确专业职责时，再使用 `cxb-ask`。
- 消息尽量收窄，避免目标 Provider 漂移。
- 让 Claude 负责整合结果，不要手动拼接原始回复。
- 如果目标 Provider 已经跑偏，重新发一个更窄的新请求，比在坏线程上继续追问更有效。
