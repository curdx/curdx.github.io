# spec-executor

执行阶段负责人——也是工作流中**唯一的自治子 Agent**。从 `tasks.md` 取未勾选任务，在新上下文中实现，验证，提交，推进，直到全部勾完。

## 触发条件

| 触发 | 行为 |
| --- | --- |
| `/curdx-flow:implement` | 启动（或恢复）自治循环 |
| `/curdx-flow:cancel` | 停止当前循环并清理状态 |

循环跑到下面任一情况停：

- `tasks.md` 中所有任务已勾（`ALL_TASKS_COMPLETE`），或
- 验证门禁失败超出单任务重试预算（停下并暴露失败）。

## 输入（每任务）

协调器通过 `Task` 工具每次委派**一个**任务：

| 字段 | 来源 | 用途 |
| --- | --- | --- |
| `basePath` | 协调器 | 规约目录——所有文件操作必须用 |
| `specName` | 协调器 | 规约名 token |
| Task index | `.curdx-state.json` | 0-based 索引到 `tasks.md` |
| Task block | `tasks.md` | 完整的 Do/Files/Done when/Verify/Commit 块 |
| `.progress.md` 上下文 | 之前的进度 | 已完成任务、学习 |
| `progressFile`（可选） | 并行模式 | 用 `.progress-task-N.md` 替代 `.progress.md` |

## 关键运作规则

执行器按严格的角色定义运作。这些规则在系统 prompt 开头**和结尾**都重述：

1. **"完成"意味着真实环境中已验证工作并有证据**——API 响应、日志输出、真实行为。"代码编译过"或"测试通过"单独不够。
2. **无用户交互**。永远不用 `AskUserQuestion`。用 `Explore`、`Bash`、`WebFetch`、MCP 浏览器工具替代。
3. **永不修改 `.curdx-state.json`**。状态对执行器只读。协调器拥有状态转移。
4. **永不输出 `TASK_COMPLETE`**，除非：verify 通过、done-when 满足、改动已提交、任务已勾 `[x]`。
5. **总是把规约文件提交一起**（`tasks.md` + 进度文件）。

## 执行循环

```text
当还有未勾选任务时：
    从 tasks.md 取下一未勾选任务（taskIndex 来自状态）
    打开新上下文（Task 委派 = 新上下文窗口）
    注入：任务描述、design.md 摘要、相关文件

    若是 [VERIFY] 任务：
        委派给 qa-engineer（不是 spec-executor）
        VERIFICATION_PASS → 标 [x]、提交、推进
        VERIFICATION_FAIL → 重试计数 +1；预算耗尽则停下

    若是 [P] 并行批：
        ONE message 派 N 个 spec-executor 并行
        各自写 .progress-task-N.md
        批完成后合并进度

    否则：
        spec-executor 实现任务
        跑 Verify 命令
        提交（默认每任务一 commit）
        在 tasks.md 标 [x]
        输出 TASK_COMPLETE

    协调器跑 3 层验证（见下）
    通过 → 推进 taskIndex；阶段边界或 5+ commits 时推
    失败 → 重试或生成修复任务

emit ALL_TASKS_COMPLETE
```

让循环可信赖的三个特性：

1. **任务级新鲜上下文**。长会话和限流恢复不会污染后续任务。执行器只看到当前任务需要的内容。
2. **先验证再推进**。`[VERIFY]` 失败立即暴露，不会盖在前一个任务上面。
3. **持续失败必停**。重试预算耗尽则停下。修底层问题再恢复。flow 不会悄悄盖过真实失败。

## 验证层级（协调器侧）

每个 `TASK_COMPLETE` 后，协调器在推进前跑三层：

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

验证执行器显式输出 `TASK_COMPLETE`（最终任务可用 `ALL_TASKS_COMPLETE`）。沉默或部分完成无效——隐含完成无效。

`TASK_COMPLETE` 缺失 → 不推进，增 `taskIteration` 重试。

### Layer 3：周期性产物评审

满足任一时协调器调用 `spec-reviewer`：

- **阶段边界**：任务 ID 阶段号变了。
- **每 5 个任务**：`taskIndex > 0 && taskIndex % 5 == 0`。
- **最终任务**：`taskIndex == totalTasks - 1`。

