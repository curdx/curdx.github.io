# 工作原理

CurdX Bridge 围绕一个核心原则构建：始终保留一个负责到底的主 Agent，同时并行调用其他专业模型。

## 分屏架构

每个 Provider 都运行在独立终端面板中。Claude 面向操作者，其他面板则扮演专业 worker。

- **Claude**：维护主对话、规划下一步、整合回复
- **Codex**：通常承担审查或执行协作角色
- **Gemini**：通常承担灵感与备选方案生成角色
- **OpenCode**：在需要时提供额外实现视角

与“后台悄悄调用另一个模型”的黑箱集成不同，这种布局是可观察的。你能看见某个 Provider 是在思考、卡住，还是已经跑偏。

## 通信流

<div style="margin: 1rem 0 1.5rem;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 280" role="img" aria-label="CurdX Bridge 异步请求响应流程" style="max-width: 100%; height: auto;">
    <defs>
      <marker id="flow-arrow-zh" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
      </marker>
    </defs>
    <rect x="10" y="10" width="960" height="260" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
    <rect x="34" y="88" width="140" height="96" rx="18" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 1.5;" />
    <rect x="224" y="62" width="188" height="148" rx="18" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
    <rect x="470" y="62" width="188" height="148" rx="18" style="fill: color-mix(in srgb, var(--vp-c-green-1) 14%, transparent); stroke: var(--vp-c-green-1); stroke-width: 2;" />
    <rect x="714" y="88" width="220" height="96" rx="18" style="fill: var(--vp-c-default-soft); stroke: var(--vp-c-divider); stroke-width: 1.5;" />

    <text x="71" y="126" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">你</text>
    <text x="51" y="154" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">自然语言</text>
    <text x="58" y="174" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">请求</text>

    <text x="283" y="104" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">Claude</text>
    <text x="251" y="136" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">打包上下文、选择 Provider、</text>
    <text x="265" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">通过 `cxb-ask` 发送</text>
    <text x="246" y="184" style="fill: var(--vp-c-brand-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">主面板保持可继续对话</text>

    <text x="524" y="104" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">Provider 面板</text>
    <text x="507" y="136" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Codex、Gemini 或 OpenCode</text>
    <text x="505" y="156" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">在独立面板中异步处理请求</text>
    <text x="506" y="184" style="fill: var(--vp-c-green-1); font: 600 13px ui-sans-serif, system-ui, sans-serif;">你可以直接观察处理过程</text>

    <text x="748" y="126" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">合并后的回复</text>
    <text x="740" y="154" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">Claude 通过 `cxb-pend`</text>
    <text x="748" y="174" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">回复路径取回结果</text>

    <path d="M174 136 L214 136" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow-zh)" />
    <path d="M412 136 L460 136" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#flow-arrow-zh)" />
    <path d="M714 192 C648 238, 528 240, 414 204" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3; stroke-dasharray: 8 7;" marker-end="url(#flow-arrow-zh)" />
    <path d="M412 92 C516 26, 676 28, 814 82" style="fill: none; stroke: var(--vp-c-divider); stroke-width: 2; stroke-dasharray: 5 6;" />
    <text x="486" y="40" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">异步请求</text>
    <text x="500" y="246" style="fill: var(--vp-c-text-2); font: 500 13px ui-sans-serif, system-ui, sans-serif;">异步响应</text>
  </svg>
</div>

当你说“让 Codex 审一下这个实现”时，内部流程大致如下：

1. Claude 解析意图并选择合适的 Provider。
2. Claude 通过异步 ask 路径发送结构化请求。
3. Provider 在独立面板中工作，不阻塞主对话。
4. Claude 之后通过 pending-reply 路径取回结果。
5. 你继续和 Claude 对话，不需要关心底层传输细节。

## 为什么异步模型重要

- Provider 之间不会互相阻塞
- Claude 能持续维持主线程一致性
- 你可以连续发起多个请求，同时保持可观察性
- 每个 Provider 都能长期保留自己的对话上下文

这也是“找另一个模型帮忙”与“运行一个可观察的多 Agent 会话”的区别。

## 角色系统

当你把 Provider 当作角色而不是可互换模型来使用时，CurdX Bridge 会更稳定。

<div style="margin: 1rem 0 1.5rem;">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 400" role="img" aria-label="CurdX Bridge 角色系统可视化" style="max-width: 100%; height: auto;">
    <defs>
      <marker id="role-arrow-zh" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" style="fill: var(--vp-c-brand-1);" />
      </marker>
    </defs>
    <rect x="10" y="10" width="960" height="380" rx="24" style="fill: var(--vp-c-bg-soft); stroke: var(--vp-c-divider); stroke-width: 2;" />
    <circle cx="490" cy="196" r="74" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
    <text x="452" y="186" style="fill: var(--vp-c-text-1); font: 700 24px ui-sans-serif, system-ui, sans-serif;">Claude</text>
    <text x="432" y="214" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">协调与整合中心</text>

    <rect x="84" y="54" width="230" height="94" rx="18" style="fill: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent); stroke: var(--vp-c-brand-1); stroke-width: 2;" />
    <text x="112" y="92" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">设计师</text>
    <text x="112" y="118" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">负责方案定义与最终回答</text>

    <rect x="662" y="54" width="238" height="94" rx="18" style="fill: color-mix(in srgb, var(--vp-c-green-1) 14%, transparent); stroke: var(--vp-c-green-1); stroke-width: 2;" />
    <text x="692" y="92" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">评审员</text>
    <text x="692" y="118" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">通常是 Codex，负责评分审查</text>

    <rect x="78" y="250" width="248" height="94" rx="18" style="fill: color-mix(in srgb, var(--vp-c-yellow-1) 18%, transparent); stroke: var(--vp-c-yellow-1); stroke-width: 2;" />
    <text x="108" y="288" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">灵感源</text>
    <text x="108" y="314" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">通常是 Gemini，只提供选项不裁决</text>

    <rect x="654" y="250" width="256" height="94" rx="18" style="fill: color-mix(in srgb, var(--vp-c-red-1) 12%, transparent); stroke: var(--vp-c-red-1); stroke-width: 2;" />
    <text x="684" y="288" style="fill: var(--vp-c-text-1); font: 700 22px ui-sans-serif, system-ui, sans-serif;">协作者</text>
    <text x="684" y="314" style="fill: var(--vp-c-text-2); font: 400 14px ui-sans-serif, system-ui, sans-serif;">OpenCode 或其他执行侧补充角色</text>

    <path d="M314 120 L405 164" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#role-arrow-zh)" />
    <path d="M662 120 L575 164" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#role-arrow-zh)" />
    <path d="M326 278 L411 232" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#role-arrow-zh)" />
    <path d="M654 278 L569 232" style="fill: none; stroke: var(--vp-c-brand-1); stroke-width: 3;" marker-end="url(#role-arrow-zh)" />
  </svg>
</div>

| 角色 | 默认 Provider | 职责 |
|------|--------------|------|
| **设计师** | Claude | 理解用户需求、生成方案、承担最终决策 |
| **评审员** | Codex | 按 rubric 做评分审查并指出缺陷 |
| **灵感源** | Gemini | 生成替代方案、命名方向和结构选项 |
| **协作者** | OpenCode | 提供额外实现视角 |
| **执行者** | Claude 或 Codex | 在 AutoFlow 中执行文件或测试动作 |

### `CLAUDE.md` 中的角色分配

角色通常在项目级 `CLAUDE.md` 中定义：

```markdown
| Role | Provider | Description |
|------|----------|-------------|
| designer | claude | Primary planner and orchestrator |
| inspiration | gemini | Brainstorming and alternatives |
| reviewer | codex | Scored review gate |
| executor | codex | File operations and test execution |
```

你修改的是 Provider 列，但真正的约束是角色名。角色定义了职责，Provider 只是具体实现。

## 审查框架

CurdX Bridge 通过显式 rubric 避免“看起来没问题”成为唯一质量门槛。

### Rubric A：方案审查

| 维度 | 权重 | 衡量内容 |
|------|------|---------|
| 清晰度 | 20% | 别的开发者能否不反复追问就执行 |
| 完整性 | 25% | 是否覆盖需求、边界情况和交付物 |
| 可行性 | 25% | 是否符合当前仓库和工具现实 |
| 风险评估 | 15% | 是否明确列出风险及缓解方式 |
| 需求对齐 | 15% | 是否能回溯到原始需求 |

### Rubric B：代码审查

| 维度 | 权重 | 衡量内容 |
|------|------|---------|
| 正确性 | 25% | 行为是否符合批准方案 |
| 安全性 | 15% | 是否妥善处理校验、密钥、危险模式 |
| 可维护性 | 20% | 命名、结构、约定是否健康 |
| 性能 | 10% | 是否引入明显可避免的退化 |
| 测试覆盖 | 15% | 变更路径是否得到必要验证 |
| 方案一致性 | 15% | 实现是否仍与方案一致 |

### 通过标准

- 加权总分至少 `7.0`
- 任一维度不得低于 `3`
- 审查失败后允许修改并重提，直到达到配置的最大轮次

## 会话管理

每个会话都会在 `.curdx/` 中保留项目级状态，包括当前执行状态和可恢复上下文。

常见生命周期：

- `curdx [providers...]` 启动新会话
- `curdx -r` 恢复上次会话
- `curdx kill` 停止全部面板
- `curdx kill codex -f` 只强制重启一个问题 Provider

## 实用操作建议

- 最终建议必须由 Claude 负责，即便某个 Provider 给出了最好的原始答案。
- 发起审查请求时要带约束。“检查迁移安全性和回滚风险”比“帮我看看”更有效。
- 不要为了新鲜感随便换角色，随机换 Provider 通常只会降低一致性。
- 多观察右侧面板。很多真实问题，是从看见某个 Provider 卡在哪里开始暴露的。
