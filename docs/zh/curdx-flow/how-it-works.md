# 工作原理

CurdX Flow 的底层逻辑是一句话：**规约才是契约，而不是 Prompt。** 在写代码之前，工作先用四份带版本的 Markdown 文件描述清楚；然后由一个专家 Agent 一次跑一个任务，每个任务之间都有验证门禁。

## 五阶段工作流

每个阶段恰好一个负责子 Agent，恰好一份产物。阶段顺序是设计上的——跳步或换序都不支持。

| 阶段 | 负责人 | 产物 | 是否暂停审批？ |
| --- | --- | --- | --- |
| 研究 | `research-analyst`（并行团队） | `research.md` | 是 |
| 需求 | `product-manager` | `requirements.md` | 是 |
| 设计 | `architect-reviewer` | `design.md` | 是 |
| 任务 | `task-planner` | `tasks.md` | 是 |
| 执行 | `spec-executor` | 代码、测试、提交 | 否——自治运行 |

前四阶段都是暂停审批；第五阶段是自治循环。

## 规约驱动架构

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 420" role="img" aria-label="CurdX Flow 规约驱动架构" style="max-width: 100%; height: auto;">
<defs>
<marker id="arch-arrow-zh-2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="400" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<text x="40" y="48" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">单仓库内的规约生命周期</text>
<text x="40" y="74" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">目标 → 四份产物 → 自治执行 → 提交代码。</text>

<rect x="40" y="106" width="220" height="76" rx="16" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<text x="64" y="138" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">/curdx-flow:start</text>
<text x="64" y="162" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">目标 + 访谈 + skills</text>

<rect x="290" y="106" width="640" height="76" rx="16" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<text x="312" y="138" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">阶段（每段后暂停审批）</text>
<text x="312" y="162" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">research.md → requirements.md → design.md → tasks.md</text>

<rect x="40" y="208" width="890" height="86" rx="16" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<text x="64" y="240" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">/curdx-flow:implement（自治循环）</text>
<text x="64" y="266" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">取下一任务 → 新上下文 → 实现 → 验证门禁 → 提交 → 标记 [x] → 重复直到 ALL_TASKS_COMPLETE</text>

<rect x="40" y="320" width="890" height="76" rx="16" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<text x="64" y="352" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">specs/&lt;name&gt;/  + .curdx-state.json + .progress.md</text>
<text x="64" y="376" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">产物提交到 git · 状态与进度 gitignore · 跨会话可恢复</text>

<path d="M260 144 L286 144" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow-zh-2)" />
<path d="M610 184 L610 204" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow-zh-2)" />
<path d="M484 296 L484 316" style="fill: none; stroke: var(--vp-c-divider); stroke-width: 2; stroke-dasharray: 4 5;" />
</svg>
</div>

## 为什么用子 Agent

大多数多 Agent 框架随着功能增长不断叠加 Agent 和编排，结果是 token 越花越多、等待越来越久、流水线越来越难审计。

flow 的赌注不一样：**每个阶段一个专家，每次都是新上下文。**

- `product-manager` 看不到实现细节，只看到目标和研究产物。
- `architect-reviewer` 看不到研究的原始笔记，只看到需求。
- `spec-executor` 不会把整份规约塞进一个 Prompt，它每次只取当前任务的描述、`design.md` 的相关片段、以及涉及的文件。

这让每阶段推理都保持新鲜，避免大上下文模型在 Prompt 膨胀下退化。

## 自治执行循环

`tasks.md` 通过审批后，`spec-executor` 接管：

```text
loop:
  从 tasks.md 取下一个未勾选任务
  打开新上下文，注入：任务描述、design.md 摘要、相关文件
  实现 → 运行验证命令 → 成功后提交
  在 tasks.md 中把任务标记为 [x]
  若验证失败 → 重试至多 N 次 → 仍失败则停下并暴露
  重复直到 ALL_TASKS_COMPLETE
```

循环有三个让人放心的特性：

1. **任务级新鲜上下文**：长会话和限流恢复不会污染后续任务。
2. **先验证再提交**：`[VERIFY]` 任务失败立即暴露，错误尽早被发现。
3. **持续失败必停**：重试预算耗尽就停下。你修复底层问题再恢复，flow 不会悄悄盖住真实失败。

## 验证层级

`tasks.md` 把实现任务和 `[VERIFY]` 任务交替排布。`[VERIFY]` 步骤运行真实命令——typecheck、单元测试、smoke、lint，不是模型主观判断的"看起来不错"。

典型验证栈（按项目定义、可配置）：