reviewer 读改动文件（`git diff --name-only $TASK_START_SHA HEAD`）、`design.md`、`requirements.md`，输出 `REVIEW_PASS` 或 `REVIEW_FAIL`（每任务最多 3 评审迭代；失败时自动生成插入修复任务）。

## 提交纪律

**每任务 = 一 commit**。精确 commit 信息来自任务的 `Commit` 字段。Conventional commit 前缀：

| 前缀 | 何时 |
| --- | --- |
| `feat(scope):` | 新功能 |
| `fix(scope):` | bug 修复 |
| `refactor(scope):` | 代码重构 |
| `test(scope):` | 添加测试 |
| `docs(scope):` | 文档 |
| `chore(scope):` | 维护、质量检查点 |

**每个任务 commit 必须含**：

```bash
# 顺序执行：
git add <task files>
git add <basePath>/tasks.md          # 标记 [x]
git add <basePath>/.progress.md      # 学习已追加
git commit -m "<exact commit message from task>"

# 并行执行（提供了 progressFile）：
git add <basePath>/<progressFile>    # 不是 .progress.md
```

不提交规约文件会破坏跨会话进度跟踪。协调器在每次状态推进后还提交索引更新（`./specs/.index/`）。

### 推送策略

每任务提交；分批推送：

| 何时推送 | 为什么 |
| --- | --- |
| 阶段边界 | 稳定检查点 |
| 自上次推送 5+ commits | 避免丢失工作 |
| PR 创建前（Phase 4/5） | `gh pr create` 需要 |
| `awaitingApproval` 触发时 | 用户门禁需要远端状态 |

## 文件修改安全

执行器用外科手术式编辑：

- **现有文件**：`Edit` 工具（精准替换）。永不在现有文件用 `Write`——`Write` 替换全部内容、悄悄回滚之前的提交。
- **仅新文件**：`Write` 工具用于创建不存在的文件。
- **`Edit` 失败**（`old_string` 找不到）：重读文件，正确 `old_string` 重试。永不退化到 `Write`。
- **提交后检查**：`git diff HEAD~1 --stat`。出现意外删除 → 调查后再 `TASK_COMPLETE`。

执行器**只触碰任务 `Files` 段列出的文件**。无"顺手做"改进。无相邻代码格式化。

## TDD 三联行为

任务含 `[RED]`、`[GREEN]`、`[YELLOW]` 时，执行器切模式：

### `[RED]` — 只写失败测试

- 只写测试代码。**不写**实现代码。
- Verify 确认测试失败。测试通过是错误（行为已存在或测试错了）。
- 只提交测试文件。
- Verify 模式：`<test cmd> 2>&1 | grep -q "FAIL\|fail\|Error" && echo RED_PASS`

### `[GREEN]` — 让测试过

- 写最小代码让失败测试通过。
- 不重构、无多余。丑但通过是对的。
- Verify 模式：`<test cmd>`

### `[YELLOW]` — 重构

- 自由重构：重命名、提取、重组。
- 每步重构后所有测试通过。测试坏了立即回滚那次重构。
- Verify 模式：`<test cmd> && <lint cmd>`

## `[VERIFY]` 任务被委派

`[VERIFY]` 任务**永不由 spec-executor 直接执行**。协调器委派给 `qa-engineer`：

```text
Task: Execute verification task $taskIndex for spec $spec
Subagent: qa-engineer

Task body:
[Full Do, Verify, Done-when sections]

Instructions:
1. Execute verification as specified
2. If issues found, attempt to fix them
3. Output VERIFICATION_PASS if verification succeeds
4. Output VERIFICATION_FAIL if verification fails and cannot be fixed
```

`VERIFICATION_PASS` 视作 `TASK_COMPLETE`。`VERIFICATION_FAIL` 不推进——协调器增 `taskIteration` 重试。

## 并行执行

当前任务有 `[P]` 且相邻任务共享标记时，协调器构造并行批（最多 5 任务），**ONE message** 派遣所有实例：

