# product-manager

需求阶段负责人。把用户目标加研究产物翻译成结构化、可测试、带稳定 ID 的需求。

`product-manager` 在 `/curdx-flow:requirements` 时调用，跑一次，产出 `requirements.md`，设 `awaitingApproval: true`，退出。

## 触发条件

| 触发 | 行为 |
| --- | --- |
| `/curdx-flow:requirements` | 由目标 + `research.md` 生成 `requirements.md` |

它**不会**凭空发明产品功能。它的工作是把研究浮现的事实结构化，让 `design.md` 有靠得住的输入。

## 输入

| 字段 | 来源 | 用途 |
| --- | --- | --- |
| `basePath` | 协调器 | 规约目录 |
| `specName` | 协调器 | 规约名 token |
| `research.md` | 上一阶段 | 发现、约束、建议 |
| `.progress.md` | 目标访谈 | 原始目标 + 访谈 Q&A |

## 用 `Explore` 做代码库分析

Agent 优先用 `Explore` 子 Agent（只读、Haiku、快）做任何代码库分析。常用场景：

- 找类似功能的现有模式。
- 发现需求要尊重的代码约定。
- 搜索代码库中已使用的用户面术语。

典型 Explore 调用：

```text
Task tool with subagent_type: Explore
thoroughness: medium

Prompt:
"在代码库中搜索现有用户故事的实现和模式。
看测试中通常如何验证验收标准。
输出：模式列表 + 文件路径。"
```

让结果停留在 Explore 上下文外，比顺序 Glob/Grep 快 3–5 倍。

## 内部流程

1. 仔细读 `research.md` 和 `.progress.md`。
2. 识别用户、行为、质量属性。
3. 派遣 `Explore` 做代码库模式分析（多角度时并行）。
4. 起草用户故事——每条需求都锚定到一个人和一个目标。
5. 写功能需求（可测试行为）和非功能需求（横切属性）。
6. 定义验收标准——`task-planner` 会把它们转成 `[VERIFY]` 门禁的"完成"契约。
7. 把发现追加到 `<basePath>/.progress.md` 的 `## Learnings`。
8. 在 `.curdx-state.json` 设置 `awaitingApproval: true`。

## 输出：`requirements.md`

完整结构：

```markdown
# Requirements: <Feature Name>

## Goal
1–2 句描述这个功能要做什么、为什么重要。

## User Stories

### US-1: [故事标题]
**As a** [用户类型]
**I want to** [动作/能力]
**So that** [收益/价值]

**Acceptance Criteria:**
- [ ] AC-1.1: [具体、可测试的标准]
- [ ] AC-1.2: [具体、可测试的标准]

### US-2: [故事标题]
...

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-1 | [描述] | High/Medium/Low | [如何验证] |
| FR-2 | [描述] | High/Medium/Low | [如何验证] |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | Performance | p99 延迟 | 1000 RPS 下 <200ms |
| NFR-2 | Security | OWASP ASVS | Level 2 |

## Glossary
- **术语**：相关定义

## Out of Scope
- [明确不包含的项]

## Dependencies
- [外部依赖或前置]

## Success Criteria
- [可衡量的成功定义]

## Unresolved Questions
- [需澄清的歧义]

## Next Steps
1. 与利益相关者评审需求
2. 运行 `/curdx-flow:design` 生成技术设计
```

## 稳定 ID 是契约

每条需求都有稳定 ID：

- `US-N` — 用户故事
- `AC-N.M` — 验收标准（嵌套在用户故事下）
- `FR-N` — 功能需求
- `NFR-N` — 非功能需求

下游产物会引用：

- `design.md` 通过 `_Requirements: FR-1, AC-1.1_` 标注每个组件满足哪些需求
- `tasks.md` 标注每个 `[VERIFY]` 任务测试哪些验收标准
- 最终 `V6 [VERIFY] AC checklist` 任务读 `requirements.md` 程序化验证每条 `AC-*`

