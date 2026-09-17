# Failure Lesson: The Agent Exists but Verification or Persistence Failed

## Scenario

The SDK returns `agent-123`, establishing a canonical ID, but the immediate retrieval fails. The agent may exist despite that verification failure. A naive retry that discards the ID and calls `createAgent()` again can silently create a duplicate.

The same rule applies when the controller already records `agent-123` and retrieval later fails: temporary inability to verify the recorded agent is not evidence that it is safe to replace.

A second partial-success path remains possible: retrieval confirms the canonical object, but the controller's database write then fails.

## Why this matters

These are not simple all-or-nothing failures. External creation may have succeeded while verification is pending, or the external side effect may be verified while local bookkeeping fails. Treating either operation as a generic failure destroys recovery information and makes duplicate creation likely.

## Required response

1. Preserve every known canonical ID in the current result.
2. After creation or an already-recorded lookup cannot be retrieved, return typed `verification-pending` with `source`, `retryWithSameRequestKey: true`, and `prohibitBlindRecreation: true`.
3. Do not persist a newly returned ID as verified when its retrieval failed.
4. After verified creation but failed persistence, return `created-unrecorded`, not generic success or generic failure.
5. Retry with the same controller request key.
6. Search for the request tag before any later creation where no controller mapping is present.
7. Recover exactly one match; stop on multiple matches.
8. Never infer absence from a retrieval failure or blindly recreate a known canonical ID.
9. Do not claim that tags enforce uniqueness or that a crash-free transaction spans the backend and controller store.

## Fixture boundary

`fixtures/provisioning-partial-success.json` is an original project-method fixture. It covers simulated creation-retrieval, already-recorded-retrieval, and persistence failures. It is not captured API traffic and proves no live behavior.
