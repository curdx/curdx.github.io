# 工作原理

CurdX Flow 的底层逻辑：**规约才是契约，而不是 Prompt。** 在写代码之前，工作先用四份带版本的 Markdown 文件描述清楚；然后由一个专家 Agent 一次跑一个任务，每任务之间都有 3 层验证协议。

本页走通每个内部机制：五阶段模型、intent 分类、目标访谈、并行研究派遣、协调器模式、自治循环、验证层级、恢复循环、hooks、状态。

## 五阶段工作流

每阶段一个负责子 Agent，一份产物。阶段顺序是设计上的——跳步或换序都不支持。

| 阶段 | 负责人 | 产物 | 暂停审批？ |
| --- | --- | --- | --- |
| 研究 | `research-analyst`（并行团队） | `research.md` | 是 |
| 需求 | `product-manager` | `requirements.md` | 是 |
| 设计 | `architect-reviewer` | `design.md` | 是 |
| 任务 | `task-planner` | `tasks.md` | 是 |
| 执行 | `spec-executor` | 代码、测试、提交 | 否——自治 |

前四阶段暂停审批；第五阶段是自治循环。

## 规约驱动架构

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 420" role="img" aria-label="CurdX Flow 规约驱动架构" style="max-width: 100%; height: auto;">
<defs>
<marker id="arch-arrow-zh-2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="400" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<text x="40" y="48" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">单仓库内的规约生命周期</text>
<text x="40" y="74" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">目标 → 四份产物 → 自治执行 → 提交代码。</text>

<rect x="40" y="106" width="220" height="76" rx="16" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<text x="64" y="138" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">/curdx-flow:start</text>
<text x="64" y="162" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">目标 + 访谈 + skills</text>

<rect x="290" y="106" width="640" height="76" rx="16" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<text x="312" y="138" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">阶段（每段后暂停审批）</text>
<text x="312" y="162" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">research.md → requirements.md → design.md → tasks.md</text>

<rect x="40" y="208" width="890" height="86" rx="16" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<text x="64" y="240" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">/curdx-flow:implement（自治循环）</text>
<text x="64" y="266" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">取下一任务 → 新上下文 → 实现 → 3 层验证 → 提交 → 标记 [x] → 重复直到 ALL_TASKS_COMPLETE</text>

<rect x="40" y="320" width="890" height="76" rx="16" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<text x="64" y="352" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">specs/&lt;name&gt;/  + .curdx-state.json + .progress.md</text>
<text x="64" y="376" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">产物提交到 git · 状态与进度 gitignore · 跨会话可恢复</text>

<path d="M260 144 L286 144" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow-zh-2)" />
<path d="M610 184 L610 204" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow-zh-2)" />
<path d="M484 296 L484 316" style="fill: none; stroke: var(--vp-c-divider); stroke-width: 2; stroke-dasharray: 4 5;" />
</svg>
</div>

## Intent 分类：如何选择工作流

`/curdx-flow:start` 在访谈**之前**对目标文本运行 intent 分类，决定问题深度和下游工作流。

| Intent | Min/Max 问题 | 工作流 | 触发关键词 |
| --- | --- | --- | --- |
| `BUG_FIX` | 5/5 | Bug TDD（Phase 0 + 4） | fix, resolve, debug, broken, failing, error, bug, crash, regression, reproduce |
| `TRIVIAL` | 1/2 | TDD | typo, spelling, small change, minor, quick, simple, tiny, rename, update text |
| `REFACTOR` | 3/5 | TDD | refactor, restructure, reorganize, clean up, simplify, extract, consolidate, modularize |
| `GREENFIELD` | 5/10 | POC-first | new feature, new system, new module, add, build, implement, create, integrate, from scratch |
| `MID_SIZED` | 3/7 | TDD | （无明确匹配时默认） |

置信度等级：

