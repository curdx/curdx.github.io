# 故障排除

CurdX Flow 出问题，几乎总是六件事之一：安装漂移、缺前置、自治循环卡住、规约与现实脱节、hook 故障、矛盾检测拒绝。每个都有真实的错误特征和恢复序列。

## 快速排障

按顺序运行。修第一个失败的层。

```bash
node --version                 # 需 ≥ 20.12
claude --version               # Claude Code 在 PATH
claude plugin list             # curdx-flow 可见？
claude mcp list                # 选装的 MCP 可见？
npx @curdx/flow status         # 你装的全绿勾？
```

Claude Code 内：

```text
/curdx-flow:help               # 确认插件已加载、能响应
/curdx-flow:status             # 显示每个规约及阶段
```

`/curdx-flow:help` 没补全 → 插件未加载到当前会话。重启 Claude Code 或重跑 `npx @curdx/flow install`。

## 真实错误特征（含义）

这些消息来自协调器和子 Agent。每个映射到具体恢复路径。

### `ERROR: State file missing or corrupt at $SPEC_PATH/.curdx-state.json`

**原因：** 状态文件被删或含无效 JSON。
**修：** 跑 `/curdx-flow:implement` —— 协调器检测后从 `tasks.md` 重新初始化执行状态。
**预防：** 不要手动编辑 `.curdx-state.json`，除非懂 schema。当作不透明工作内存。

### `ERROR: Tasks file missing at $SPEC_PATH/tasks.md`

**原因：** 没跑 `/curdx-flow:tasks` 就到 `/curdx-flow:implement`，或 `tasks.md` 被删。
**修：** 跑 `/curdx-flow:tasks` 生成任务列表，再 `/curdx-flow:implement`。

### `ERROR: Spec directory missing at $SPEC_PATH/`

**原因：** 规约目录被删但 `.current-spec` 仍指向它。
**修：** 从 git 恢复（`git checkout HEAD -- specs/<name>`），或跑 `/curdx-flow:new <name>` 新建。

### `CONTRADICTION: claimed completion while admitting failure`

**原因：** Layer 1 验证拒绝了执行器的 `TASK_COMPLETE`。执行器说了类似"任务完成但不能自动化"——这些短语触发矛盾检测：

- "requires manual"
- "cannot be automated"
- "could not complete"
- "needs human"
- "manual intervention"

**修：** 这是任务本身不能自治完成的信号。跑 `/curdx-flow:refactor`：
- 把手动步骤换成自动化 `Verify` 命令（如 curl/Playwright/MCP 浏览器）。
- 拆分任务，把手动部分放到自治循环外。

**预防：** `task-planner` 已强制"无手动验证"——但万一漏过，这里被抓。

### `ERROR: Max retries reached for task $taskIndex after $maxTaskIterations attempts`

