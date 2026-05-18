# Agents

CurdX Flow v7.3.3 交付 10 个 Claude Code 专用 agent。它们不是聊天名单；每个 agent 都有明确工作边界，并返回协议 marker，由协调器核验证据后再更新状态。

## Agent 地图

| Agent | 主要职责 | 成功 marker |
| --- | --- | --- |
| [research-analyst](/zh/curdx-flow/agents/research-analyst) | 发现仓库事实、当前文档、既有模式、风险。 | `RESEARCH_COMPLETE` |
| [product-manager](/zh/curdx-flow/agents/product-manager) | 把事实转成用户故事和验收标准。 | `REQUIREMENTS_COMPLETE` |
| [architect-reviewer](/zh/curdx-flow/agents/architect-reviewer) | 产出技术设计、文件范围、风险决策。 | `DESIGN_COMPLETE` |
| [task-planner](/zh/curdx-flow/agents/task-planner) | 把设计转成价值切片任务和验证门禁。 | `TASKS_READY` |
| [spec-executor](/zh/curdx-flow/agents/spec-executor) | 实现一个隔离任务并报告具体证据。 | `TASK_COMPLETE` |
| [qa-engineer](/zh/curdx-flow/agents/qa-engineer) | 执行 `[VERIFY]` 门禁和证据检查。 | `VERIFICATION_PASS` |
| [spec-reviewer](/zh/curdx-flow/agents/spec-reviewer) | 审查规格产物是否合规。 | `REVIEW_PASS` |
| [code-quality-reviewer](/zh/curdx-flow/agents/code-quality-reviewer) | 审查实现和代码质量风险。 | `REVIEW_PASS` |
| [refactor-specialist](/zh/curdx-flow/agents/refactor-specialist) | 根据实现学习更新 spec 文件。 | `REFACTOR_COMPLETE` |
| [triage-analyst](/zh/curdx-flow/agents/triage-analyst) | 把大需求拆成依赖明确的 specs。 | `EPIC_READY` |

## 协调规则

- 阶段命令负责协调，不会静默替代专家 agent。
- Agent 输出必须以精确 marker 结束。
- 协调器先核验产物、命令和证据，再 merge 状态。
- `spec-reviewer` 和 `code-quality-reviewer` 审查不同轴线，不应互相读取对方发现。
- `qa-engineer` 负责验证；`spec-executor` 负责实现。`[VERIFY]` 任务不应由 executor 实现。

## 运行位置

| 工作流时刻 | Agents |
| --- | --- |
| 发现 | `research-analyst`，必要时配合有边界的代码库探索。 |
| 规划 | `product-manager`、`architect-reviewer`、`task-planner`。 |
| Review 门禁 | `spec-reviewer`、`code-quality-reviewer`、`qa-engineer`。 |
| 执行 | `spec-executor`，验证由 `qa-engineer` 处理。 |
| 恢复/变更 | `refactor-specialist`、`triage-analyst`。 |