```text
Step 1: TeamDelete()                       # 释放残留团队
Step 2: TeamCreate("exec-$spec")           # 新团队
Step 3: TaskCreate per task in batch
Step 4: ALL Task(...) calls in ONE message
        Each spec-executor writes to .progress-task-N.md
Step 5: Wait for idle notifications
Step 6: SendMessage(shutdown_request) per teammate
Step 7: Merge .progress-task-N.md files into .progress.md
Step 8: TeamDelete()
```

并行模式下，执行器用 `flock` 协调写入：

```bash
# tasks.md 更新（标记 [x]）：
( flock -x 200; sed -i 's/- \[ \] X.Y/- [x] X.Y/' "$BASE/tasks.md" ) 200>"$BASE/.tasks.lock"

# git 提交：
( flock -x 200; git add <files>; git commit -m "msg" ) 200>"$BASE/.git-commit.lock"
```

锁文件（`.tasks.lock`、`.git-commit.lock`）是临时的；协调器在批后清理。

## 输出协议

成功模板（每任务完成都用）：

```text
TASK_COMPLETE
status: pass
commit: a1b2c3d
verify: all tests passed (12/12)
```

约束：

- 单行 `verify:` 结果。
- 7 字符 commit hash（`git rev-parse --short HEAD`）。
- 无推理叙述（"First I'll..."）。
- 无庆祝（"Great news!"）。
- 无完整堆栈（最多一行）。
- 无文件列表（commit hash 足够）。
- 无"为什么"解释（写到 commit 消息里）。

最终任务：输出 `ALL_TASKS_COMPLETE`。协调器在以下都满足时发出 `ALL_TASKS_COMPLETE`（带可选 PR URL）：

- `taskIndex >= totalTasks`
- 所有任务标 `[x]`
- 零测试回归已验证
- 代码模块化/可复用（在 `.progress.md` 文档化）
- Phase 5 PR Lifecycle 完成（如有）

## `TASK_MODIFICATION_REQUEST` 协议

任务计划需调整时，执行器输出 `TASK_MODIFICATION_REQUEST` 而非自作主张：

```text
TASK_MODIFICATION_REQUEST
```
```json
{
  "type": "SPLIT_TASK" | "ADD_PREREQUISITE" | "ADD_FOLLOWUP",
  "originalTaskId": "X.Y",
  "reasoning": "Why this modification is needed",
  "proposedTasks": [
    "- [ ] X.Y.1 Task name\n  - **Do**:\n    1. Step\n  - **Files**: path\n  - **Done when**: Criteria\n  - **Verify**: command\n  - **Commit**: `type(scope): message`"
  ]
}
```

| 类型 | 何时 | 同响应中 TASK_COMPLETE? |
| --- | --- | --- |
| `SPLIT_TASK` | 当前任务太复杂 | 是（原任务完成，子任务插入） |
| `ADD_PREREQUISITE` | 发现缺失依赖 | 否（阻塞直到 prereq 完成） |
| `ADD_FOLLOWUP` | 需要清理/扩展 | 是（当前任务完成，后续添加） |

限制：每任务最多 3 修改；嵌套深度最多 2 级（`1.3.1.1` 允许，`1.3.1.1.1` 拒绝）。

## 恢复循环（修复任务）

`recoveryMode: true` 时任务失败，协调器自动生成修复任务：

```text
1. 解析失败输出（提取 taskId、error、attemptedFix）
2. 检查修复限制（maxFixTasksPerOriginal，默认 3）
3. 检查修复深度（最多 2 嵌套层）
4. 生成修复任务 markdown：
   - [ ] X.Y.N [FIX X.Y] Fix: <error summary>
5. 插入到 tasks.md（原任务块后）
6. 更新 state.fixTaskMap[taskId]:
   { attempts: N, fixTaskIds: [...], lastError: "..." }
7. 增 totalTasks
8. 委派修复任务给 spec-executor
9. 修复 TASK_COMPLETE → 重试原任务
10. 修复失败 → 生成修复的修复（深度最多 2）
```

`.progress.md` 中的修复任务链：

```markdown
## Fix Task History
- Task 1.3: 2 fixes attempted (1.3.1, 1.3.2) - Final: PASS
- Task 2.1: 1 fix attempted (2.1.1) - Final: PASS
- Task 3.4: 3 fixes attempted (3.4.1, 3.4.2, 3.4.3) - Final: FAIL (max limit)
```

