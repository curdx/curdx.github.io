# 配置

新手通常不需要改配置。先会用 `/curdx-flow:start` 和 `/curdx-flow:status` 就够了。

这页只解释你真正可能遇到的配置。

## 安装时的参数

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

| 参数 | 作用 |
| --- | --- |
| `--yes` | 跳过确认，直接安装或重装。 |
| `--all` | 安装所有已知配套能力。 |
| `--lang zh` | 安装器使用中文。 |
| `--no-claude-md` | 不更新 `~/.claude/CLAUDE.md` 中的受管说明块。 |
| `--no-refresh` | 不刷新插件缓存，排障时才需要。 |

## 任务粒度

你最可能用到的是：

```text
/curdx-flow:start todo-app 做一个 Todo 应用 --task-granularity standard
```

| 值 | 适合什么 |
| --- | --- |
| `auto` | 默认，让 Flow 判断。 |
| `standard` | 大多数功能。 |
| `fine` | 想让每个任务更小，更方便 review。 |
| `coarse` | 原型或探索，接受任务更大。 |

## Spec 放在哪里

默认放在：

```text
specs/
```

Monorepo 可以把不同包的 spec 分开放：

```yaml
specs_dirs:
  - "./specs"
  - "./packages/web/specs"
  - "./packages/api/specs"
```

创建时指定目录：

```text
/curdx-flow:start checkout-ui 做结账页面 --specs-dir ./packages/web/specs
```

## 哪些文件建议提交

建议提交：

- `research.md`
- `requirements.md`
- `design.md`
- `tasks.md`

谨慎提交：

- `.curdx-state.json`
- `.progress.md`

后两者更像运行状态。如果团队要复盘执行过程，可以提交；如果只是普通功能开发，通常不用提交。

## 配套能力

CurdX Flow 会检查这些能力：

| 能力 | 为什么需要 |
| --- | --- |
| `chrome-devtools-mcp` | 前端页面需要真实浏览器证据。 |
| `claude-mem` | 查历史上下文和旧决策。 |
| `pua` | 恢复和高级流程辅助。 |
| `ui-ux-pro-max` | 前端 UI/UX 质量检查。 |
| `context7` | 查当前库/框架文档。 |
| `sequential-thinking` | 高风险任务的显式推理。 |

检查它们：

```bash
curdx-flow doctor
```

## 发布版本

如果你在维护 `@curdx/flow` 项目本身，版本升级用：

```bash
node scripts/bump-version.mjs patch
```

发布需要两个 tag：

```text
vX.Y.Z
curdx-flow--vX.Y.Z
```

普通使用者不需要关心这一节。
