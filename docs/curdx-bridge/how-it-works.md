# How It Works

## Architecture Overview

CurdX Bridge uses tmux (or WezTerm) to create a split-pane terminal layout. Each AI provider runs in its own pane, and a lightweight daemon manages communication between them.

![CurdX Bridge layout](/images/curdx-bridge/layout.svg)

```
┌──────────────────────┬──────────────┐
│                      │    Codex     │
│       Claude         ├──────────────┤
│    (main pane)       │   Gemini     │
│                      ├──────────────┤
│                      │  OpenCode    │
└──────────────────────┴──────────────┘
```

- **Left pane** — Claude, your primary interface. You type here.
- **Right panes** — Codex, Gemini, OpenCode. You can watch them work in real time.

## Communication Model

When you say "let Codex review this", here's what happens:

1. Claude invokes the `/cxb-ask` skill with your request
2. The skill sends the message to Codex's pane via the async protocol
3. Codex processes the request — you can see it working in its pane
4. Claude polls for the response using `/cxb-reply`
5. The result appears in your conversation with Claude

Each provider runs independently. They don't share context directly — Claude acts as the coordinator, deciding what information to send and how to integrate responses.

## Role System

CurdX Bridge assigns each AI a role that defines its responsibilities:

| Role | Default Provider | Responsibilities |
|------|-----------------|------------------|
| **Designer** | Claude | Plans architecture, writes code, orchestrates other agents |
| **Reviewer** | Codex | Evaluates code and plans using scored rubrics (1-10 per dimension) |
| **Inspiration** | Gemini | Generates creative alternatives and brainstorming ideas (reference only) |
| **Collaborator** | OpenCode | Provides additional AI perspective on demand |

### Role Assignment

Roles are configured in your project's `CLAUDE.md` file:

```markdown
| Role | Provider | Description |
|------|----------|-------------|
| designer | claude | Primary planner and architect |
| inspiration | gemini | Creative brainstorming |
| reviewer | codex | Scored quality gate |
| executor | claude | Code implementation |
```

You can reassign roles by editing the Provider column. For example, you could make Gemini the reviewer instead of Codex.

## Review Framework

The review system uses two rubrics for quality gates:

### Rubric A — Plan Review

5 dimensions, each scored 1-10:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Clarity | 20% | Can another developer follow the plan without questions? |
| Completeness | 25% | Are all requirements, edge cases, and deliverables covered? |
| Feasibility | 25% | Are the steps achievable with the current codebase? |
| Risk Assessment | 15% | Are risks identified with concrete mitigations? |
| Requirement Alignment | 15% | Does every step trace back to stated requirements? |

### Rubric B — Code Review

6 dimensions, each scored 1-10:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Correctness | 25% | Does the code do what the plan specified? |
| Security | 15% | No injection, hardcoded secrets, or missing validation? |
| Maintainability | 20% | Clean code, good naming, follows project conventions? |
| Performance | 10% | No unnecessary complexity or blocking calls? |
| Test Coverage | 15% | Are changed paths covered by passing tests? |
| Plan Adherence | 15% | Does the implementation match the approved plan? |

### Pass/Fail Criteria

- **Pass**: Overall weighted score ≥ 7.0 AND no single dimension ≤ 3
- **Fail**: Fix the flagged issues and resubmit (max 3 rounds)
- **Escalation**: After 3 failed rounds, the results are presented to you for a decision

## Async Protocol

Provider communication uses an async request/response pattern:

1. **Request** — Claude sends a message via `cxb-ask` to a provider pane
2. **Processing** — The provider works in its own pane (visible to you)
3. **Response** — Claude retrieves the result via `cxb-reply`

This design means:
- Providers never block each other
- You can observe each provider's work in real time
- Claude stays responsive while waiting for responses
- Session context is preserved per-provider

## Session Management

Each CurdX session creates tmux panes for the selected providers. Sessions can be:

- **Created** — `curdx [providers...]` starts a new session
- **Resumed** — `curdx -r` restores the previous session with full context
- **Killed** — `curdx kill` terminates all panes, `curdx kill <provider> -f` force-kills a specific one

Session state is stored in `.curdx/` in your project directory.