| 匹配数 | 置信度 | 行为 |
| --- | --- | --- |
| 3+ 关键词 | High | 用匹配的类别 |
| 1–2 关键词 | Medium | 用匹配的类别 |
| 0 关键词 | Low | 默认到 MID_SIZED |

分类存到 `.progress.md`，后由 `task-planner` 读取选 POC-first / TDD / Bug TDD 工作流。

## 目标访谈

分类后，协调器按 intent 深度跑自适应 Q&A。探查领域：

- **正在解决的问题** — 什么痛点或需求驱动这个目标？
- **约束和必须** — 性能、兼容性、时间、集成要求
- **成功标准** — 用户怎么知道功能正确工作？
- **范围边界** — 什么显式在/不在范围内？
- **用户已有知识** — 已知什么 vs 需要发现什么？

`BUG_FIX` intent 的访谈被替换成 5 个聚焦的复现问题：

1. 走一遍精确复现这个 bug 的步骤。你做什么、按什么顺序？
2. 你期望发生什么？实际发生什么？
3. 这是何时开始的？以前能用吗？
4. 是否有现有的失败测试捕获这个 bug？
5. 复现失败的最快命令是什么？

对话后，协调器提出 2–3 个高层方案并把响应存到 `.progress.md`：

```markdown
## Interview Format
- Version: 1.0

## Intent Classification
- Type: GREENFIELD
- Confidence: high (3 keywords matched)
- Min questions: 5
- Max questions: 10
- Keywords matched: add, build, implement

## Interview Responses

### Goal Interview (from start.md)
- Problem: 用户想要 Google + Microsoft SSO
- Constraints: 现有 JWT 系统保留；refresh token 必须轮换；不能破坏会话
- Success: 首次登录 5s 内；静默刷新；现有 auth 测试无回归
- Scope: 不在范围 — passkey、SAML
- Existing knowledge: JWT 模式在 src/auth/jwt.ts；OAuth 是新的
- Chosen approach: B - new auth module with refresh rotation

## Skill Discovery
- claude-mem:make-plan: matched (keywords: feature, plan, implement)
- pua:pua-loop: no match
```

`BUG_FIX` 立即抓 BEFORE state：

```markdown
## Reality Check (BEFORE)
- Reproduction command: `pnpm test -- --grep 'login flow'`
- Exit code: 1
- Output: Expected 401, got 500
- Confirmed failing: yes
- Timestamp: 2026-05-05T12:30:00Z
```

## Skill 自动发现

flow 扫描当前环境已安装的 Claude Code skills（项目 skills、`.agents/skills/`、插件 skills），按目标语义匹配，相关的预加载到上下文。

发现跑两次：

1. **第一次** — `/curdx-flow:start`，仅基于目标文本。
2. **第二次** — 研究完成后，基于目标 + research 执行摘要。捕捉问题深入理解后才相关的 skills。

Token 匹配算法：

1. 读每个 `SKILL.md` 文件的 YAML frontmatter（`name`, `description`）。
2. 分词：小写、连字符替空格、剥标点、空格切分。
3. 移除停用词：a, an, the, to, for, with, and, or, in, on, by, is, be, that, this, of, it, should, used, when, asks, needs, about。
4. 算目标/上下文 token 与 description token 的重叠数。
5. 重叠 ≥ 2 且未调用过 → 调用 `Skill({ skill: "..." })`。
6. 把匹配详情记到 `.progress.md` 的 `## Skill Discovery`。

两次都记录，便于回看哪些被加载、为什么。

## 并行研究派遣

研究命令是**协调器，不是研究者**。它必须把所有研究工作委派给子 Agent：

- `Explore` 子 Agent 用于代码库分析（只读、Haiku、快、便宜）
- `research-analyst` 子 Agent 用于网络研究（需要 WebSearch + WebFetch）

### 主题识别

派遣前协调器把目标拆成独立研究领域：

| 类别 | Agent 类型 |
| --- | --- |
| 外部 / 最佳实践 | `research-analyst` |
| 代码库分析 | `Explore` |
| 关联规约 | `Explore` |
| 领域专项（web） | `research-analyst` |
| 领域专项（code） | `Explore` |
| Quality Commands | `Explore` |
| Verification Tooling | `Explore` |

