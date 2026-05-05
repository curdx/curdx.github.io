# task-planner

任务阶段负责人。把已通过的设计拆成有序、可勾选的任务列表，工作单元之间穿插 `[VERIFY]` 验证门禁。

## 它做什么

`task-planner` 在 `design.md` 通过审批后、运行 `/curdx-flow:tasks` 时被调用。它产出 `tasks.md`——`spec-executor` 自治执行的契约，按任务推进直到全部勾完。

它支持两种粒度模式（通过 `--tasks-size` 参数）：`fine`（默认，提交大小的小任务）和 `coarse`（更大块、写得快但更难验证）。

## 触发时机

| 触发 | 行为 |
| --- | --- |
| `/curdx-flow:tasks` | 由 `design.md` 生成 `tasks.md` |
| `/curdx-flow:tasks --tasks-size coarse` | 生成更少、更大的任务，用于快速原型 |

## 产物：`tasks.md`

典型 `tasks.md` 按阶段分组，验证门禁穿插其中：

```markdown
## 阶段 1：Schema 与存储

- [ ] 1.1 增加 OAuth provider 配置 schema
- [ ] 1.2 [VERIFY] schema 通过 typecheck，能校验样例输入
- [ ] 1.3 实现带轮换锁的 token 存储
- [ ] 1.4 [VERIFY] 存储单元测试通过

## 阶段 2：Token 交换

- [ ] 2.1 实现授权码交换处理器
- [ ] 2.2 实现 refresh token 轮换处理器
- [ ] 2.3 [VERIFY] 认证集成测试通过

## 阶段 3：中间件

- [ ] 3.1 把 OAuth 接入现有认证中间件链
- [ ] 3.2 [VERIFY] 端到端 smoke 测试通过
- [ ] 3.3 [VERIFY] typecheck 与 lint 全仓库无错
```

每个任务包含：

- 唯一编号（`1.1`、`1.2`、`2.1` …）
- 简短的动作型描述
- 对应 `design.md` 章节的引用（隐式但可推导）
- 受限的文件列表（执行器不会改外面的文件）

## 为什么需要 `[VERIFY]` 任务

`[VERIFY]` 任务不是实现工作，而是执行器必须运行的验证命令。命令失败则任务失败，循环的重试预算开始计数。

这种分离很重要：

- 实现任务描述要写什么。
- `[VERIFY]` 任务描述如何知道写对了。

没有验证门禁的规约是愿望清单，有的是可测试规约。

## 粒度：`fine` vs `coarse`

### Fine（默认）

```markdown
- [ ] 1.1 增加 OAuth provider 配置 schema
- [ ] 1.2 [VERIFY] schema 通过 typecheck
- [ ] 1.3 实现 token 交换处理器
- [ ] 1.4 [VERIFY] 单元测试通过
- [ ] 1.5 实现 refresh 处理器
- [ ] 1.6 [VERIFY] 刷新集成测试通过
```

适合生产代码：每个任务可独立提交，diff 可审。

### Coarse

```markdown
- [ ] 1 实现 OAuth provider 骨架（配置 schema + token 交换 + 刷新）
- [ ] 2 [VERIFY] 骨架可启动并接受样例请求
```

适合 spike 和原型，提交粒度本就不重要。

| 模式 | 平均任务数 | 平均提交数 | 适用 |
| --- | --- | --- | --- |
| `fine` | 8–20 | 1 任务 1 提交 | 生产代码 |
| `coarse` | 3–6 | 1 任务 1 提交 | spike、原型 |

## 阅读产物

审 `tasks.md` 时：

- **每个实现任务后应有验证任务**。后面没有门禁的任务无法自证。
- **任务排序应最小化中间损坏状态**。任务 1.3 依赖 1.1，应当按这个顺序排，期间穿插验证。
- **阶段边界要有意义**。阶段切分是想检查 diff 时停下的天然位置。
- **总数要合理**。30 个任务的规约通常是两个规约伪装的——考虑 `/curdx-flow:triage`。

## 实战示例

### 全新功能，fine 模式

```text
/curdx-flow:tasks
```

预期 10–20 个任务、3–5 个阶段，每 1–2 个实现任务带 1 个验证。

### 重构，fine 模式

```text
/curdx-flow:tasks
```

验证比例会更高——重构必须每步都证明行为不变。

### Spike，coarse 模式

```text
/curdx-flow:tasks --tasks-size coarse
```

预期 3–5 个任务，最后 1–2 个验证。

## 最佳实践

- 在 `/curdx-flow:implement` 之前认真读 `tasks.md`。循环开始后改错任务等于取消并 refactor。
- 看到没有验证的实现工作就 push back，让 planner 加 `[VERIFY]` 门禁。
- `coarse` 仅用于你接受回滚也很粗的场景。一个坏的粗任务就是回滚一大坨 diff。
- 长规约考虑拆小，而不是产出 30 个任务的 `tasks.md`。
- 验证命令必须是项目能真正跑起来的。`npm test` 没问题；执行器跑不了的命令会让循环停下。
