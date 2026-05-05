# task-planner

任务阶段负责人。把已通过的设计拆成有序、可勾选的任务列表，工作单元之间穿插验证门禁。

`task-planner` 在 `/curdx-flow:tasks` 时被调用，产出 `tasks.md`——`spec-executor` 自治执行的契约，按任务推进直到全部勾完。

支持两种粒度模式（`fine` / `coarse`）和三种工作流（POC-first / TDD / Bug TDD），由 intent 分类决定。

## 触发条件

| 触发 | 行为 |
| --- | --- |
| `/curdx-flow:tasks` | 由 `design.md` 生成 `tasks.md`（工作流由 intent 自动选） |
| `/curdx-flow:tasks --tasks-size coarse` | 粗粒度：10–20 任务（替代默认 40–60+） |

## 输入

| 字段 | 来源 | 用途 |
| --- | --- | --- |
| `basePath` | 协调器 | 规约目录 |
| `requirements.md` | Phase 2 | US, FR, NFR, AC 用于溯源 |
| `design.md` | Phase 3 | 文件清单、决策、风险 |
| `research.md` | Phase 1 | Quality Commands 和 Verification Tooling |
| `Intent Classification` | `.progress.md` | 选择工作流（POC / TDD / Bug TDD） |
| `granularity` | 委派参数 | `fine`（默认）或 `coarse` |

## 工作流选择

Agent 读 `.progress.md` 的 `Intent Classification` 选工作流：

| Intent | 工作流 | 理由 |
| --- | --- | --- |
| `GREENFIELD` | POC-first（5 阶段） | 新功能需要先快速验证，再投入测试 |
| `TRIVIAL` | TDD Red-Green-Yellow | 现有代码有测试可基于 |
| `REFACTOR` | TDD | 重构——测试守卫回归 |
| `MID_SIZED` | TDD | 扩展功能——测试先定义预期 |
| `BUG_FIX` | Bug TDD（Phase 0 + 4） | 先复现，再 TDD 锁定修复防止回归 |

intent 缺失时按目标关键词推断："new"、"create"、"build"、"from scratch" → POC-first；"fix"、"extend"、"refactor"、"update" → TDD。

## 粒度规则

| 模式 | POC 目标 | TDD 目标 | 最大 Do 步数 | 最大文件数 | `[VERIFY]` 频次 |
| --- | --- | --- | --- | --- | --- |
| `fine`（默认） | 40–60+ | 30–50+ | 4 | 3 | 每 2–3 任务 |
| `coarse` | 10–20 | 8–15 | 8–10 | 5–6 | 每 2–3 任务 |

`fine` 是生产默认——每个任务足够小，diff 可审。`coarse` 用于 spike 和原型，提交粒度本来就不重要。

### 拆分 / 合并规则

**拆分（fine）**：
- Do 段超过 4 步
- Files 段超过 3 文件
- 任务混合创建 + 测试
- 任务混合多个逻辑关注点

**合并（fine）**：
- 任务 A 创建文件，任务 B 加单个 import 到该文件
- 两个任务触碰同一文件且改动琐碎相关
- 单独看任一任务都没意义

## 任务格式契约

`update-spec-index.mjs` hook 用正则解析任务。任何偏离都会破坏进度跟踪。每个任务必须是顶级列表项，含复选框 + 紧跟着的可识别 ID token：

```markdown
- [ ] 1.1 Task title
- [x] 1.2 [P] Parallel task
- [ ] V1 [VERIFY] Quality checkpoint
- [ ] VE1 [VERIFY] E2E startup
- [ ] VF [VERIFY] Goal verification
```

可识别 ID tokens：`\d+\.\d+`、`V\d+`、`VE\d+`、`VF`。其它**不会被跟踪**。

**禁止在 `- [ ]` 复选框后出现的 token**：`AC-…`、`FR-…`、`NFR-…`、`US-…`。这些是引用 ID，不是执行单元——放在复选框后会让进度跟踪器把需求当任务计数（真实事故：导致已完成 spec 报告 0/N）。

任务正文里 AC/FR/NFR/US 列表必须用纯 bullet（`- AC-1.1 — covered by …`）或编号（`1. AC-1.1 — …`）。

## 五种任务标记

Agent 用这些标记控制协调器行为：

| 标记 | 效果 | 委派给 |
| --- | --- | --- |
| （无） | 顺序实现任务 | `spec-executor` |
| `[P]` | 可并行（与相邻 `[P]` 零文件冲突） | `spec-executor`（并行批） |
| `[VERIFY]` | 质量门禁；运行验证命令 | `qa-engineer` |
| `[RED]` / `[GREEN]` / `[YELLOW]` | TDD 三联（测试 → 实现 → 重构） | `spec-executor` |
| `[FIX X.Y]` | 恢复循环自动生成的修复任务 | `spec-executor` |

