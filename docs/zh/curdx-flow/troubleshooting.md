# 故障排除

先别猜。按下面顺序查。

## 先跑这两个命令

终端里：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

Claude Code 里：

```text
/curdx-flow:status
```

如果还看不出问题，再跑：

```bash
curdx-flow doctor
```

## 看不到 `/curdx-flow:*`

最常见原因：Claude Code 当前会话还没加载插件。

处理：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

然后完全退出并重新打开 Claude Code。

再检查：

```bash
claude plugin list
```

## 安装状态不对

检查：

```bash
npm exec -- @curdx/flow@latest status
```

如果显示缺插件或版本不对，重装：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

如果你想一次补齐全部配套能力：

```bash
npm exec -- @curdx/flow@latest install --all --yes
```

## 前端浏览器验证失败

检查三件事：

1. 本机有 Chrome。
2. `chrome-devtools-mcp` 已安装并启用。
3. 项目的 dev server 能正常启动。

运行：

```bash
curdx-flow doctor
```

如果项目本来有 Playwright，也可以先跑项目自己的 e2e 命令。

## 不知道现在做到哪一步

Claude Code 里运行：

```text
/curdx-flow:status
```

如果 active spec 不对：

```text
/curdx-flow:switch <spec-name-or-path>
```

终端里也可以看：

```bash
curdx-flow specs list
curdx-flow specs resolve
```

## 验证失败

不要把验证失败的任务标成完成。先看失败命令。

常见处理：

```bash
npm test
npm run build
```

修好后重新让 Flow 记录验证：

```bash
curdx-flow verify run --phase execution --command "npm test"
```

再检查：

```bash
npm exec -- @curdx/flow@latest check
```

## 外部 MCP 缺失

`context7` 和 `sequential-thinking` 是外部 MCP，不是 curdx-flow 自己内置的。

如果 `curdx-flow doctor` 显示它们缺失：

- 当前文档查询可能降级；
- 高风险推理能力可能降级；
- 需要修复你自己的 Claude MCP 配置。

修完后重跑：

```bash
curdx-flow doctor
```

## 发布前检查

如果你维护的是 `@curdx/flow` 本身，发布前跑：

```bash
npm run verify
claude plugin validate ./plugins/curdx-flow
CURDX_FLOW_CLAUDE_BIN=claude npm run test:claudecc
```

普通项目不需要这一节。
