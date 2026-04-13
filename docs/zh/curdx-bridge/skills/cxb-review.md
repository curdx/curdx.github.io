# cxb-review

步骤级和任务级的双重评估。

## 概述

`cxb-review` 通过两个独立评估提供质量验证 — 一个来自 Claude，一个来自交叉审查 Provider（通常是 Codex）。双重评估减少盲点，提高审查结果的可信度。

## 模式

| 模式 | 触发时机 | 评估对象 |
|------|---------|---------|
| `step` | 每步执行后 | 单个步骤是否满足完成条件 |
| `task` | 所有步骤完成后 | 整个任务是否满足验收标准 |

## 工作流

### 步骤 1：Claude 评估

Claude 根据完成条件（step 模式）或验收标准（task 模式）评估工作，给出判定：

- **PASS** — 所有条件满足
- **FIX** — 发现问题，附具体修复项
- **UNCERTAIN** — 需要第二意见

### 步骤 2：交叉审查

工作发送给交叉审查 Provider（默认 Codex）做独立评估：

1. 是否同意 Claude 的判定？
2. 有没有 Claude 遗漏的问题？
3. 最终建议：PASS 还是 FIX？

### 步骤 3：最终决定

| Claude | 交叉审查 | 结果 |
|--------|---------|------|
| PASS | PASS | **PASS** |
| PASS | FIX | **FIX**（Claude 决定修复项） |
| FIX | PASS | **FIX**（合并修复项） |
| FIX | FIX | **FIX**（合并修复项） |
| UNCERTAIN | 任意 | Claude 做最终判定 |

## step 模式检查项

审查单个步骤时：

- 所有完成条件是否满足？
- 代码改动是否正确？
- 是否引入回归？

## task 模式检查项

审查整个任务时：

- 所有验收标准是否满足？
- 是否有遗漏或缺失？
- 代码质量问题？
- 文档是否完整？
- 测试是否通过？

## 审查输出

审查产出结构化 JSON 结果：

```json
{
  "mode": "step",
  "target": "实现用户认证",
  "verdict": "PASS",
  "claudeAssessment": {
    "verdict": "PASS",
    "reason": "所有完成条件已验证"
  },
  "crossAssessment": {
    "verdict": "PASS",
    "agreedWithClaude": true,
    "missedIssues": [],
    "fixItems": []
  },
  "finalDecision": {
    "verdict": "PASS",
    "reason": "双方评估一致"
  }
}
```

## 集成

`cxb-review` 由 [`cxb-task-run`](/zh/curdx-bridge/skills/cxb-task-run) 自动调用：

- **步骤 8** — 每步执行后（step 模式）
- **步骤 10** — 任务完成后（task 模式）

也可以手动调用，对任何工作进行结构化审查。
