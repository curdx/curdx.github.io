# research-analyst

研究阶段负责人。通过网络搜索、文档查询和代码库扫描调研目标——并以**并行团队**方式运行，不是单 Agent。

`research-analyst` 是 `/curdx-flow:start` 或 `/curdx-flow:research` 时第一个被调用的专家。核心原则是**"先验证、不假设"**——绝不猜，必须查。

## 触发条件

| 触发 | 行为 |
| --- | --- |
| `/curdx-flow:start` | 访谈后跑一次，再暂停审批 |
| `/curdx-flow:research` | 重新跑当前规约的研究阶段 |

协调器根据目标的复杂度和涉及面派遣团队规模。Quick 模式跑同样的派遣流程，但跳过人工审批门禁。

## 输入

每个 `research-analyst` 实例通过 `Task` 委派接收：

| 字段 | 来源 | 用途 |
| --- | --- | --- |
| `basePath` | 协调器 | 规约目录路径（如 `./specs/oauth-login`），所有文件操作必须使用，不能硬编码 |
| `specName` | 协调器 | 规约名 token |
| Topic | 主题识别 | 该组员负责的单一研究角度 |
| Goal Interview Context | `.progress.md` | start 阶段访谈完整 Q&A 与所选方案 |

## 并行派遣

研究命令是**协调器，不是研究者**。它必须将所有研究工作委派给子 Agent：

- `Explore` 子 Agent 用于代码库分析（只读，跑 Haiku——快、便宜）
- `research-analyst` 子 Agent 用于网络研究（需要 WebSearch + WebFetch）

### 主题识别

派遣前，协调器分析目标，拆成独立的研究领域：

| 类别 | Agent 类型 | 示例 |
|----------|-----------|----------|
| 外部 / 最佳实践 | `research-analyst` | 行业标准、模式、库 |
| 代码库分析 | `Explore` | 现有实现、模式、约束 |
| 关联规约 | `Explore` | 可能重叠的其他 spec |
| 领域专项（web） | `research-analyst` | 需要聚焦网络研究的专题 |
| 领域专项（code） | `Explore` | 需要代码库探索的专题 |
| Quality Commands | `Explore` | 项目 lint/test/build 命令发现 |
| Verification Tooling | `Explore` | 开发服务器、测试运行器、浏览器依赖、E2E 配置、端口 |

**最少派遣：2 个 Agent**（1 个 research-analyst + 1 个 Explore）。无例外。

### 按复杂度扩展

| 场景 | Agent 数量 |
|----------|-------------|
| 简单聚焦目标 | 2：1 web + 1 codebase |
| 跨多个领域 | 3–5：2–3 research-analyst + 1–2 Explore |
| 涉及外部 API + 代码库 | 2+ research-analyst（API 文档/最佳实践）+ 1+ Explore |
| 多组件改动 | 每组件一位 Explore + 每个外部主题一位 research-analyst |
| 复杂架构问题 | 5+：3–4 research-analyst + 2–3 Explore |

### 派遣流程

```text
1. TeamDelete()                              # 释放任何残留团队
2. TeamCreate(team_name: "research-$spec")   # 新团队
3. TaskCreate per topic                      # 每位组员一个 native task
4. ALL Task(...) calls in ONE message        # 真正并行
5. 等待组员 idle 通知
6. SendMessage(shutdown_request) per teammate
7. TeamDelete()
```

真实派遣消息（每位组员一个 Task，全在同一条消息里）：

```typescript
Task({
  subagent_type: "research-analyst",
  team_name: "research-oauth-login",
  name: "researcher-1",
  prompt: `你是研究组员。
主题：OAuth 2.0 最佳实践与 refresh token 策略
Spec: oauth-login | Path: ./specs/oauth-login/
输出: ./specs/oauth-login/.research-oauth-patterns.md

目标背景：[来自 .progress.md 访谈]
所选方案：B - 新认证模块带刷新轮换

指令：
1. WebSearch OAuth refresh-token 轮换模式 2024
2. 查 RFC 6819 + OAuth WG 草案
3. 识别陷阱（token 复用、竞态）
4. 把发现写到输出文件
不要扫描代码库——Explore 组员负责那部分。`,
});

Task({
  subagent_type: "Explore",
  team_name: "research-oauth-login",
  name: "explorer-1",
  prompt: `分析 spec oauth-login 的代码库
输出: ./specs/oauth-login/.research-codebase.md
找现有认证相关的模式、依赖、约束
章节：Existing Patterns, Dependencies, Constraints, Recommendations。`,
});
```

每位组员完成后，协调器把所有 `.research-*.md` 部分文件合并到统一 `research.md`，然后删除部分文件。

## 内部流程（每位组员）

每个 `research-analyst` 实例都遵循"先验证"方法：

1. **理解请求** — 解析诉求，识别知识缺口。
2. **先做外部研究** — `WebSearch` 查当前最佳实践、库文档、已知问题。
3. **再做内部研究** — `Glob`、`Grep`、`Read` 找现有模式、依赖、约束。
4. **交叉验证** — 多源核对，识别缺口和冲突。
5. **综合输出** — 写 `research.md`（或部分 `.research-<topic>.md`），或抛出澄清问题。
6. **追加学习** — 把发现写到 `<basePath>/.progress.md` 的 `## Learnings` 下。
7. **设置 `awaitingApproval: true`** — 最后动作，通知协调器暂停。

`## Learnings` 追加内容：
- 调研中发现的非预期技术约束。
- 代码库里找到的有用模式。
- 与现有实现不同的外部最佳实践。
- 影响后续任务的依赖或限制。
- 后续 Agent 该知道的"坑"。

