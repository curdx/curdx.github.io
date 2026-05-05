# CurdX Flow

面向 Claude Code 的规约驱动开发工作流，自带自治任务执行循环。

## CurdX Flow 是什么？

`@curdx/flow` 是一个 npm 包，围绕 Claude Code 同时交付两个产品：

1. **规约驱动开发插件**：提供 `/curdx-flow:*` 斜杠命令，把模糊的需求转化为研究报告、需求文档、技术设计、任务清单，再让自治执行循环按任务拆分、逐个推进，每一步之间都有验证门禁。
2. **精选插件 / MCP 市场**：一套交互式安装器，挑选、安装、更新、卸载与 Claude Code 互补的工具集合（跨会话记忆、浏览器自动化、实时文档查询等），并在 `~/.claude/CLAUDE.md` 里维护一份受管清单，让 Claude 知道当前环境装了什么。

插件和安装器在同一个 npm 包里，共用一个版本号。运行一次 `npx @curdx/flow`，整套 Claude Code 环境就搭好了。

```text
你：    /curdx-flow:start "添加带 token 刷新的 OAuth 登录"
flow：  ✓ 访谈：3 个澄清问题（60 秒）
flow：  ✓ 并行研究团队已派遣（3 个专家 Agent）
        → research.md（148 行，9 处引用，识别出 4 项风险）
你：    审查 · 通过  →  /curdx-flow:requirements
flow：  ✓ product-manager
        → requirements.md（US-1..US-9, FR-1..FR-23, NFR-1..NFR-12）
你：    审查 · 通过  →  /curdx-flow:design
flow：  ✓ architect-reviewer
        → design.md（9 项决策、7 项风险、组件图）
你：    审查 · 通过  →  /curdx-flow:tasks
flow：  ✓ task-planner
        → tasks.md（4 个阶段共 12 个任务，含 VERIFY 门禁）
你：    审查 · 通过  →  /curdx-flow:implement
flow：  ⟳ 任务 1.1 → 验证 → 提交 ✓
        ⟳ 任务 1.2 → 验证 → 提交 ✓
        …
        ✓ ALL_TASKS_COMPLETE（12/12 任务，47 个提交，全绿）
```

## 工作流总览

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 280" role="img" aria-label="CurdX Flow 五阶段工作流" style="max-width: 100%; height: auto;">
<defs>
<marker id="flow-arrow-zh" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="260" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />

<rect x="34" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<rect x="220" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<rect x="406" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<rect x="592" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<rect x="778" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-red-soft); stroke: var(--vp-c-red-1); stroke-width: 2;" />

<text x="78" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">研究</text>
<text x="62" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">并行研究团队</text>
<text x="62" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ research.md</text>

<text x="264" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">需求</text>
<text x="248" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">product-manager</text>
<text x="240" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ requirements.md</text>

<text x="450" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">设计</text>
<text x="426" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">architect-reviewer</text>
<text x="442" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ design.md</text>

<text x="638" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">任务</text>
<text x="624" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">task-planner</text>
<text x="624" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ tasks.md</text>

<text x="824" y="124" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">执行</text>
<text x="804" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">spec-executor</text>
<text x="800" y="172" style="fill: var(--vp-c-red-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">自治循环</text>

<path d="M204 140 L216 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow-zh)" />
<path d="M390 140 L402 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow-zh)" />
<path d="M576 140 L588 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow-zh)" />
<path d="M762 140 L774 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow-zh)" />

<text x="46" y="220" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">阶段之间需人工通过</text>
<text x="788" y="220" style="fill: var(--vp-c-red-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">无人值守跑到完成</text>

<text x="40" y="62" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">五阶段，每阶段一个产物，每阶段一个专家 Agent。</text>
</svg>
</div>

工作流共 **五个阶段**。每个阶段由一个专家子 Agent 负责，恰好产出一份 Markdown 文档，并在进入下一阶段前**暂停等待人工通过**。最后一个阶段 `implement` 是自治循环——逐任务执行、验证、提交、推进，直到 `tasks.md` 里所有勾都打上为止。

