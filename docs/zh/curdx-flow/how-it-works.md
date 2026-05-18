# 工作原理

这页给想理解内部机制的人看。新手可以先跳过。

## 一个简单比喻

直接让 Claude Code 做复杂任务，像是边想边写。CurdX Flow 会先把事情写成计划，再按计划执行。

流程是：

```text
目标 -> 规格文件 -> 任务列表 -> 执行 -> 验证证据
```

## 第 1 步：先判断任务大小

`/curdx-flow:start` 会先判断：

- 这是小改动，还是复杂功能？
- 项目是前端、后端、CLI、插件，还是 monorepo？
- 有没有旧 spec 可以继续？
- 是否需要浏览器、测试、发布证据？

所以同一个 `/curdx-flow:start` 可以处理不同任务，而不是每次都强制完整流程。

## 第 2 步：生成规格文件

复杂任务通常会生成四个文件：

| 文件 | 回答的问题 |
| --- | --- |
| `research.md` | 项目现状是什么？风险在哪里？ |
| `requirements.md` | 到底要做什么？怎样算完成？ |
| `design.md` | 技术上怎么做？改哪些地方？ |
| `tasks.md` | 分几步做？每步怎么验证？ |

这些文件让任务可以暂停、审查、继续。

## 第 3 步：按任务执行

`/curdx-flow:implement` 会读取 `tasks.md`。每次只处理一个有边界的任务。

实现任务通常由 `spec-executor` 做；验证任务由 `qa-engineer` 做。这样可以减少“自己写完自己说通过”的问题。

## 第 4 步：必须有证据

CurdX Flow 不把“我完成了”当证据。它更关心：

- 命令是否跑过？
- 退出码是不是 0？
- 浏览器页面是否真的可用？
- console 或 network 有没有错误？
- 发布 tag、npm 包、CI 状态是否真实存在？

这些证据会写进 Flow 的状态文件，后续可以检查。

## 第 5 步：中途停了也能恢复

如果你关闭 Claude Code，之后可以运行：

```text
/curdx-flow:status
/curdx-flow:start
```

Flow 会读取 spec 文件和状态，告诉你下一步。

## 内部组件

| 组件 | 作用 |
| --- | --- |
| skills | Claude Code 里的 `/curdx-flow:*` 命令。 |
| agents | 研究、需求、设计、任务、实现、验证等专用角色。 |
| hooks | 在关键时刻记录状态、阻止无证据完成声明。 |
| runtime CLI | `curdx-flow doctor`、`curdx-flow specs list` 等内部工具。 |
| npm CLI | 安装、更新、状态检查、分析日志。 |
