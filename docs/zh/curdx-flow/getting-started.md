# 快速开始

这一页只做一件事：让你从零跑通第一个任务。

![CurdX Flow 新手路径](/images/curdx-flow/curdx-flow-loop.zh-CN.svg)

## 你需要准备什么

确认你已经有：

- Claude Code
- Node.js 20.12 或更高
- 一个要开发的项目目录
- 如果要测前端页面，本机安装 Chrome

先检查 Claude Code：

```bash
claude --version
```

能看到版本号就继续。

## 第一步：安装插件

在终端运行：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

安装后检查：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

你应该能看到 `curdx-flow`。

## 第二步：进入你的项目

```bash
cd /path/to/your/project
claude
```

进入 Claude Code 后输入：

```text
/curdx-flow:help
```

如果命令没有补全，先重启 Claude Code。还不行就重装：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

## 第三步：跑一个 Todo 例子

在 Claude Code 里输入：

```text
/curdx-flow:start todo-app 做一个可以新增、编辑、完成、删除的 Todo 应用，并用浏览器验证
```

Flow 会先判断这个任务应该怎么做。你可能会看到它生成或更新这些文件：

```text
specs/todo-app/research.md
specs/todo-app/requirements.md
specs/todo-app/design.md
specs/todo-app/tasks.md
```

你只需要按它提示审查。如果不确定，就先看 `requirements.md` 和 `tasks.md`，确认需求没有跑偏。

## 第四步：开始执行

当 `tasks.md` 准备好后：

```text
/curdx-flow:implement
```

如果 Claude Code 的原生 `/goal` 不可用，改用手动模式：

```text
/curdx-flow:implement --manual
```

## 第五步：看结果

执行结束后做三件事：

```text
/curdx-flow:status
```

然后在终端跑项目自己的检查，比如：

```bash
npm test
npm run build
```

如果这是前端项目，还要看浏览器验证结果。Flow 会尽量用 `chrome-devtools-mcp` 记录 DOM、console、network 或截图证据。

## 常见新手问题

| 问题 | 处理 |
| --- | --- |
| 看不到 `/curdx-flow:*` | 重启 Claude Code，运行 `claude plugin list`。 |
| 不知道下一步 | 输入 `/curdx-flow:status`。 |
| 任务太大 | 用 `/curdx-flow:triage <目标>` 先拆分。 |
| 验证失败 | 不要硬说完成，先修失败，再重新验证。 |

下一页建议看：[命令参考](/zh/curdx-flow/commands)。