**最少 2 Agent**（1 research-analyst + 1 Explore）。无例外。

### 派遣流程

```text
1. TeamDelete()                              # 释放残留团队
2. TeamCreate(team_name: "research-$spec")
3. TaskCreate per topic
4. ALL Task(...) calls in ONE message        # 真正并行
5. 等待组员 idle 通知
6. SendMessage(shutdown_request) per teammate
7. TeamDelete()
```

真实派遣（每位组员一个 Task，全在同一条消息里）：

```typescript
Task({
  subagent_type: "research-analyst",
  team_name: "research-oauth-login",
  name: "researcher-1",
  prompt: `主题：OAuth 2.0 最佳实践与 refresh token 策略
    Spec: oauth-login | Path: ./specs/oauth-login/
    输出: ./specs/oauth-login/.research-oauth-patterns.md
    目标背景：[...]
    指令：
    1. WebSearch OAuth refresh-token 轮换模式 2024
    2. 查 RFC 6819 + OAuth WG 草案
    3. 识别陷阱（token 复用、竞态）
    不要扫描代码库——Explore 组员负责那部分。`,
});

Task({
  subagent_type: "Explore",
  team_name: "research-oauth-login",
  name: "explorer-1",
  prompt: `分析 spec oauth-login 的代码库
    输出: ./specs/oauth-login/.research-codebase.md
    找现有认证相关的模式、依赖、约束。`,
});

// + 同条消息中更多 Task(...) 调用
```

### 合并结果

所有组员完成后，协调器读各 `.research-<topic>.md`，合成统一 `research.md`，含这些段：

- Executive Summary
- External Research（Best Practices / Prior Art / Pitfalls）
- Codebase Analysis（Existing Patterns / Dependencies / Constraints）
- Related Specs
- Quality Commands
- Verification Tooling
- Feasibility Assessment
- Recommendations for Requirements
- Open Questions
- Sources

然后删除部分文件：`rm ./specs/$spec/.research-*.md`。

## 协调器模式

implement 命令是**协调器，不是实现者**。循环：

```text
1. 读 .curdx-state.json（taskIndex, totalTasks, taskIteration）
2. taskIndex >= totalTasks → 发 ALL_TASKS_COMPLETE，停
3. 解析当前任务（taskIndex 处）
4. 检测标记：
   - [P]: 构建并行批（最多 5）
   - [VERIFY]: 委派给 qa-engineer
   - 默认：委派给 spec-executor
5. 记录 TASK_START_SHA = git rev-parse HEAD
6. 通过 Task 工具委派
7. 等待响应
8. 跑 3 层验证
9. 更新状态（推进 taskIndex）
10. 阶段边界、5+ commits、awaitingApproval 时推送
11. 循环（通过 stop-watcher hook 重新调用）
```

完整性规则：

- 永不谎报完成——声明完成前验证实际状态
- 永不删除任务——任务失败就**添加**修复任务；总数只增不减
- 永不跳过验证层（3 层都必须通过）
- 永不无独立验证就信任子 Agent 声明
- 续触发但无活跃执行：干净停止，不伪造状态

## 三层验证

每个 `TASK_COMPLETE` 后，协调器在推进前跑三层。

### Layer 1：矛盾检测

扫描执行器输出中 `TASK_COMPLETE` 旁的矛盾模式：

- "requires manual"
- "cannot be automated"
- "could not complete"
- "needs human"
- "manual intervention"

任何矛盾短语与 `TASK_COMPLETE` 同时出现：
- 拒绝完成
- 日志：`CONTRADICTION: claimed completion while admitting failure`
- 增 `taskIteration` 重试

### Layer 2：信号验证

验证执行器显式输出 `TASK_COMPLETE`（最终任务用 `ALL_TASKS_COMPLETE`）。沉默或部分完成无效。

