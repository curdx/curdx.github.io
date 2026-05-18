# 工作原理

CurdX Flow 是一个 Claude Code 插件，外面包了一层很小的 npm 安装器。插件负责编排 skills、agents、hooks、runtime scripts 和状态文件；安装器负责保持环境一致。

## 插件布局

源码仓库里的插件位于 `plugins/curdx-flow/`：

```text
plugins/curdx-flow/
  .claude-plugin/plugin.json
  skills/
  agents/
  hooks/
  schemas/
  templates/
  references/
  bin/curdx-flow
```

这符合当前 Claude Code 插件结构：manifest 在 `.claude-plugin/` 下，skills、agents、hooks 和 runtime 资产位于插件根目录。

## 智能路由

`/curdx-flow:start` 不会盲目启动长流程。它会让 runtime router 根据以下信息选择路线：

- 当前仓库形态；
- active spec 和会话绑定；
- 用户目标和参数；
- 技术栈画像；
- 可用能力；
- 风险和验证需求。

路线可能是 direct-change、lite-spec、full-spec、triage、resume 或 blocked-ask-user。所以同一个命令既能处理一个 README 小改，也能处理前端应用、Claude Code 插件发布或多 spec epic。

## 阶段产物

常规完整 spec 会生成四份可审查 Markdown：

| 产物 | 负责人 |
| --- | --- |
| `research.md` | `research-analyst` |
| `requirements.md` | `product-manager` |
| `design.md` | `architect-reviewer` |
| `tasks.md` | `task-planner` |

每个阶段都可以使用访谈、代码库事实、当前官方文档、历史记忆和能力检查。Review agents 可以在阶段边界运行。Quick mode 会减少交互，但仍保留产物和验证契约。

## 执行

`/curdx-flow:implement` 是协调器。它验证 `tasks.md`、初始化状态、编译 goal 条件，然后把有边界的工作委派给专用 agents。

默认 driver 是 Claude Code 原生 `/goal`，前提是 readiness 检查通过。如果原生 goal 不可用，`--manual` 会走一次可恢复的单回合协调路径。

关键执行规则：

- `spec-executor` 实现隔离任务。
- `qa-engineer` 负责 `[VERIFY]` 任务和证据检查。
- `spec-reviewer` 与 `code-quality-reviewer` 审查不同轴线，不能混成一个意见。
- 状态写入通过 runtime merge helper。
- 完成 marker 会被解析，然后用产物和证据核验。

## 验证

CurdX Flow 把验证当数据，不当口头说明。`verificationBlocks` 保存证据，例如：

```json
{
  "execution": {
    "command": "npm test",
    "exitCode": 0,
    "timestamp": "2026-05-18T00:00:00.000Z",
    "srcMtime": "2026-05-18T00:00:00.000Z"
  }
}
```

Stop hook 和 `@curdx/flow check` 执行同一条规则：所需证据缺失、过期或失败时，不能声明完成。

## Hooks

Hooks 用于流程安全和上下文恢复。它们注入压缩上下文、记录进度、验证任务完成 marker，并保护 expansion 或 stop 事件。Hook bundles 由 TypeScript 源码生成，并作为插件运行时产物提交。

核心规则：除非故意阻止错误完成声明，否则 hook fail-open。诊断写 stderr；hook 协议输出写 stdout。

## 能力诊断

`curdx-flow doctor` 会报告插件依赖、外部 MCP readiness、原生 `/goal` readiness、浏览器验证选项、hook freshness 和 release readiness。能力缺失会显式降级：

- 缺 `chrome-devtools-mcp`，浏览器证据降级；
- 缺 `context7`，当前文档查询降级；
- 缺 `sequential-thinking`，高风险推理证据降级；
- 插件依赖被禁用时，会给出修复建议。

## 发布模型

对 curdx-flow 自身，npm 发布和 Claude Code 插件发布是两个 surface：

| Surface | Tag |
| --- | --- |
| npm package | `vX.Y.Z` |
| Claude Code plugin | `curdx-flow--vX.Y.Z` |

两个 tag 必须有意保持成对。测试通过不等于发布完成；还需要插件校验、插件 smoke、hook freshness、版本一致和 tag 一致。
