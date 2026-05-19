# architect-reviewer

**专治"愿望清单式的设计"。** 产出足够具体的技术设计，让任务能被切成有边界的执行单元。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `high` |
| 成功 | `DESIGN_COMPLETE` |
| 失败 | `DESIGN_BLOCKED` |
| 主要产物 | `design.md` |

## 职责

- 把需求翻译成架构决策。
- 定义文件范围、组件边界、接口和数据流。
- 标注风险、回滚、迁移和验证策略。
- 让文件范围成为执行契约 —— 不是愿望清单。

## 边界

`spec-reviewer` 查规格合规，`code-quality-reviewer` 查代码质量风险。两者的发现彼此独立 —— 设计失败不能被任何一方静默盖过。
