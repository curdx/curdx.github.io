# product-manager

把研究结果和用户目标转成可测试需求。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `medium` |
| 成功 | `REQUIREMENTS_COMPLETE` |
| 失败 | `REQUIREMENTS_BLOCKED` |
| 主要产物 | `requirements.md` |

## 职责

- 写清晰的用户故事和验收标准。
- 保留明确的非目标和范围边界。
- 把模糊点转成可审查的问题或假设。
- 让需求足够可测试，供 `task-planner` 和 `qa-engineer` 使用。
- 不写实现设计；那是 `architect-reviewer` 的职责。

## 协调用法

`/curdx-flow:requirements` 会在已有 research 或目标上下文后委派给该 agent。协调器核验产物和 review 状态后才进入设计。
