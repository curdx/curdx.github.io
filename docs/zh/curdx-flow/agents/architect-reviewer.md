# architect-reviewer

设计阶段负责人。把已通过的需求转成可落地的技术设计——组件、决策、风险、文件级变更清单。

## 它做什么

`architect-reviewer` 在 `requirements.md` 通过审批后、运行 `/curdx-flow:design` 时被调用。它产出 `design.md`——后续 `task-planner` 拆任务的依据，也是 `spec-executor` 实现每个任务时引用的文件。

它是工作流中**最重要的暂停点**。`design.md` 通过后，下游所有阶段都对它做承诺。

## 触发时机

| 触发 | 行为 |
| --- | --- |
| `/curdx-flow:design` | 由 `requirements.md`（与 `research.md` 作为背景）生成 `design.md` |

## 产物：`design.md`

典型 `design.md` 包含：

### 组件

要新增或修改的代码单元（模块、服务、文件、类）列表。每个组件有简短的职责说明。

### 数据流

请求、事件或数据如何在组件间流动——通常配图或编号序列。

### API / 契约

组件对外暴露的接口。参数、返回类型、错误条件。

### 决策（`D-1`、`D-2` …）

带理由的编号设计决策。

```markdown
**D-3**：Token 存储使用 Postgres `citext` 实现大小写无关查找。
理由：现有代码库已对相似字段使用 `citext`，避免引入新的排序规则策略。
对比方案：写入小写化（被否——需要数据迁移）；查询时 `lower()`（被否——破坏索引）。
```

### 风险（`R-1`、`R-2` …）

带缓解方案的编号风险。

```markdown
**R-2**：refresh token 轮换在并发刷新请求间存在竞态。
缓解：轮换时对 token 行使用 SELECT FOR UPDATE，文档化锁竞争上界。
```

### 文件变更清单

将创建、修改、删除的文件列表。`task-planner` 用它来确定每个任务的范围。

## 为什么清单重要

文件变更清单不是愿望清单，是契约。`spec-executor` 实现每个任务时会引用它来确定哪些文件在范围内。如果某文件不在清单里，执行器**不会**修改它，除非你修订设计。

这让自治循环保持纪律：它不会跑偏去重写无关代码，因为清单告诉它什么在范围内、什么不在。

## 实战示例

### 全新组件

```text
组件：
- src/auth/oauth-provider.ts（新）—— Google/Microsoft providers 的适配器
- src/auth/token-store.ts（新）—— refresh token 持久化
- src/auth/middleware.ts（修改）—— 把 OAuth 接入现有认证链
```

### 重构

```text
组件：
- src/cache/index.ts（修改）—— 抽出 TTL 策略接口
- src/cache/strategies/static-ttl.ts（新）
- src/cache/strategies/dynamic-ttl.ts（新）
- src/cache/legacy-ttl.ts（迁移完成后删除）
```

### 横切功能

```text
组件：
- packages/shared/observability/index.ts（新）—— 埋点原语
- packages/api/src/middleware/observability.ts（修改）
- packages/worker/src/observability.ts（修改）
```

## 阅读产物

审 `design.md` 时：

- **决策要有理由**。没有"为什么"的决策只是猜测。
- **风险要有缓解**。"可能存在竞态"且无方案是已知未知地雷。
- **清单要具体**。glob 模式或"若干文件"等于执行器没有清晰边界。
- **决策应引用需求**。一条不满足任何 FR/NFR 的决策很可疑——要么决策多余，要么需求漏写。

## 最佳实践

- 对模糊设计强 push back。`architect-reviewer` 是最后一个便宜暂停点——`tasks.md` 一出，改设计就是 `/curdx-flow:refactor` 走三份产物。
- 拿你自己的知识对照风险列表。架构师不可能掌握你对代码库的全部认知。能想到的、列表里没有的风险，要补上。
- 检查清单是否符合你的心智模型。看到不该出现的文件（或缺少应该出现的文件），就是纠偏时机。
- 复杂改动要明确数据流图。简单的改动列表 OK；跨组件改动一张 ASCII 或 SVG 图回报巨大。
