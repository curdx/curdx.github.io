# task-planner

把已批准设计转成可执行的价值切片任务。

| 字段 | 值 |
| --- | --- |
| 模型 | `sonnet` |
| Effort | `high` |
| 成功 | `TASKS_READY` |
| 失败 | `TASKS_BLOCKED` |
| 主要产物 | `tasks.md` |

## 职责

- 把工作拆成有顺序、文件范围明确的任务。
- 使用传入的 `--task-granularity auto|coarse|standard|fine`。
- 在需要证据的位置加入验证命令和 `[VERIFY]` 门禁。
- 让任务足够小，便于 `spec-executor` 完成并验证。
- 只有文件所有权清晰时才标注依赖和并行资格。

## 协调用法

`/curdx-flow:tasks` 会在设计批准后委派给该 agent。协调器会验证 `tasks.md`，然后 `/curdx-flow:implement` 才能启动。