`TASK_COMPLETE` 缺失 → 不推进，增 `taskIteration` 重试。

### Layer 3：周期性产物评审

满足任一时协调器调用 `spec-reviewer`：

- **阶段边界**：阶段号变了（1.4 → 2.1）。
- **每 5 个任务**：`taskIndex > 0 && taskIndex % 5 == 0`。
- **最终任务**：`taskIndex == totalTasks - 1`。

评审循环：

```text
Set reviewIteration = 1

WHILE reviewIteration <= 3:
  1. 通过 `git diff --name-only $TASK_START_SHA HEAD` 收集改动文件
  2. 读 $SPEC_PATH/design.md 和 requirements.md
  3. 通过 Task 工具调用 spec-reviewer
  4. 解析最后一行信号：
     - REVIEW_PASS: 记录，进 State Update
     - REVIEW_FAIL（迭代 < 3）：
       a. Path A（代码级）：生成修复任务，插到当前后，
          委派给 spec-executor，重跑 Layer 3
       b. Path B（规约级）：在 .progress.md 追加 "## Review Suggestions"，
          打断循环
     - REVIEW_FAIL（迭代 >= 3）：
       记录警告，用最佳可用实现继续
     - 无信号（reviewer 错误）：
       视为 REVIEW_PASS（宽容）
```

## 恢复循环（修复任务）

`recoveryMode: true` 时任务失败：

```text
1. 解析失败输出
   - 匹配 `Task \d+\.\d+:.*FAILED`
   - 提取 Error / Attempted fix / Status
2. 检查修复限制（maxFixTasksPerOriginal，默认 3）
3. 检查修复深度（最多 2 嵌套层）
4. 生成修复任务 markdown：
   - [ ] X.Y.N [FIX X.Y] Fix: <error summary>
     - **Do**: 处理错误
     - **Files**: 原任务的 Files
     - **Verify**: 原任务的 Verify
     - **Commit**: fix(scope): address <errorType> from task X.Y
5. 插到 tasks.md（原任务块后）
6. 更新 state.fixTaskMap[taskId]:
   { attempts: N, fixTaskIds: [...], lastError: "..." }
7. 增 totalTasks
8. 委派修复给 spec-executor
9. 修复 TASK_COMPLETE → 重试原任务
10. 修复失败 → 生成修复的修复（深度最多 2）
```

恢复序列例子：

```text
任务 1.3 失败 → 生成 1.3.1
1.3.1 完成
重试 1.3 → 完成 → 成功！

# 或带嵌套修复：
任务 1.3 失败 → 生成 1.3.1
1.3.1 失败 → 生成 1.3.1.1（修复的修复）
1.3.1.1 完成
重试 1.3.1 → 完成
重试 1.3 → 完成 → 成功！
```

预算耗尽时协调器停下：

```text
ERROR: Max fix attempts (3) reached for task 3.4
Fix attempts: 3.4.1, 3.4.2, 3.4.3
```

## Native Task Sync

每个 spec 任务都镜像到 Claude Code native task（UI 可见）。协调器在状态中维护 `nativeTaskMap[taskIndex] → nativeTaskId`。

同步点：

- **初始化** — 首次调用，每个 spec 任务 `TaskCreate`，subject 形如 `"1.1 Task title"`（或 `"[P] 2.1 Task"`、`"[VERIFY] 1.4 Quality"`）。
- **委派前** — `TaskUpdate(status: "in_progress", activeForm: "Executing 1.1 ...")`。
- **验证后** — `TaskUpdate(status: "completed")`。
- **失败时** — `TaskUpdate(subject: "1.3 Task title [retry 2/5]", activeForm: "Retrying ...")`。

优雅降级：`TaskCreate`/`TaskUpdate` 连续 3 次失败后，协调器设 `nativeSyncEnabled: false`，无 UI 镜像继续。

## Hooks 编排

flow 自带四个 hook 绑到 Claude Code 生命周期：

