# 故障排除

这页的目标是让你尽快恢复到可用状态。先不要猜原因，按顺序查。

## 先判断是哪一类问题

| 现象 | 先看哪里 |
| --- | --- |
| `/curdx-flow:*` 不出现 | [命令不出现](#命令不出现) |
| 安装后状态不对 | [安装状态不对](#安装状态不对) |
| 不知道现在做到哪一步 | [不知道下一步](#不知道下一步) |
| 前端页面无法验证 | [浏览器验证失败](#浏览器验证失败) |
| Flow 说验证失败 | [验证失败](#验证失败) |
| context7 或 sequential-thinking 缺失 | [外部 MCP 缺失](#外部-mcp-缺失) |

## 先跑健康检查

终端里运行：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

Claude Code 里运行：

```text
/curdx-flow:status
```

如果还看不出来，再运行：

```bash
curdx-flow doctor
```

`doctor` 的作用是告诉你缺插件、缺 MCP、浏览器不可用，还是原生续跑能力不可用。

## 命令不出现

最常见原因：Claude Code 当前会话还没重新加载插件。

按这个顺序处理：

1. 重新安装：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

2. 完全退出 Claude Code。
3. 重新打开 Claude Code。
4. 输入：

```text
/curdx-flow:help
```

如果还是没有，检查：

```bash
claude plugin list
```

你需要能看到 `curdx-flow`，并且它不是 disabled。

## 安装状态不对

如果 `status` 显示缺插件、版本不对或依赖未启用，先重装 curdx-flow：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

如果你希望一次补齐全部配套能力：

```bash
npm exec -- @curdx/flow@latest install --all --yes
```

重装后再查：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

## 不知道下一步

Claude Code 里运行：

```text
/curdx-flow:status
```

它会显示 active spec、当前阶段和下一条推荐命令。

如果 active spec 不对：

```text
/curdx-flow:switch <spec-name-or-path>
```

终端里也可以查看：

```bash
curdx-flow specs list
curdx-flow specs resolve
```

## 浏览器验证失败

前端任务要确认三件事：

| 检查项 | 怎么确认 |
| --- | --- |
| Chrome 已安装 | 本机能正常打开 Chrome。 |
| `chrome-devtools-mcp` 已启用 | `claude plugin list` 里能看到并启用。 |
| 项目能启动 | 例如 `npm run dev` 能启动页面。 |

再运行：

```bash
curdx-flow doctor
```

如果项目有 Playwright，也可以先跑项目自己的 e2e 命令。浏览器验证失败时，不要用人工目测代替证据。

## 验证失败

验证失败不是坏事，它说明 Flow 没有让失败悄悄通过。

处理顺序：

1. 找到失败命令或失败证据。
2. 在终端复现，比如：

```bash
npm test
npm run build
```

3. 修复问题。
4. 重新验证：

```bash
curdx-flow verify run --phase execution --command "npm test"
```

5. 再检查：

```bash
npm exec -- @curdx/flow@latest check
```

## 外部 MCP 缺失

`context7` 和 `sequential-thinking` 是外部 MCP，不由 curdx-flow 内置。

缺失时影响：

| 能力 | 影响 |
| --- | --- |
| `context7` | 当前库/框架文档查询会降级。 |
| `sequential-thinking` | 高风险任务的显式推理会降级。 |

修复你的 Claude MCP 配置后，重跑：

```bash
curdx-flow doctor
```

## 还不行怎么办

收集这几项再反馈问题：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
curdx-flow doctor
```

如果是某个任务失败，也附上：

- 失败的 spec 名字；
- 失败命令；
- `requirements.md` 和 `tasks.md` 中相关片段；
- 项目测试或浏览器验证输出。
