# 快速开始

从零到第一个通过审批的 spec，**每步都展示真实产物片段**，让你在跑命令之前就知道输出长什么样。

## 前置依赖

| 要求 | 为什么需要 | 安装 |
|-------------|----------------|---------|
| **Node.js ≥ 20.12** | 安装器和 `analyze` CLI 在 Node 上运行 | [nodejs.org](https://nodejs.org) |
| **Claude Code CLI** | flow 是运行在 Claude Code 内的插件 | `npm install -g @anthropic-ai/claude-code` |
| **Git** | 规约保存在仓库里，执行器按任务提交 | 标准安装 |
| *(可选)* **Bun ≥ 1.0** | 自动检测；选 `claude-mem` 时安装器问是否安装 | [bun.sh](https://bun.sh) |

确认 Claude Code 在 `PATH` 上：

```bash
claude --version
# Claude Code 1.x.x
```

失败先解决这一步。flow 是协调层，不能替代 Claude Code 本身。

## 安装

```bash
npx @curdx/flow
```

首次运行选语言（English / 中文），然后选安装哪些。内置 `curdx-flow` 插件始终安装，其它都是可选。

### 非交互式

```bash
# 安装全部，无确认
npx @curdx/flow install --all --yes

# 只装指定条目
npx @curdx/flow install claude-mem context7
```

### 验证

```bash
claude plugin list                    # 应能看到 curdx-flow@curdx
claude mcp list                       # 你选装的 MCP
npx @curdx/flow status                # 全绿勾即正常
```

在 Claude Code 输入 `/curdx-flow:`，应能看到所有命令的自动补全。

## 你的第一个 Spec（端到端）

这个走查从头到尾构建一个 OAuth 登录功能，每一步显示真实产物片段。

```bash
cd ~/projects/my-app
claude
```

### 步骤 1：`/curdx-flow:start`

```text
/curdx-flow:start
```

提示时描述目标：

```text
> 我想加 OAuth 登录（Google + Microsoft），带 refresh token 轮换。
```

接下来 60 秒里你会看到：

```text
分支检查：在 main（默认分支）
  → 创建新分支？[Y/n] Y
  → 分支名：feat/oauth-login
  → 已切换到 feat/oauth-login

Intent classification: GREENFIELD (high confidence, 3 keywords matched)
  → Min/Max questions: 5/10

Goal Interview (1/5): 什么痛点驱动这个？
> 用户抱怨密码疲劳；我们有 JWT 但没 SSO。

Goal Interview (2/5): 约束和必须？
> 现有 JWT 系统保留。Refresh token 必须轮换。不能破坏会话。

Goal Interview (3/5): 怎么知道这能工作？
> 首次登录 5s 内。静默刷新。现有 auth 测试无回归。

Goal Interview (4/5): 什么显式不在范围内？
> Passkey、SAML、账号链接 UI。

Goal Interview (5/5): 已知什么 vs 需要发现什么？
> JWT 模式在 src/auth/jwt.ts。OAuth provider 细节未知。

方案提议:
  (A) 扩展现有 JWT 模块，OAuth 接进去
  (B) 新认证模块 + refresh 轮换；JWT 保留给老路径
  (C) 用现有原语轻量集成

> B

Skill Discovery Pass 1:
  - claude-mem:make-plan: matched (keywords: build, plan, implement)
  - context7: matched (keywords: oauth, library, docs)

派遣并行研究团队（3 位组员）:
  ⟳ researcher-1: OAuth 2.0 最佳实践与 refresh token 策略
  ⟳ researcher-2: PKCE 模式与安全考量
  ⟳ explorer-1: 代码库分析现有认证模式

[~45 秒后]
  ✓ 所有组员完成。合并到 research.md。
  ✓ research.md 已写（148 行，9 处引用，4 项风险）

Skill Discovery Pass 2:
  - pua:pua-loop: no match
  - frontend-design: no match (no UI in scope)

awaitingApproval: true。停下等审批。

→ 下一步：审 specs/oauth-login/research.md，再运行 /curdx-flow:requirements
```

此时 `research.md` 真实片段：

```markdown
# Research: oauth-login

## Executive Summary
OAuth 2.0 授权码流程 + PKCE + refresh token 轮换是正确模式。现有代码库
有 JWT 原语可复用做会话管理。主要风险是轮换中的 refresh token 竞态。

## External Research

### Best Practices
- 所有 OAuth 流（即便服务端）都用 PKCE — 来源: RFC 7636
- 按 RFC 6819 §5.2.2.3 做 refresh token 轮换 — 来源: oauth.net/2/refresh-tokens/

### Pitfalls to Avoid
- Token 复用不撤销会留钓鱼窗口 — 来源: portswigger.net OAuth research
- Provider 时钟漂移 → iat/exp 容忍 30 秒

## Codebase Analysis

### Existing Patterns
- JWT 签发在 `src/auth/jwt.ts:42` (HS256)
- Auth 中间件链：`src/server/middleware/auth.ts`
- Session cookie helper: `src/lib/session.ts`

### Constraints
- Postgres 用 `citext` 做大小写无关查询（一致模式）
- 所有中间件必须通过 `src/server/middleware-registry.ts` 注册

## Quality Commands
| Type | Command | Source |
|------|---------|--------|
| Lint | `pnpm run lint` | package.json |
| TypeCheck | `pnpm run check-types` | package.json |
| Unit Test | `pnpm test` | package.json |
| E2E Test | `pnpm test:e2e` | package.json |

## Verification Tooling
| Tool | Command | Detected From |
|------|---------|---------------|
| Dev Server | `pnpm run dev` | package.json scripts.dev |
| Browser Automation | `playwright` | devDependencies |
| Port | `3000` | .env |

## Feasibility Assessment
| Aspect | Assessment | Notes |
|--------|------------|-------|
| Technical Viability | High | 所有依赖已存在 |
| Effort Estimate | M | 单人 1 周 |
| Risk Level | Medium | Token 轮换竞态（R-2） |
```

### 步骤 2：`/curdx-flow:requirements`

```text
/curdx-flow:requirements

⟳ product-manager: 生成 requirements.md
  ✓ 完成。(3.2s)

awaitingApproval: true。
→ 下一步：审 specs/oauth-login/requirements.md，再 /curdx-flow:design
```

`requirements.md` 真实片段：

```markdown
# Requirements: oauth-login

## Goal
加 OAuth 2.0 登录（Google + Microsoft）+ refresh token 轮换，
保留现有 JWT 会话连续性。

## User Stories

### US-1: 首次 OAuth 登录
**As a** 新用户
**I want to** 用 Google 或 Microsoft 账号登录
**So that** 不用再管理一个密码

**Acceptance Criteria:**
- [ ] AC-1.1: 用户能在 5 秒内通过 Google 完成 OAuth 授权码流程
- [ ] AC-1.2: 首次成功登录自动用 provider 数据创建用户账号
- [ ] AC-1.3: provider 账号链接到用户记录（一个用户多个 provider）

### US-2: 跨会话保持登录
**As a** 已认证用户
**I want to** 跨浏览器会话保持登录
**So that** 不用每次访问都重输密码

**Acceptance Criteria:**
- [ ] AC-2.1: 登录时签发的 refresh token 有效期 30 天
- [ ] AC-2.2: access token 静默刷新无需用户交互
- [ ] AC-2.3: 每次刷新轮换 refresh token；复用 token 被拒

## Functional Requirements

| ID | Requirement | Priority | AC |
|----|-------------|----------|----|
| FR-1 | PKCE OAuth 码流支持 Google + Microsoft | High | AC-1.1 |
| FR-2 | 认证签发 access token (15min) + refresh token (30d) | High | AC-2.1 |
| FR-3 | 每次刷新轮换 refresh token；拒绝复用 | High | AC-2.3 |
| FR-4 | 首次 OAuth 登录自动创建用户记录 | High | AC-1.2 |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | 认证延迟 | p99（码交换） | <200ms |
| NFR-2 | Refresh token 存储 | 加密 | 通过 KMS 静态加密 |
| NFR-3 | Token 轮换 | 并发安全 | SELECT FOR UPDATE |

## Out of Scope
- Passkey 支持
- SAML
- 账号链接 UI

## Success Criteria
- 95% 用户首次登录 < 5s
- 生产遥测中零 refresh-token 复用事故
```

### 步骤 3：`/curdx-flow:design`

```text
/curdx-flow:design

⟳ architect-reviewer: 并行派 3 个 Explore 子 Agent
  ✓ 现有认证模式已分析
  ✓ 接口和类型已编目
  ✓ 数据流已追踪
  ✓ design.md 已写（9 决策，7 风险，mermaid 图）

awaitingApproval: true。
→ 下一步：审 specs/oauth-login/design.md，再 /curdx-flow:tasks
```

`design.md` 真实片段：

```markdown
# Design: oauth-login

## Overview
新认证模块在 src/auth/oauth/ 实现 PKCE 保护的码流（Google + Microsoft）。
Refresh token 在 Postgres 存储，带轮换锁。现有 JWT 模块保留给老路径。

## Components

### oauth-provider
**Purpose**: Google + Microsoft providers 的适配器
**Responsibilities**:
- 用 PKCE challenge 构造授权 URL
- 用码交换 token
- 验证 ID token 签名

**Interfaces**:
```typescript
interface OAuthProvider {
  getAuthorizeUrl(state: string, codeChallenge: string): string;
  exchangeCode(code: string, codeVerifier: string): Promise<TokenSet>;
  validateIdToken(idToken: string): Promise<UserClaims>;
}
```

### token-store
**Purpose**: Refresh token 持久化 + 轮换
**Responsibilities**:
- 登录时插入新 token 家族
- 原子性轮换 token（SELECT FOR UPDATE）
- 检测复用，撤销整个家族

## Technical Decisions

| ID | Decision | Options | Choice | Rationale |
|----|----------|---------|--------|-----------|
| D-1 | OAuth client | (a) 自研, (b) openid-client, (c) provider SDK | (b) | 已是传递依赖；RFC 兼容 |
| D-2 | Email 排序 | (a) 写入小写, (b) citext, (c) lower() | (b) | 现有模式；保留索引 |
| D-3 | Token 表布局 | (a) 共享 + tenant_id, (b) 按租户分表 | (a) | 查询更简单；RLS 处理租户 |

## Known Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R-1 | Provider 中断破坏登录 | 现有会话在刷新前继续工作 |
| R-2 | Refresh 轮换竞态 | SELECT FOR UPDATE；~5ms p99 锁 |
| R-3 | PKCE verifier 通过 referer 泄露 | `Referrer-Policy: strict-origin-when-cross-origin` |

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| src/auth/oauth/provider.ts | Create | Provider 适配器接口 |
| src/auth/oauth/google.ts | Create | Google provider 实现 |
| src/auth/oauth/microsoft.ts | Create | Microsoft provider 实现 |
| src/auth/oauth/token-store.ts | Create | Token 持久化 + 轮换 |
| src/auth/oauth/callback.ts | Create | POST /auth/callback handler |
| src/server/middleware/auth.ts | Modify | OAuth 接入链 |
| migrations/2026-05-05-oauth-tokens.sql | Create | Token 表 + 索引 |
```

### 步骤 4：`/curdx-flow:tasks`

```text
/curdx-flow:tasks

⟳ task-planner: 生成 POC-first 任务列表（granularity: fine）
  ✓ 派 2 个 Explore 验证 Files 路径和 Verify 命令
  ✓ tasks.md 已写（4 阶段，18 任务，8 [VERIFY] 检查点，3 VE 任务）

awaitingApproval: true。
→ 下一步：审 specs/oauth-login/tasks.md，再 /curdx-flow:implement
```

`tasks.md` 真实片段：

```markdown
# Tasks: oauth-login

## Phase 1: Make It Work (POC)

- [ ] 1.1 [P] Create OAuth provider config schema
  - **Do**:
    1. Create src/auth/oauth/config-schema.ts with Zod schema
    2. Add Google + Microsoft provider entries
  - **Files**: src/auth/oauth/config-schema.ts
  - **Done when**: Schema parses sample config without error
  - **Verify**: `pnpm tsc --noEmit src/auth/oauth/config-schema.ts && node -e "require('./src/auth/oauth/config-schema').schema.parse(require('./test-fixtures/oauth-config.json'))" && echo PASS`
  - **Commit**: `feat(auth): add OAuth provider config schema`
  - _Requirements: FR-1_
  - _Design: Component oauth-provider, D-1_

- [ ] 1.2 [P] Add token storage with rotation lock
  - **Do**:
    1. Create src/auth/oauth/token-store.ts
    2. Add insertToken / rotateToken using SELECT FOR UPDATE
  - **Files**: src/auth/oauth/token-store.ts, migrations/2026-05-05-oauth-tokens.sql
  - **Done when**: rotateToken locks and rotates atomically
  - **Verify**: `pnpm tsc --noEmit && node scripts/test-rotation.mjs && echo PASS`
  - **Commit**: `feat(auth): add token storage with rotation lock`
  - _Requirements: FR-3, NFR-3_
  - _Design: Component token-store, D-2, R-2_

- [ ] 1.3 [VERIFY] Quality checkpoint: pnpm lint && pnpm tsc --noEmit
  - **Do**: Run quality commands and verify all pass
  - **Verify**: All commands exit 0
  - **Done when**: No lint errors, no type errors
  - **Commit**: `chore(auth): pass quality checkpoint` (if fixes needed)

[... 12 more tasks across phases 1-3 ...]

## Phase 4: Quality Gates

- [ ] V4 [VERIFY] Full local CI: pnpm lint && pnpm tsc --noEmit && pnpm test && pnpm test:e2e && pnpm build
- [ ] V5 [VERIFY] CI pipeline passes
- [ ] V6 [VERIFY] AC checklist
  - **Do**: Read requirements.md, programmatically verify each AC-* is satisfied
  - **Verify**:
    - AC-1.1 — covered by tests/e2e/oauth-login.spec.ts:42
    - AC-1.2 — covered by src/auth/oauth/user-create.ts + tests
    - AC-2.3 — covered by tests/auth-rotation.test.ts (token reuse rejection)

- [ ] VE1 [VERIFY] E2E startup
- [ ] VE2 [VERIFY] E2E check: complete OAuth flow against sandbox
- [ ] VE3 [VERIFY] E2E cleanup
```

### 步骤 5：`/curdx-flow:implement`

```text
/curdx-flow:implement

读取状态。从任务 1.1 (0/18) 恢复 spec oauth-login。

⟳ task 1.1 [P] Create OAuth provider config schema
  TASK_COMPLETE
  status: pass
  commit: 7f3a9c2
  verify: schema parses sample, tsc clean

⟳ task 1.2 [P] Add token storage with rotation lock
  TASK_COMPLETE
  status: pass
  commit: 8e1b4d5
  verify: rotation test passed (3/3 concurrent)

⟳ task 1.3 [VERIFY] Quality checkpoint
  qa-engineer: VERIFICATION_PASS

⟳ task 1.4 Implement authorization code exchange handler
  TASK_COMPLETE
  status: pass
  commit: 1c2d3e4
  verify: e2e-oauth.mjs passed against google-sandbox

[阶段边界 — 推送 4 commits]
Pushed 4 commits (reason: phase boundary)

⟳ task 2.1 Extract token-family revocation helper
  ...

⟳ task V4 [VERIFY] Full local CI
  qa-engineer: VERIFICATION_PASS

⟳ task V5 [VERIFY] CI pipeline passes
  qa-engineer: gh pr checks shows all green
  VERIFICATION_PASS

⟳ task VE1 [VERIFY] E2E startup
  qa-engineer: dev server up on port 3000
  VERIFICATION_PASS

⟳ task VE2 [VERIFY] E2E check: complete OAuth flow against sandbox
  qa-engineer: full sandbox flow completed
  VERIFICATION_PASS

⟳ task VE3 [VERIFY] E2E cleanup
  qa-engineer: port 3000 free
  VERIFICATION_PASS

✓ ALL_TASKS_COMPLETE  (18/18 tasks, 41 commits)

PR: https://github.com/curdx/my-app/pull/142
```

循环跑的时候你走开。回来读 diff，merge。

## 恢复：任务失败时

停下长这样：

```text
⟳ task 1.4 Implement authorization code exchange handler
  Verify failed: e2e-oauth.mjs exited 1
  Last error: TypeError: cannot read property 'sub' of undefined at oauth-provider.ts:42
  Retry 1/5...
  Retry 2/5...
  Retry 5/5...
  ✗ HALT — task 1.4 verification failed beyond retry budget

修问题后运行 /curdx-flow:implement 恢复。
规约需修订时运行 /curdx-flow:refactor。
```

三种恢复路径：

**Path A — 实现 bug。** shell 里复现 verify 命令。错误是真的，修代码，`/curdx-flow:implement` 从任务 1.4 恢复。

**Path B — 规约错了。** 设计假设了不真的事情（如 token 字段叫 `subject` 不是 `sub`），运行 `/curdx-flow:refactor`。`refactor-specialist` 走 `requirements.md` → `design.md` → `tasks.md`，让你方法化更新每个。然后 `/curdx-flow:implement`。

**Path C — 重启。** 规约根本错了：`/curdx-flow:cancel`，然后用纠正后的目标 `/curdx-flow:start`。

## Quick 模式

低风险、可在最后一次性审完的小规约：

```text
/curdx-flow:start --quick
> 加 /healthz 端点，返回版本号和 uptime。
```

变化：

- 四阶段不暂停连续跑。
- 每个产物有 3 迭代评审循环（`spec-reviewer` 验证并修订）。
- `tasks.md` 生成后立刻启动自治循环。
- 在 `main` 时自动建分支。
- VE 任务自动启用（无跳过 prompt）。

不变：

- 四份产物仍生成并提交。
- 所有 `[VERIFY]` 门禁仍跑。
- 持续失败仍停。

最适合一次性审完的变更。

## 入门模式

### 单人小功能

```text
/curdx-flow:start
> 重构 cache helper 用新的 TTL 配置。
```

适合改动有边界、想用规约纪律但不想太重的场景。Intent 分类会选 `REFACTOR` 跑 TDD 工作流。

### 跨模块功能

```text
/curdx-flow:triage
> 服务端 webhook：接入、重试队列、死信 UI。
```

`triage-analyst` 把功能拆成依赖明确的多个规约（epic）。每个子规约按正常五阶段推进。Epic 存到 `specs/_epics/<name>/epic.md`。

### Bug 修复

```text
/curdx-flow:start
> 登录返回 500 而不是 401（无效凭据时）。
```

Intent 分类选 `BUG_FIX`。访谈变成 5 个聚焦复现问题。Phase 0 复现 bug 并写 BEFORE state。最终强制的 `VF` 任务重跑复现并验证修复。

## 常用参数

| 参数 | 效果 |
| --- | --- |
| `--quick` | 不暂停连续跑完所有阶段 |
| `--commit-spec` / `--no-commit-spec` | 每阶段后是否提交规约（默认开） |
| `--specs-dir <path>` | 规约写到非默认目录（如 `packages/api/specs/`） |
| `--tasks-size fine` / `coarse` | `tasks.md` 拆分粒度 |
| `--fresh` | 即使已有相关规约也强制新建 |

完整列表与项目级覆盖见 [配置](/zh/curdx-flow/configuration)。

## 日常常用命令

```bash
# 在 Claude Code 内
/curdx-flow:start         # 智能入口：新建或恢复
/curdx-flow:status        # 查看所有规约及阶段
/curdx-flow:switch        # 切换当前规约
/curdx-flow:implement     # 恢复自治执行

# 在 shell 里
npx @curdx/flow           # 交互式菜单
npx @curdx/flow status    # 当前安装情况
npx @curdx/flow update    # 更新到最新
npx @curdx/flow analyze   # 生成可观察性报告
```

## 最佳实践

- **提交四份核心产物**。`research.md`、`requirements.md`、`design.md`、`tasks.md` 应纳入版本控制。状态文件（`.curdx-state.json`、`.progress.md`）默认 gitignore。
- **认真审批**。每次暂停都是阶段切换前最便宜的纠偏机会，比事后返工省得多。
- **保持规约小而美**。30+ 任务的规约通常是两个规约伪装的，建议 `/curdx-flow:triage`。
- **谨慎使用 `--quick`**。低风险变更可用，但跳过的门禁是有意义的。
- **升级后跑 `npx @curdx/flow status`**。能在你被坑之前暴露漂移。
- **停下后读 `.progress.md`**。`## Learnings` 段是执行器记录的真实失败上下文。

## 下一步

- 读 [工作原理](/zh/curdx-flow/how-it-works) 了解架构与执行模型
- 在 [配置](/zh/curdx-flow/configuration) 中配置参数和受管 `CLAUDE.md` 块
- 在 [命令参考](/zh/curdx-flow/commands) 中浏览所有斜杠和 CLI 命令
- 在 [子 Agent](/zh/curdx-flow/agents/) 中认识团队
