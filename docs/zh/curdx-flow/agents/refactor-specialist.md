# refactor-specialist

根据实现学习更新 spec 产物。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `medium` |
| 成功 | `REFACTOR_COMPLETE` |
| 主要命令 | `/curdx-flow:refactor` |

## 职责

- 更新 `requirements.md`、`design.md` 或 `tasks.md`，不重写无关部分。
- 保留有价值上下文，移除过期指令。
- 检测级联影响：需求变化可能影响设计和任务；设计变化可能影响任务。
- 记录为什么需要 refactor。

## 边界

该 agent 编辑 spec 产物，不编辑应用代码。它不会绕过审批、review 或验证门禁。