## 输出：`research.md`

合并后的 `research.md` 结构（每段由一个或多个组员贡献）：

```markdown
---
spec: oauth-login
phase: research
created: 2026-05-05T12:30:00Z
---

# Research: oauth-login

## Executive Summary
2–3 句综合发现。每位评审者最先读这里。

## External Research

### Best Practices
- [发现] — 来源: <URL>

### Prior Art
- [类似方案] — <项目名>, <URL>

### Pitfalls to Avoid
- [社区常见错误]

## Codebase Analysis

### Existing Patterns
- [模式] — `src/auth/jwt.ts:42`

### Dependencies
- [可复用的现有依赖]

### Constraints
- [发现的技术限制]

## Related Specs

| Spec | Relevance | Relationship | May Need Update |
| --- | --- | --- | --- |
| user-profile | High | 共享认证中间件 | Yes |
| audit-log | Medium | 会记录认证事件 | No |

## Quality Commands

| Type | Command | Source |
| --- | --- | --- |
| Lint | `pnpm run lint` | package.json scripts.lint |
| TypeCheck | `pnpm run check-types` | package.json scripts.check-types |
| Unit Test | `pnpm test:unit` | package.json scripts.test:unit |
| Integration Test | `pnpm test:integration` | package.json scripts.test:integration |
| Build | `pnpm run build` | package.json scripts.build |

**Local CI**: `pnpm run lint && pnpm run check-types && pnpm test && pnpm run build`

## Verification Tooling

| Tool | Command | Detected From |
| --- | --- | --- |
| Dev Server | `pnpm run dev` | package.json scripts.dev |
| Browser Automation | `playwright` | devDependencies |
| E2E Config | `playwright.config.ts` | project root |
| Port | `3000` | .env / package.json |
| Health Endpoint | `/api/health` | src/routes/ |

**Project Type**: Web App
**Verification Strategy**: 起开发服务器到 3000 端口，curl 健康端点，playwright 跑关键用户流。

## Feasibility Assessment

| Aspect | Assessment | Notes |
| --- | --- | --- |
| Technical Viability | High | 所有依赖已存在；无库约束 |
| Effort Estimate | M | 单人 1 周 |
| Risk Level | Medium | Token 轮换竞态（R-2） |

## Recommendations for Requirements

1. 用 SELECT FOR UPDATE 锁实现 refresh token 轮换。
2. 用现有 KMS 模式加密 refresh token。
3. 加 NFR：99 分位认证延迟 < 200ms。

## Open Questions
- Refresh token 应租户级还是用户级？

## Sources
- https://datatracker.ietf.org/doc/html/rfc6819
- https://oauth.net/2/refresh-tokens/
- src/auth/jwt.ts
- src/middleware/auth.ts
```

## 质量检查

每位组员完成前自检：

- [ ] 已 web 搜索当前信息
- [ ] 已读相关内部代码/文档
- [ ] 多源交叉验证
- [ ] 全部来源已引用（URL 和 file:line）
- [ ] 不确定项已列入 Open Questions
- [ ] 提供可执行的 Recommendations
- [ ] 已在 `.curdx-state.json` 设置 `awaitingApproval: true`

## 为什么并行

单一研究 Agent 串行调研。并行团队的好处：

- **更快**——多个独立未知点的目标完成更快。
- **每位组员聚焦**单一角度（无上下文膨胀）。
- **早期暴露冲突**——两位调研者意见相左时，合并步骤会显式记录分歧。

最少 2 Agent 派遣是死规矩：每个 spec 至少需要一次外部调研和一次代码库扫描。

## 反模式

| 不要 | 为什么 |
| --- | --- |
| 猜 | 研究就是为了不猜。不知道就查或问。 |
| 跳过 web 搜索 | 外部信息可能比训练数据新。 |
| 跳过内部文档 | 项目可能有覆盖外部最佳实践的特定模式。 |
| 给无来源声明 | 每条发现都需要来源 URL 或 file:line。 |
| 隐藏不确定 | 明确表达置信度。Open Questions 是一等输出。 |
| 把多个外部主题塞给一个组员 | 每位组员处理一个外部主题。拆分才是并行。 |
| 协调器自己干活 | 协调器只负责派遣和合并，绝不读文档或 grep。 |

## 阅读产物

`research.md` 是工作流中最便宜的纠偏点。审查时关注：

- **与目标矛盾的风险** — 如果研究揭示某约束让目标不可行，现在改方向，别等到 `tasks.md`。
- **模糊引用** — 具体 URL 和章节锚点是好的，"各种博客"不是。
- **缺失的角度** — 团队没调你认为关键的方向时，重跑 `/curdx-flow:research` 时把它点名。
- **Quality Commands 表** — 验证它确实是项目能跑的命令。错误的命令会传播到错误的 `[VERIFY]` 门禁。
- **Verification Tooling 段** — 这里抽出的开发服务器/端口/健康端点驱动 implement 阶段每个 VE 任务。如果项目不在 3000 端口跑，现在就修。

## 最佳实践

- 目标要具体。"加 OAuth"是一个角度，"加按租户限定的、带 refresh token 的 OAuth"是三个。
- 先读执行摘要。如果与你要的不符，研究就跑偏了，后续规约会继承漂移。
- 把风险列表当 TODO。研究里每条未处理的风险，到 `design.md` 通过时都应被回应。
- `Quality Commands` 和 `Verification Tooling` 表不是装饰——它们是 `task-planner` 据以构造 `[VERIFY]` 和 VE 任务的契约，仔细核对。
