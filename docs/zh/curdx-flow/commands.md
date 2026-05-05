# 命令参考

CurdX Flow 有两套命令面：Claude Code 内的**斜杠命令**（工作流），以及 Claude Code 外的 **`npx @curdx/flow` CLI**（安装器 + 可观察性）。

每个斜杠命令都有定义好的行为矩阵：读什么状态、写什么、派哪个子 Agent、发什么完成信号。本页把两边都文档化。

## 速查

```text
# Claude Code 内（工作流）
/curdx-flow:start               # 智能入口——访谈、研究、暂停
/curdx-flow:new <name>          # 强制新建 spec
/curdx-flow:research            # 重跑研究阶段
/curdx-flow:requirements        # 生成 requirements.md
/curdx-flow:design              # 生成 design.md
/curdx-flow:tasks               # 生成 tasks.md
/curdx-flow:implement           # 启动/恢复自治循环
/curdx-flow:status              # 查看所有规约
/curdx-flow:switch              # 切换当前规约
/curdx-flow:cancel              # 暂停循环、清理状态
/curdx-flow:refactor            # 走 requirements → design → tasks
/curdx-flow:index               # 构建可搜索规约元数据
/curdx-flow:triage              # 把功能拆成多个规约
/curdx-flow:help                # 显示帮助
/curdx-flow:feedback            # 提交反馈

# Shell 里（安装器 + 可观察性）
npx @curdx/flow                 # 交互式菜单
npx @curdx/flow install         # 安装市场条目
npx @curdx/flow update          # 更新到最新
npx @curdx/flow uninstall       # 干净卸载
npx @curdx/flow status          # 查看安装情况
npx @curdx/flow status --json   # 机器可读
npx @curdx/flow analyze         # 7 段可观察性报告
```

## 斜杠命令（Claude Code 内）

### `/curdx-flow:start`

智能入口。九成场景用它。

**做什么：**

1. 分支检查——在默认分支时提示新建/worktree/继续。
2. 参数解析——抽取 `name`、`goal`、`--fresh`、`--quick`、`--specs-dir`、`--tasks-size`。
3. Intent 分类——目标文本走关键词匹配，选 BUG_FIX/TRIVIAL/REFACTOR/GREENFIELD/MID_SIZED。
4. 恢复检测——name 提供且 spec 存在（且无 `--fresh`）时，问恢复 vs 新建。
5. 规约扫描——找 `./specs/` 下相关规约做上下文。
6. 新建流程：
   - `mkdir -p` 规约目录
   - 初始化 `.curdx-state.json`
   - 用目标写 `.progress.md`
   - 更新 `.current-spec`
   - 跑 Skill Discovery Pass 1
   - 跑目标访谈（深度按 intent）
   - 跑 Skill Discovery Pass 2（访谈后）
   - 派遣并行研究团队（≥2 子 Agent）
   - 合并到 `research.md`
   - 设 `awaitingApproval: true`，停
7. 恢复流程：读状态，跳到当前阶段。

**读：** `.curdx-state.json`、`.current-spec`、`.progress.md`、所有已装 `SKILL.md`
**写：** `<basePath>/research.md`、`.curdx-state.json`、`.progress.md`、`./specs/.index/`
**派：** 并行团队——`research-analyst` + `Explore`（最少 2，通常 3–5）
**停在：** `research.md` 合并后的 `awaitingApproval: true`

**示例：**

```text
# 自动检测（恢复或问新建）
/curdx-flow:start

# 恢复或创建 user-auth
/curdx-flow:start user-auth

# 创建 user-auth 含目标
/curdx-flow:start user-auth Add OAuth2

# 强制新建，覆盖已存在
/curdx-flow:start user-auth --fresh

# Quick 模式带目标
/curdx-flow:start "Build auth with JWT" --quick

# Quick 模式带 plan 文件
/curdx-flow:start ./my-plan.md --quick

# 粗粒度
/curdx-flow:start my-feature "Add logging" --tasks-size coarse
```

### `/curdx-flow:new`

强制新建规约，跳过恢复检测。智能入口选错时用它。

**读：** 无
**写：** 新规约目录、状态文件、进度文件
**派：** 无（创建骨架；研究通过 `/curdx-flow:research`）
**停在：** 未提供时提示 name 和 goal

```text
/curdx-flow:new oauth-login
> Goal: Add OAuth login with Google + Microsoft
```

### `/curdx-flow:research`