`[P]` 规则（planner 自动检测）：

1. 与相邻任务零文件冲突（不同 `Files:`）。
2. 不依赖相邻任务的输出。
3. **不是** `[VERIFY]`（那种打断并行组）。
4. 不修改共享配置文件（package.json, tsconfig.json 等）。
5. 单批最大 5 任务。

## 标准任务结构

每个任务用这个固定格式：

```markdown
- [ ] 1.2 [P] Create user service
  - **Do**:
    1. Create src/services/user.ts with UserService class
    2. Implement findById and create methods
    3. Add basic JSDoc
  - **Files**: src/services/user.ts
  - **Done when**: UserService is exported with findById/create methods
  - **Verify**: `pnpm tsc --noEmit && grep -q 'export class UserService' src/services/user.ts && echo PASS`
  - **Commit**: `feat(services): add UserService`
  - _Requirements: FR-1, AC-1.1_
  - _Design: Component A, D-1_
```

必填字段：
- **Do** — 执行器精确执行的编号步骤（fine 最多 4 步）
- **Files** — 任务可修改的具体路径（fine 最多 3 文件）
- **Done when** — 可测试的成功标准
- **Verify** — 可运行命令，**不是描述**
- **Commit** — 精确的 conventional-commit 信息
- **Requirements / Design** — 溯源反向引用

## POC-first 工作流（Greenfield）

五阶段，比例如下：

| Phase | 任务占比 | 焦点 |
| --- | --- | --- |
| 1: Make It Work (POC) | 50–60% | 端到端验证对真实外部系统。跳过测试。 |
| 2: Refactoring | 15–20% | 清理代码、加错误处理、遵循项目模式 |
| 3: Testing | 15–20% | 单元 + 集成 + E2E 测试 |
| 4: Quality Gates | 10–15%（合并） | 本地 CI、PR 创建、V4–V6 + VE1–VE3 |
| 5: PR Lifecycle | — | CI 监控、评审解决、自治直到达标 |

Phase 1 以 `POC Checkpoint` 任务结束，证明集成对真实外部系统能工作（不只是编译）。

## TDD 工作流（非 Greenfield）

每个工作单元是 3-task 三联：

```markdown
- [ ] 1.1 [RED] Failing test: refresh token rotation rejects reused token
  - **Do**: Write test asserting reused refresh token returns 401
  - **Files**: src/auth/__tests__/refresh.test.ts
  - **Done when**: Test exists AND fails with expected assertion error
  - **Verify**: `pnpm test -- --grep "rotation rejects reused" 2>&1 | grep -q "FAIL\|fail\|Error" && echo RED_PASS`
  - **Commit**: `test(auth): red - failing test for refresh token reuse rejection`
  - _Requirements: FR-3, AC-2.3_

- [ ] 1.2 [GREEN] Pass test: minimal token reuse detection
  - **Do**: Add reuse check in refresh handler; return 401 on second use
  - **Files**: src/auth/refresh.ts
  - **Done when**: Previously failing test now passes
  - **Verify**: `pnpm test -- --grep "rotation rejects reused"`
  - **Commit**: `feat(auth): green - implement refresh token reuse rejection`
  - _Requirements: FR-3, AC-2.3_

- [ ] 1.3 [YELLOW] Refactor: extract token-family revocation helper
  - **Do**: Extract revokeFamily helper; both reuse-detection and explicit-logout use it
  - **Files**: src/auth/refresh.ts, src/auth/__tests__/refresh.test.ts
  - **Done when**: Code is clean AND all tests pass
  - **Verify**: `pnpm test && pnpm lint`
  - **Commit**: `refactor(auth): yellow - extract revokeFamily helper`
```

TDD 规则：
- `[RED]` 只写测试代码，测试**必须失败**。
- `[GREEN]` 写最小代码让测试过。无多余、不重构。
- `[YELLOW]` 每个三联可选（代码已清就跳过）。

## Bug TDD 工作流（BUG_FIX）

Phase 0 在任何代码改动前预置两个先复现任务：

