# CurdX Flow

面向 Claude Code 的规格驱动执行层：先路由需求，生成刚好够用的规格，再逐任务执行，并用真实验证证据约束“完成”声明。

![CurdX Flow 产品概览](/images/curdx-flow/curdx-flow-overview.zh-CN.svg)

## 交付内容

`@curdx/flow` v7.3.3 有两个相互配合的入口：

| 入口 | 作用 |
| --- | --- |
| Claude Code 插件 `curdx-flow` | 提供 `/curdx-flow:*` 斜杠技能、专用 agents、hooks、schemas、templates，以及插件内置 `curdx-flow` runtime CLI。 |
| npm CLI `@curdx/flow` | 安装、更新、检查、分析围绕插件的 Claude Code 环境。 |

插件是产品核心。npm CLI 是安装器和诊断层，用来保持插件、伴随插件依赖和 `~/.claude/CLAUDE.md` 受管能力块一致。

## 安装

常规安装用 npm 安装器：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

然后在项目目录打开 Claude Code：

```text
/curdx-flow:help
/curdx-flow:start todo-app 做一个可新增、编辑、完成、删除，并通过浏览器验证的 Todo 应用
```

调试 marketplace 时也可以手动安装插件：

```bash
claude plugin marketplace add curdx/curdx-flow
claude plugin install curdx-flow@curdx
```

## 工作流

![CurdX Flow 工作流闭环](/images/curdx-flow/curdx-flow-loop.zh-CN.svg)

`/curdx-flow:start` 是推荐入口。它会检查仓库、当前 spec 状态、用户目标、可用能力和风险等级，然后选择最轻但安全的路线：

| 路线 | 适用场景 |
| --- | --- |
| 直接修改 | 很小、低风险，完整规格反而制造噪声。 |
| 轻量规格 | 有边界的功能或修复，通常 1-3 个价值切片任务。 |
| 完整规格 | 跨模块、UI、发布、插件或高风险工作，需要明确研究、需求、设计和任务。 |
| Epic 拆分 | 大需求需要拆成多个依赖明确的 spec。 |
| 恢复 | 已有未完成 spec、会话绑定或可恢复执行状态。 |

典型阶段文件：

```text
specs/<name>/
  research.md
  requirements.md
  design.md
  tasks.md
  .curdx-state.json
  .progress.md
```

`research.md`、`requirements.md`、`design.md`、`tasks.md` 是可审查的项目资产。`.curdx-state.json` 保存执行状态和 `verificationBlocks`。`.progress.md` 记录运行期进度和学习。

## 核心差异

- **先路由再写。** 小任务保持轻，大任务先拆清楚再实现。
- **优先使用原生 `/goal`。** 长任务由 Claude Code 原生 goal loop 驱动，`--manual` 是显式降级路径。
- **完成必须有证据。** 命令、浏览器、CI、release、npm、review 结果会写入 `verificationBlocks`。
- **协调伴随能力。** `pua`、`claude-mem`、`chrome-devtools-mcp`、`ui-ux-pro-max`、`context7`、`sequential-thinking` 在需要时提供证据或上下文。
- **跟随当前插件结构。** 交付的 Claude Code 插件使用当前 `.claude-plugin/plugin.json` 结构，skills、agents、hooks、schemas、templates、`bin/` 位于插件根目录。

## 伴随能力

| 能力 | 类型 | 作用 |
| --- | --- | --- |
| `pua` | Claude Code 插件依赖 | 恢复策略和高级流程辅助。 |
| `claude-mem` | Claude Code 插件依赖 | 历史上下文、历史决策、重复失败记忆。 |
| `chrome-devtools-mcp` | Claude Code 插件依赖 | 真实浏览器 DOM、console、network、截图和运行时证据。 |
| `ui-ux-pro-max` | Claude Code 插件依赖 | 可见前端任务的 UI/UX 质量判断。 |
| `context7` | 外部 MCP | 查询当前库/框架文档。 |
| `sequential-thinking` | 外部 MCP | 高风险任务的显式推理。 |

`curdx-flow` 会诊断缺失能力并给修复建议。它不会内置外部 MCP，也不会重复写 MCP 配置。

## 快速导航

- [快速开始](/zh/curdx-flow/getting-started)
- [工作原理](/zh/curdx-flow/how-it-works)
- [配置](/zh/curdx-flow/configuration)
- [命令参考](/zh/curdx-flow/commands)
- [子 Agent](/zh/curdx-flow/agents/)
- [故障排除](/zh/curdx-flow/troubleshooting)
