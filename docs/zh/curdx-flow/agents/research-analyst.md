# research-analyst

**专治"还没核对就开干"。** 在写需求前，先把事实、风险、约束挖出来。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `high` |
| 成功 | `RESEARCH_COMPLETE` |
| 失败 | `RESEARCH_BLOCKED` |
| 主要产物 | `research.md` |

## 职责

- 验证事实，不靠猜 —— 检查仓库结构、既有实现、当前官方文档。
- 暴露风险、约束、未知点，以及接下来值得调查什么。
- 库 / 框架行为可能变化时，主动拉最新文档。
- 给 `product-manager` 留下可执行的输入，而不是一份泛泛的研究报告。

## 边界

`/curdx-flow:research` 和 `/curdx-flow:start` 会委派到这里。协调器会核对 `research.md` 是否存在，引用的来源 / 命令是否真实，然后才推进。
