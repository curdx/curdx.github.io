# spec-reviewer

**只读的规格合规 reviewer。** 抓缺失验收标准、无支撑声明、范围漂移、过期证据、阶段交接断裂。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `medium` |
| 成功 | `REVIEW_PASS` |
| 失败 | `REVIEW_FAIL` |
| 工具 | `Read`、`Grep`、`Glob` |

## 职责

- 检查 research / requirements / design / tasks / 执行证据是否满足规格契约。
- 找出过期证据和阶段间的衔接断裂。
- 只报告可执行的发现。
- 不进入 `code-quality-reviewer` 的代码质量领地。

## 边界

两阶段 review 靠隔离来工作。`spec-reviewer` 不接收 `code-quality-reviewer` 的发现作为上下文，自己的发现也不去引导代码质量 review 的 prompt。
