# CurdX Flow

CurdX Flow 是给 Claude Code 用的开发流程插件。它把一句“帮我做这个功能”，变成一套可审查、可恢复、可验证的交付记录。

你不用先理解代理、Hooks 或 MCP。第一次只记住三件事：

1. 用一条命令安装插件。
2. 用 `/curdx-flow:start` 说明目标。
3. 用 `/curdx-flow:status` 看下一步。
4. 用 `/curdx-flow:implement` 执行。

<picture>
  <source media="(max-width: 700px)" srcset="/images/curdx-flow/curdx-flow-overview-mobile.zh-CN.svg" />
  <img class="curdx-flow-figure" src="/images/curdx-flow/curdx-flow-overview.zh-CN.svg" alt="CurdX Flow 产品概览" />
</picture>

## 30 秒看懂

没有 CurdX Flow 时，你可能会直接对 Claude Code 说：

```text
帮我做一个 Todo 应用，要能新增、编辑、完成、删除。
```

这对小改动够用。但真实功能经常会遇到四个问题：需求越聊越散、上下文中途丢失、做到一半不好恢复、最后没有证据说明真的跑过。

用 CurdX Flow 时，你从这条命令开始：

```text
/curdx-flow:start todo-app 做一个可以新增、编辑、完成、删除的 Todo 应用，并用浏览器验证
```

Flow 会先把目标写成文件，再按文件推进：

| 产物 | 用途 |
| --- | --- |
| `requirements.md` | 写清楚要做什么，怎样算完成。 |
| `design.md` | 写清楚怎么实现，哪些文件在范围内。 |
| `tasks.md` | 拆成一步步可以执行和检查的小任务。 |
| 验证证据 | 留下测试、构建、浏览器、CI 或发布结果。 |

## 为什么你会愿意用

CurdX Flow 的价值不是“让 AI 多写一点”，而是让 AI 写出来的东西能被别人接手和审查。

| 你在意的事 | Flow 带来的结果 |
| --- | --- |
| 不想每次重新解释上下文 | 规格文件保存在项目里，之后可以继续。 |
| 不想模型写着写着跑偏 | 需求、设计、任务先落文件，执行时按文件走。 |
| 不想靠一句“完成了”判断结果 | 完成需要命令、浏览器、CI 或发布证据。 |
| 想让团队也看得懂 AI 做了什么 | 产物是 Markdown，能进 PR，能被 review。 |
| 任务太大不知道怎么拆 | 可以先 triage 成多个 spec。 |

## 3 分钟试用

1. 安装：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

2. 进入项目：

```bash
cd /path/to/your/project
claude
```

3. 在 Claude Code 里运行：

```text
/curdx-flow:start todo-app 做一个可以新增、编辑、完成、删除的 Todo 应用，并用浏览器验证
```

4. 看下一步：

```text
/curdx-flow:status
```

5. 规格准备好后执行：

```text
/curdx-flow:implement
```

## 完成时你要看到什么

一次正常的功能开发，完成时要留下这些东西：

- `specs/<name>/requirements.md`：需求和验收标准。
- `specs/<name>/design.md`：实现方案和文件范围。
- `specs/<name>/tasks.md`：任务清单和验证方式。
- 项目代码变更。
- 测试、构建、浏览器或发布证据。

如果缺少规格文件或验证证据，就不要按“完成”处理。CurdX Flow 的核心就是把“AI 说做完了”变成“文件、代码和证据都在这里”。

## 什么时候最值得用

适合：

- 前端页面、CLI、插件、后端接口、跨模块功能。
- 需要先讨论需求，再实现的任务。
- 需要浏览器、测试、CI、发布证据的任务。
- 会跨多轮对话，或者你可能中途暂停的任务。
- 你希望 PR 里有规格、设计和验证依据。

不适合：

- 只问一段代码是什么意思。
- 临时写一个很小的脚本。
- 你明确只想让 Claude Code 回答问题，不想改文件。

## 怎么介绍给同事

短版：

> CurdX Flow 是 Claude Code 的开发流程插件。它会把一个目标拆成需求、设计、任务和验证证据，让 AI 做真实功能时更容易 review 和继续。

稍完整一点可以这样说：

> 我们可以用 CurdX Flow 管 Claude Code 的开发流程。它不是让模型直接一口气改完，而是先生成 `requirements.md`、`design.md`、`tasks.md`，再按任务执行，并要求测试或浏览器证据。这样 PR 里不只有代码 diff，还有目标、方案和验证记录。

安装命令也只有一条：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

## 下一步

1. [快速开始](/zh/curdx-flow/getting-started)：照着跑通第一个 Todo 示例。
2. [命令参考](/zh/curdx-flow/commands)：了解常用命令和参数怎么选。
3. [故障排除](/zh/curdx-flow/troubleshooting)：命令不出现、验证失败、浏览器不可用时看这里。
4. [工作原理](/zh/curdx-flow/how-it-works)：需要理解内部机制时再读。
