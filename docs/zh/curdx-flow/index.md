# CurdX Flow

> **给 Claude Code 的规格驱动交付层。**
> 把一句 `"帮我做这个功能"`，变成可审查的规格、可追溯的任务和可验证的证据 —— 而不是"它说做完了"。

<picture>
  <source media="(max-width: 700px)" srcset="/images/curdx-flow/curdx-flow-overview-mobile.zh-CN.svg" />
  <img class="curdx-flow-figure" src="/images/curdx-flow/curdx-flow-overview.zh-CN.svg" alt="CurdX Flow 产品概览" />
</picture>

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

```text
/curdx-flow:start todo-app  做一个支持新增/编辑/完成/删除并用浏览器验证的 todo 应用
```

就这么多。插件会识别目标的大小、把规格写进仓库、按任务执行，并且没有证据就不算完成。

## 它解决的三个真问题

Claude Code 一旦面对真实任务，就会暴露三种典型失败：

| 没有 Flow | 有了 Flow |
| --- | --- |
| 上下文越来越长，模型忘掉最初的约束 | 目标钉进 `requirements.md`，跨会话都不会丢 |
| "完成了" 没有任何证据：没命令输出、没浏览器跑过 | 完成需要 `verificationBlocks`，不允许静默通过 |
| 大需求被一口气做完，小任务又被流程压垮 | `/start` 自动判断：直接处理 / 轻量规格 / 完整规格 / 恢复 / 拆成多个 spec |

它不是又一层项目管理仪式，而是给 Claude Code 加一层 **执行纪律**。

## 一次正常的功能开发，会留下这些东西

每个真实功能都会生成可提交、可 review、可恢复的产物：

```text
specs/todo-app/
├── research.md         # 事实、风险、已存在的假设
├── requirements.md     # 要做什么 · 怎样算完成
├── design.md           # 怎么实现 · 范围内文件
├── tasks.md            # 可执行的任务，每个都有验证命令
├── .curdx-state.json   # 阶段、verificationBlocks、恢复信息
└── .progress.md        # 运行期记录（通常 gitignore）
```

加上代码 diff，加上测试/构建/浏览器/CI/发布证据。PR 里同时有 **目标、方案和证据**，不止有 diff。

## 3 分钟试用

```bash
# 1. 安装（会一起带上 companion plugins 和 ~/.claude/CLAUDE.md 管理块）
npm exec -- @curdx/flow@latest install curdx-flow --yes

# 2. 进入你的项目
cd /path/to/your/project && claude
```

在 Claude Code 里：

```text
/curdx-flow:start todo-app 做一个支持新增/编辑/完成/删除并用浏览器验证的 todo 应用
/curdx-flow:status        # → "可以执行 /implement"
/curdx-flow:implement     # 按任务执行，留下证据
```

中途找不到状态？运行 `/curdx-flow:status` —— 它会告诉你当前 spec、阶段、缺哪个能力，以及下一步该执行什么命令。

## 团队为什么愿意用

- **AI 工作可 review。** `requirements.md` 和 `design.md` 进 PR，reviewer 看到的不只是 diff。
- **跨会话可恢复。** 关上电脑明天再回来 —— `status` 和 `start` 会自动接上之前的 spec。
- **完成可证明。** 测试 / 构建 / 浏览器 DOM / CI / npm 发布 —— 全部写进 `verificationBlocks`。
- **流程按需收放。** 小改直接做；跨模块的大需求触发 triage 拆成多个相互依赖的 spec。
- **没有锁定。** 是一个 Claude Code 插件，规格是普通 Markdown，随时可以走。

## 适合 · 不适合

| 适合用 | 不必用 |
| --- | --- |
| 前端页面、CLI、插件、后端接口、发布流程 | 一次性提问："这段代码什么意思？" |
| 需要先讲清楚需求再实现的任务 | 临时写的一次性脚本 |
| 需要浏览器 / 测试 / CI / 发布证据 | 你明确要求"只回答，不动文件" |
| 会跨多轮 / 可能中途暂停 | 一行代码改动，仪式只会成为负担 |
| 希望 PR 里有方案和证据 | — |

## 一句话怎么介绍

> CurdX Flow 把 Claude Code 的一句提示变成规格文件、可追溯任务和验证证据 —— 真实功能可以被 review、被恢复、被信任，而不是"它说做完了"。

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

## 下一步

- [快速开始](/zh/curdx-flow/getting-started) —— 端到端走通第一个例子。
- [命令参考](/zh/curdx-flow/commands) —— 不同场景该用什么命令。
- [工作原理](/zh/curdx-flow/how-it-works) —— 心智模型和内部组件。
- [配置](/zh/curdx-flow/configuration) —— 值得知道的参数。
- [故障排除](/zh/curdx-flow/troubleshooting) —— 出问题时按症状查。
