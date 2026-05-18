# 命令参考

CurdX Flow 有三套命令面：

| 命令面 | 运行位置 | 用途 |
| --- | --- | --- |
| 斜杠技能 | Claude Code 内 | spec 工作流和任务执行。 |
| npm CLI `@curdx/flow` | Shell | 安装、更新、状态、分析、证据检查。 |
| Runtime CLI `curdx-flow` | 插件运行时 | 内部路由、状态、doctor、开发运行时、验证辅助。 |

## 斜杠技能

| 命令 | 用途 |
| --- | --- |
| `/curdx-flow:help` | 显示当前命令和推荐下一步。 |
| `/curdx-flow:start [name] [goal]` | 智能路由、创建或恢复。不确定时优先用它。 |
| `/curdx-flow:new <name> [goal]` | 明确创建新 spec。 |
| `/curdx-flow:research [spec]` | 为 active spec 执行或重跑发现研究。 |
| `/curdx-flow:requirements [spec]` | 生成需求和验收标准。 |
| `/curdx-flow:design [spec]` | 生成技术设计。 |
| `/curdx-flow:tasks [spec]` | 从设计生成实现任务。 |
| `/curdx-flow:implement` | 执行 ready 任务，可用时使用原生 `/goal`。 |
| `/curdx-flow:status` | 查看 specs、active 状态、进度和健康状态。 |
| `/curdx-flow:switch <spec>` | 切换 active spec。 |
| `/curdx-flow:triage [epic] [goal]` | 把过大的工作拆成依赖明确的 specs。 |
| `/curdx-flow:refactor [spec]` | 根据实现学习更新 spec 文件。 |
| `/curdx-flow:prompt-optimize [draft]` | 优化提示词并推荐路由，不执行。 |
| `/curdx-flow:index` | 在 `specs/.index/` 生成组件规格。 |
| `/curdx-flow:cancel [spec]` | 确认后停止执行或移除 spec 状态。 |
| `/curdx-flow:feedback [message]` | 提交反馈或 bug 报告。 |

### Start 参数

```text
/curdx-flow:start [name] [goal] [--fresh] [--quick] [--mode auto|fast|deep] [--task-granularity auto|coarse|standard|fine] [--review minimal|standard|strict] [--commit-spec] [--no-commit-spec] [--specs-dir <path>]
```

| 参数 | 含义 |
| --- | --- |
| `--fresh` | 新建 spec，不恢复匹配的未完成 spec。 |
| `--quick` | 在仍需要 spec 的路线中减少审批提示。 |
| `--mode auto|fast|deep` | 覆盖路由深度。 |
| `--task-granularity auto|coarse|standard|fine` | 覆盖价值切片任务粒度。 |
| `--review minimal|standard|strict` | 覆盖 review 节奏。 |
| `--commit-spec` / `--no-commit-spec` | 控制是否提交 spec 产物。 |
| `--specs-dir <path>` | 从允许的 spec 根目录创建或解析 spec。 |

### Implement 参数

```text
/curdx-flow:implement [--max-task-iterations 5] [--max-global-iterations 30] [--goal-turns 30] [--manual] [--quick] [--recovery-mode]
```

| 参数 | 含义 |
| --- | --- |
| `--max-task-iterations` | 当前任务重试上限。 |
| `--max-global-iterations` | 整体执行循环上限。 |
| `--goal-turns` | 原生 `/goal` turn 上限。 |
| `--manual` | 不使用原生 goal 续跑，只执行一次可恢复协调回合。 |
| `--quick` | 在已存策略允许时跳过提示。 |
| `--recovery-mode` | 执行失败时生成修复任务，而不是立刻停止。 |

## npm CLI

```bash
npm exec -- @curdx/flow@latest --help
```

当前命令：

| 命令 | 用途 |
| --- | --- |
| `install [IDS]` | 安装或重装插件 / MCP 条目。 |
| `uninstall [IDS]` | 移除已安装插件 / MCP 条目。 |
| `update [IDS]` | 更新已安装插件。 |
| `status` | 显示安装状态。 |
| `analyze` | 分析 Claude Code session jsonl 和 curdx-flow 错误。 |
| `check` | 验证 active spec 的 `verificationBlocks`。 |

常用示例：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
npm exec -- @curdx/flow@latest install --all --yes
npm exec -- @curdx/flow@latest status --json
npm exec -- @curdx/flow@latest analyze --out flow-report.md
npm exec -- @curdx/flow@latest check
```

全局参数：

| 参数 | 用途 |
| --- | --- |
| `--lang zh|en` | 覆盖安装器语言。 |
| `--no-claude-md` | 跳过同步 `~/.claude/CLAUDE.md` 中的受管 `@curdx/flow` 块。 |

## Runtime CLI

插件自带 runtime 可执行文件，供 skills 和 hooks 使用：

```bash
curdx-flow doctor
curdx-flow route --compile --goal "发布 Claude Code 插件"
curdx-flow snapshot
curdx-flow specs list
curdx-flow specs resolve
curdx-flow state merge <state-file> <json-patch>
curdx-flow verify run --phase execution --command "npm test"
curdx-flow verify-blocks
curdx-flow dev detect
curdx-flow dev up
curdx-flow dev health
curdx-flow dev verify
curdx-flow dev down
```

这个命令面适合在 curdx-flow 技能内部使用，或调试已安装插件。普通用户安装和状态检查优先用 npm CLI。