| Hook | 事件 | 作用 |
| --- | --- | --- |
| `update-spec-index` | `Stop` | 维护 `./specs/.index/`，供 `/curdx-flow:status` 和 triage 用 |
| `quick-mode-guard` | `PreToolUse` | `--quick` 模式护栏 |
| `stop-watcher` | `Stop` | 检测自治循环完成，自动推进下一任务 |
| `load-spec-context` | `SessionStart` | 会话启动时预加载当前 spec |

Hooks 是 TypeScript 源码，构建时打包到 `.mjs`。是纯 shell 驱动脚本——hook 内部不嵌套 Agent。

`stop-watcher` hook 是让自治循环*自治*的关键：协调器响应结束时，hook 检测是否发出 `ALL_TASKS_COMPLETE`；如未发，自动续循环。

Hook 错误日志到 `~/.claude/curdx-flow/errors.jsonl`：

```json
{"hookName":"update-spec-index","exitCode":1,"stderr":"...","timestamp":"2026-05-05T12:30:00Z"}
```

## 提交纪律

**每任务 = 一 commit。** 每任务执行器提交：

```bash
git add <task files from Files section>
git add <basePath>/tasks.md          # 标记 [x]
git add <basePath>/.progress.md      # 学习已追加
git commit -m "<exact commit message from task>"
```

协调器在每次状态推进后还提交索引更新：

```bash
git add "$SPEC_PATH/tasks.md" "$SPEC_PATH/.progress.md" ./specs/.index/
git diff --cached --quiet || git commit -m "chore(spec): update progress for task $taskIndex"
```

### 推送策略

提交分批推送：

| 何时推送 | 为什么 |
| --- | --- |
| 阶段边界 | 稳定检查点 |
| 自上次推送 5+ commits | 避免丢失工作 |
| PR 创建前（Phase 4/5） | `gh pr create` 需要 |
| `awaitingApproval` 触发时 | 用户门禁需要远端状态 |

| 何时**不**推送 | 为什么 |
| --- | --- |
| 每个独立任务后 | 远端操作过多 |
| 阶段中间但未达 5 commits | 等批阈值 |

### 分支规则

- 永不直接推到默认分支（main/master）
- 分支在 `/curdx-flow:start` 时设（新分支 / worktree / 继续）
- 只推到功能分支：`git push -u origin <branch>`
- 执行中检测到默认分支：停下并告警

### 状态文件保护

`.curdx-state.json` **永不提交**。它持有执行状态（taskIndex, 迭代计数, fixTaskMap, modificationMap, nativeTaskMap），提交会污染历史。

`spec-executor` 对状态**只读**。只有协调器（implement 循环）通过 deep-merge helper 写入：

```bash
node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/lib/merge-state.mjs" \
     "$SPEC_PATH/.curdx-state.json" \
     '{"taskIndex":5,"taskIteration":1,"globalIteration":17}'
```

merge 保留所有现有字段（source, name, basePath, commitSpec, relatedSpecs 等）——永不从头写新对象。

## 状态与持久化

每个规约：

```text
specs/<spec-name>/
├── research.md              # 提交
├── requirements.md          # 提交
├── design.md                # 提交
├── tasks.md                 # 提交
├── .curdx-state.json        # gitignore — 执行状态
└── .progress.md             # gitignore — 阶段笔记、学习、skill 发现
```

仓库级：

```text
specs/
├── .current-spec            # 当前 spec 名（gitignore）
├── .current-epic            # 当前 epic 名（gitignore）
└── .index/                  # 用于 triage 的搜索索引
```

典型 `.curdx-state.json`：

