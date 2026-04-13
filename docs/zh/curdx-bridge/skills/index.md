# Skills

Skills 是 CurdX Bridge 中自然语言调度背后的操作层。它把“让 Codex 审一下这个方案”这类请求转化为职责明确、状态可追踪的工作流。

## 为什么 Skills 重要

没有 Skills，多 Provider 会话很快就会变成临时拼接。Skills 为 Claude 提供了结构化的方法来：

- 发送异步请求
- 运行规划循环
- 生成执行制品
- 执行质量门禁
- 推进自动化任务流水线

大多数用户并不需要手动输入 Skill 名称，但理解这套结构能帮助你发出更有效的请求。

## Skill 分类

### 通信

| Skill | 用途 |
|-------|------|
| [cxb-ask](/zh/curdx-bridge/skills/cxb-ask) | 向某个 Provider 发送异步请求 |

### 规划与执行

| Skill | 用途 |
|-------|------|
| [cxb-plan](/zh/curdx-bridge/skills/cxb-plan) | 产出经过评审的实施方案 |
| [cxb-task-plan](/zh/curdx-bridge/skills/cxb-task-plan) | 把批准方案转为任务制品 |
| [cxb-task-run](/zh/curdx-bridge/skills/cxb-task-run) | 通过 AutoFlow 执行下一步任务 |

### 质量保障

| Skill | 用途 |
|-------|------|
| [cxb-review](/zh/curdx-bridge/skills/cxb-review) | 对单步或整项任务执行双重评估 |

## Skill 工作流流水线

<div style="margin: 1rem 0 1.5rem;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 280" role="img" aria-label="Skill 工作流流水线" style="max-width: 100%; height: auto;">
    <defs>
      <marker id="skills-arrow-zh" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
      </marker>
    </defs>
    <rect x="10" y="10" width="940" height="260" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
    <rect x="46" y="88" width="176" height="104" rx="18" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
    <rect x="276" y="88" width="182" height="104" rx="18" style="fill: color-mix(in srgb, var(--vp-c-green-1) 14%, transparent); stroke: var(--vp-c-green-1); stroke-width: 2;" />
    <rect x="512" y="88" width="182" height="104" rx="18" style="fill: color-mix(in srgb, var(--vp-c-yellow-1) 18%, transparent); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
    <rect x="748" y="88" width="164" height="104" rx="18" style="fill: color-mix(in srgb, var(--vp-c-red-1) 12%, transparent); stroke: var(--vp-c-red-1); stroke-width: 2;" />

    <text x="90" y="128" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">cxb-plan</text>
    <text x="84" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">澄清需求、设计并</text>
    <text x="93" y="176" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">完成评分审查</text>

    <text x="302" y="128" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">cxb-task-plan</text>
    <text x="307" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">生成状态、todo</text>
    <text x="318" y="176" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">与日志文件</text>

    <text x="552" y="128" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">cxb-task-run</text>
    <text x="548" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">执行单步、测试</text>
    <text x="548" y="176" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">并推进状态</text>

    <text x="779" y="128" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">cxb-review</text>
    <text x="786" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">PASS 或 FIX</text>
    <text x="772" y="176" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">双重评估决策</text>

    <path d="M222 140 L266 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#skills-arrow-zh)" />
    <path d="M458 140 L502 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#skills-arrow-zh)" />
    <path d="M694 140 L738 140" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#skills-arrow-zh)" />
    <path d="M830 202 C800 240, 592 252, 366 226 C240 212, 164 206, 134 200" style="fill: none; stroke: var(--vp-c-divider); stroke-width: 2; stroke-dasharray: 6 6;" marker-end="url(#skills-arrow-zh)" />
    <text x="406" y="248" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">审查未通过时，修复项会回流到规划或执行阶段</text>
  </svg>
</div>

## 推荐心智模型

可以这样理解整套 Skill 栈：

1. `cxb-plan` 决定应该做什么
2. `cxb-task-plan` 把方案转成可持续推进的状态
3. `cxb-task-run` 执行下一步工作
4. `cxb-review` 判断该工作是否通过

而 `cxb-ask` 则是让各个 Provider 能协作起来的底层传输技能。

## 常见工作流

### 先规划，再编码

- 先让 Claude 产出方案
- 再让 Codex 审方案
- 通过后才开始实现

### 把功能拆成可恢复的步骤

- 运行规划工作流
- 生成 `.curdx/` 制品
- 使用 `curdx -r` 以后继续执行

### 安全地使用 Gemini

- 让 Gemini 负责提出选项
- 要求 Claude 将每条建议分类为 adopt、adapt 或 discard
- 再把最终方向交给 Codex 做审查

## 进阶建议

- 让需求表达为“我要的结果”，而不是只报 Skill 名称。比如“给这个迁移创建一个经过审查的任务方案”。
- 审查尽量保持二值化，只问是否能通过，还有哪些 fix items。
- 只有中大型任务才值得跑完整 AutoFlow，小改动没必要上全套流水线。
