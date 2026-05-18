# 配置

CurdX Flow 的配置刻意保持少。大多数行为由当前仓库、active spec、已安装 Claude Code 能力和命令参数推断。

## 安装器参数

npm CLI 全局参数：

| 参数 | 含义 |
| --- | --- |
| `--lang zh|en` | 覆盖显示语言。 |
| `--no-claude-md` | 不更新 `~/.claude/CLAUDE.md` 中的受管 `@curdx/flow` 块。 |

install 命令参数：

| 参数 | 含义 |
| --- | --- |
| `--all` | 安装所有已知条目。 |
| `--yes` | 跳过重装确认。 |
| `--no-refresh` | 跳过 marketplace 缓存刷新。 |

示例：

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
npm exec -- @curdx/flow@latest install --all --yes
npm exec -- @curdx/flow@latest install --lang zh --no-claude-md
```

## 工作流参数

最重要的参数在 `/curdx-flow:start`：

| 参数 | 默认 | 含义 |
| --- | --- | --- |
| `--mode auto|fast|deep` | `auto` | 路由深度和上下文预算。 |
| `--task-granularity auto|coarse|standard|fine` | `auto` | 生成价值切片任务的大小。 |
| `--review minimal|standard|strict` | 路由决定 | review 节奏，保存到 `autoPolicy.reviewCadence`。 |
| `--quick` | 关闭 | 为低风险或已预批准工作减少提示。 |
| `--fresh` | 关闭 | 新建 spec，不恢复已有 spec。 |
| `--commit-spec` / `--no-commit-spec` | 路由决定 | 是否提交阶段产物。 |
| `--specs-dir <path>` | 默认 spec 目录 | 指定允许的 spec 根目录。 |

`--task-granularity` 已替代旧的 `--tasks-size` 说法。生产常规用 `standard`，希望每个 diff 更小用 `fine`，原型或 spike 用 `coarse`。

## Spec 根目录

CurdX Flow 支持多个 spec 根目录。内置模板默认：

```yaml
specs_dirs: ["./specs"]
```

Monorepo 可以显式增加：

```yaml
specs_dirs:
  - "./specs"
  - "./packages/frontend/specs"
  - "./packages/api/specs"
```

创建到指定根目录：

```text
/curdx-flow:start checkout-ui "实现结账 UI" --specs-dir ./packages/frontend/specs
```

## 状态文件

| 文件 | 作用 |
| --- | --- |
| `research.md` | 事实、既有模式、当前文档、约束、风险。 |
| `requirements.md` | 用户故事、验收标准、边界。 |
| `design.md` | 架构、决策、文件范围、验证策略。 |
| `tasks.md` | 有序价值切片任务和 `[VERIFY]` 检查点。 |
| `.curdx-state.json` | 阶段、active 任务、策略、`verificationBlocks`、恢复状态。 |
| `.progress.md` | 运行期进度、学习、失败尝试、续跑记录。 |

在插件内部工作时，只通过 runtime helper 更新 `.curdx-state.json`：

```bash
curdx-flow state merge <state-file> <json-patch>
```

## Verification Blocks

`verificationBlocks` 是完成契约。没有对应的新鲜证据，就不信任完成声明。

常见证据来源：

| 证据 | 示例 |
| --- | --- |
| 命令 | `npm test`、`npm run build`、`npm run verify`、退出码和时间戳。 |
| 浏览器 | DOM 状态、console/network 状态、截图、Chrome DevTools MCP 证据。 |
| Review | `spec-reviewer`、`code-quality-reviewer`、`qa-engineer` verdict。 |
| 发布 | tag parity、插件校验、npm package、GitHub release。 |

验证 active spec：

```bash
npm exec -- @curdx/flow@latest check
```

## 依赖

插件 manifest 声明这些 Claude Code 插件依赖：

| 依赖 | Marketplace |
| --- | --- |
| `pua` | `pua-skills` |
| `claude-mem` | `thedotmack` |
| `chrome-devtools-mcp` | `chrome-devtools-plugins` |
| `ui-ux-pro-max` | `ui-ux-pro-max-skill` |

预期外部 MCP：

| MCP | 归属 |
| --- | --- |
| `context7` | 外部配置，用于查询当前文档。 |
| `sequential-thinking` | 外部配置，用于高风险显式推理。 |

CurdX Flow 只诊断和使用这些能力，不重复内置或 vendor。

## 发布配置

对 `@curdx/flow` 项目自身，版本字段必须在 npm package、package lock、插件 manifest 和 marketplace metadata 之间保持一致。用脚本升级：

```bash
node scripts/bump-version.mjs patch
```

发布需要两个 tag 面：

```bash
vX.Y.Z
curdx-flow--vX.Y.Z
```

npm tag 发布包。插件 tag 供 Claude Code 解析插件版本。
