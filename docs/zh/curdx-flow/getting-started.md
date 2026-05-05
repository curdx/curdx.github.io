# 快速开始

本页是从零开始到完成第一个规约的最短路径。

## 前置依赖

| 要求 | 为什么需要 | 如何安装 |
|-------------|----------------|---------|
| **Node.js ≥ 20.12** | 安装器和 `analyze` CLI 运行在 Node 上 | [nodejs.org](https://nodejs.org) |
| **Claude Code CLI** | flow 是运行在 Claude Code 内的插件 | `npm install -g @anthropic-ai/claude-code` |
| **Git** | 规约保存在仓库里，执行器按任务提交 | 标准安装 |
| *(可选)* **Bun ≥ 1.0** | 自动检测；选择 `claude-mem` 时安装器会主动询问是否安装 | 见 [bun.sh](https://bun.sh) |

安装前先确认 Claude Code 在 `PATH` 上：

```bash
claude --version
```

如果失败，先解决这一步。flow 是协调层，不能替代 Claude Code 本身。

## 安装

```bash
npx @curdx/flow
```

首次运行会让你选择语言（English / 中文），然后选择安装哪些组件。内置的 `curdx-flow` 插件（也就是规约工作流本身）始终会安装，其它都是可选项。

### 非交互式安装

```bash
# 安装全部可用条目，跳过确认
npx @curdx/flow install --all --yes

# 只装指定条目
npx @curdx/flow install claude-mem context7
```

### 验证安装

```bash
claude plugin list                    # 应能看到 curdx-flow@curdx
claude mcp list                       # 你选装的 MCP 服务
npx @curdx/flow status                # 全绿勾即正常
```

在 Claude Code 里输入 `/curdx-flow:`，应能看到所有命令的自动补全。

## 你的第一个 Spec

在任意项目里：

```bash
cd ~/projects/my-app
claude
```

然后在 Claude Code 提示符里：

```text
/curdx-flow:start
```

提示时描述目标：

```text
> 我想加一个限流的 /api/upload 接口，支持 S3 multipart 上传。
```

`start` 命令会做：

1. 创建 `specs/upload-api/` 和 `.curdx-state.json` 状态文件。
2. 进行 60 秒访谈（约 3 个针对目标的澄清问题）。
3. 根据已安装的插件检测相关 skills，提前注入。
4. 派遣并行研究团队——一位调研 S3 multipart，一位调研限流策略，一位扫描代码库现有上传模式。
5. 把结果合并到 `research.md` 并**暂停等待通过**。

读一下 `specs/upload-api/research.md`。如果方向正确，继续推进：

```text
/curdx-flow:requirements
/curdx-flow:design
/curdx-flow:tasks
/curdx-flow:implement
```

每条命令都会暂停等待你通过。最后一条 `implement` 启动自治循环，直到 `tasks.md` 中所有任务勾完（或验证门禁连续超出重试预算才会停）。

## 你的前五分钟

一次真实的初始会话大致这样：

```text
你：    /curdx-flow:start
        > 加一个带 token 刷新的 OAuth 登录。
flow：  访谈中…（3 个简短澄清问题）
        研究已派遣：3 名并行调研者。
        → research.md 已生成。通过即继续。

你：    /curdx-flow:requirements
flow：  product-manager → requirements.md（US, FR, NFR 章节）。

你：    /curdx-flow:design
flow：  architect-reviewer → design.md（决策、风险、文件计划）。

你：    /curdx-flow:tasks
flow：  task-planner → tasks.md（4 阶段共 12 个任务，含 VERIFY 门禁）。

你：    /curdx-flow:implement
flow：  ⟳ 任务 1.1 → 验证 → 提交 ✓
        ⟳ 任务 1.2 → 验证 → 提交 ✓
        ...
        ✓ ALL_TASKS_COMPLETE。
```

心智模型很简单：你用中文描述目标，flow 写规约，你审批，flow 写代码。

## 入门模式

### 单人小功能

```text
/curdx-flow:start
> 重构缓存助手，使用新的 TTL 配置。
```

适合改动有边界、想用规约纪律但不想太重的场景。

### 跨模块功能

```text
/curdx-flow:triage
> 我们要做服务端 webhook：接入、重试队列、死信 UI。
```

`triage` 把功能拆成依赖明确的多个规约（epic）。每个子规约按正常五阶段推进。

### 快速模式

```text
/curdx-flow:start --quick
> 加一个 /healthz 接口，返回版本号和 uptime。
```

`--quick` 不暂停连续跑完所有阶段。适合最后一次性审阅的低风险变更。

## 常用参数

| 参数 | 效果 |
| --- | --- |
| `--quick` | 不暂停连续跑完所有阶段 |
| `--commit-spec` / `--no-commit-spec` | 每阶段后是否提交规约产物（默认开） |
| `--specs-dir <path>` | 把规约写到非默认目录（如 `packages/api/specs/`） |
| `--tasks-size fine` / `coarse` | `tasks.md` 的拆分粒度 |

完整参数与项目级覆盖见 [配置](/zh/curdx-flow/configuration)。

## 日常常用命令

```bash
# 在 Claude Code 内
/curdx-flow:start         # 智能入口：新建 spec 或恢复
/curdx-flow:status        # 查看所有规约及阶段
/curdx-flow:switch        # 切换当前规约
/curdx-flow:implement     # 恢复自治执行

# 在 shell 里
npx @curdx/flow           # 交互式菜单（安装 / 更新 / 状态）
npx @curdx/flow status    # 当前安装情况，是否有过期
npx @curdx/flow update    # 更新到最新
npx @curdx/flow analyze   # 生成可观察性报告
```

## 最佳实践

- **提交四份核心产物**。`research.md`、`requirements.md`、`design.md`、`tasks.md` 应纳入版本控制。状态文件（`.curdx-state.json`、`.progress.md`）默认 gitignore。
- **认真审批**。每次暂停都是阶段切换前最便宜的纠偏机会，比事后返工省得多。
- **保持规约小而美**。30+ 任务的规约通常是两个规约伪装的，建议 `/curdx-flow:triage`。
- **谨慎使用 `--quick`**。低风险变更可用，但跳过的门禁是有意义的。
- **升级后跑 `npx @curdx/flow status`**。能在你被坑之前暴露漂移。

## 下一步

- 读 [工作原理](/zh/curdx-flow/how-it-works) 了解架构与执行模型
- 在 [配置](/zh/curdx-flow/configuration) 中配置参数和受管 `CLAUDE.md` 块
- 在 [命令参考](/zh/curdx-flow/commands) 中浏览所有斜杠和 CLI 命令
- 在 [子 Agent](/zh/curdx-flow/agents/) 中认识团队