```json
{
  "source": "spec",
  "name": "oauth-login",
  "basePath": "./specs/oauth-login",
  "phase": "execution",
  "taskIndex": 7,
  "totalTasks": 12,
  "taskIteration": 1,
  "maxTaskIterations": 5,
  "globalIteration": 23,
  "maxGlobalIterations": 100,
  "commitSpec": true,
  "quickMode": false,
  "granularity": "fine",
  "discoveredSkills": [
    {"name": "claude-mem:make-plan", "matchedAt": "start", "invoked": true},
    {"name": "pua:pua-loop", "matchedAt": "post-research", "invoked": true}
  ],
  "fixTaskMap": {
    "1.4": {
      "attempts": 1,
      "fixTaskIds": ["1.4.1"],
      "lastError": "TypeError: cannot read property 'sub' of undefined"
    }
  },
  "modificationMap": {},
  "nativeTaskMap": {
    "0": "task-7f3a9c2",
    "1": "task-8e1b4d5"
  },
  "awaitingApproval": false,
  "completed": false
}
```

四份核心产物是变更的持久记录。状态文件是工作内存。

## 市场那一面

同一个 npm 包还自带交互式安装器：

| ID | 类型 | 用途 |
| --- | --- | --- |
| **`curdx-flow`** | plugin | 规约工作流本身。**始终安装。** |
| `claude-mem` | plugin | 跨会话记忆。 |
| `pua` | plugin | 反失败压力模式，连续失败时触发。 |
| `chrome-devtools-mcp` | plugin | 通过 MCP 操控真实 Chrome。 |
| `frontend-design` | plugin | 高质量、不模板化的前端输出。 |
| `sequential-thinking` | mcp | 序列化思考 MCP 服务。 |
| `context7` | mcp | 实时库文档查询。 |

安装器读自带描述符目录，调 `claude plugin install` 和 `claude mcp add`，并在 `~/.claude/CLAUDE.md` 写入受管块告知 Claude Code 装了什么。所有操作幂等——任何时候重跑都能与目标状态对齐。

受管块用标记包裹：

```markdown
<!-- BEGIN @curdx/flow v1 -->
... 安装器维护的清单 ...
<!-- END @curdx/flow v1 -->
```

标记之外原样保留。`--no-claude-md`（或 `CURDX_FLOW_NO_CLAUDE_MD=1`）退出。

## 为什么需要它

Claude Code 速度快，但在真实项目中有可预测的失效模式：

- 不主动写测试，除非反复提醒。
- 跨会话、限流恢复、长会话内会丢失上下文。
- 同一任务不同次运行结果不一致。
- 对欠规约的需求不会反推，而是直接猜，等到代码评审时才发现错位。

多数工作流框架靠堆 Agent 解决问题。flow 的取舍：先把契约写出来，每阶段一个专家、新上下文，让自治循环把人工审过的中段执行做完。

赌注：

1. **规约才是契约，不是 Prompt。** 每次变更先写 `research.md` → `requirements.md` → `design.md` → `tasks.md`。它们存在仓库里。评审者能读。未来的你能读。
2. **子 Agent 专精，不堆叠。** 每阶段一位专家。新上下文。无多 Agent 编排沙拉。
3. **循环自跑。** `tasks.md` 通过后，`/curdx-flow:implement` 自治执行整个任务列表，每任务间有验证门禁。你走开。回来。读 diff。
4. **安装器和插件同包。** 无独立市场注册、无脚手架、无项目级配置。一次 `npx @curdx/flow`。

> Claude Code 是引擎。CurdX Flow 是底盘。

## 实操建议

- 把每个暂停当真正的检查点。在 `requirements.md` 阶段纠偏几乎免费，到 `tasks.md` 就要重新跑很多步。
- `/curdx-flow:implement` 之前认真读 `tasks.md`。循环开始后是按任务提交的，撤销靠 git，不是一键回退。
- 发现执行器跑偏，立刻 `/curdx-flow:cancel`、修规约、再恢复。别让它带着错跑 20 任务。
- 规约保持小到能装进脑子里。再大就用 `/curdx-flow:triage`。
- 多日项目结束后跑一次 `analyze` CLI。能暴露你平时永远不会注意到的 hook 故障、schema 漂移、命令/Agent 调度热度。
- 重试预算耗尽视作信号，不是配额。循环故意会停。
