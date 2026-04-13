# cxb-task-run

通过 AutoFlow 流水线执行任务步骤。

## 它做什么

`cxb-task-run` 是中大型、可恢复任务的执行引擎。它一次只推进一个步骤，对该步骤执行审查、更新任务状态，并决定流水线是否可以继续。

这样可以避免长任务退化成一串不可追踪的临时改动。

## AutoFlow 10 步流水线

<div style="margin: 1rem 0 1.5rem;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 440" role="img" aria-label="AutoFlow 十步执行流水线" style="max-width: 100%; height: auto;">
<defs>
<marker id="auto-arrow-zh" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
<path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
</marker>
</defs>
<rect x="10" y="10" width="960" height="420" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />

<g style="font: 600 15px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-1);">
<rect x="36" y="64" width="158" height="86" rx="16" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<rect x="220" y="64" width="158" height="86" rx="16" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<rect x="404" y="64" width="158" height="86" rx="16" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<rect x="588" y="64" width="158" height="86" rx="16" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
<rect x="772" y="64" width="158" height="86" rx="16" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />

<rect x="772" y="254" width="158" height="86" rx="16" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<rect x="588" y="254" width="158" height="86" rx="16" style="fill: var(--vp-c-green-soft); stroke: var(--vp-c-green-1); stroke-width: 2;" />
<rect x="404" y="254" width="158" height="86" rx="16" style="fill: var(--vp-c-yellow-soft); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
<rect x="220" y="254" width="158" height="86" rx="16" style="fill: var(--vp-c-red-soft); stroke: var(--vp-c-red-1); stroke-width: 2;" />
<rect x="36" y="254" width="158" height="86" rx="16" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1); stroke-width: 2;" />

<text x="56" y="94">1. 同步状态</text>
<text x="56" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">读取 `.curdx/state.json`</text>

<text x="240" y="94">2. 设计当前步</text>
<text x="240" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">Claude + Codex 独立设计</text>

<text x="424" y="94">3. 拆分检查</text>
<text x="424" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">拆分过大的步骤</text>

<text x="608" y="94">4. 构建请求</text>
<text x="608" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">准备 FileOpsREQ</text>

<text x="792" y="94">5. 发送请求</text>
<text x="792" y="118" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">发给执行者</text>

<text x="792" y="284">6. 执行</text>
<text x="792" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">代码、文件、测试</text>

<text x="608" y="284">7. 处理回复</text>
<text x="608" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">`ok`、`ask`、`fail`</text>

<text x="424" y="284">8. 审查</text>
<text x="424" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">双重评估</text>

<text x="240" y="284">8.5 测试</text>
<text x="240" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">按需执行</text>

<text x="56" y="284">9-10 收尾</text>
<text x="56" y="308" style="font: 400 13px ui-sans-serif, system-ui, sans-serif; fill: var(--vp-c-text-2);">推进状态并最终审查</text>
</g>

<path d="M194 107 L210 107" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow-zh)" />
<path d="M378 107 L394 107" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow-zh)" />
<path d="M562 107 L578 107" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow-zh)" />
<path d="M746 107 L762 107" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow-zh)" />
<path d="M852 150 C940 176, 940 230, 852 254" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow-zh)" />
<path d="M772 297 L756 297" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow-zh)" />
<path d="M588 297 L572 297" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow-zh)" />
<path d="M404 297 L388 297" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow-zh)" />
<path d="M220 297 L204 297" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#auto-arrow-zh)" />
</svg>
</div>

## 各步骤说明

### 1. 同步状态

读取 `.curdx/state.json`，确定当前步骤，检查重试次数，并在任务已完成或已阻塞时立即停止。

### 2. 设计当前步骤

Claude 和 Codex 会分别独立提出当前步骤的实现方案，之后由 Claude 合并：

- 实施方式
- 完成条件
- 风险
- 是否需要拆分

这样可以在实际改动前先降低盲点。

### 3. 拆分检查

如果步骤过大，就拆成更小的子步骤。好的子步骤应当：

- 有顺序
- 可独立审查
- 每个都具备实际意义

### 4. 构建文件操作请求

Claude 会准备一个结构化执行请求，而不是临时随手改代码。

### 5. 发送给执行者

请求会被路由到配置好的执行者，通常是 Codex。

### 6. 执行

执行模式取决于配置：

| 执行者配置 | 行为 |
|-----------|------|
| `codex` | Codex 完整执行该步骤 |
| `opencode` | Codex 监督 OpenCode |
| `codex+opencode` | Codex 负责读，OpenCode 负责写 |

### 7. 处理回复

| 状态 | 含义 | 后续动作 |
|------|------|---------|
| `ok` | 工作完成 | 进入审查 |
| `ask` | 执行者需要澄清 | 向用户提出问题 |
| `fail` | 执行者无法继续 | 标记阻塞并记录原因 |

### 8. 审查

[`cxb-review`](/zh/curdx-bridge/skills/cxb-review) 会以 step 模式运行，给出 PASS 或 FIX。

### 8.5 测试

测试不是每一步都自动执行。Claude 会按以下因素决定是否需要测试：

- 改动范围
- 风险大小
- 是否存在相关测试

### 9. 收尾当前步

成功后更新：

- `.curdx/state.json`
- `.curdx/todo.md`
- `.curdx/plan_log.md`

然后进入下一步。

### 10. 最终审查

当所有步骤完成后，[`cxb-review`](/zh/curdx-bridge/skills/cxb-review) 会以 task 模式运行。

可能结果：

- 小问题直接修复
- 中等问题追加一个小步骤
- 大问题生成后续任务

## 真实示例

以“为管理员写操作增加审计日志”为例，`cxb-task-run` 可能会：

1. 设计 schema 扩展方案
2. 实现存储路径
3. 审查写入流程
4. 运行管理员写路径相关测试
5. 收尾并补充文档

## 最佳实践

- AutoFlow 适合中大型任务，不适合一两个文件的小改动。
- 完成条件必须可验证、具体。
- 当任务变得模糊时，应暂停自动执行并向用户确认，而不是继续猜。
- 审查失败不是噪音，它是在告诉你真正的问题还没解决。
