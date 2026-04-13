# 配置

## 配置文件

CurdX Bridge 从两个位置读取 `curdx.config`：

| 位置 | 作用域 |
|------|-------|
| `.curdx/curdx.config` | 项目级（优先级更高） |
| `~/.curdx/curdx.config` | 全局（用户级默认） |

### 简单格式

列出 Provider 名称，空格分隔：

```
claude codex gemini opencode
```

### JSON 格式

支持高级选项：

```json
{
  "providers": ["claude", "codex", "gemini", "opencode"],
  "flags": {
    "resume": true,
    "auto": true
  }
}
```

## 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `CURDX_DEBUG` | 启用调试日志 | `CURDX_DEBUG=1 curdx` |
| `CURDX_LANG` | 强制语言（en/zh） | `CURDX_LANG=zh` |
| `CURDX_THEME` | 强制主题 | `CURDX_THEME=dark` |

## CLAUDE.md 集成

CurdX Bridge 将配置注入项目的 `CLAUDE.md` 文件，使 Claude Code 理解多 AI 协作环境。包括：

### 角色分配表

控制每个角色由哪个 AI Provider 担任：

```markdown
| Role | Provider | Description |
|------|----------|-------------|
| designer | claude | 主要规划师和架构师 |
| inspiration | gemini | 创意头脑风暴 |
| reviewer | codex | 评分质量门禁 |
| executor | claude | 代码实现 |
```

要更改角色分配，编辑 Provider 列。例如，让 Gemini 做评审员：

```markdown
| reviewer | gemini | 评分质量门禁 |
```

### 同行评审框架

`CLAUDE.md` 中的评审配置定义评审触发时机：

1. **方案评审** — 方案定稿后、写代码前
2. **代码评审** — 代码完成后、报告完成前

通过标准：加权总分 ≥ 7.0 且无单项 ≤ 3。

### 异步护栏

异步护栏配置确保 Claude 向其他 Provider 发送请求后，正确等待响应，而不是轮询或添加多余文字。

## AutoFlow 配置

自动任务执行系统（`/cxb-task-run`）在 `.curdx/` 中存储额外配置：

| 文件 | 用途 |
|------|------|
| `.curdx/state.json` | 当前任务执行状态 |
| `.curdx/todo.md` | 带状态标记的任务列表 |
| `.curdx/plan_log.md` | 执行历史和决策记录 |

### 角色覆盖

AutoFlow 支持通过 `.autoflow/roles.json` 覆盖角色：

```json
{
  "executor": "codex",
  "reviewer": "codex"
}
```

这是二级查找 — `CLAUDE.md` 中的角色分配表优先级更高。
