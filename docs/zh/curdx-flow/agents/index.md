# 子 Agent

CurdX Flow 内置 9 位专家子 Agent。每位职责单一、独立上下文运行，由协调命令自动调用。你不会直接喊它们——但理解它们的分工能帮你写出更好的目标、审更好的产物。

## 为什么用专家子 Agent

多 Agent 框架常见做法是把多个通用 Agent 叠加在同一个对话上，结果是 token 消耗多、等待时间长、出问题难排查。

flow 的取舍不一样：**每个阶段一个专家，每次都是新上下文。** 子 Agent 只拿它需要的输入（目标、前置产物、相关 skills），产出唯一一份产物，然后退出。没有多 Agent 编排沙拉。

## 子 Agent 流水线

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 280" role="img" aria-label="CurdX Flow 子 Agent 流水线" style="max-width: 100%; height: auto;">
<defs>
<marker id="agent-arrow-zh" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="260" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />

<rect x="34" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<rect x="220" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<rect x="406" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<rect x="592" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
<rect x="778" y="86" width="170" height="108" rx="18" style="fill: var(--vp-c-red-soft); stroke: var(--vp-c-red-1); stroke-width: 2;" />

<text x="40" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">research-analyst</text>
<text x="62" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">并行研究团队</text>
<text x="62" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ research.md</text>

<text x="240" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">product-manager</text>
<text x="248" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">US, FR, NFR</text>
<text x="240" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ requirements.md</text>

<text x="416" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">architect-reviewer</text>
<text x="426" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">决策、风险</text>
<text x="442" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ design.md</text>

<text x="624" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">task-planner</text>
<text x="624" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">[VERIFY] 门禁</text>
<text x="624" y="172" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">→ tasks.md</text>

<text x="794" y="124" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">spec-executor</text>
<text x="800" y="152" style="fill: var(--vp-c-text-2); font: 400 13px ui-sans-serif, system-ui, sans-serif;">实现、验证</text>
<text x="800" y="172" style="fill: var(--vp-c-red-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">提交、推进</text>

<path d="M204 140 L216 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#agent-arrow-zh)" />
<path d="M390 140 L402 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#agent-arrow-zh)" />
<path d="M576 140 L588 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#agent-arrow-zh)" />
<path d="M762 140 L774 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#agent-arrow-zh)" />

<text x="40" y="58" style="fill: var(--vp-c-text-1); font: 700 18px ui-sans-serif, system-ui, sans-serif;">五位阶段负责人，各写一份产物即退出。</text>
<text x="40" y="220" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">辅助子 Agent（spec-reviewer、qa-engineer、refactor-specialist、triage-analyst）支撑流水线。</text>
</svg>
</div>

## 九位子 Agent

### 阶段负责人

这五位负责一个完整阶段，产出唯一一份核心产物。

| 子 Agent | 阶段 | 产物 |
| --- | --- | --- |
| [research-analyst](/zh/curdx-flow/agents/research-analyst) | 研究 | `research.md` |
| [product-manager](/zh/curdx-flow/agents/product-manager) | 需求 | `requirements.md` |
| [architect-reviewer](/zh/curdx-flow/agents/architect-reviewer) | 设计 | `design.md` |
| [task-planner](/zh/curdx-flow/agents/task-planner) | 任务 | `tasks.md` |
| [spec-executor](/zh/curdx-flow/agents/spec-executor) | 执行 | 代码、测试、提交 |

### 辅助 Agent

这四位在质量门禁和 epic 拆分时支撑流水线。

| 子 Agent | 角色 |
| --- | --- |
| `spec-reviewer` | 只读评审者，按类型规则验证产物，输出 `REVIEW_PASS` 或 `REVIEW_FAIL`。 |
| `qa-engineer` | 在质量门禁运行验证命令，输出 `VERIFICATION_PASS` 或 `VERIFICATION_FAIL`。 |
| `refactor-specialist` | 执行揭示规约漂移后逐节更新规约文件。`/curdx-flow:refactor` 调用它。 |
| `triage-analyst` | 把大功能拆成依赖明确的多个规约（epic 图）。`/curdx-flow:triage` 调用它。 |

## 心智模型

把流水线想成一个小团队：

1. **研究分析师** 读所有材料、写出简报。
2. **产品经理** 把简报转成可测试需求。
3. **架构师** 决定如何实现需求。
4. **任务规划师** 把设计拆成带验证门禁的清单。
5. **执行器** 跑清单、提交代码。

辅助 Agent 是质量与流程——评审、验证、当现实出现时重塑规约。

## 常用工作流

### 一次完整规约走查

```text
/curdx-flow:start         # 访谈 + research-analyst（并行团队）
/curdx-flow:requirements  # product-manager
/curdx-flow:design        # architect-reviewer
/curdx-flow:tasks         # task-planner
/curdx-flow:implement     # spec-executor（自治循环，每个 VERIFY 门禁由 qa-engineer 把关）
```

### 执行后发现规约要改

```text
/curdx-flow:cancel        # 暂停循环
/curdx-flow:refactor      # refactor-specialist 走 requirements → design → tasks
/curdx-flow:implement     # 恢复
```

### 单个规约装不下的大功能

```text
/curdx-flow:triage        # triage-analyst 产出 epic.md 和子规约
/curdx-flow:start         # 正常推进第一个子规约
```

## 进阶建议

- 用自然语言描述**结果**，协调器自会选对子 Agent。
- 子 Agent 输出令人失望，问题通常在上游。研究差 → 需求差 → 设计差。
- 用 `/curdx-flow:refactor` 而不是手改产物，辅助 `refactor-specialist` 会一致地走完整链。
- 任务保持细粒度。`spec-executor` 最高兴的状态是每个任务对应一个可验证改动。
