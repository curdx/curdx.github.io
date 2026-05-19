# spec-executor

**只做一个有边界的任务，不多做。** 跑在独立 worktree 里 —— 想顺手"扩一下范围"都不行。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `high` |
| 成功 | `TASK_COMPLETE` |
| 失败 | `TASK_FAILED`、`TASK_MODIFICATION_REQUEST` |
| 隔离 | `worktree` |

## 职责

- 只读取该任务、相关 spec 上下文和指定文件。
- 完成请求的代码改动 —— 不扩大范围。
- 跑任务的 verify 命令，给出退出码和变更文件列表。
- 任务不安全、欠明确或需要拆分时，请求修改任务。

## 边界

`spec-executor` 不负责 `[VERIFY]` 门禁 —— 那是 `qa-engineer` 的事。它也不自行重写 spec；规格变更走 `/curdx-flow:refactor`。
