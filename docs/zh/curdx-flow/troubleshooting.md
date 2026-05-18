# 故障排除

先拿事实：

```bash
npm exec -- @curdx/flow@latest status
claude plugin list
```

Claude Code 内：

```text
/curdx-flow:status
```

插件运行时健康检查：

```bash
curdx-flow doctor
```

## 斜杠命令不出现

检查插件是否已安装并启用：

```bash
claude plugin list
```

通过 npm 安装器重装：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

然后重启 Claude Code。需要调试 marketplace 时：

```bash
claude plugin marketplace add curdx/curdx-flow
claude plugin install curdx-flow@curdx
```

## 伴随插件缺失或被禁用

运行：

```bash
curdx-flow doctor
```

manifest 预期：

| 插件 | Marketplace |
| --- | --- |
| `pua` | `pua-skills` |
| `claude-mem` | `thedotmack` |
| `chrome-devtools-mcp` | `chrome-devtools-plugins` |
| `ui-ux-pro-max` | `ui-ux-pro-max-skill` |

如果依赖缺失、禁用或 scope 不对，重跑：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

然后再次检查 `claude plugin list`。

## 外部 MCP 未就绪

`context7` 和 `sequential-thinking` 是预期外部 MCP，不由 curdx-flow 内置。

表现：

- 当前文档查询不可用；
- 高风险推理证据降级；
- `curdx-flow doctor` 报 external MCP readiness 为 `unknown` 或 `missing`。

修复用户自己的 Claude MCP 配置后重跑：

```bash
curdx-flow doctor
```

只有工作流明确接受降级证据时，才用官方文档或人工确认作为 fallback。

## 浏览器验证失败

CurdX Flow 对 UI 工作优先要求真实浏览器证据。

检查：

```bash
curdx-flow doctor
```

预期条件：

- `chrome-devtools-mcp` 已安装并启用；
- 本机装有 Chrome；
- 项目 dev server 能启动；
- console 和 network 输出能满足任务验证。

如果项目已有 Playwright，优先跑项目 Playwright 脚本。否则 Chrome DevTools MCP 可提供 DOM、截图、console、network 证据。

## 原生 `/goal` 不可用

`/curdx-flow:implement` 会在 `curdx-flow doctor` 判断 ready 时使用 Claude Code 原生 `/goal`。

如果原生 goal 被阻塞：

```text
/curdx-flow:implement --manual
```

Manual mode 会执行一次可恢复协调回合。修复环境后重跑：

```bash
curdx-flow doctor
```

## Active Spec 不对

列出和解析 specs：

```bash
curdx-flow specs list
curdx-flow specs resolve
```

Claude Code 内：

```text
/curdx-flow:status
/curdx-flow:switch <spec-name-or-path>
```

如果配置了多个 spec root，传精确路径；新建时使用 `--specs-dir`。

## Verification Blocks 缺失或过期

运行：

```bash
npm exec -- @curdx/flow@latest check
```

退出码 `2` 表示至少一个必要 block 缺失、过期或失败。重跑真实验证命令，并通过 curdx-flow 记录证据：

```bash
curdx-flow verify run --phase execution --command "npm test"
```

CI 或发布工作不要绕过该门禁。`CURDX_VERIFY_SKIP_BLOCKS=1` 只作为人工逃生口。

## 发布检查失败

对 curdx-flow 仓库自身，运行：

```bash
npm run check-versions
npm run verify
claude plugin validate ./plugins/curdx-flow
CURDX_FLOW_CLAUDE_BIN=claude npm run test:claudecc
```

发布前确认两个 tag：

```bash
git ls-remote --tags origin "vX.Y.Z" "curdx-flow--vX.Y.Z"
```

`vX.Y.Z` 是 npm package tag。`curdx-flow--vX.Y.Z` 是 Claude Code 插件 tag。

## 分析会话

从 Claude Code session 日志生成报告：

```bash
npm exec -- @curdx/flow@latest analyze --out flow-report.md
```

`--include-prompts` 只用于本地调试，表示有意关闭 prompt redact。
