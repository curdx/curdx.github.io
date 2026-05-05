# 配置

CurdX Flow 可在三个层面配置：CLI 参数（每次调用）、环境变量（按 shell 或会话）、受管的 `~/.claude/CLAUDE.md` 块（全局，所有 Claude Code 会话共享）。

## CLI 参数

### 安装器参数（`npx @curdx/flow`）

| 参数 | 效果 |
| --- | --- |
| `--all` | 对所有可用条目执行（配合 `install` / `update`） |
| `--yes` | 跳过所有确认（非交互式） |
| `--lang en` / `--lang zh` | 覆盖本次调用的语言 |
| `--no-claude-md` | 不写入 `~/.claude/CLAUDE.md` 受管块 |
| `--json` | 机器可读 JSON 输出（配合 `status`） |

实战示例：

```bash
# 一键安装全部，无确认
npx @curdx/flow install --all --yes

# 中文界面安装，跳过 CLAUDE.md 块
npx @curdx/flow install --lang zh --no-claude-md

# 给脚本和 CI 用的机器可读 status
npx @curdx/flow status --json
```

### 插件参数（斜杠命令）

这些参数传给 `/curdx-flow:start` 或 `/curdx-flow:new`：

| 参数 | 效果 |
| --- | --- |
| `--quick` | 不暂停连续跑完所有阶段 |
| `--commit-spec` / `--no-commit-spec` | 每阶段后是否提交规约产物（默认：`true`） |
| `--specs-dir <path>` | 把规约写到非默认目录（如 `packages/api/specs/`） |
| `--tasks-size fine` / `--tasks-size coarse` | `tasks.md` 拆分粒度 |
| `--fresh` | 即使已有相关规约也强制新建 |

实战示例：

```text
# 低风险变更用 quick 模式
/curdx-flow:start --quick
> 加 /healthz，返回版本号 + uptime。

# 原型用 coarse 任务粒度提速
/curdx-flow:start --tasks-size coarse
> spike 一个 webhook 接收器验证契约。

# monorepo 中按子包存放规约
/curdx-flow:start --specs-dir packages/api/specs
> 加 OAuth 登录。
```

## 环境变量

| 变量 | 效果 | 等价参数 |
| --- | --- | --- |
| `CURDX_FLOW_NO_CLAUDE_MD=1` | 跳过受管 `CLAUDE.md` 块写入 | `--no-claude-md` |
| `CURDX_FLOW_LANG=en` / `=zh` | 安装器默认语言 | `--lang` |
| `CONTEXT7_API_KEY` | `context7` MCP 服务可选 API Key | n/a |

推荐用法：

- 总是用同一种语言时，在 shell profile 设一次 `CURDX_FLOW_LANG`。
- 团队手工管理 `~/.claude/CLAUDE.md`、不希望 flow 触碰时设 `CURDX_FLOW_NO_CLAUDE_MD=1`。
- 装了 `context7` MCP 服务并希望提升限流时设 `CONTEXT7_API_KEY`。

## 粒度：`--tasks-size`

`fine` 是默认值，每个任务对应一个可验证步骤：

```markdown
- [ ] 1.1 增加 OAuth provider 配置 schema
- [ ] 1.2 [VERIFY] schema 通过 typecheck 并能校验样例输入
- [ ] 1.3 实现 token 交换处理器
- [ ] 1.4 [VERIFY] 单元测试通过
```

`coarse` 给出更少、更宽的任务：

```markdown
- [ ] 1 实现 OAuth provider 骨架
- [ ] 2 [VERIFY] 骨架可启动并接受样例请求
```

生产代码用 `fine`，让每个任务可独立提交；spike / 原型用 `coarse`，提交粒度本来就不重要。

## 状态文件

每个规约下，flow 在四份核心产物之外维护两份工作文件：

| 文件 | 用途 | 提交？ |
| --- | --- | --- |
| `research.md` | 研究产物——事实、引用、建议 | 是 |
| `requirements.md` | 用户故事、FR / NFR、验收标准 | 是 |
| `design.md` | 决策、风险、组件、文件变更清单 | 是 |
| `tasks.md` | 含 `[VERIFY]` 门禁的任务序列 | 是 |
| `.curdx-state.json` | 当前阶段、任务索引、迭代计数 | 否（gitignore） |
| `.progress.md` | 阶段笔记、skill 发现日志 | 否（gitignore） |

flow 默认生成的 `.gitignore` 包含：

```text
specs/.current-spec
specs/.current-epic
**/.curdx-state.json
**/.progress.md
```

四份核心产物当作代码库的一部分，状态和进度文件当作工作内存。

## 受管的 `CLAUDE.md` 块

安装后，`~/.claude/CLAUDE.md` 会包含一个被标记包裹的块：

```markdown
<!-- BEGIN @curdx/flow v1 -->
... 安装器维护的清单 ...
<!-- END @curdx/flow v1 -->
```

它的作用：