重跑研究阶段。目标变清晰想要更新研究时用。

**读：** `.progress.md` 目标背景、所有 `SKILL.md`
**写：** `<basePath>/research.md`、`.progress.md`（skill discovery 段）、部分 `.research-*.md`（合并后清理）
**派：** 通过 `TeamCreate` / `TaskCreate` / `Task`（同条消息）的并行研究团队
**停在：** 合并后 `awaitingApproval: true`

### `/curdx-flow:requirements`

由目标 + 研究生成 `requirements.md`。

**读：** `.progress.md`、`research.md`
**写：** `<basePath>/requirements.md`
**派：** `product-manager` 子 Agent（单个）
**停在：** 写完后 `awaitingApproval: true`

Agent 用 `Explore` 做需要的代码库分析（如用户面术语、现有 AC 模式）。稳定 ID（`US-N`、`AC-N.M`、`FR-N`、`NFR-N`）是一等公民——下游产物引用它们。

### `/curdx-flow:design`

由 requirements 生成 `design.md`。

**读：** `requirements.md`、`research.md`（代码库模式）
**写：** `<basePath>/design.md`
**派：** `architect-reviewer` + 多个并行 `Explore` 做架构分析
**停在：** `awaitingApproval: true`

最重要的暂停点。`design.md` 通过后，文件变更清单成为 `tasks.md` 和 `spec-executor` 的契约。

### `/curdx-flow:tasks`

把设计拆成可勾选任务列表。

**读：** `design.md`、`requirements.md`、`research.md`（Quality Commands 和 Verification Tooling）、`.progress.md`（Intent Classification → 工作流选择）
**写：** `<basePath>/tasks.md`、`.curdx-state.json`（设 `totalTasks`）
**派：** `task-planner` + 2–3 个并行 `Explore`
**停在：** `awaitingApproval: true`

工作流由 intent 选：

- `GREENFIELD` → POC-first（5 阶段，40–60+ tasks fine，10–20 coarse）
- `TRIVIAL`/`REFACTOR`/`MID_SIZED` → TDD Red-Green-Yellow（4 阶段，30–50+ tasks fine，8–15 coarse）
- `BUG_FIX` → Bug TDD（Phase 0 + 4 阶段，强制 VF 任务）

```text
# 默认 fine 粒度
/curdx-flow:tasks

# 原型用 coarse
/curdx-flow:tasks --tasks-size coarse
```

### `/curdx-flow:implement`

启动/恢复自治执行循环。

**读：** `.curdx-state.json`（taskIndex, totalTasks, taskIteration, fixTaskMap, modificationMap, nativeTaskMap）、`tasks.md`、`.progress.md`
**写：**
- `.curdx-state.json`（taskIndex, taskIteration, globalIteration, completed, completedAt）
- `tasks.md`（[x] 标记）
- `.progress.md`（已完成任务、学习、修复任务历史）
- `./specs/.index/`（每次状态推进通过 `update-spec-index.mjs`）
- 代码、测试、迁移（按任务 `Files` 段）

**派：**
- `spec-executor` 处理普通/`[P]`/`[RED]`/`[GREEN]`/`[YELLOW]` 任务
- `qa-engineer` 处理 `[VERIFY]`/`VE`/`VF` 任务
- `spec-reviewer` 周期性（阶段边界、每 5 任务、最终任务）
- 并行批用 `TeamCreate`/`Task`（同条消息最多 5）

**循环跑到任一停：**
- `taskIndex >= totalTasks` 且所有任务标 `[x]` → 发 `ALL_TASKS_COMPLETE`
- `taskIteration > maxTaskIterations`（默认 5）→ 停下报错
- `globalIteration > maxGlobalIterations`（默认 100）→ 停下报错
- Phase 5 PR Lifecycle 超时：48h 上限，20 CI 周期上限 → 停下

**发出：**
- `TASK_COMPLETE`（每任务）— 来自 `spec-executor`
- `VERIFICATION_PASS`/`VERIFICATION_FAIL` — 来自 `qa-engineer`
- `REVIEW_PASS`/`REVIEW_FAIL` — 来自 `spec-reviewer`
- `TASK_MODIFICATION_REQUEST` — 执行器浮出计划不匹配时
- `ALL_TASKS_COMPLETE`（终态）— 来自协调器
- 可选：`ALL_TASKS_COMPLETE` 后的 PR URL

```text
# 启动或恢复
/curdx-flow:implement

# 修问题后从同一任务恢复
/curdx-flow:implement
```

