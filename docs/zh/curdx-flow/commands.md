# 命令参考

CurdX Flow 有两套命令面：Claude Code 内的**斜杠命令**（工作流），以及 Claude Code 外的 **`npx @curdx/flow` CLI**（安装器与可观察性）。

## 斜杠命令（Claude Code 内）

内置插件提供这些 `/curdx-flow:*` 命令。日常常用其实只有三个：`start`、`status`、`implement`。

### 工作流命令

| 命令 | 用途 |
| --- | --- |
| `/curdx-flow:start` | 智能入口。识别新建 vs 恢复，运行访谈，派遣研究。**九成场景用它。** |
| `/curdx-flow:new` | 强制新建规约，跳过恢复检测。 |
| `/curdx-flow:research` | 重新运行研究阶段。 |
| `/curdx-flow:requirements` | 通过 `product-manager` 生成 `requirements.md`。 |
| `/curdx-flow:design` | 通过 `architect-reviewer` 生成 `design.md`。 |
| `/curdx-flow:tasks` | 通过 `task-planner` 把设计拆成可勾选任务列表（`tasks.md`）。 |
| `/curdx-flow:implement` | 启动自治执行循环。一直跑到全部完成或不可恢复失败。 |

实战示例：

```text
# 新建规约——访谈、研究、暂停
/curdx-flow:start
> 加一个带 token 刷新的 OAuth 登录。

# 小变更走快速模式
/curdx-flow:start --quick
> 加 /healthz，返回版本号 + uptime。

# 修复后恢复自治循环
/curdx-flow:implement

# 目标更清晰后重新研究
/curdx-flow:research
```

### 规约管理

| 命令 | 用途 |
| --- | --- |
| `/curdx-flow:status` | 查看所有规约、阶段、进度。 |
| `/curdx-flow:switch` | 切换当前规约（用于恢复 / 继续）。 |
| `/curdx-flow:cancel` | 取消当前自治循环、清理状态、可选删除规约。 |
| `/curdx-flow:refactor` | 在执行暴露问题后，按 `requirements.md` → `design.md` → `tasks.md` 顺序重构规约。 |
| `/curdx-flow:index` | 把代码库和外部资源索引为可搜索的规约元数据。 |

实战示例：

```text
# 查看每个规约现在在哪
/curdx-flow:status

# 切到另一个进行中的规约
/curdx-flow:switch
> upload-api

# 执行器揭露设计漏洞后回头改规约
/curdx-flow:refactor
```

### Epic 与拆分

| 命令 | 用途 |
| --- | --- |
| `/curdx-flow:triage` | 把大功能拆成依赖明确的多个规约，产出 `specs/_epics/<name>/epic.md` 与子规约图。 |

```text
/curdx-flow:triage
> 服务端 webhook：接入、重试队列、死信 UI。
```

### 帮助与反馈

| 命令 | 用途 |
| --- | --- |
| `/curdx-flow:help` | 显示插件帮助和工作流概览。 |
| `/curdx-flow:feedback` | 提交反馈或上报插件问题。 |

## CLI 命令（Claude Code 外）

在 shell 里运行。最常用的是 `npx @curdx/flow`，进入交互式菜单。

### 安装器

```bash
# 交互式菜单（安装 / 更新 / 卸载 / 状态）
npx @curdx/flow

# 非交互：一键全装
npx @curdx/flow install --all --yes

# 只装指定条目
npx @curdx/flow install claude-mem context7

# 全部更新到最新
npx @curdx/flow update

# 干净卸载（连同受管 CLAUDE.md 块一起移除）
npx @curdx/flow uninstall

# 单次调用覆盖语言
npx @curdx/flow --lang en
```

### 状态

```bash
# 查看安装情况和漂移
npx @curdx/flow status

# 给脚本和 CI 用的机器可读输出
npx @curdx/flow status --json
```

返回市场条目列表、各条目的安装状态、以及已装版本与可用版本的偏差。

### Analyze（插件可观察性）

```bash
# 从最近一次 Claude Code 会话生成 markdown 报告
npx @curdx/flow analyze

# 报告中包含 prompt（仅用于本地排障）
npx @curdx/flow analyze --include-prompts
```

`analyze` 解析 Claude Code 会话 jsonl（`~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl`）合并 `~/.claude/curdx-flow/errors.jsonl`，输出 7 段 markdown 报告：

| 章节 | 告诉你 |
| --- | --- |
| Hook Failures | `exitCode ≠ 0` 数量最多的 hook |
| Slash Commands | `/curdx-flow:*` 调用频率 |
| Subagents | `Task` / `Agent` 调度热度 |
| Spec Funnel | 研究 → 需求 → 设计 → 任务 → 执行 各阶段完成率 |
| Hook Duration | 每个 hook 的 P50 / P95 / P99 延迟 |
| Schema Drift | 未知事件类型与解析错误 |
| Parent UUID Chain | `parentUuid` 链完整率 |

默认**不**包含 prompt 全文、完整文件路径、`file-history-snapshot` 内容。`--include-prompts` 仅供本地调试。

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
/curdx-flow:status
/curdx-flow:switch
/curdx-flow:implement
```

### 从卡住的循环中恢复

```text
# 1. 先取消、查看状态
/curdx-flow:cancel

# 2. 修底层问题（通常在 design.md 或 tasks.md）
/curdx-flow:refactor

# 3. 恢复执行
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

## 进阶建议

- **用 `start` 而不是 `new`**。`start` 同时支持新建和恢复；`new` 只在智能识别走错路时用。
- **认真审批每次暂停**。这是最便宜的纠偏机会。
- **`--quick` 仅用于低风险规约**，会跳过保护更高风险工作的门禁。
- **恢复前跑 `/curdx-flow:status`**，长时间不接尤其要看一眼。
- **保留 `analyze` 报告**。和发布 tag 一起存档，是规约执行过程的干净审计材料。
- **不要在 CI 里跑 `implement`**。它要交互式 Claude Code；CI 应运行项目自身的验证命令。
