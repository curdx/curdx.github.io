# 命令参考

新手先记住 4 个命令就够了。

## 最常用命令

| 命令 | 什么时候用 |
| --- | --- |
| `/curdx-flow:start <名字> <目标>` | 开始一个任务。最推荐入口。 |
| `/curdx-flow:status` | 不知道下一步时查看状态。 |
| `/curdx-flow:implement` | `tasks.md` 准备好后开始执行。 |
| `npm exec -- @curdx/flow@latest status` | 在终端检查安装状态。 |

例子：

```text
/curdx-flow:start todo-app 做一个 Todo 应用
/curdx-flow:status
/curdx-flow:implement
```

## Claude Code 里的命令

| 命令 | 作用 |
| --- | --- |
| `/curdx-flow:help` | 显示帮助和推荐下一步。 |
| `/curdx-flow:start [name] [goal]` | 智能开始、创建或恢复。 |
| `/curdx-flow:new <name> [goal]` | 明确创建一个新 spec。 |
| `/curdx-flow:research` | 重新做项目事实和风险研究。 |
| `/curdx-flow:requirements` | 生成需求和验收标准。 |
| `/curdx-flow:design` | 生成技术设计。 |
| `/curdx-flow:tasks` | 生成实现任务。 |
| `/curdx-flow:implement` | 按任务执行。 |
| `/curdx-flow:status` | 查看状态和下一步。 |
| `/curdx-flow:switch <spec>` | 切换当前 spec。 |
| `/curdx-flow:triage <goal>` | 大任务先拆成多个 spec。 |
| `/curdx-flow:refactor` | 实现过程中学到新情况后更新 spec。 |
| `/curdx-flow:cancel` | 停止或删除 spec 状态，删除前会确认。 |

## `/curdx-flow:start` 常用参数

```text
/curdx-flow:start [name] [goal] [--quick] [--task-granularity standard]
```

| 参数 | 新手理解 |
| --- | --- |
| `--quick` | 少问几个问题，适合低风险任务。 |
| `--fresh` | 不恢复旧 spec，强制新建。 |
| `--task-granularity coarse` | 任务更大，适合原型。 |
| `--task-granularity standard` | 默认推荐，适合大多数任务。 |
| `--task-granularity fine` | 任务更小，适合需要仔细 review 的改动。 |
| `--specs-dir <path>` | 指定 spec 放到哪个目录。 |

## `/curdx-flow:implement` 常用参数

```text
/curdx-flow:implement --manual
/curdx-flow:implement --max-task-iterations 5
```

| 参数 | 新手理解 |
| --- | --- |
| `--manual` | 不使用原生 `/goal` 自动续跑，一次只走一个可恢复回合。 |
| `--max-task-iterations 5` | 一个任务最多重试 5 次。 |
| `--max-global-iterations 30` | 整体最多推进 30 轮。 |
| `--recovery-mode` | 失败时尝试生成修复任务。 |

## 终端里的 npm CLI

| 命令 | 作用 |
| --- | --- |
| `npm exec -- @curdx/flow@latest install curdx-flow --yes` | 安装 curdx-flow。 |
| `npm exec -- @curdx/flow@latest install --all --yes` | 安装全部已知配套能力。 |
| `npm exec -- @curdx/flow@latest status` | 查看安装状态。 |
| `npm exec -- @curdx/flow@latest update` | 更新已安装插件。 |
| `npm exec -- @curdx/flow@latest analyze --out report.md` | 分析 Claude Code 会话日志。 |
| `npm exec -- @curdx/flow@latest check` | 检查 active spec 的验证证据。 |

## 调试用 runtime CLI

这些一般是插件内部或排障时用：

```bash
curdx-flow doctor
curdx-flow specs list
curdx-flow specs resolve
curdx-flow verify-blocks
```

新手排障优先用 `curdx-flow doctor`，它会告诉你缺哪个插件、MCP 或浏览器能力。
