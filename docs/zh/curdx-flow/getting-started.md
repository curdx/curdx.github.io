# 快速开始

这一页带你跑通第一个 CurdX Flow 任务。目标不是学完所有概念，而是在一个真实项目里完成这条路径：

```text
安装插件 -> 描述目标 -> 生成规格 -> 执行任务 -> 留下验证证据
```

<picture>
  <source media="(max-width: 700px)" srcset="/images/curdx-flow/curdx-flow-loop-mobile.zh-CN.svg" />
  <img class="curdx-flow-figure" src="/images/curdx-flow/curdx-flow-loop.zh-CN.svg" alt="CurdX Flow 新手路径" />
</picture>

## 成功标准

我们用一个 Todo 应用作为例子。跑通后，你要看到：

- Claude Code 里可以使用 `/curdx-flow:*` 命令。
- 项目里出现 `specs/todo-app/` 目录。
- 里面有 `requirements.md`、`design.md`、`tasks.md`。
- `/curdx-flow:status` 能告诉你当前阶段和下一步。
- 进入执行阶段后，有测试、构建或浏览器验证证据。

## 0. 准备环境

确认你已经安装：

| 依赖 | 用途 |
| --- | --- |
| Claude Code | 运行插件和斜杠命令。 |
| Node.js 20.12+ | 运行 npm 安装器。 |
| Chrome | 前端项目需要浏览器验证时使用。 |

先检查：

```bash
claude --version
node --version
```

如果这两个命令都能输出版本号，可以继续。

如果你没有合适的测试项目，可以先新建一个干净的 Vite 项目：

```bash
npm create vite@latest curdx-flow-todo -- --template react-ts
cd curdx-flow-todo
npm install
```

## 1. 安装 CurdX Flow

在终端运行：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

然后检查安装状态：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

你要确认两件事：

- `claude plugin list` 里能看到 `curdx-flow`。
- `status` 没有提示 curdx-flow 缺失。

如果命令失败，先看 [故障排除](/zh/curdx-flow/troubleshooting)。

## 2. 进入一个项目

进入你要测试的项目目录：

```bash
cd /path/to/your/project
claude
```

进入 Claude Code 后输入：

```text
/curdx-flow:help
```

如果没有补全 `/curdx-flow:*`，完全退出 Claude Code 后重新打开。Claude Code 插件通常需要新会话才能加载。

## 3. 创建第一个任务

在 Claude Code 里输入：

```text
/curdx-flow:start todo-app 做一个可以新增、编辑、完成、删除的 Todo 应用，并用浏览器验证
```

这个命令里有两部分：

| 部分 | 含义 |
| --- | --- |
| `todo-app` | 这个任务的名字，也会影响 spec 目录名。 |
| 后面的中文 | 你真正想让它完成的目标。 |

Flow 会先判断任务复杂度。对 Todo 这种功能，它会先生成规格文件，再进入执行阶段。

## 4. 审查 Flow 生成的文件

你会看到类似这样的目录：

```text
specs/todo-app/
  research.md
  requirements.md
  design.md
  tasks.md
```

第一次用时，重点看两个文件：

| 文件 | 你要检查什么 |
| --- | --- |
| `requirements.md` | 是否真的包含新增、编辑、完成、删除、浏览器验证。 |
| `tasks.md` | 任务是否小到可以一步步完成，是否有验证方式。 |

如果需求不对，先让 Flow 修改规格，不要急着执行。这个检查很重要：规格错了，后面的实现也会跟着错。

## 5. 开始执行

当 `tasks.md` 准备好后，在 Claude Code 里运行：

```text
/curdx-flow:implement
```

如果环境提示不能使用原生续跑能力，就用：

```text
/curdx-flow:implement --manual
```

执行过程中，Flow 会按任务推进。你可以随时查看状态：

```text
/curdx-flow:status
```

## 6. 判断是否真的完成

不要只看最后一句话。完成时必须看到至少一种证据：

| 项目类型 | 常见证据 |
| --- | --- |
| 前端页面 | 浏览器打开成功，DOM/截图/console/network 检查通过。 |
| Node/CLI | `npm test`、`npm run build` 或实际 CLI 输出。 |
| 插件/发布 | 插件校验、测试、tag 或 npm 发布结果。 |

你也可以在终端跑：

```bash
npm exec -- @curdx/flow@latest check
```

如果检查失败，就按未完成处理：补齐证据、修复失败命令，再重新检查。

## 7. 给团队看什么

如果你想把这次结果介绍给同事，不要只发“AI 写好了”。更好的方式是发：

- 代码 diff；
- `requirements.md`；
- `design.md`；
- `tasks.md`；
- 测试或浏览器验证结果。

这样别人能很快判断：目标是什么、怎么实现、有没有真的跑过。

## 下一步

- 想知道命令怎么选，看 [命令参考](/zh/curdx-flow/commands)。
- 命令不出现或验证失败，看 [故障排除](/zh/curdx-flow/troubleshooting)。
- 想理解内部机制，看 [工作原理](/zh/curdx-flow/how-it-works)。
