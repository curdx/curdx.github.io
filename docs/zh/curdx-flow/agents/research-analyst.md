# research-analyst

在写需求前发现事实。用于代码库模式、当前文档、可行性、约束和风险。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `high` |
| 成功 | `RESEARCH_COMPLETE` |
| 失败 | `RESEARCH_BLOCKED` |
| 主要产物 | `research.md` |

## 职责

- 验证事实，不猜。
- 检查仓库结构和既有实现模式。
- 技术行为可能变化时，引入当前官方文档。
- 暴露风险、约束、未知点和下一步调查建议。
- 给 `product-manager` 提供可执行输入，而不是泛泛研究报告。

## 协调用法

`/curdx-flow:research` 和 `/curdx-flow:start` 会把研究工作委派给该 agent。协调器会核验 `research.md` 是否存在，以及声明的来源或命令是否真实，然后才推进。
