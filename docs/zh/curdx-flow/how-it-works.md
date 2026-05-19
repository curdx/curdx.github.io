# 工作原理

第一次用可以跳过 —— `/curdx-flow:start` 并不要求你懂这些。想理解它为什么这么做的时候再回来。

## 心智模型

直接让 Claude Code 做一个真实功能，等于一边写代码一边规划。Flow 的做法是先写规划，再按规划执行：

```text
目标 ─► 规格文件 ─► 任务清单 ─► 执行 ─► 验证证据
```

按这个顺序，自然得到三个保证：

1. **可 review。** 规格是仓库里的 Markdown。PR 同时带方案，不只是 diff。
2. **可恢复。** 状态存在磁盘上，不在聊天记录里。关掉窗口 —— `/status` 会把你接回来。
3. **可证明。** "完成"必须有 `verificationBlocks`：命令输出、浏览器检查、CI 运行、发布 tag。

## 第 1 步 · 给目标路由

`/curdx-flow:start` 先做分类再行动：

- 这是小改动还是真实功能？
- 项目是前端、后端、CLI、插件还是 monorepo？
- 有没有已有的 spec 可以恢复？
- 完成是否需要浏览器 / 测试 / 发布证据？

正因为有这一层，同一条 `/start` 既能处理 "rename 一个变量"，也能驱动 "发布一个 Claude Code 插件"，而不会用同一套仪式去压垮它们。

## 第 2 步 · 把方案钉到文件

真实功能通常产生四个产物：

| 文件 | 它在回答什么 |
| --- | --- |
| `research.md` | 这个项目里已经有什么是真的？风险在哪里？ |
| `requirements.md` | 到底要做什么？怎样算完成？ |
| `design.md` | 怎么实现？哪些文件在范围内？ |
| `tasks.md` | 拆成哪些有边界的步骤？每一步怎么验证？ |

方案从聊天记录搬进仓库 —— 工作就变得可 review、可恢复、抗中断。

## 第 3 步 · 按任务执行

`/curdx-flow:implement` 读 `tasks.md`，一次只做 **一个有边界的任务**。角色是被刻意分开的：

- `spec-executor` 负责写代码改动。
- `qa-engineer` 负责跑验证。
- 在合适的节点，`architect-reviewer` / `code-quality-reviewer` / `spec-reviewer` 介入。

让实现者和验证者不是同一个角色 —— 直接干掉 "我写的，所以它通过了" 这种失败模式。

## 第 4 步 · 要证据

没有这些就不算完成：

- 验证命令真的跑过，
- 退出码 0（或同等结果），
- 视觉任务真的打开过浏览器页面，
- 必要时控制台 / 网络是干净的，
- 真的有发布 tag / npm 包 / CI 结果 —— 被观察到的，不是被描述的。

这些都会被写进 `.curdx-state.json` 的 `verificationBlocks` 里，事后可以审。

## 第 5 步 · 之后再来恢复

关上电脑，第二天回来：

```text
/curdx-flow:status     # 当前阶段、缺失能力、下一步命令
/curdx-flow:start      # 重新接上现有 spec
```

Flow 从规格文件和状态文件重建上下文 —— 不依赖聊天记忆。

## 内部组件

| 组件 | 做什么 |
| --- | --- |
| **skills** | Claude Code 里那些 `/curdx-flow:*` 命令。 |
| **agents** | 专用角色：研究、PM、架构、任务规划、执行、QA、评审、重构、triage。 |
| **hooks** | 记录状态，阻止"没有证据的完成"通过。 |
| **runtime CLI** | `curdx-flow doctor` / `specs list` / `route`。 |
| **npm CLI** | `@curdx/flow`：install / status / update / analyze / check。 |

## 它会协调的外部能力

Flow 是一个 Claude Code 插件，但也会显式检测和使用这些能力：

| 能力 | 它的作用 |
| --- | --- |
| `chrome-devtools-mcp` | 真实 Chrome 的 DOM、控制台、网络、截图证据。 |
| `claude-mem` | 历史决策和重复失败经验。 |
| `pua` | 多次失败时的恢复、并行规划、中文技能。 |
| `ui-ux-pro-max` | 可见 UI/UX 的设计判断与质量检查。 |
| `context7`（外部 MCP） | 最新的库 / 框架文档。 |
| `sequential-thinking`（外部 MCP） | 高风险任务的显式假设拆解。 |

缺哪个？`curdx-flow doctor` 会报告降级状态和修复方式 —— 它不会静默跳过关键证据。
