# triage-analyst

把大工作拆成依赖明确的 specs。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `high` |
| 成功 | `EPIC_READY` |
| 失败 | `EPIC_BLOCKED` |
| 主要命令 | `/curdx-flow:triage` |

## 职责

- 判断一个请求是否过大，不适合单个 spec。
- 按用户可见价值、依赖顺序和接口契约拆分。
- 识别阻塞决策、共享迁移和跨 spec 风险。
- 产出 child specs 可独立执行的 epic plan。

## 边界

`triage-analyst` 负责拆分规划，不实现 child specs。依赖和验收边界不清楚时，不能把模糊 epic 当成 ready。
