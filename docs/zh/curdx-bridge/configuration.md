# 配置

CurdX Bridge 支持全局级、项目级，以及 `CLAUDE.md` 这类角色感知提示文件中的多层配置。

## 配置来源

CurdX Bridge 会从两个位置读取 `curdx.config`：

| 位置 | 作用域 | 优先级 |
|------|-------|-------|
| `.curdx/curdx.config` | 项目级 | 最高 |
| `~/.curdx/curdx.config` | 用户级默认 | 兜底 |

项目级配置应放仓库特有默认值；全局配置则适合存放你的个人习惯设置。

## 简单 Provider 列表格式

如果你只想指定默认 Provider，保持最小配置即可：

```text
claude codex gemini opencode
```

适用场景：

- 团队几乎总是使用同一组 Provider
- 你希望配置文件尽量短、可快速检查
- 你暂时不需要附加 flag

## JSON 格式

如果你需要更明确的 flag 和结构，可以使用 JSON：

```json
{
  "providers": ["claude", "codex", "gemini"],
  "flags": {
    "resume": true,
    "auto": true
  }
}
```

实际例子：

```json
{
  "providers": ["claude", "codex"],
  "flags": {
    "resume": false,
    "auto": false
  }
}
```

如果你希望默认保持更低噪音，建议只配置 `claude` 与 `codex`，在需要时再显式加 Gemini 或 OpenCode。

## 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `CURDX_DEBUG` | 启用详细日志 | `CURDX_DEBUG=1 curdx` |
| `CURDX_LANG` | 强制文档与界面语言 | `CURDX_LANG=zh` |
| `CURDX_THEME` | 强制显示主题 | `CURDX_THEME=dark` |

推荐用法：

- 排查路由问题时开启 `CURDX_DEBUG=1`
- 双语团队或共享环境中使用 `CURDX_LANG`
- 终端与文档主题识别不一致时使用 `CURDX_THEME`

## `CLAUDE.md` 集成

CurdX Bridge 依赖 `CLAUDE.md` 来描述主 Agent 在多 Provider 环境中的行为方式。

### 角色分配表

```markdown
| Role | Provider | Description |
|------|----------|-------------|
| designer | claude | Primary planner and orchestrator |
| inspiration | gemini | Brainstorming and alternatives |
| reviewer | codex | Scored review gate |
| executor | codex | File operations and test execution |
```

这是日常行为最关键的配置面。它决定谁做什么。

常见模式：

- `designer` 保持为 Claude，确保连续性和责任归属
- `reviewer` 保持为 Codex，获得更强的代码审查与 rubric 执行
- `executor` 交给 Codex，这样 Claude 保持监督角色而不是直接改文件

### 审查时机

`CLAUDE.md` 还会定义审查发生的时机：

1. 写代码前先做方案审查
2. 完成实现后再做代码审查

标准通过规则通常是：

- 总分 `>= 7.0`
- 任一维度不低于 `3`

### 异步护栏

异步护栏确保跨 Provider 请求过程整洁稳定：

- Claude 先提交请求
- 提交后停止发言，而不是补一堆填充文本
- 稍后再取回回复并继续主线程

这能减少重复 ask、重复轮询和上下文交接失真。

## AutoFlow 状态文件

AutoFlow 会在 `.curdx/` 中写入执行制品：

| 文件 | 用途 |
|------|------|
| `.curdx/state.json` | 当前步骤、状态与重试信息 |
| `.curdx/todo.md` | 面向人阅读的任务列表和状态标记 |
| `.curdx/plan_log.md` | 决策日志、执行记录和审查轨迹 |

这些文件应该被视为工作状态，而不是正式项目文档。

## 角色覆盖

某些工作流支持在 `.autoflow/roles.json` 中覆盖角色：

```json
{
  "executor": "codex",
  "reviewer": "codex"
}
```

优先级顺序很重要：

1. `CLAUDE.md` 角色表
2. `.autoflow/roles.json`
3. 内置默认值

如果实际行为和预期不一致，先检查更高优先级的文件。

## 推荐团队模式

### 小型仓库或个人项目

- 全局配置保存你的常用 Provider 组合
- 项目配置只在该仓库需要特殊默认值时覆盖
- `CLAUDE.md` 角色表保持简单即可

### 大型团队仓库

- 提交项目级 `.curdx/curdx.config`
- 提交共享的 `CLAUDE.md` 角色表
- AutoFlow 文件只用于任务状态，不用于记录团队策略

## 最佳实践

- 项目默认配置尽量收窄。默认 Provider 太多只会制造噪音。
- 排查配置问题时，一次只改一层。
- 非默认角色映射应在仓库中说明原因，避免队友误解。
- 尽量显式指定 `executor` 和 `reviewer`，不要依赖模糊默认。
