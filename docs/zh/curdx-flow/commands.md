# 命令参考

不用全背下来。按场景挑，需要的时候再翻细节。

## 速查表

```text
新功能             →  /curdx-flow:start <name> <goal>
我现在在哪一步？    →  /curdx-flow:status
可以开始构建吗？    →  /curdx-flow:implement
目标太大           →  /curdx-flow:triage <goal>
切换激活的 spec     →  /curdx-flow:switch <spec>
安装 / 修复         →  npm exec -- @curdx/flow@latest install curdx-flow --yes
健康检查           →  npm exec -- @curdx/flow@latest status
```

99% 的场景就这三条：

```text
/curdx-flow:start todo-app 做一个 Todo 应用
/curdx-flow:status
/curdx-flow:implement
```

## `/curdx-flow:start`

推荐入口。它会判断该直接处理、写轻量规格、写完整规格、恢复旧 spec，还是建议拆分。

```text
/curdx-flow:start todo-app 做一个支持新增/编辑/完成/删除的 Todo 应用
```

**值得记的 flag：**

| Flag | 什么时候用 |
| --- | --- |
| `--quick` | 低风险任务，少几个确认步骤。 |
| `--fresh` | 强制创建新 spec，不恢复旧的。 |
| `--task-granularity standard` | 多数功能开发的默认。 |
| `--task-granularity fine` | 任务更小，便于 review 和回滚。 |
| `--task-granularity coarse` | 原型阶段，可以接受较大的任务。 |
| `--specs-dir <path>` | Monorepo 下指定 `specs/` 所在目录。 |

## `/curdx-flow:status`

不知道在哪一步时，先跑这个。

```text
/curdx-flow:status
```

会告诉你：

- 当前激活的 spec
- 已经存在哪些产物文件
- 当前阶段
- 推荐执行的下一步命令
- 缺哪些 companion 能力

## `/curdx-flow:implement`

`tasks.md` 准备好后执行。

```text
/curdx-flow:implement
```

**值得记的 flag：**

| Flag | 什么时候用 |
| --- | --- |
| `--manual` | 没法自动连续执行，或者你想一次推进一步。 |
| `--max-task-iterations 5` | 限制单个任务的重试次数。 |
| `--max-global-iterations 30` | 限制整次执行的总步数。 |
| `--recovery-mode` | 失败后生成修复任务，而不是卡住。 |

## `/curdx-flow:triage`

目标太大、一个 spec 装不下时用。

```text
/curdx-flow:triage 做一个有登录、计费、看板、管理后台的客户门户
```

适合：

- 请求里明显包含多个模块，
- 依赖顺序重要，
- 一个 spec 写不清楚，
- 子 spec 应该被独立 review。

## 终端命令（Claude Code 之外）

| 命令 | 用途 |
| --- | --- |
| `npm exec -- @curdx/flow@latest install curdx-flow --yes` | 安装或修复。 |
| `npm exec -- @curdx/flow@latest install --all --yes` | 把所有 companion 能力一起安装。 |
| `npm exec -- @curdx/flow@latest status` | 查看安装状态。 |
| `npm exec -- @curdx/flow@latest update` | 升级已安装插件。 |
| `npm exec -- @curdx/flow@latest analyze --out report.md` | 分析 Claude Code 会话日志。 |
| `npm exec -- @curdx/flow@latest check` | 校验当前 spec 的证据。 |
| `curdx-flow doctor` | 一行诊断：插件、MCP、浏览器状况。 |
| `curdx-flow specs list` | 列出所有 spec 及其阶段。 |
| `curdx-flow route --compile --goal "…"` | 对某个目标做路由的预演（不执行）。 |

## 全部 Claude Code 命令

| 命令 | 用途 |
| --- | --- |
| `/curdx-flow:help` | 帮助和推荐的下一步。 |
| `/curdx-flow:start` | 智能开始 / 创建 / 恢复。 |
| `/curdx-flow:new` | 明确创建新 spec（不自动恢复）。 |
| `/curdx-flow:research` | 重新跑事实和风险研究。 |
| `/curdx-flow:requirements` | 生成需求和验收标准。 |
| `/curdx-flow:design` | 生成技术设计。 |
| `/curdx-flow:tasks` | 生成可执行任务。 |
| `/curdx-flow:implement` | 进入执行循环并验证。 |
| `/curdx-flow:status` | 当前状态 + 下一步。 |
| `/curdx-flow:switch` | 切换激活的 spec。 |
| `/curdx-flow:triage` | 把大需求拆成多个 spec。 |
| `/curdx-flow:refactor` | 实现学到新东西后更新 spec。 |
| `/curdx-flow:cancel` | 停止执行或删除 spec 状态（需确认）。 |
| `/curdx-flow:prompt-optimize` | 只优化草稿提示词，不执行。 |