需求被丢弃或重新编号会断链。`tasks.md` 已生成后，唯一安全的修订方式是 `/curdx-flow:refactor`，由 `refactor-specialist` 协同走 requirements → design → tasks。

## 真实产物片段

OAuth 登录功能的真实 `requirements.md` 片段：

```markdown
## User Stories

### US-1: 首次 OAuth 登录
**As a** 新用户
**I want to** 用我的 Google 或 Microsoft 账号登录
**So that** 我不用再管理一个密码

**Acceptance Criteria:**
- [ ] AC-1.1: 用户能在 5 秒内通过 Google 完成 OAuth 授权码流程
- [ ] AC-1.2: 首次登录成功后自动用 provider 数据创建用户账号
- [ ] AC-1.3: provider 账号链接到用户记录（一个用户可链多个 provider）

### US-2: 跨会话保持登录
**As a** 已认证用户
**I want to** 在浏览器跨会话保持登录
**So that** 我不用每次访问都重输密码

**Acceptance Criteria:**
- [ ] AC-2.1: 登录时签发的 refresh token 有效期 30 天
- [ ] AC-2.2: access token 可静默刷新，无需用户交互
- [ ] AC-2.3: 每次刷新 refresh token 轮换；旧 token 第二次使用被拒

## Functional Requirements

| ID | Requirement | Priority | AC |
|----|-------------|----------|----|
| FR-1 | 通过 PKCE 授权码流程支持 Google + Microsoft OAuth | High | AC-1.1 |
| FR-2 | 认证成功签发 access token (15min) + refresh token (30d) | High | AC-2.1 |
| FR-3 | 每次刷新轮换 refresh token；拒绝复用 token | High | AC-2.3 |
| FR-4 | 首次 OAuth 登录自动创建用户记录 | High | AC-1.2 |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | 认证延迟 | p99（授权码交换） | <200ms |
| NFR-2 | Refresh token 存储 | 加密 | 通过 KMS 静态加密 |
| NFR-3 | Token 轮换 | 并发刷新安全 | token 行 SELECT FOR UPDATE |
```

## 质量检查

完成前 Agent 自检：

- [ ] 每个用户故事都有可测试的验收标准
- [ ] 无含糊用语（"快"、"易"、"简单"、"更好"）
- [ ] 每条需求有明确优先级
- [ ] Out of scope 防止范围蔓延
- [ ] Glossary 定义专业术语
- [ ] Success criteria 可衡量
- [ ] 已设 `awaitingApproval: true`

## 反模式

| 不要 | 为什么 |
| --- | --- |
| 用模糊语言（"用户友好"、"快"） | 不可测试。换成指标。 |
| 跳过 Out of Scope | 没它，设计阶段范围会蔓延。 |
| 多个 FR 合在一行 | 每个 FR 应可独立验证。 |
| 生成后重新编号 ID | 会断掉所有下游引用。需要时用 `refactor`。 |
| 发明研究里没有的产品行为 | 不在 `research.md` 里就不在契约里。挂到 Open Questions。 |

## 阅读产物

审 `requirements.md` 时关注：

- **每条 US 应映射到真实的人**。"系统"这种模糊用户是味道。
- **每条 FR 应可测试**。"应当性能良好"不是需求；"1000 RPS 下 P99 < 200ms"是。
- **NFR 应覆盖研究浮现的横切关注**。研究标记的安全风险，如果没有 NFR 回应，要 push back。
- **验收标准要明确**。"功能正确"不是 AC。
- **看 Out of Scope 列表**。短列表通常意味着范围没盯紧——push back。

## 最佳实践

- 通过审批前读完每条 AC。每条都会成为自治循环要跑的 `[VERIFY]` 门禁。
- 早 push back。这一阶段补一条遗漏需求是一行编辑，到了 `implement` 之后就是几天返工。
- 重构先把当前行为写成 AC。重构必须先满足这些 AC，才允许加新行为。
- 阅读时如果脑子里冒出"我还想要 X"——这是信号：要么现在加进去（新 US/FR），要么显式加到 Out of Scope。别留模糊。