**原因：** 非 `[VERIFY]` 任务连续 `taskIteration > maxTaskIterations`（默认 5）次失败。
**修：** 三条路径——见下面 [从卡住的自治循环恢复](#从卡住的自治循环恢复)。

### `ERROR: Max fix attempts (3) reached for task $taskId`

**原因：** 恢复模式生成了 3 个修复任务（`X.Y.1`、`X.Y.2`、`X.Y.3`），都失败。
**输出还含：**

```text
Fix attempts: 1.3.1, 1.3.2, 1.3.3
```

**修：** 强信号——规约错了，不是实现错了。跑 `/curdx-flow:refactor`。

### `ERROR: Max fix task depth ($maxFixTaskDepth) exceeded for task $taskId`

**原因：** 修复的修复嵌套超过深度限制（默认 2）。如生成 `1.3.1.1.1`。
**修：** 需人工介入。修复链太深几乎总是规约需根本修订的信号。

### `VE-check failed after N retries — skipping to VE-cleanup`

**原因：** `VE1`（E2E 启动）或 `VE2`（E2E 检查）任务超出重试预算。
**行为：** 协调器**不**立即停——往前扫到 `VE3`（E2E 清理）任务，跑清理释放开发服务器端口，再停。
**修：** 清理跑完后修底层问题（常见：开发服务器没起、端口冲突、健康端点错），恢复。

### `VE-cleanup failed after N retries — aborting`

**原因：** 连 `VE3` 清理也失败。
**风险：** 孤儿进程（开发服务器、浏览器）可能仍在跑。需手动清理：

```bash
# 读 VE 任务写的 PID 文件
cat /tmp/ve-pids.txt

# 按 PID 杀
kill -9 $(cat /tmp/ve-pids.txt)

# 按端口回退（替换 3000 为你项目端口）
lsof -ti :3000 | xargs kill -9

# 删 PID 文件
rm -f /tmp/ve-pids.txt
```

### Native sync 警告（`Native sync disabled after 3 consecutive failures`）

**原因：** `TaskCreate` 或 `TaskUpdate` 调用连续失败 3 次。常见于不支持 Claude Code 原生任务的非交互环境。
**修：** 无需处理。协调器优雅降级，设 `nativeSyncEnabled: false`，无原生任务 UI 镜像继续。

## 从卡住的自治循环恢复

循环在验证多次失败时**故意**停下。这是特性。

### 步骤 1：读失败任务

```bash
cat specs/<active-spec>/tasks.md
```

最后一个未勾的任务就是失败的。读它的 `Do` 和 `Verify` 段。

### 步骤 2：读 .progress.md learnings

```bash
cat specs/<active-spec>/.progress.md
```

`## Learnings` 段是执行器记录的失败信息。恢复模式启用时找 `## Fix Task History`。

### 步骤 3：手动复现失败

shell 跑同一 `Verify` 命令。如果失败方式相同 → 规约对，实现错了。

```bash
# 例：任务 Verify 是 pnpm test -- --grep "rotation"
pnpm test -- --grep "rotation"
```

### 步骤 4：选恢复路径

**Path A — 实现 bug。** 修代码，恢复：

```text
/curdx-flow:implement
```

循环从同一任务接，重跑验证。

**Path B — 规约错了。** 跑 `/curdx-flow:refactor`：

```text
/curdx-flow:refactor
```

它方法化走规约：

1. 对比当前理解重读 `requirements.md`。
2. 更新 `design.md` 反映实际情况。
3. 同步 `tasks.md` 与新设计。

规约修正后恢复：

```text
/curdx-flow:implement
```

**Path C — 重启。** 规约根本错了：

```text
/curdx-flow:cancel
> Remove spec directory? [y/N] y

/curdx-flow:start
> [纠正后的目标]
```

## 检查 hook 故障

Hook 是工作流的隐形导轨。坏了，症状通常是"该推进的没推进"。

### 读错误日志

```bash
cat ~/.claude/curdx-flow/errors.jsonl | tail -20
```

每条是 JSON：

```json
{"hookName":"update-spec-index","exitCode":1,"stderr":"ENOENT: no such file or directory, scandir './specs/.index/'","timestamp":"2026-05-05T12:30:00Z","durationMs":42}
```

盯着同一个 `hookName` 的连续非零 `exitCode`。

### 生成结构化报告

```bash
npx @curdx/flow analyze
```

报告含：

- **Hook Failures** — 按失败次数排名的 hook
- **Hook Duration** — 每 hook 的 P50/P95/P99 延迟（慢的 hook 可能超时）
- **Schema Drift** — 未知事件类型或解析错误

### 关闭 hook 错误日志

```json
// ~/.claude/settings.json
{
  "errorLogEnabled": false
}
```

关掉只是消除症状，不修根因。仅在确认 hook 没问题后用。

## 规约与现实脱节

最隐蔽的失效模式：执行揭示设计假设了实际不真的事情。

### 症状

- 看起来对的任务反复 `[VERIFY]` 失败。
- 多个连续任务都需要同一外部修复。
- 执行器输出与你研究阶段提到过的约束相矛盾。
- `## Fix Task History` 显示相关任务多次修复。

### 修

```text
/curdx-flow:refactor
```

`refactor-specialist` 走 `requirements.md` → `design.md` → `tasks.md` 逐节。每节：保留 / 编辑 / 作废。

胜过硬扛重试。

## 安装与市场问题

### `claude plugin install` 失败

```bash
npx @curdx/flow install --yes 2>&1 | tee install.log
```

常见原因：

- shell 的 `claude` 在 PATH，但子进程的 PATH 不一样。`~/.zprofile` vs `~/.zshrc` vs `~/.bashrc` 不一致常见。
- 插件需要的 Claude Code 版本比已装新。`claude --version` 看。

### MCP 服务列出来但不响应

```bash
claude mcp list
```

服务列出但不工作时，看是否需要 API Key。如 `context7` 接受 `CONTEXT7_API_KEY`，没设的话装了但严格限流。

### Claude Code 升级后漂移

```bash
npx @curdx/flow update
npx @curdx/flow status
```

更新幂等。Claude Code 升级后顺手跑是好习惯。

### 安装后 `claude mcp list` 为空

查 `~/.claude/curdx-flow/errors.jsonl` 找安装错误。重跑 `npx @curdx/flow install <mcp-id>` 装失败的 MCP。

## 状态文件损坏恢复

`.curdx-state.json` 损坏（无效 JSON）且 `/curdx-flow:implement` 无法恢复时：

```bash
# 检查损坏
cat specs/<spec>/.curdx-state.json

# 手动重置——移除状态让协调器重新初始化
rm specs/<spec>/.curdx-state.json
```

然后跑 `/curdx-flow:implement` —— 协调器从 `tasks.md` 重新初始化。会丢失 `taskIteration` / `globalIteration` / `fixTaskMap` 历史，但四份核心产物和 `tasks.md` `[x]` 标记保留。

## 分支问题

### "Currently on default branch (main/master)"

执行器检测到仍在默认分支会停。分支应在 `/curdx-flow:start` 时设。

**修：**

```bash
git checkout -b feat/<spec-name>
```

恢复：

```text
/curdx-flow:implement
```

### "git push -u origin failed"

几乎总是远端权限问题或分支冲突。检查：

```bash
git remote -v
gh auth status
git pull origin main --rebase   # 分支陈旧时
```

## 平台说明

### macOS

- Intel 和 Apple Silicon 都支持。
- 推荐用 nvm 装 Node；系统自带的 Node 通常太旧。
- macOS 不原生支持 `flock` —— 并行批用 Node 锁 helper。

### Linux

- 验证过 Ubuntu 22.04+ 和 Fedora 39+。
- 确保 shell 和子进程看到的 `bash` / `node` 路径一致。

### Windows

- 用 WSL2（推荐 Ubuntu LTS）。
- `analyze` CLI 在 Windows **支持但未充分测试** — NTFS 上 `~/.claude/curdx-flow/errors.jsonl` 写入原子性无保证（POSIX `PIPE_BUF` 4KB 仅适用 POSIX）。
- PowerShell `claude` 路径可能与 WSL 路径不一致。在 WSL 内跑 flow 保持一致。

## 预防最佳实践

- Claude Code 升级后、长期不接后跑一次 `npx @curdx/flow status`。
- 提交四份核心产物。评审者不需装 flow 也能审规约。
- `.curdx-state.json` 和 `.progress.md` 保持 gitignore。提交进去会污染未来会话。
- 重试预算耗尽视作信号，不是配额。该做的是修根因，不是抬限制。
- 用 `/curdx-flow:refactor` 而不是手改 `design.md`。它会同步走完所有下游产物。
- 把 `npx @curdx/flow analyze` 报告与发布 tag 一起存档——是规约执行过程的干净审计。
- BUG_FIX 规约通过前手动复现 Phase 0——本地复现不出来，AFTER 验证证不了修复。

## 寻求帮助

- [GitHub Issues](https://github.com/curdx/curdx-flow/issues) 用于可复现 Bug 和功能请求
- [Releases](https://github.com/curdx/curdx-flow/releases) 确认是不是装了旧版
- Claude Code 内的 `/curdx-flow:feedback` 不离开会话提交反馈
