# spec-executor

实现 `tasks.md` 中一个有边界的任务。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `high` |
| 成功 | `TASK_COMPLETE` |
| 失败 | `TASK_FAILED`、`TASK_MODIFICATION_REQUEST` |
| 隔离 | `worktree` |

## 职责

- 只读取当前任务、相关 spec 上下文和指定文件。
- 完成请求的代码改动，不扩大范围。
- 运行任务的 verify 命令。
- 报告变更文件、必要的 commit 证据和 verify 退出码。
- 当任务不安全、欠明确或需要拆分时，请求修改任务。

## 边界

`spec-executor` 不负责 `[VERIFY]` 任务；这些任务交给 `qa-engineer`。它也不自行重写 spec；需求、设计或任务变更走 `/curdx-flow:refactor`。
