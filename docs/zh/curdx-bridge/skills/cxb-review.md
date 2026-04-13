# cxb-review

用于步骤级和任务级的双重评估。

## 它做什么

`cxb-review` 通过 Claude 的本地评估和另一个 Provider（通常是 Codex）的交叉评估，提供第二层质量控制。

这样做的意义在于，单个模型很容易遗漏：

- 隐蔽回归
- 需求漂移
- 测试不足
- 验收标准覆盖不完整

## 审查模式

| 模式 | 运行时机 | 检查对象 |
|------|---------|---------|
| `step` | 单个步骤执行后 | 该步骤的完成条件 |
| `task` | 所有步骤完成后 | 整体验收标准与全局质量 |

## 决策流程

### 1. Claude 评估

Claude 会先给出一个本地判定：

- `PASS`
- `FIX`
- `UNCERTAIN`

### 2. 交叉评估

交叉审查 Provider 需要回答：

1. 是否同意 Claude 的结论？
2. Claude 漏掉了什么？
3. 最终应判定通过还是修复？

### 3. 最终决定

| Claude | 交叉评审 | 结果 |
|--------|---------|------|
| PASS | PASS | **PASS** |
| PASS | FIX | **FIX** |
| FIX | PASS | **FIX** |
| FIX | FIX | **FIX** |
| UNCERTAIN | 任意 | 由 Claude 最终裁决 |

该系统有意偏向“先修复再通过”，而不是在分歧中放行。

## Step 模式检查项

针对单一步骤，审查需要回答：

- 完成条件是否被准确满足？
- 代码改动是否仍在范围内？
- 是否引入了明显回归？
- 如果该步骤需要测试，测试是否已执行？

## Task 模式检查项

针对整项任务，审查需要回答：

- 是否满足全部验收标准？
- 是否缺少文档或配置更新？
- 是否仍存在正确性或可维护性问题？
- 是否应该显式拆出后续任务，而不是默默妥协？

## 审查输出示例

```json
{
  "mode": "step",
  "target": "Add audit logging to admin mutations",
  "verdict": "FIX",
  "claudeAssessment": {
    "verdict": "PASS",
    "reason": "Done conditions appear satisfied"
  },
  "crossAssessment": {
    "verdict": "FIX",
    "agreedWithClaude": false,
    "missedIssues": [
      "DELETE mutations are not logged",
      "No test covers actor attribution"
    ],
    "fixItems": [
      "Log destructive admin actions",
      "Add regression test for actor_id capture"
    ]
  },
  "finalDecision": {
    "verdict": "FIX",
    "reason": "Cross-review found requirement gaps"
  }
}
```

## 最佳实践

- 审查要保持二值化：通过或修复，不要停留在“差不多可以”。
- 修复项必须具体，不能只给空泛建议。
- 只要任务涉及用户可见行为或高风险改动，就应用 task 模式做最终审查。
- 如果 Claude 和 Codex 结论不一致，重点看分歧点，真正的问题通常就藏在那里。

## 适合触发 `cxb-review` 的请求

- “按完成条件跑一步 step-level review。”
- “按最初验收标准审查这个已完成任务。”
- “让 Codex 挑战这个实现，只有测试和文档完整才允许通过。”
