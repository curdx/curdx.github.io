# 故障排除

不要猜。按症状对号入座，按顺序修。

## 按症状对照

| 症状 | 跳到 |
| --- | --- |
| `/curdx-flow:*` 不出现 | [命令不出现](#命令不出现) |
| 安装状态看起来不对 | [安装状态不对](#安装状态不对) |
| 不知道下一步 | [不知道下一步](#不知道下一步) |
| 浏览器验证失败 | [浏览器验证失败](#浏览器验证失败) |
| 验证报告失败 | [验证失败](#验证失败) |
| `context7` / `sequential-thinking` 缺失 | [外部 MCP 缺失](#外部-mcp-缺失) |

## 先跑健康检查

终端：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

Claude Code 里：

```text
/curdx-flow:status
```

还不清楚：

```bash
curdx-flow doctor
```

`doctor` 会告诉你缺哪个插件、MCP、浏览器依赖或继续执行能力。

## 命令不出现

最常见原因：当前 Claude Code 会话没重新加载插件。

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

然后 **完全退出** Claude Code（不是关闭窗口）。重新打开后：

```text
/curdx-flow:help
```

还是不见？看是否真的装上：

```bash
claude plugin list
```

应该有 `curdx-flow`，并处于启用状态。

## 安装状态不对

如果 `status` 报告缺插件、版本不对或依赖被禁：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

需要把所有 companion 能力都补齐：

```bash
npm exec -- @curdx/flow@latest install --all --yes
```

再检查：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

## 不知道下一步

在 Claude Code 里：

```text
/curdx-flow:status
```

会显示激活的 spec、当前阶段、推荐执行的下一步。

激活的 spec 不对？

```text
/curdx-flow:switch <spec-name-or-path>
```

终端也能查：

```bash
curdx-flow specs list
curdx-flow specs resolve
```

## 浏览器验证失败

前端任务，按顺序检查：

| 检查 | 怎么做 |
| --- | --- |
| Chrome 是否安装 | 本地能否打开 Chrome。 |
| `chrome-devtools-mcp` 是否启用 | `claude plugin list` 应该包含它。 |
| 项目是否真的跑得起来 | `npm run dev`（或等价命令）能打开应用。 |

然后：

```bash
curdx-flow doctor
```

如果项目本身有 Playwright，也跑一次它的 e2e。**不要用"看起来没问题"替代浏览器证据。**

## 验证失败

验证失败是好事 —— 它接住了一个本该被发现的问题。不要绕过它。

```text
1. 看清楚是哪个命令 / 哪条证据失败。
2. 在终端复现：
     npm test
     npm run build
3. 修真正的问题。
4. 重新记录验证：
     curdx-flow verify run --phase execution --command "npm test"
5. 再 check：
     npm exec -- @curdx/flow@latest check
```

## 外部 MCP 缺失

`context7` 和 `sequential-thinking` 是外部 MCP，Flow 只检测、不内置。

| 能力 | 缺失影响 |
| --- | --- |
| `context7` | 当前库 / 框架文档查询能力下降。 |
| `sequential-thinking` | 高风险任务的显式推理能力下降。 |

修好你的 Claude MCP 配置后：

```bash
curdx-flow doctor
```

## 还是卡住？

反馈问题时，请把这些一起带上：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
curdx-flow doctor
```

如果任务失败，再加上：

- spec 名称，
- 失败的命令，
- `requirements.md` / `tasks.md` 相关片段，
- 测试 / 浏览器验证输出。
