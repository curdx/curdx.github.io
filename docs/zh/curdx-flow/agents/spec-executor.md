# spec-executor

执行阶段负责人——也是工作流中**唯一的自治子 Agent**。运行执行循环：从 `tasks.md` 取未勾选任务、在新上下文中实现、验证、提交、推进，直到全部勾完。

## 它做什么

`spec-executor` 在 `tasks.md` 通过审批后、运行 `/curdx-flow:implement` 时被调用。和其它阶段负责人不同，它不会写完一份产物就退出，而是循环跑到下面任一情况：

- `tasks.md` 中所有任务都已勾选（`ALL_TASKS_COMPLETE`）；或
- 验证门禁失败超出单任务重试预算（循环停下并暴露失败）。

这就是宣传语里所说的"走开、回来、读 diff"。

## 触发时机

| 触发 | 行为 |
| --- | --- |
| `/curdx-flow:implement` | 启动（或恢复）自治循环 |
| `/curdx-flow:cancel` | 停止当前循环并清理状态 |

## 执行循环

```text
当还有未勾选任务时：
    从 tasks.md 取下一个未勾选任务
    打开新上下文
    注入：任务描述、design.md 摘要、相关文件
    若是 [VERIFY] 任务：
        运行验证命令
        通过 → 标记 [x]、提交进度、推进
        失败 → 重试计数 +1；预算耗尽则停下
    否则：
        实现任务
        标记 [x]
        提交（默认每任务一个 commit）
        推进
循环结束
输出 ALL_TASKS_COMPLETE
```

三个特性让循环值得托付：

1. **任务级新鲜上下文**：长会话和限流恢复不会污染后续任务。执行器只看到当前任务需要的内容。
2. **先验证再推进**：`[VERIFY]` 失败立即暴露，不会盖在前一个任务上面。
3. **持续失败必停**：重试预算耗尽则停下，由人工修底层问题再恢复。flow 不会悄悄把真实失败盖过去。

## 产物：代码、测试、提交

和其它阶段负责人不同，执行器的产物是你的代码库。默认行为：

- 每个任务一个 commit（可通过 `--commit-spec` / `--no-commit-spec` 配置）
- commit message 含任务编号和描述
- `tasks.md` 中已完成任务被标记为 `[x]`
- `.curdx-state.json` 记录当前任务索引和重试计数

## 重试预算与停下行为

执行器有两个预算，存在 `.curdx-state.json` 中：

| 计数 | 默认 | 用途 |
| --- | --- | --- |
| `maxTaskIterations` | 5 | `[VERIFY]` 失败时单任务重试预算 |
| `maxGlobalIterations` | 100 | 整份规约的硬上限 |

任务失败时：

1. 执行器分析失败（验证 stderr、命令输出）。
2. 在同一上下文里尝试修复。
3. 重新运行验证。
4. 重复至多 `maxTaskIterations` 次。
5. 仍失败则标记循环停下，把失败暴露给人工。

停下的正确反应几乎从来不是"调高预算"，而是"修底层问题或修订规约"。

## 停下后恢复

```text
# 1. 看哪里停下
/curdx-flow:status

# 2. 读失败任务，手动复现
cat specs/<spec>/tasks.md
# 在 shell 里跑验证命令

# 3a. 如果是实现 Bug，修了再恢复：
/curdx-flow:implement

# 3b. 如果是规约问题，先 refactor：
/curdx-flow:refactor
/curdx-flow:implement
```

## 执行器不做的事

- 不会修改设计清单之外的文件。清单错了就修订规约。
- 不会跳过 `[VERIFY]` 门禁。失败的门禁就是失败的任务。
- 不会发明新任务。只执行 `tasks.md` 里的内容。
- 不会运行交互式命令。验证命令必须非交互式。

这种窄范围是特性，正是它让循环可被信任、可以离开。

## 实战示例

### 正常完成

```text
你：    /curdx-flow:implement
flow：  ⟳ 任务 1.1 → 验证 → 提交 ✓
        ⟳ 任务 1.2 → 验证 → 提交 ✓
        ⟳ 任务 1.3 → 验证 → 提交 ✓
        ...
        ✓ ALL_TASKS_COMPLETE（12/12 任务，47 个提交）
你：    git log --oneline | head
```

### 失败停下

```text
你：    /curdx-flow:implement
flow：  ⟳ 任务 1.1 → 验证 → 提交 ✓
        ⟳ 任务 1.2 → 验证 失败（重试 1/5）
        ⟳ 任务 1.2 → 验证 失败（重试 2/5）
        ⟳ 任务 1.2 → 验证 失败（重试 5/5）
        ✗ 停下 —— 任务 1.2 验证超出重试预算
        最后一次错误：TypeError: cannot read property 'sub' of undefined at oauth-provider.ts:42
你：    [读 tasks.md，修问题或 refactor]
        /curdx-flow:implement   # 从任务 1.2 恢复
```

### 长时间间隔后恢复

```text
你：    /curdx-flow:status
flow：  规约：oauth-login（8/12 任务完成）
        最后任务：2.4 [VERIFY] 集成测试通过
你：    /curdx-flow:implement
flow：  ⟳ 任务 3.1 → 验证 → 提交 ✓
        ...
```

## 阅读产物

循环跑完后：

- **先读 `git log`**。每任务一个 commit，告诉你交付了什么。
- **按阶段读 diff，而不是按任务**。阶段边界通常是审阅的合适粒度。
- **用你自己的方式验证**。执行器跑了规约里定义的验证命令，但合并前请把项目完整测试套件再过一遍。

## 最佳实践

- 认真审 `tasks.md`。执行器对它做承诺，任务错了就只能取消并 refactor。
- 不要在 CI 里跑 `/curdx-flow:implement`。它要交互式 Claude Code 会话。
- 验证命令保持快。循环会反复跑它，慢的验证会成倍放大等待。
- 把停下当信号。循环故意会在无法安全推进时停下——先排查再恢复。
- 默认开 `--commit-spec`，让规约产物随代码一起提交。评审者两边都该能读到。