- 告诉 Claude Code 当前装了哪些插件和 MCP 服务。
- 列出可用的 `/curdx-flow:*` 命令，让新会话也能补全。
- 给可选市场条目提供最少必要的使用提示。

flow 的承诺：

- **只重写标记之间的内容**，标记之外原样保留。
- **幂等**。重跑 `npx @curdx/flow` 在相同状态下产生相同的块。
- **可关闭**。`--no-claude-md` 或 `CURDX_FLOW_NO_CLAUDE_MD=1`。

如果你手工维护 `~/.claude/CLAUDE.md`，关掉这个写入并自己加清单。否则交给 flow 就好。

## 项目级覆盖

项目级 Claude Code 配置在 `.claude/settings.json`。flow 默认不写这个文件。如果你想配置项目级错误日志：

```json
{
  "errorLogEnabled": false
}
```

设为 `false` 关闭 hook 错误日志。默认开启（写入 `~/.claude/curdx-flow/errors.jsonl`）。

## 迭代上限与恢复状态

自治循环在 `.curdx-state.json` 中有多个计数器和映射。典型执行中状态：

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
    {"name": "claude-mem:make-plan", "matchedAt": "start", "invoked": true}
  ],
  "fixTaskMap": {
    "1.4": {
      "attempts": 1,
      "fixTaskIds": ["1.4.1"],
      "lastError": "TypeError: cannot read property 'sub' of undefined"
    }
  },
  "modificationMap": {},
  "nativeTaskMap": {"0": "task-7f3a9c2", "1": "task-8e1b4d5"},
  "recoveryMode": false,
  "maxFixTasksPerOriginal": 3,
  "maxFixTaskDepth": 2,
  "nativeSyncEnabled": true,
  "awaitingApproval": false,
  "completed": false
}
```

### 计数器

| 字段 | 默认 | 用途 |
| --- | --- | --- |
| `taskIteration` | 1 | 当前任务的重试次数（成功时重置） |
| `maxTaskIterations` | 5 | 验证失败时的单任务重试预算 |
| `globalIteration` | 1 | 整 spec 已执行的任务总数（含重试） |
| `maxGlobalIterations` | 100 | 整 spec 的硬上限 |
| `maxFixTasksPerOriginal` | 3 | 每原任务的最大修复任务数（如 1.3.1, 1.3.2, 1.3.3） |
| `maxFixTaskDepth` | 2 | 修复的修复嵌套深度上限（`1.3.1.1` 允许，`1.3.1.1.1` 拒绝） |

`maxTaskIterations` 触顶则停下暴露失败。`maxGlobalIterations` 触顶则即使每任务都没满也强制停止。

### 映射

| 字段 | 用途 |
| --- | --- |
| `discoveredSkills` | 由 skill discovery 自动加载的 skills（Pass 1 + Pass 2） |
| `fixTaskMap` | `recoveryMode: true` 时每任务的修复尝试历史 |
| `modificationMap` | 每任务的 `TASK_MODIFICATION_REQUEST` 历史（每任务最多 3 次） |
| `nativeTaskMap` | 把 `taskIndex` 映射到 Claude Code 原生任务 ID 用于 UI 镜像 |

`taskIndex` 和计数器都可直接编辑。但计数失控通常是规约需要修订的信号，不是预算问题。

### 始终保留现有字段

协调器用 deep-merge helper 更新状态——永不从头写新对象。手动调整：

```bash
node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/lib/merge-state.mjs" \
     "$SPEC_PATH/.curdx-state.json" \
     '{"maxTaskIterations": 8}'
```

保留 `source`, `name`, `basePath`, `commitSpec`, `relatedSpecs` 和所有其它字段。

## 推荐范式

### 单人小仓库

- 安装内置插件 + 一两个市场条目（`claude-mem` 和 `context7` 是常见组合）。
- 默认参数即可。`--quick` 仅用于一次性规约。
- 让 flow 管理 `~/.claude/CLAUDE.md`。

### 团队 monorepo

- 用 `--specs-dir <package>/specs` 让规约按包归属。
- 把状态文件加到 `.gitignore`。
- 在项目 README 里写明 `[VERIFY]` 命令集，子 Agent 才知道跑什么。
- 选 `--tasks-size fine`，提交保持可审。

### CI 集成

- 在 CI 里跑 `npx @curdx/flow status --json` 检测安装漂移。
- 用 `npx @curdx/flow analyze` 分析会话 jsonl，提前发现 hook 退化。
- **不要**在 CI 里跑 `/curdx-flow:implement`。循环依赖交互式 Claude Code 会话。

## 最佳实践

- 提交四份核心产物。评审者不需要装 flow 也能读懂规约。
- 状态文件别提交。`.gitignore` 默认值不是装饰——提交了的状态会污染未来会话。
- `--quick` 仅在一次性能审完的小规约上用。暂停门禁不是官僚主义，是早期纠偏的窗口。
- 重试预算频繁触顶就修根因，不是抬限制。持续验证失败是信号，不是噪声。
