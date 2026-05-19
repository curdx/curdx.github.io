# task-planner

**专治"一个大 prompt + 一次混乱运行"。** 把设计切成有边界的任务，每个任务都带验证。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `high` |
| 成功 | `TASKS_READY` |
| 失败 | `TASKS_BLOCKED` |
| 主要产物 | `tasks.md` |

## 职责

- 把工作切成有顺序、文件范围明确的任务。
- 尊重传入的 `--task-granularity auto|coarse|standard|fine`。
- 在需要证据的位置加上验证命令和 `[VERIFY]` 门禁。
- 让任务足够小，便于 `spec-executor` 完成并验证。
- 只有文件所有权清晰时才标依赖和并行资格。

## 边界

`/curdx-flow:tasks` 在设计被批准后委派到这里。协调器要先验证 `tasks.md`，`/curdx-flow:implement` 才能启动。
