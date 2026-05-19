# 命令参考

你不需要一次记住所有命令。按场景选就行。

## 我现在应该用哪个命令

| 你想做什么 | 用这个 |
| --- | --- |
| 开始一个新功能 | `/curdx-flow:start <名字> <目标>` |
| 不知道下一步 | `/curdx-flow:status` |
| 已经有 `tasks.md`，想开始执行 | `/curdx-flow:implement` |
| 任务太大，想先拆分 | `/curdx-flow:triage <目标>` |
| 想切换到另一个 spec | `/curdx-flow:switch <spec>` |
| 安装或修复插件 | `npm exec -- @curdx/flow@latest install curdx-flow --yes` |
| 检查安装状态 | `npm exec -- @curdx/flow@latest status` |

最常见的一组命令是：

```text
/curdx-flow:start todo-app 做一个 Todo 应用
/curdx-flow:status
/curdx-flow:implement
```

## `/curdx-flow:start`

推荐入口。它会根据当前项目和目标决定是直接处理、轻量规格、完整规格、恢复旧任务，还是建议拆分。

```text
/curdx-flow:start todo-app 做一个可以新增、编辑、完成、删除的 Todo 应用
```

常用参数：

| 参数 | 什么时候用 |
| --- | --- |
| `--quick` | 低风险任务，想减少确认步骤。 |
| `--fresh` | 不想恢复旧 spec，强制新建。 |
| `--task-granularity standard` | 大多数功能的推荐粒度。 |
| `--task-granularity fine` | 想让任务更小，方便 review。 |
| `--task-granularity coarse` | 原型或探索任务，接受任务更大。 |
| `--specs-dir <path>` | monorepo 里指定 spec 存放目录。 |

## `/curdx-flow:status`

当你不知道现在做到哪一步，先运行它。

```text
/curdx-flow:status
```

它会告诉你：

- 当前 active spec 是哪个；
- 哪些文件已经存在；
- 当前阶段是什么；
- 下一步建议运行什么命令；
- 环境里缺不缺关键能力。

## `/curdx-flow:implement`

当 `tasks.md` 准备好后，用它开始执行。

```text
/curdx-flow:implement
```

常用参数：

| 参数 | 什么时候用 |
| --- | --- |
| `--manual` | 自动续跑不可用，或者你想一轮一轮手动推进。 |
| `--max-task-iterations 5` | 限制单个任务最多重试次数。 |
| `--max-global-iterations 30` | 限制整体最多推进轮数。 |
| `--recovery-mode` | 失败时尝试生成修复任务。 |

## `/curdx-flow:triage`

目标太大时先用它拆分。

```text
/curdx-flow:triage 做一个客户门户，包含登录、账单、仪表盘和后台管理
```

适合：

- 一个需求明显包含多个独立模块；
- 需要先定依赖顺序；
- 一个 spec 很难一次讲清楚；
- 你希望多个子任务能分批 review。

## 终端里的 npm CLI

这些命令在 Claude Code 外面运行：

| 命令 | 作用 |
| --- | --- |
| `npm exec -- @curdx/flow@latest install curdx-flow --yes` | 安装或修复 curdx-flow。 |
| `npm exec -- @curdx/flow@latest install --all --yes` | 安装全部已知配套能力。 |
| `npm exec -- @curdx/flow@latest status` | 查看安装状态。 |
| `npm exec -- @curdx/flow@latest update` | 更新已安装插件。 |
| `npm exec -- @curdx/flow@latest analyze --out report.md` | 分析 Claude Code 会话日志。 |
| `npm exec -- @curdx/flow@latest check` | 检查当前 spec 的验证证据。 |

## 完整 Claude Code 命令列表

| 命令 | 作用 |
| --- | --- |
| `/curdx-flow:help` | 显示帮助和推荐下一步。 |
| `/curdx-flow:start` | 智能开始、创建或恢复。 |
| `/curdx-flow:new` | 明确创建一个新 spec。 |
| `/curdx-flow:research` | 重新研究项目事实和风险。 |
| `/curdx-flow:requirements` | 生成需求和验收标准。 |
| `/curdx-flow:design` | 生成技术设计。 |
| `/curdx-flow:tasks` | 生成实现任务。 |
| `/curdx-flow:implement` | 按任务执行。 |
| `/curdx-flow:status` | 查看状态和下一步。 |
| `/curdx-flow:switch` | 切换当前 spec。 |
| `/curdx-flow:triage` | 大任务拆分。 |
| `/curdx-flow:refactor` | 根据执行过程更新 spec。 |
| `/curdx-flow:cancel` | 停止或删除 spec 状态，删除前会确认。 |
