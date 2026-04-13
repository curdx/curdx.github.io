# cxb-ask

Send an async request to any AI provider.

## What It Does

`cxb-ask` is the transport skill behind nearly every cross-provider action in CurdX Bridge. Claude uses it to submit work to another pane, then returns control immediately instead of blocking the main conversation.

This is why the system feels like collaboration rather than a serialized chain of prompts.

## Syntax

```text
/cxb-ask <provider> "<message>"
```

Supported providers:

| Provider | Typical role |
|----------|--------------|
| `codex` | Review, implementation, deeper code analysis |
| `gemini` | Brainstorming, naming, design alternatives |
| `opencode` | Additional implementation perspective |
| `claude` | Cross-pane communication or explicit self-routing |

## How The Async Handoff Works

1. Claude submits the message to the target provider pane.
2. A successful submission returns an async acknowledgement such as `CURDX_ASYNC_SUBMITTED`.
3. Claude stops speaking instead of adding filler.
4. The provider works independently in its pane.
5. Claude later retrieves the reply through the pending-reply path.

The important behavior is not the command itself. It is the guardrail: submit, stop, wait, retrieve.

## Examples

### Ask Codex for a scored review

```text
/cxb-ask codex "Review this plan using the plan rubric. Return scores, top risks, and pass/fail."
```

### Ask Gemini for alternatives

```text
/cxb-ask gemini "Give me 4 API shapes for bulk export jobs. Emphasize simplicity and rollback safety."
```

### Ask OpenCode to challenge an implementation

```text
/cxb-ask opencode "Find the weakest assumptions in this caching refactor and suggest a safer path."
```

## Writing Better Requests

Good async requests usually include:

- the job: review, brainstorm, compare, implement, summarize
- the scope: file, feature, diff, plan, migration
- the rubric or constraints: security, tests, rollback, performance
- the expected output: bullets, scores, pass/fail, recommendation

Compare:

- Weak: "Take a look at this"
- Strong: "Review this diff for auth correctness, missing tests, and rollback risk. Return pass/fail plus fix items."

## Best Practices

- Use `cxb-ask` when a provider has a clear specialist job.
- Keep the message tight enough that the provider does not wander.
- Let Claude merge the results instead of manually stitching together raw provider replies.
- If the provider drifted, reissue a narrower request rather than asking more follow-up questions on a bad thread.