```markdown
- [ ] 0.1 [VERIFY] Reproduce bug: login returns 500 instead of 401 for invalid creds
  - **Do**: Run reproduction command and confirm it fails as described
  - **Done when**: Command fails with expected error
  - **Verify**: `curl -s -o /dev/null -w '%{http_code}' -X POST localhost:3000/auth/login -d 'user=x&pass=y' | grep -q '500' && echo REPRO_PASS`
  - **Commit**: None (no code changes in Phase 0)

- [ ] 0.2 [VERIFY] Confirm repro consistency: bug fails reliably 3/3 times
  - **Do**: Run reproduction command 3 times to confirm consistent failure
  - **Done when**: Failure consistent; document BEFORE state in .progress.md
  - **Verify**: `for i in 1 2 3; do curl ... | grep -q '500' || exit 1; done && echo CONSISTENT_PASS`
  - **Commit**: `chore(login): document reality check before`
```

Phase 0 把 `## Reality Check (BEFORE)` 写到 `.progress.md`：

```markdown
## Reality Check (BEFORE)
- Reproduction command: `curl -s -o /dev/null -w '%{http_code}' -X POST localhost:3000/auth/login -d 'user=x&pass=y'`
- Exit code: 0 (curl succeeded; HTTP code captured separately)
- HTTP code observed: 500 (expected 401)
- Confirmed failing: yes
- Timestamp: 2026-05-05T12:30:00Z
```

Phase 1 第一个 `[RED]` 任务引用此 BEFORE state 锁定精确失败模式。强制的最终 `VF` 任务重跑复现并验证修复：

```markdown
- [ ] VF [VERIFY] Goal verification: original failure now passes
  - **Do**:
    1. Read BEFORE state from .progress.md
    2. Re-run reproduction command from Reality Check (BEFORE)
    3. Compare output with BEFORE failure
    4. Document AFTER state in .progress.md
  - **Verify**: HTTP 401 returned (was 500)
  - **Done when**: Command that failed before now passes correctly
  - **Commit**: `chore(login): verify fix resolves original issue`
```

## 验证层级（V 任务）

每个 spec 最后 3 任务的最终验证序列：

```markdown
- [ ] V4 [VERIFY] Full local CI: lint && typecheck && test && e2e && build
  - **Do**: Run complete local CI suite including E2E
  - **Verify**: All commands pass
  - **Done when**: Build succeeds, all tests pass, E2E green
  - **Commit**: `chore(scope): pass local CI` (if fixes needed)

- [ ] V5 [VERIFY] CI pipeline passes
  - **Do**: Verify GitHub Actions/CI passes after push
  - **Verify**: `gh pr checks` shows all green
  - **Done when**: CI pipeline passes
  - **Commit**: None

- [ ] V6 [VERIFY] AC checklist
  - **Do**: Read requirements.md, programmatically verify each AC-* is satisfied
  - **Verify**: Grep codebase for AC implementation, run relevant test commands
  - **Done when**: All acceptance criteria confirmed met via automated checks
  - **Commit**: None
```

中间的 `V1`、`V2`、`V3` 检查点每 2–3 个实现任务后插入。

## VE 任务（E2E 验证）

VE 任务起真实基础设施，端到端测试已构建的功能。出现在 `V6` 之后、Phase 5 之前：

```markdown
- [ ] VE1 [VERIFY] E2E startup: start dev server and wait for ready
  - **Do**:
    1. Start dev server in background: `pnpm run dev &`
    2. Record PID: `echo $! > /tmp/ve-pids.txt`
    3. Wait for ready (60s timeout): `for i in $(seq 1 60); do curl -s localhost:3000/api/health && break || sleep 1; done`
  - **Verify**: `curl -sf localhost:3000/api/health && echo VE1_PASS`
  - **Done when**: Dev server responding on 3000
  - **Commit**: None

- [ ] VE2 [VERIFY] E2E check: complete OAuth flow against provider sandbox
  - **Do**:
    1. Hit /auth/start, follow redirect, complete sandbox auth
    2. Verify session cookie present and access token works
  - **Verify**: `node scripts/e2e-oauth.mjs && echo VE2_PASS`
  - **Done when**: User flow produces signed-in session
  - **Commit**: None

- [ ] VE3 [VERIFY] E2E cleanup: stop server and free port
  - **Do**:
    1. Kill by PID: `kill $(cat /tmp/ve-pids.txt) 2>/dev/null; sleep 2; kill -9 $(cat /tmp/ve-pids.txt) 2>/dev/null || true`
    2. Kill by port fallback: `lsof -ti :3000 | xargs -r kill 2>/dev/null || true`
    3. Remove PID file: `rm -f /tmp/ve-pids.txt`
    4. Verify port free: `! lsof -ti :3000`
  - **Verify**: `! lsof -ti :3000 && echo VE3_PASS`
  - **Done when**: No process on 3000, PID file removed
  - **Commit**: None
```