### `/curdx-flow:status`

显示所有规约、阶段、进度。

**读：** `./specs/.index/`（由 `update-spec-index.mjs` hook 构建）、找到的每个 `.curdx-state.json`
**写：** 无
**派：** 无
**输出：** 表格：spec name, phase, task progress (`N/M`), last activity

```text
/curdx-flow:status

Active: oauth-login
Spec               Phase         Progress  Last activity
oauth-login        execution     7/12      2 minutes ago
upload-api         design        —         3 hours ago
audit-log          completed     22/22     yesterday
```

### `/curdx-flow:switch`

切换当前规约。

**读：** `./specs/.index/`
**写：** `./specs/.current-spec`
**派：** 无

```text
/curdx-flow:switch
> Choose: upload-api
```

### `/curdx-flow:cancel`

暂停当前循环并清理状态。

**读：** `.curdx-state.json`
**写：** 移除 `.curdx-state.json`（或标 `cancelled: true`）；可选移除规约目录
**派：** 无

规约根本错时用——想用纠正后的目标重启。

```text
/curdx-flow:cancel
> Remove spec directory? [y/N] N   # 保留规约做参考，只暂停循环
```

### `/curdx-flow:refactor`

执行揭示设计漂移后，方法化走 `requirements.md` → `design.md` → `tasks.md`。

**读：** 四份产物全部 + `.progress.md`
**写：** `requirements.md`、`design.md`、`tasks.md` 的逐节更新
**派：** `refactor-specialist` 子 Agent

何时用：执行器停下因为规约假设了不真的事情。重构胜过硬扛重试。

```text
# 停下后：
/curdx-flow:refactor

# 走每份产物每节，问：保留、编辑、还是作废？
# 通过后更新下游产物保持对齐。

/curdx-flow:implement   # 恢复执行
```

### `/curdx-flow:index`

把代码库 + 外部资源索引成可搜索规约元数据。`/curdx-flow:status` 和 `/curdx-flow:triage` 内部用。仓库大重构后或 status 报告变陈旧时手动跑。

**读：** 所有 `./specs/<name>/` 目录，可选外部源
**写：** `./specs/.index/`
**派：** 无（纯文件扫描）

### `/curdx-flow:triage`

把大功能拆成依赖明确的多个规约（epic）。

**读：** `.progress.md`（背景）、`./specs/.index/`（关联规约）
**写：**
- `./specs/_epics/<epic-name>/epic.md`
- `./specs/_epics/<epic-name>/.epic-state.json`
- `./specs/.current-epic`
- 每个子规约一个 `./specs/<child-spec>/` 骨架
**派：** `triage-analyst` 子 Agent

```text
/curdx-flow:triage
> 服务端 webhook：接入、重试队列、死信 UI。

triage-analyst:
  拆成 3 个 spec：
    1. webhook-ingestion (无依赖，从这开始)
    2. webhook-retry (依赖：webhook-ingestion)
    3. webhook-dead-letter (依赖：webhook-retry)

  Epic: specs/_epics/webhooks/epic.md

→ 下一步：/curdx-flow:start 开始第一个无阻塞子规约
```

### `/curdx-flow:help` / `/curdx-flow:feedback`

`help` 显示插件帮助和工作流概览。`feedback` 不离开 Claude Code 提交反馈到 GitHub Issue 跟踪器。

## CLI 命令（Claude Code 外）

### `npx @curdx/flow`

交互式菜单。最常用入口。

**做什么：**

- 首次：选语言（English / 中文）。
- 显示菜单：install / update / uninstall / status / exit。
- 每个动作执行前确认。

### `npx @curdx/flow install`

```bash
# 交互式选择器
npx @curdx/flow install

# 全部，无 prompt
npx @curdx/flow install --all --yes

# 指定条目
npx @curdx/flow install claude-mem context7

# 不同语言
npx @curdx/flow install --lang en
```

**每条目效果：**

- 插件：`claude plugin install curdx/<plugin-id>`
- MCP 服务：`claude mcp add <name> <transport-config>`
- 更新 `~/.claude/CLAUDE.md` 受管块（除非 `--no-claude-md`）

幂等——重跑产生相同终态。

### `npx @curdx/flow update`

```bash
npx @curdx/flow update
```

对比已装版本与市场目录，更新过期。内部重跑 hooks 打包步骤确保 `.mjs` 输出与 TypeScript 源匹配。