| 层级 | 命令 | 触发时机 |
| --- | --- | --- |
| 类型安全 | `npm run typecheck` | 每次代码改动 |
| 单元测试 | `npm test` | 每个实现任务后 |
| 构建 / 打包 | `npm run build` | 结构性变更 |
| 烟雾 / e2e | 项目自定义 | 阶段边界 |

`[VERIFY]` 失败时，执行器报告 `VERIFICATION_FAIL`，重试预算开始计数，预算耗尽则停下。

## Skill 自动发现

flow 扫描当前环境已安装的 Claude Code skills（项目 skills、`.agents/skills/`、插件 skills），按目标语义匹配，相关的 skills 会在子 Agent 运行前预加载到上下文中。

发现会跑两次：

1. **第一次** —— 在 `/curdx-flow:start` 时，仅基于目标文本。
2. **第二次** —— 研究完成后，基于目标 + research 执行摘要。这样能捕捉只有在问题被进一步理解后才相关的 skills。

两次匹配都记录在 `.progress.md` 里，便于你回看哪些被加载、为什么。

## Hooks

flow 自带四个 hook，绑定到 Claude Code 生命周期事件：

| Hook | 事件 | 作用 |
| --- | --- | --- |
| `update-spec-index` | `Stop` | 维护规约索引，供 `/curdx-flow:status` 和 triage 使用 |
| `quick-mode-guard` | `PreToolUse` | `--quick` 模式下的护栏 |
| `stop-watcher` | `Stop` | 检测自治循环完成，自动推进下一任务 |
| `load-spec-context` | `SessionStart` | 会话启动时预加载当前 spec |

Hooks 是 TypeScript 源码，构建时打包成 `.mjs`。是纯 shell 驱动脚本，hook 内部不嵌套 Agent。

## 状态与持久化

每个规约：

```text
specs/<spec-name>/
├── research.md              # 提交到 git
├── requirements.md          # 提交到 git
├── design.md                # 提交到 git
├── tasks.md                 # 提交到 git
├── .curdx-state.json        # gitignore——当前阶段、taskIndex、迭代
└── .progress.md             # gitignore——阶段笔记、skill 发现日志
```

仓库级：

```text
specs/
├── .current-spec            # 当前 spec 名（gitignore）
├── .current-epic            # 当前 epic 名（gitignore）
└── .index/                  # 用于 triage 的搜索索引
```

四份产物是变更的持久记录。状态文件是工作内存。

## 市场那一面

同一个 npm 包还自带交互式安装器：

| ID | 类型 | 用途 |
| --- | --- | --- |
| **`curdx-flow`** | plugin | 规约工作流本身。**始终安装。** |
| `claude-mem` | plugin | 跨会话记忆。 |
| `pua` | plugin | 反失败压力模式，连续失败时触发。 |
| `chrome-devtools-mcp` | plugin | 通过 MCP 操控真实 Chrome。 |
| `frontend-design` | plugin | 高质量、不模板化的前端输出。 |
| `sequential-thinking` | mcp | 序列化思考 MCP 服务。 |
| `context7` | mcp | 实时库文档查询。 |

安装器读取自带的描述符目录，调用 `claude plugin install` 和 `claude mcp add`，并在 `~/.claude/CLAUDE.md` 写入受管块，告知 Claude Code 装了什么。所有操作幂等——任何时候重跑都能与目标状态对齐。

## 为什么需要它

Claude Code 速度快，但在真实项目中有可预测的失效模式：

- 不主动写测试，除非反复提醒。
- 跨会话、限流恢复、长会话内会丢失上下文。
- 同一任务不同次运行结果不一致。
- 对欠规约的需求不会反推，而是直接猜，等到代码评审时才发现错位。

多数工作流框架靠堆 Agent 解决问题。flow 的取舍是：先把契约写出来，每阶段一个专家、新上下文，然后让自治循环把人工审过的中段执行做完。

> Claude Code 是引擎，CurdX Flow 是底盘。

## 实操建议

- 把每个暂停当成真正的检查点。在 `requirements.md` 阶段纠偏几乎免费，到 `tasks.md` 阶段就要重新跑很多步。
- 在 `/curdx-flow:implement` 之前认真读 `tasks.md`。循环开始后是按任务提交的，撤销靠 git，不是一键回退。
- 发现执行器跑偏，立刻 `/curdx-flow:cancel`，修规约，再恢复。别让它带着错跑 20 个任务。
- 规约保持小到能装进脑子里。再大就用 `/curdx-flow:triage`。
- 多日项目结束后跑一次 `analyze` CLI，能暴露你平时永远不会注意到的 hook 故障和 schema 漂移。
