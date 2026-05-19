# 内部角色

第一次用可以跳过 —— `/curdx-flow:start` 帮你协调一切。想知道 Flow 为什么把角色拆开，而不是让一个模型既写需求又写代码又给自己盖章 "OK" 时，再回来。

## 角色地图

```text
goal ─► research-analyst ─► product-manager ─► architect-reviewer ─► task-planner
                                                                       │
                                                                       ▼
                                                                 spec-executor
                                                                       │
                                                                       ▼
                                                                  qa-engineer
                                                                       │
                              spec-reviewer  ◄────  code-quality-reviewer
                                       │
                                       ▼
                              refactor-specialist
                                       │
                       triage-analyst（目标太大时介入）
```

| 角色 | 负责 |
| --- | --- |
| [`research-analyst`](/zh/curdx-flow/agents/research-analyst) | 写代码前先把事实、风险、假设挖出来。 |
| [`product-manager`](/zh/curdx-flow/agents/product-manager) | 把目标变成需求和验收条件。 |
| [`architect-reviewer`](/zh/curdx-flow/agents/architect-reviewer) | 写技术设计，定义文件范围。 |
| [`task-planner`](/zh/curdx-flow/agents/task-planner) | 把设计切成有边界 / 可单独验证的任务。 |
| [`spec-executor`](/zh/curdx-flow/agents/spec-executor) | 执行单个任务的代码改动，绝不自己盖章。 |
| [`qa-engineer`](/zh/curdx-flow/agents/qa-engineer) | 跑验证，把证据写进 `verificationBlocks`。 |
| [`spec-reviewer`](/zh/curdx-flow/agents/spec-reviewer) | 检查 spec 产物是否完整、自洽。 |
| [`code-quality-reviewer`](/zh/curdx-flow/agents/code-quality-reviewer) | 独立审查代码质量与实现风险。 |
| [`refactor-specialist`](/zh/curdx-flow/agents/refactor-specialist) | 实现里学到新东西后回头更新规格。 |
| [`triage-analyst`](/zh/curdx-flow/agents/triage-analyst) | 把过大的目标拆成相互依赖的多个 spec。 |

## 为什么要拆角色

复杂任务的失败可以预料 —— 每一种都被某个角色专门盯着：

| 典型失败 | 由谁拦截 |
| --- | --- |
| 还没核对事实就开始写代码 | `research-analyst` 先跑，输出 `research.md`。 |
| 做着做着忘了最初目标 | `product-manager` + `architect-reviewer` 把目标钉在 `requirements.md` / `design.md`。 |
| 实现者说"通过了"，没有证据 | `spec-executor` 和 `qa-engineer` 是两个角色，QA 的证据写进状态。 |

## 什么时候需要看单个角色

- 你在调一个表现异常的阶段。
- 你在维护 `@curdx/flow` 插件本身。
- 你好奇某个职责到底归谁。

否则，回到 [快速开始](/zh/curdx-flow/getting-started) —— 你不需要把演员表背下来就能把功能交付出去。