### `npx @curdx/flow uninstall`

```bash
npx @curdx/flow uninstall
```

每个已装条目：`claude plugin uninstall` / `claude mcp remove`。从 `~/.claude/CLAUDE.md` 移除受管块（标记外内容保留）。

### `npx @curdx/flow status`

```bash
# 人类可读
npx @curdx/flow status

# 给脚本和 CI 用的机器可读
npx @curdx/flow status --json
```

返回市场条目、每条目安装状态、已装版本与可用版本的偏差。JSON 样例：

```json
{
  "version": "7.1.2",
  "items": [
    {"id": "curdx-flow", "type": "plugin", "installed": true, "version": "7.1.2", "available": "7.1.2", "drift": "none"},
    {"id": "claude-mem", "type": "plugin", "installed": true, "version": "0.4.1", "available": "0.5.0", "drift": "minor"},
    {"id": "context7", "type": "mcp", "installed": false, "version": null, "available": "latest", "drift": "missing"}
  ]
}
```

CI 中用它检测 Claude Code 升级后的漂移。

### `npx @curdx/flow analyze`

解析 Claude Code 会话 jsonl 生成 7 段 markdown 报告。

```bash
# 默认——除 prompt 全文外都包含
npx @curdx/flow analyze

# 包含 prompt（仅本地排障）
npx @curdx/flow analyze --include-prompts
```

**输入：**
- `~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl`（Claude Code 会话日志）
- `~/.claude/curdx-flow/errors.jsonl`（hook 错误）
- `plugins/curdx-flow/schemas/transcript-events.json`（事件白名单；缺失时回退到内置）

**章节：**

| 章节 | 告诉你 |
| --- | --- |
| Hook Failures | `exitCode ≠ 0` 数量最多的 hook |
| Slash Commands | `/curdx-flow:*` 调用频率（含 `<command-name>` XML 回退） |
| Subagents | `Task` / `Agent` 调度热度 |
| Spec Funnel | research → requirements → design → tasks → execution 完成率 |
| Hook Duration | 每 hook 的 P50 / P95 / P99 延迟 |
| Schema Drift | 未知事件类型与解析错误 |
| Parent UUID Chain | `parentUuid` 链完整率（`withParent / total`） |

默认**不**含 prompt 全文、完整文件路径、`file-history-snapshot` 内容。`--include-prompts` 仅供本地调试。

## 命令组合食谱

### 走完一个完整功能

```text
/curdx-flow:start
> 用自然语言描述功能。

# 通过研究 → 推进下一阶段，循环：
/curdx-flow:requirements
/curdx-flow:design
/curdx-flow:tasks
/curdx-flow:implement
```

### 长时间间隔后恢复

```text
/curdx-flow:status            # 看所有规约
/curdx-flow:switch            # 切换当前规约
/curdx-flow:implement         # 恢复自治循环
```

### 从卡住的循环恢复

```text
# 1. 暂停查看状态
/curdx-flow:cancel

# 2. shell 复现 verify 命令
cat specs/oauth-login/tasks.md
pnpm test -- --grep "rotation"

# 3a. 实现 bug：修代码、恢复
/curdx-flow:implement

# 3b. 规约错：先 refactor
/curdx-flow:refactor
/curdx-flow:implement
```

### 审计安装

```bash
npx @curdx/flow status
claude plugin list
claude mcp list
```

### 生成会话复盘

```bash
npx @curdx/flow analyze
```

把报告与发布 tag 一起存档做审计历史。

### CI 检测安装漂移

```bash
# CI 中
npx @curdx/flow status --json | jq -e '.items[] | select(.drift != "none")' && \
  echo "DRIFT detected" && exit 1
```

## 进阶建议

- **用 `start` 而不是 `new`**。`start` 同时支持新建和恢复；`new` 只在智能识别走错路时用。
- **认真审批每次暂停**。这是最便宜的纠偏机会。
- **`--quick` 仅用于低风险规约**，会跳过保护更高风险工作的门禁。
- **恢复前跑 `/curdx-flow:status`**，长时间不接尤其要看一眼。
- **保留 `analyze` 报告**。和发布 tag 一起存档，是规约执行过程的干净审计材料。
- **不要在 CI 里跑 `implement`**。它要交互式 Claude Code；CI 应运行项目自身的验证命令。
- **停下后读 `.progress.md`**。`## Learnings` 和 `## Fix Task History` 段告诉你循环为什么停下。
