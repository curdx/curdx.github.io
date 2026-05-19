# Getting Started

Your first run, in about five minutes. The goal isn't to learn every concept — it's to land in this state:

```text
install ─► /curdx-flow:start ─► review specs ─► /curdx-flow:implement ─► evidence in repo
```

<picture>
  <source media="(max-width: 700px)" srcset="/images/curdx-flow/curdx-flow-loop-mobile.en.svg" />
  <img class="curdx-flow-figure" src="/images/curdx-flow/curdx-flow-loop.en.svg" alt="CurdX Flow workflow loop" />
</picture>

## You'll know it worked when…

- `/curdx-flow:*` autocompletes inside Claude Code.
- A `specs/todo-app/` directory appears with `requirements.md`, `design.md`, `tasks.md`.
- `/curdx-flow:status` reports a current phase and a next command.
- Execution leaves test/build/browser evidence behind.

## 0 · Check the environment

```bash
claude --version    # Claude Code
node --version      # ≥ 20.12
```

If both print versions, you're good. Need a sandbox project?

```bash
npm create vite@latest curdx-flow-todo -- --template react-ts
cd curdx-flow-todo && npm install
```

## 1 · Install

```bash
npm exec -- @curdx/flow@latest install curdx-flow --yes
```

The installer wires up the plugin, its companion plugins, the marketplace entry, and a managed block in `~/.claude/CLAUDE.md`.

Verify:

```bash
npm exec -- @curdx/flow@latest status   # should not say "missing"
claude plugin list                       # should include curdx-flow
```

Stuck? Jump to [Troubleshooting → Commands do not appear](/curdx-flow/troubleshooting#commands-do-not-appear).

## 2 · Describe the goal

Open Claude Code in your project and run:

```text
/curdx-flow:start todo-app build a todo app with create/edit/complete/delete, browser-verified
```

Two parts: a **task name** (`todo-app` → directory name) and the **actual goal** (the prose after it). Flow routes the work: tiny edit → direct execution; real feature → spec files first.

> If `/curdx-flow:*` doesn't autocomplete, fully quit and reopen Claude Code. Plugin changes need a fresh session.

## 3 · Read what Flow wrote

You'll see something like:

```text
specs/todo-app/
├── research.md
├── requirements.md
├── design.md
└── tasks.md
```

For the first run, check just two files — fixing them now saves you an entire wrong implementation later:

| File | Look for |
| --- | --- |
| `requirements.md` | Does it actually include create / edit / complete / delete and the browser-verify step? |
| `tasks.md` | Are tasks small enough? Does each one have a verify command? |

## 4 · Execute

```text
/curdx-flow:implement
```

If your environment can't continue automatically, pass `--manual`:

```text
/curdx-flow:implement --manual
```

Peek progress anytime:

```text
/curdx-flow:status
```

## 5 · Decide if it's *actually* done

Don't trust the final sentence. Match the evidence to the project type:

| Project | Evidence that counts |
| --- | --- |
| Frontend page | Browser opens, DOM/screenshot/console/network checks pass |
| Node / CLI | `npm test`, `npm run build`, or real CLI output |
| Plugin / release | Plugin validation, tests pass, tag pushed, npm release confirmed |

Quick gate:

```bash
npm exec -- @curdx/flow@latest check
```

If `check` fails, treat the task as incomplete. Add evidence, re-run, check again.

## 6 · Share it like a pro

Don't say "AI built it." Share **goal + plan + proof**:

- the code diff
- `requirements.md` · `design.md` · `tasks.md`
- the verification output

That's what makes the work reviewable.

## Next

- [Commands](/curdx-flow/commands) — pick the right command for the situation.
- [How It Works](/curdx-flow/how-it-works) — the model behind `/start` routing and `verificationBlocks`.
- [Troubleshooting](/curdx-flow/troubleshooting) — when commands vanish or evidence fails.
