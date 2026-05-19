# product-manager

**专治"做着做着目标就飘了"。** 把目标和研究转成可测试的需求，把非目标写明白。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `medium` |
| 成功 | `REQUIREMENTS_COMPLETE` |
| 失败 | `REQUIREMENTS_BLOCKED` |
| 主要产物 | `requirements.md` |

## 职责

- 写简洁的用户故事和验收标准。
- 明确写出非目标和范围边界。
- 把模糊的部分转成可审查的问题或假设。
- 让需求足够可测试，供 `task-planner` 和 `qa-engineer` 使用。

## 边界

它不写实现设计 —— 那是 `architect-reviewer` 的事。`/curdx-flow:requirements` 会在有 research 或目标上下文之后委派到这里。
