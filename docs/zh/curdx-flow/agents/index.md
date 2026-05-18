# 内部角色

新手不需要先学这些角色。你只要会用 `/curdx-flow:start` 就行。

这页解释 Flow 内部为什么要分角色：不同 agent 负责不同环节，避免一个模型同时写需求、写代码、自己验收自己。

## 一句话记住

| 角色 | 它负责什么 |
| --- | --- |
| `research-analyst` | 先查事实和风险。 |
| `product-manager` | 写清楚需求和验收标准。 |
| `architect-reviewer` | 写技术方案。 |
| `task-planner` | 把方案拆成任务。 |
| `spec-executor` | 实现一个具体任务。 |
| `qa-engineer` | 验证任务是否真的通过。 |
| `spec-reviewer` | 检查规格是否完整。 |
| `code-quality-reviewer` | 检查代码质量风险。 |
| `refactor-specialist` | 根据执行过程更新 spec。 |
| `triage-analyst` | 把大需求拆成多个 spec。 |

## 为什么要分角色

复杂任务最容易出三个问题：

- 没查清楚就开始写；
- 写到一半忘了原始目标；
- 自己实现完就说通过，但没有证据。

分角色后，Flow 可以让“写代码的人”和“验证的人”分开，让需求、设计、任务都有明确产物。

## 什么时候需要看单个角色页面

通常只有三种情况：

- 你在调试 Flow 的内部流程；
- 你想知道某个阶段为什么失败；
- 你在维护 `@curdx/flow` 插件本身。

普通使用者可以直接回到：[快速开始](/zh/curdx-flow/getting-started)。