修复预算耗尽时（`attempts >= maxFixTasksPerOriginal`），协调器停下并：

```text
ERROR: Max fix attempts (3) reached for task 3.4
Fix attempts: 3.4.1, 3.4.2, 3.4.3
```

## 真实样例循环输出

用户视角的典型 implement 运行：

```text
你：    /curdx-flow:implement
flow：  读取状态。从任务 1.1 (0/12) 恢复 spec oauth-login。

       ⟳ task 1.1 [P] Add OAuth provider config schema
         TASK_COMPLETE
         status: pass
         commit: 7f3a9c2
         verify: schema parses sample, tsc clean

       ⟳ task 1.2 [P] Add token storage with rotation lock
         TASK_COMPLETE
         status: pass
         commit: 8e1b4d5
         verify: rotation test passed (3/3 concurrent)

       ⟳ task 1.3 [VERIFY] Quality checkpoint: pnpm lint && pnpm tsc --noEmit
         qa-engineer: VERIFICATION_PASS

       ⟳ task 1.4 Implement authorization code exchange handler
         TASK_COMPLETE
         status: pass
         commit: 1c2d3e4
         verify: e2e-oauth.mjs passed against google-sandbox

       [phase boundary — pushing 4 commits]
       Pushed 4 commits (reason: phase boundary)

       ⟳ task 2.1 Extract token-family revocation helper
         ...

       ✓ ALL_TASKS_COMPLETE  (12/12 tasks, 47 commits, all green)

       PR: https://github.com/curdx/oauth-login/pull/42
```

中途失败：

```text
       ⟳ task 1.4 Implement authorization code exchange handler
         Verify failed: e2e-oauth.mjs exited 1
         Last error: TypeError: cannot read property 'sub' of undefined at oauth-provider.ts:42
         Retry 1/5...
         Retry 2/5...
         Retry 5/5...
         ✗ HALT — task 1.4 verification failed beyond retry budget

       修问题后运行 /curdx-flow:implement 恢复。
       规约需要修订时运行 /curdx-flow:refactor。
```

## 执行器**不**做的事

- 不编辑设计清单外的文件。清单错了就修订规约。
- 不跳 `[VERIFY]` 门禁。失败的门禁就是失败的任务。
- 不发明新任务（用 `TASK_MODIFICATION_REQUEST` 替代）。
- 不跑交互式命令。验证命令必须非交互。
- 不修改 `.curdx-state.json`。协调器独占。
- 不直接推送到默认分支。分支在 `/curdx-flow:start` 时设。

这种窄范围是特性——正是它让循环可信赖到能离开。

## 反模式

| 不要 | 为什么 |
| --- | --- |
| 在现有文件用 `Write` | 替换整个内容、悄悄回滚之前的提交。 |
| 编辑 `Files` 段外的文件 | 范围外编辑破坏清单契约。 |
| 输出 `TASK_COMPLETE` 带保留 | Layer 1 矛盾检测会拒绝。 |
| 跳过 `tasks.md` / `.progress.md` 的提交 | 破坏进度跟踪。 |
| 修改 `.curdx-state.json` | 协调器独占。Layer 2 验证。 |
| 谎报完成 | 浪费迭代、破坏工作流。诚实暴露阻塞。 |

## 停下后恢复

```text
# 1. 看哪里停了
/curdx-flow:status

# 2. 读失败任务，手动复现
cat specs/<spec>/tasks.md
# 在 shell 跑 verify 命令

# 3a. 实现 bug，修了恢复：
/curdx-flow:implement

# 3b. 规约问题，先 refactor：
/curdx-flow:refactor
/curdx-flow:implement
```

## 最佳实践

- 认真审 `tasks.md`。执行器对它做承诺，错任务就只能取消并 refactor。
- 不在 CI 跑 `/curdx-flow:implement`。它要交互式 Claude Code。
- 验证命令保持快。循环反复跑它，慢的验证成倍放大等待。
- 把停下当信号。循环故意会在无法安全推进时停下——先排查再恢复。
- 默认开 `--commit-spec`，让规约产物随代码一起提交。评审者两边都该能读到。
- 终端中关注 `TASK_MODIFICATION_REQUEST` 信号——意味着执行器浮出真实的计划不匹配，值得你关注。
