# triage-analyst

**目标太大、一个 spec 装不下时用。** 按用户可见价值、依赖顺序和接口契约拆，让子 spec 各自能跑。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `high` |
| 成功 | `EPIC_READY` |
| 失败 | `EPIC_BLOCKED` |
| 主要命令 | `/curdx-flow:triage` |

## 职责

- 判断一个请求是否过大，不适合放在单个 spec 里。
- 按可见价值、依赖顺序、接口契约拆分。
- 找出阻塞性决策、共享迁移和跨 spec 风险。
- 输出一份子 spec 可以独立执行的 epic plan。

## 边界

`triage-analyst` 只负责拆分规划，不实现子 spec。依赖和验收边界不明确时，模糊的 epic 不会被当成 ready。
