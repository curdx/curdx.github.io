# 快速开始

本页使用当前 `@curdx/flow` v7.3.3 命令面。

## 前置条件

- 已安装并登录 Claude Code。
- Node.js 20.12 或更新版本。
- 一个准备用 Claude Code 工作的项目目录。
- 如果要通过 `chrome-devtools-mcp` 采集浏览器证据，本机需要 Chrome。

先确认 Claude Code 可调用：

```bash
claude --version
```

## 1. 安装 CurdX Flow

推荐安装方式：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

如果想一次装完整伴随环境：

```bash
npm exec -- @curdx/flow@latest install --all --yes
```

检查状态：

```bash
npm exec -- @curdx/flow@latest status
npm exec -- @curdx/flow@latest status --json
claude plugin list
```

## 2. 在项目里启动 Claude Code

```bash
cd /path/to/project
claude
```

Claude Code 内运行：

```text
/curdx-flow:help
/curdx-flow:status
```

如果斜杠命令没有补全，重启 Claude Code，并重新同步：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

## 3. 跑第一个 Spec

使用 `/curdx-flow:start`；它会判断是直接处理、轻量 spec、完整 spec，还是 epic 拆分。

```text
/curdx-flow:start todo-app 做一个可新增、编辑、完成、删除、本地持久化，并用浏览器验证的 Todo 应用
```

低风险任务可以减少交互：

```text
/curdx-flow:start todo-app 做 Todo 应用 --quick --task-granularity standard
```

大功能先拆：

```text
/curdx-flow:triage customer-portal 做客户门户，包含登录、计费、仪表盘和后台工作流
```

## 4. 审查产物

多数 spec 会生成：

```text
specs/<name>/
  research.md
  requirements.md
  design.md
  tasks.md
  .curdx-state.json
  .progress.md
```

Markdown 文件是值得提交的项目上下文。`.curdx-state.json` 和 `.progress.md` 是运行期状态，是否提交由团队策略决定。

## 5. 执行

任务准备好后：

```text
/curdx-flow:implement
```

默认路径会在 `curdx-flow doctor` 判断可用时使用 Claude Code 原生 `/goal`。环境不支持原生 goal 续跑时，用手动模式：

```text
/curdx-flow:implement --manual
```

常用上限：

```text
/curdx-flow:implement --max-task-iterations 5 --max-global-iterations 30 --goal-turns 30
```

## 6. 验证

运行与你项目匹配的检查。对 curdx-flow 仓库自身，发布级验证是：

```bash
npm run verify
claude plugin validate ./plugins/curdx-flow
CURDX_FLOW_CLAUDE_BIN=claude npm run test:claudecc
```

任何使用 curdx-flow 的项目都可以跑插件侧证据门禁：

```bash
npm exec -- @curdx/flow@latest check
```

`check` 会验证 active spec 的 `verificationBlocks`；证据缺失、过期或失败时退出码为 `2`。

## 7. 更新

```bash
npm exec -- @curdx/flow@latest update
npm exec -- @curdx/flow@latest status
```

Claude Code 升级后，如果涉及插件、hook 或 MCP 行为，先重新 install/status，再继续信任旧会话。
