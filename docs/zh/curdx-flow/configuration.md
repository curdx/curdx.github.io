# 配置

绝大多数人只会动两样：安装参数和任务粒度。其余都是按需。

## 安装参数

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

| Flag | 效果 |
| --- | --- |
| `--yes` | 跳过确认，直接装或重装。 |
| `--all` | 把所有 companion 能力一起装。 |
| `--lang en` / `--lang zh` | 安装器语言。 |
| `--no-claude-md` | 不更新 `~/.claude/CLAUDE.md` 的管理块。 |
| `--no-refresh` | 跳过插件缓存刷新（通常只为调试用）。 |

## 任务粒度

你最可能想调的开关：

```text
/curdx-flow:start todo-app 做一个 Todo 应用 --task-granularity standard
```

| 取值 | 适合 |
| --- | --- |
| `auto` | 让 Flow 自己判断。 |
| `standard` | 多数功能开发。 |
| `fine` | 任务更小，便于 review 与回滚。 |
| `coarse` | 原型，能接受较大任务。 |

## 规格目录在哪里

默认：

```text
specs/
```

Monorepo？按包拆分，并在 start 时指定：

```yaml
specs_dirs:
  - "./specs"
  - "./packages/web/specs"
  - "./packages/api/specs"
```

```text
/curdx-flow:start checkout-ui 做 checkout UI --specs-dir ./packages/web/specs
```

## 该提交哪些文件

| 通常要提交 | 视团队而定 |
| --- | --- |
| `research.md` | `.curdx-state.json`（运行期状态，审计有用，PR 噪音大） |
| `requirements.md` | `.progress.md`（运行期记录，通常 `.gitignore`） |
| `design.md` | |
| `tasks.md` | |

经验法则：**上下文进 git，运行期状态进 gitignore。**

## Companion 能力

```bash
curdx-flow doctor
```

| 能力 | 为什么重要 |
| --- | --- |
| `chrome-devtools-mcp` | 前端工作的真实浏览器证据。 |
| `claude-mem` | 历史决策和失败经验。 |
| `pua` | 恢复与高阶工作流辅助。 |
| `ui-ux-pro-max` | UI/UX 质量检查。 |
| `context7` *（外部 MCP）* | 最新库 / 框架文档。 |
| `sequential-thinking` *（外部 MCP）* | 高风险任务的显式推理。 |

缺哪个就降级哪个信号 —— `doctor` 会告诉你到底缺什么。

## 发布版本（仅维护者）

如果你在维护 `@curdx/flow` 项目本身：

```bash
node scripts/bump-version.mjs patch
```

发布需要两个 tag 一起 push：

```text
vX.Y.Z                  # 触发 npm 发布
curdx-flow--vX.Y.Z      # Claude Code 插件 marketplace 标签
```

普通用户可忽略这一节。