VE 规则：
- 总是顺序（永远不 `[P]`）——基础设施状态共享。
- 总是 `[VERIFY]` 标记——委派给 `qa-engineer`。
- VE3（清理）必须运行，即便 VE1 或 VE2 失败。最大重试时协调器跳到 VE-cleanup。
- 命令来自 `research.md` "Verification Tooling" 段——不能硬编码。
- Library 项目得到最小 VE（构建 + 导入检查，无开发服务器）。

## 禁止模式

Agent 强制硬性禁止：

### 不允许手动验证

`Verify` 字段必须是**自动化命令**。执行器不能问问题或等人工输入。禁止模式：

- "Manual test..."
- "Manually verify..."
- "Check visually..."
- "Ask user to..."

如果验证看起来需要手动测试，找自动化替代：
- 视觉检查 → DOM 元素断言、截图比对 CLI
- 用户流测试 → 浏览器自动化（Playwright/Puppeteer via MCP）
- Dashboard 验证 → API 查询 dashboard 后端
- 扩展测试 → `web-ext lint`、清单验证、构建输出检查

### 不允许新建 spec 目录

任务**永远不**创建新 spec 目录用于测试。执行器在当前 spec 目录内运作。新建 spec 目录会污染代码库、导致清理问题、破坏单 spec 模型。

POC/测试在 spec 内做：
- 在当前 spec 上下文内测
- 用 `.test-temp/` 在当前 spec 里
- 在当前 spec 里创建测试夹具

## 真实样例输出

OAuth 登录的真实 `tasks.md` 节选（POC-first，fine 粒度）：

```markdown
# Tasks: oauth-login

## Phase 1: Make It Work (POC)

- [ ] 1.1 [P] Add OAuth provider config schema
  - **Do**:
    1. Create src/auth/oauth/config-schema.ts with Zod schema for provider config
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
- [ ] VE2 [VERIFY] E2E check: full OAuth flow against sandbox
- [ ] VE3 [VERIFY] E2E cleanup

## Notes
- POC shortcuts: hardcoded provider client IDs in Phase 1 → replaced in Phase 2.
- Production TODOs: refresh token cleanup job, audit log integration.
```

## 质量检查

- [ ] 所有任务用 `- [ ] <task-id> …` 列表项格式（无 `### Task` 标题）
- [ ] 没有 `- [ ]` 复选框引用 AC/FR/NFR/US ids
- [ ] 所有任务 ≤ 4 Do 步（fine）或 ≤ 10（coarse）
- [ ] 所有任务触碰 ≤ 3 文件（fine）或 ≤ 6（coarse）
- [ ] 所有任务引用 requirements/design
- [ ] 没有 Verify 字段含 "manual"、"visually"、"ask user"
- [ ] 每个任务有可运行 Verify 命令
- [ ] 质量检查点每 2–3 任务插入
- [ ] 最终 V4–V6 总是存在
- [ ] VE 任务存在（按 research.md 项目类型）
- [ ] 任务按依赖排序
- [ ] `[P]` 组最大 5 任务，被 `[VERIFY]` 打断
- [ ] BUG_FIX 包含 Phase 0（复现）+ 强制 VF 任务

## 反模式

| 不要 | 为什么 |
| --- | --- |
| 标题任务（`### Task X.Y: …`） | index hook 不解析。跟踪器报 0/N。 |
| 复选框 AC/FR/NFR/US 行 | 跟踪器把它们当任务计数。真实事故存在。 |
| 手动验证 | 执行器不能问问题。找自动化路径。 |
| 投机功能 | 每任务 = 一个逻辑关注点。无"顺手做"。 |
| Do 步骤里隐藏依赖 | 通过任务顺序和 Files 显式表达依赖。 |
| `[P]` 共享文件的任务 | 竞态、丢失编辑、提交破坏。 |

## 最佳实践

- 在 `/curdx-flow:implement` 之前认真读 `tasks.md`。循环开始后改错任务等于取消并 refactor。
- 看到没有验证的实现工作就 push back，让 planner 加 `[VERIFY]` 门禁。
- `coarse` 仅用于你接受回滚也很粗的场景。一个坏的粗任务就是回滚一大坨 diff。
- 长规约考虑拆小，而不是产出 30 任务的 `tasks.md`。
- 验证命令必须项目能真正跑起来。`research.md` 的 Quality Commands 表是事实来源。
- BUG_FIX 规约通过前手动复现 Phase 0——本地复现不出来，AFTER 验证就证不了修复。
