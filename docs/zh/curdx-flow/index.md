# CurdX Flow

CurdX Flow 是给 Claude Code 用的开发流程插件。你告诉它“我要做什么”，它会帮你把任务拆清楚、写成规格文件、一步步执行，并要求每一步留下验证证据。

![CurdX Flow 产品概览](/images/curdx-flow/curdx-flow-overview.zh-CN.svg)

## 你什么时候需要它

适合：

- 做一个功能，而不是只改一行代码。
- 任务需要先想清楚需求、设计、验证方式。
- 做前端页面，需要真实浏览器检查。
- 做发布、插件、CLI、跨文件改动，需要有测试或命令证据。
- 中途可能暂停，之后还要继续。

不适合：

- 只是问一段代码是什么意思。
- 很小的临时脚本。
- 你明确只想让 Claude Code 直接回答，不想改文件。

## 第一次只记这三步

### 1. 安装

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

### 2. 在项目里打开 Claude Code

```bash
cd /path/to/your/project
claude
```

### 3. 让 Flow 开始

```text
/curdx-flow:start todo-app 做一个可以新增、编辑、完成、删除的 Todo 应用，并用浏览器验证
```

如果你不知道下一步该干什么，就运行：

```text
/curdx-flow:status
```

## 它会生成什么

通常会在项目里生成：

```text
specs/todo-app/
  research.md       # 先看项目现状和风险
  requirements.md   # 写清楚需求和验收标准
  design.md         # 写技术方案
  tasks.md          # 拆成可执行任务
```

这些文件的作用很简单：让 Claude Code 不靠“记忆”和“感觉”做复杂任务，而是按文件里的计划继续推进。

## 它为什么更稳

CurdX Flow 做了四件事：

| 做法 | 解决的问题 |
| --- | --- |
| 先路由 | 小任务不走重流程，大任务先拆清楚。 |
| 写规格 | 中途断了也能继续，不用重新解释。 |
| 分任务 | 每次只做一小块，减少跑偏。 |
| 要证据 | 不是说“完成了”就算完成，必须有命令、浏览器或发布证据。 |

## 你需要知道的组件

| 名称 | 新手理解 |
| --- | --- |
| `/curdx-flow:start` | 最常用入口。帮你判断该怎么做。 |
| `/curdx-flow:status` | 查看现在做到哪一步。 |
| `/curdx-flow:implement` | 按 `tasks.md` 开始执行。 |
| `chrome-devtools-mcp` | 用真实浏览器验证前端页面。 |
| `claude-mem` | 帮 Claude Code 记住历史上下文。 |

其他命令可以等用到再看。

## 下一步

- [快速开始](/zh/curdx-flow/getting-started)：从安装到第一个 Todo 例子
- [命令参考](/zh/curdx-flow/commands)：常用命令怎么用
- [故障排除](/zh/curdx-flow/troubleshooting)：装不上、命令不出现、验证失败怎么办
- [工作原理](/zh/curdx-flow/how-it-works)：想了解内部机制再看
