# Failure Lesson: The Agent Exists but the Controller Forgot

## Scenario

The SDK returns `agent-123`, and retrieval confirms that canonical object. The controller's database write then fails. A naive retry calls `createAgent()` again and silently creates a duplicate.

## Why this matters

This is not a simple all-or-nothing failure. The external side effect succeeded while local bookkeeping failed. Treating the whole operation as failed destroys information and makes duplicate creation likely.

## Required response

1. Preserve the returned canonical ID in the current result.
2. Return `created-unrecorded`, not generic success or generic failure.
3. Retry with the same controller request key.
4. Search for the request tag before any later creation.
5. Recover exactly one match; stop on multiple matches.
6. Do not claim that tags enforce uniqueness or that a crash-free transaction spans the backend and controller store.

## Fixture boundary

`fixtures/provisioning-partial-success.json` is an original project-method fixture. It is not captured API traffic and proves no live behavior.
