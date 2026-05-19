# 快速开始

第一次运行，大约 5 分钟。目标不是学会所有概念，而是走完这条路径：

```text
安装 ─► /curdx-flow:start ─► 审查规格 ─► /curdx-flow:implement ─► 仓库里留下证据
```

<picture>
  <source media="(max-width: 700px)" srcset="/images/curdx-flow/curdx-flow-loop-mobile.zh-CN.svg" />
  <img class="curdx-flow-figure" src="/images/curdx-flow/curdx-flow-loop.zh-CN.svg" alt="CurdX Flow 工作流闭环" />
</picture>

## 走通的标志

- 在 Claude Code 中输入 `/curdx-flow:*` 能自动补全。
- 项目下出现 `specs/todo-app/` 目录，包含 `requirements.md`、`design.md`、`tasks.md`。
- `/curdx-flow:status` 能告诉你当前阶段和下一步。
- 执行后留下测试 / 构建 / 浏览器证据。

## 0 · 检查环境

```bash
claude --version    # Claude Code
node --version      # ≥ 20.12
```

两条都能打印出版本号即可。还没有项目用来试？

```bash
npm create vite@latest curdx-flow-todo -- --template react-ts
cd curdx-flow-todo && npm install
```

## 1 · 安装

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

安装器会同步插件、companion plugins、marketplace 入口，以及 `~/.claude/CLAUDE.md` 的管理块。

验证：

```bash
npm exec -- @curdx/flow@latest status   # 不应该出现 "missing"
claude plugin list                       # 列表里应该有 curdx-flow
```

卡住了？跳到 [故障排除 → 命令不出现](/zh/curdx-flow/troubleshooting#命令不出现)。

## 2 · 描述目标

打开你的项目，进入 Claude Code：

```text
/curdx-flow:start todo-app 做一个支持新增/编辑/完成/删除并用浏览器验证的 todo 应用
```

两个部分：**任务名**（`todo-app` 会成为目录名）+ **真正的目标**（后面那段话）。Flow 会判断：小改动直接做、真实功能先生成规格文件。

> 如果 `/curdx-flow:*` 没自动补全，请完全退出 Claude Code 再重新打开。插件变更需要新会话。

## 3 · 看 Flow 写了什么

你会看到：

```text
specs/todo-app/
├── research.md
├── requirements.md
├── design.md
└── tasks.md
```

第一次运行先盯紧两个文件 —— 现在改它，比之后改实现便宜得多：

| 文件 | 检查什么 |
| --- | --- |
| `requirements.md` | 真的包含新增 / 编辑 / 完成 / 删除 + 浏览器验证？ |
| `tasks.md` | 任务足够小吗？每个任务都带验证命令吗？ |

## 4 · 执行

```text
/curdx-flow:implement
```

如果你的环境不支持自动连续执行：

```text
/curdx-flow:implement --manual
```

随时查看进度：

```text
/curdx-flow:status
```

## 5 · 判断"真的做完了"吗

不要只看最后一句。按项目类型对照证据：

| 项目类型 | 该有的证据 |
| --- | --- |
| 前端页面 | 浏览器能打开，DOM/截图/控制台/网络检查通过 |
| Node / CLI | `npm test`、`npm run build`，或真实 CLI 输出 |
| 插件 / 发布 | 插件校验通过、测试通过、tag 已打、npm 发布确认 |

一键判断：

```bash
npm exec -- @curdx/flow@latest check
```

如果 `check` 不通过，就当成没完成。补证据，再跑，再 check。

## 6 · 怎么交给别人

不要只说"AI 做完了"。把 **目标 + 方案 + 证据** 一起交：

- 代码 diff
- `requirements.md` · `design.md` · `tasks.md`
- 验证输出

这才是可被 review 的形态。

## 下一步

- [命令参考](/zh/curdx-flow/commands) —— 不同场景挑对命令。
- [工作原理](/zh/curdx-flow/how-it-works) —— `/start` 路由和 `verificationBlocks` 背后的模型。
- [故障排除](/zh/curdx-flow/troubleshooting) —— 命令找不到、验证失败时看这里。
