# CurdX Bridge

面向 Claude、Codex、Gemini、OpenCode 的多 AI 分屏终端。

![CurdX Bridge 截图](/images/curdx-bridge/screenshot.png)

## CurdX Bridge 是什么？

CurdX Bridge 把一个终端窗口变成可协作的多 Agent 工作台。你始终在 Claude 主面板里对话，需要代码审查、替代设计、实现支持时，用自然语言提出即可。Claude 负责路由请求、等待异步回复，再把结果带回同一条对话线程。

这意味着：

- 不需要在多个 CLI 之间来回切换
- 不需要把同一份上下文复制粘贴给四个工具
- 不需要临时判断哪个模型更适合规划、审查或发散
- 全程可观察，因为每个 Provider 都在自己的面板中运行

## 架构一图看懂

<div style="margin: 1rem 0 1.5rem;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 430" role="img" aria-label="CurdX Bridge 架构概览" style="max-width: 100%; height: auto;">
    <defs>
      <marker id="arch-arrow-zh" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
      </marker>
    </defs>
    <rect x="8" y="8" width="904" height="414" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
    <text x="40" y="48" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">CurdX Bridge 会话</text>
    <text x="40" y="76" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">一个终端，一个主对话面，多路 Provider 实时协作。</text>

    <rect x="42" y="106" width="390" height="268" rx="20" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
    <text x="68" y="148" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">Claude</text>
    <text x="68" y="176" style="fill: var(--vp-c-text-2); font: 500 14px ui-sans-serif, system-ui, sans-serif;">主面板</text>
    <text x="68" y="214" style="fill: var(--vp-c-text-1); font: 400 15px ui-sans-serif, system-ui, sans-serif;">你在这里输入需求。</text>
    <text x="68" y="240" style="fill: var(--vp-c-text-1); font: 400 15px ui-sans-serif, system-ui, sans-serif;">Claude 负责角色调度、上下文打包、</text>
    <text x="68" y="264" style="fill: var(--vp-c-text-1); font: 400 15px ui-sans-serif, system-ui, sans-serif;">异步请求发送与结果整合。</text>

    <rect x="494" y="106" width="384" height="78" rx="16" style="fill: color-mix(in srgb, var(--vp-c-green-1) 14%, transparent); stroke: var(--vp-c-green-1); stroke-width: 2;" />
    <rect x="494" y="201" width="384" height="78" rx="16" style="fill: color-mix(in srgb, var(--vp-c-yellow-1) 18%, transparent); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
    <rect x="494" y="296" width="384" height="78" rx="16" style="fill: color-mix(in srgb, var(--vp-c-red-1) 12%, transparent); stroke: var(--vp-c-red-1); stroke-width: 2;" />

    <text x="520" y="137" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Codex</text>
    <text x="520" y="162" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">评分审查、实现协同、深度代码分析</text>

    <text x="520" y="232" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">Gemini</text>
    <text x="520" y="257" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">替代方案、命名方向、思路发散</text>

    <text x="520" y="327" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">OpenCode</text>
    <text x="520" y="352" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">按需补充实现视角</text>

    <rect x="294" y="28" width="336" height="46" rx="12" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 1.5;" />
    <text x="330" y="57" style="fill: var(--vp-c-text-1); font: 600 16px ui-sans-serif, system-ui, sans-serif;">异步路由、会话状态、角色策略、AutoFlow</text>

    <path d="M432 155 L484 145" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow-zh)" />
    <path d="M432 240 L484 240" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow-zh)" />
    <path d="M432 326 L484 336" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#arch-arrow-zh)" />
  </svg>
</div>

## 适合哪些场景

当你希望一个主 Agent 持续负责，同时又能按角色调用其他模型时，CurdX Bridge 最有价值：

- 功能开发：Claude 负责主实现，Codex 负责审查门禁
- 重构任务：Gemini 提供替代思路，但不替代最终决策
- 复杂排障：你需要并行视角，但仍想保留单一主对话界面
- 长任务执行：`-r` 会话恢复比一次性 Prompt 更重要

## 核心特性

**自然语言调度**：直接说“让 Codex 按 rubric 评审这个方案”或“问 Gemini 三个迁移备选方案”，无需手动切换工具。

**角色化协作**：规划、灵感、审查、执行分工明确，避免多个模型随机重叠、互相覆盖。

**可观察的异步执行**：Provider 面板始终可见。你可以看到它们是否在工作、卡住，或偏离任务。

**质量门禁**：方案和代码都通过显式评分机制，而不是只靠“看起来不错”。

**会话持久化**：通过 `curdx -r` 恢复上下文，适合持续数小时或数天的工作流。

**跨平台支持**：支持 macOS、Linux，以及通过 WSL 运行的 Windows。

## 一个典型操作流程

1. 使用 `curdx` 启动你需要的 Provider 组合。
2. 在主面板向 Claude 描述任务。
3. 让 Claude 按需委派规划、发散、审查或执行。
4. 观察右侧面板异步工作。
5. 在同一对话中继续采纳结果、推进下一步。

## 进阶建议

- 日常编码先从更精简的组合开始，`curdx claude codex` 往往就够用。
- 把 Gemini 用于发散，而不是最终正确性判断。
- 让 Claude 对最终结论负责，要求它解释为何接受或拒绝其他 Provider 的建议。
- 多提交、多轮任务优先使用 `curdx -r`，能显著提升连续性。
- 如果某个 Provider 漂移严重，只重启该 Provider，别急着重置整个会话。

## 快速导航

- [快速开始](/zh/curdx-bridge/getting-started)：安装、首次启动、初始工作流
- [工作原理](/zh/curdx-bridge/how-it-works)：架构、通信、角色、审查机制
- [配置](/zh/curdx-bridge/configuration)：`curdx.config`、环境变量、角色覆盖
- [命令参考](/zh/curdx-bridge/commands)：CLI 用法与 shell 示例
- [Skills](/zh/curdx-bridge/skills/)：规划、执行与审查技能流水线
- [故障排除](/zh/curdx-bridge/troubleshooting)：常见故障与恢复步骤