| 阶段 | 命令 | 子 Agent | 产物 |
| --- | --- | --- | --- |
| 研究 | `/curdx-flow:research` | research-analyst（并行团队） | `research.md` |
| 需求 | `/curdx-flow:requirements` | product-manager | `requirements.md` |
| 设计 | `/curdx-flow:design` | architect-reviewer | `design.md` |
| 任务 | `/curdx-flow:tasks` | task-planner | `tasks.md` |
| 执行 | `/curdx-flow:implement` | spec-executor（自治循环） | 代码、测试、提交 |

所有产物保存在仓库的 `specs/<spec-name>/` 下。它们是纯 Markdown，受版本控制，跨会话也能延续。

## 适合哪些场景

CurdX Flow 在以下场景收益最大：

- **代码会被别人审阅**：规约形成可追溯的纸面证据，对评审者和未来的你都可审计。
- **代码库有约定和约束**：研究和设计阶段会强制把这些前置浮出来，而不是事后才发现。
- **你经常切换上下文**：每个任务都是全新上下文，长时间停顿或限流恢复后不需要重新给项目"补课"。
- **你愿意委派、之后再回来**：自治循环可无人值守运行，跑完了你回来读 diff 即可。

对一次性脚本、五行小改动来说收益不大——直接用纯 Claude Code 更快。

## 核心特性

**五阶段规约工作流**：先把非结构化需求转成研究、需求、设计、任务文档，再写代码。每一阶段都是可审阅的 Markdown。

**自治执行循环**：批准的任务由循环自动跑完，每步都有验证门禁。你可以走开，回来读 diff。

**专家子 Agent**：每个阶段唯一负责人，新上下文运行，思路始终新鲜。

**`[VERIFY]` 质量门禁**：任务之间运行 typecheck、测试、smoke 检查。差的步骤不会悄悄通过。

**Skill 自动发现**：扫描已安装的 Claude Code skills，按目标语义匹配，提前注入到上下文中。

**精选市场**：通过单一交互式安装器获取 `claude-mem`、`chrome-devtools-mcp`、`context7` 等成熟工具——同包同版本，一条命令。

**插件可观察性**：附带 `analyze` CLI，解析会话 jsonl 并生成 7 段 markdown 报告，覆盖 hook 故障、命令频率、Agent 调度热度、规约漏斗、schema 漂移。

## 典型操作流程

1. 一次性运行 `npx @curdx/flow` 安装内置插件，可选挑选市场条目。
2. 进入项目目录，输入 `/curdx-flow:start`，用自然语言描述功能。
3. 通过研究产物，依次推进需求、设计、任务。
4. 按下 `/curdx-flow:implement` 后离开，循环自动逐任务推进。
5. 回来读 diff，开 PR。

## 进阶建议

- 提交四份核心产物（`research.md`、`requirements.md`、`design.md`、`tasks.md`）。评审者会感谢你。
- `--quick` 只用于低风险规约，最后能一次性审完。阶段暂停门禁是有意义的。
- 快速原型用 `--tasks-size coarse`，生产代码用 `fine`，让每个任务对应一个可验证步骤。
- 恢复前先跑 `/curdx-flow:status`，能告诉你每个 spec 当前在哪。
- 大功能直接用 `/curdx-flow:triage`，会拆成依赖明确的多个子规约（epic）。
- 任务多次验证失败时，根因修复，别一味重试。循环故意会停。

## 快速导航

- [快速开始](/zh/curdx-flow/getting-started)：安装、首个 spec、五分钟教程
- [工作原理](/zh/curdx-flow/how-it-works)：规约模型、子 Agent 与自治循环架构
- [配置](/zh/curdx-flow/configuration)：参数、环境变量、状态文件、受管 CLAUDE.md 块
- [命令参考](/zh/curdx-flow/commands)：所有斜杠命令与 CLI 用法
- [子 Agent](/zh/curdx-flow/agents/)：负责各阶段的九位专家
- [故障排除](/zh/curdx-flow/troubleshooting)：常见故障与恢复步骤
