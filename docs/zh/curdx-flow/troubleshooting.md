# 故障排除

CurdX Flow 出问题，通常是五件事之一：安装漂移、缺前置依赖、自治循环卡住、规约与现实脱节、hook 故障。

## 常见问题

| 问题 | 可能原因 | 解决方式 |
| --- | --- | --- |
| `npx @curdx/flow` 立刻退出 | Node 版本太低 | 升级到 Node ≥ 20.12 |
| `/curdx-flow:` 没有自动补全 | 当前 Claude Code 会话未装插件 | `claude plugin list`，再 `npx @curdx/flow install` |
| `start` 提示无活跃规约但目录存在 | `specs/.current-spec` 被删 | 用 `/curdx-flow:switch` 显式切换 |
| 循环中途停下 | 验证失败超出重试预算 | 读 `tasks.md` 中失败任务，修底层问题，再 `/curdx-flow:implement` |
| 同一任务反复以同一错误重试 | 修复点在**规约**而非代码 | `/curdx-flow:refactor` 修订 `design.md` / `tasks.md` |
| 子 Agent 调用抛异常 | 插件版本过旧或打包漂移 | `npx @curdx/flow update` |
| 安装后 `claude mcp list` 为空 | MCP 服务跳过或安装失败 | `npx @curdx/flow status` 查漂移，重装 MCP |

## 快速排障清单

按顺序运行：

```bash
node --version                 # 需 ≥ 20.12
claude --version               # Claude Code 在 PATH 上
claude plugin list             # 是否能看到 curdx-flow？
claude mcp list                # 选装的 MCP 是否在？
npx @curdx/flow status         # 你装的条目是否全部绿勾？
```

任何一层失败先修这一层。Claude Code 自身不正常时插件无法工作。

## Claude Code 内的健康检查

```text
/curdx-flow:help               # 确认插件已加载、能响应
/curdx-flow:status             # 列出每个规约及阶段
```

如果 `/curdx-flow:help` 没补全，插件未加载到当前会话。重启 Claude Code 或重跑 `npx @curdx/flow install`。

## 自治循环卡住的恢复

循环在验证多次失败时**故意**停下。这是特性，不是 Bug。

### 步骤 1：读失败任务

打开 `specs/<active-spec>/tasks.md`，最后一个未勾的任务就是失败点。读它的描述和它运行的验证命令。

### 步骤 2：手动复现失败

在 shell 里跑同一个验证命令。如果失败方式相同，说明规约没问题、实现错了——修代码、恢复：

```text
/curdx-flow:implement
```

### 步骤 3：如果是规约问题

如果手动复现表明规约本身要求错了，应该改规约而不是硬把代码改成贴合错误规约：

```text
/curdx-flow:refactor
```

它会按 `requirements.md` → `design.md` → `tasks.md` 顺序，让你逐节修订。改完恢复：

```text
/curdx-flow:implement
```

### 步骤 4：实在不行就取消重启

如果规约根本不对、修订成本超过重写：

```text
/curdx-flow:cancel
```

清理 `.curdx-state.json`，可选删除规约目录。然后 `/curdx-flow:start` 重新出发。

## 安装与市场问题

### `claude plugin install` 失败

```bash
# 启用详细输出看 flow 实际尝试了什么
npx @curdx/flow install --yes 2>&1 | tee install.log
```

常见原因：

- shell 的 `claude` 在 PATH，但子进程的 PATH 不一样（`~/.zprofile` vs `~/.zshrc` 之类）
- 当前 Claude Code 版本太旧——`claude --version` 看一眼

### MCP 服务列出来但不响应

```bash
claude mcp list
```

服务列出来但不工作时，看是否需要 API Key。比如 `context7` 接受 `CONTEXT7_API_KEY`，没设的话会被严格限流。

### Claude Code 升级后漂移

```bash
npx @curdx/flow update
npx @curdx/flow status
```

更新是幂等的。Claude Code 升级后顺手跑一次是好习惯。

## Hook 故障

Hook 是工作流的隐形导轨。它们坏了，症状通常是"该推进的没推进"。

### 查看 hook 错误

```bash
cat ~/.claude/curdx-flow/errors.jsonl | tail -20
```

每条是 JSON，含 `hookName`、`exitCode`、`stderr`、`timestamp`。盯着同一个 hook 的连续非零退出。

### 生成结构化报告

```bash
npx @curdx/flow analyze
```

Hook Failures 段按失败次数排名，Hook Duration 段标出可能超时的 hook。

### 关闭 hook 错误日志

```json
// ~/.claude/settings.json
{
  "errorLogEnabled": false
}
```

关掉只是消除症状，不修根因。仅在你确认 hook 没问题、只想终端清净时用。

## 规约与现实脱节

最隐蔽的失效模式：执行揭示设计假设了一个其实不存在的事实。

症状：

- 看起来对的任务反复 `[VERIFY]` 失败
- 多个连续任务都需要同一个外部修复
- 执行器输出与你研究阶段提到过的约束相矛盾

修复：

```text
/curdx-flow:refactor
```

它会方法化地走规约：

1. 对比当前理解重读 `requirements.md`
2. 更新 `design.md` 反映实际情况
3. 同步 `tasks.md` 与新设计
4. 从下一个未勾任务恢复执行

比硬靠重试推过去要好。

## 平台说明

### macOS

- Intel 和 Apple Silicon 都支持
- 推荐用 nvm 装 Node；系统自带的 Node 通常太旧

### Linux

- 验证过 Ubuntu 22.04+ 与 Fedora 39+
- 确保 shell 和子进程看到的 `bash` / `node` 路径一致

### Windows

- 用 WSL2（推荐 Ubuntu LTS）
- `analyze` CLI 在 Windows 上**支持但未充分测试** —— NTFS 上 `~/.claude/curdx-flow/errors.jsonl` 写入原子性无法保证
- 遇到 Windows 特有问题请反馈环境详情

## 预防最佳实践

- Claude Code 升级后、长期不接后跑一次 `npx @curdx/flow status`。
- 提交四份核心产物。评审者不需装 flow 也能审规约。
- `.curdx-state.json` 和 `.progress.md` 保持 gitignore。提交进去会污染未来会话。
- 重试预算耗尽视作信号，不是配额。该做的是修根因，不是抬限制。
- 用 `/curdx-flow:refactor` 而不是手改 `design.md`。它会同步走完所有下游产物。

## 寻求帮助

- [GitHub Issues](https://github.com/curdx/curdx-flow/issues) 用于可复现 Bug 和功能请求
- [Releases](https://github.com/curdx/curdx-flow/releases) 确认是不是装了旧版本
- Claude Code 内的 `/curdx-flow:feedback`，不离开会话提交反馈
