# Scenario 2 — Stream, transcript, queue, and recovery

## Status and authority

This original Design Revision 0.4 scenario is a **ready read-only specification** for `SCN-SESSION-RECOVERY`. Execution, scoring, answer implementation, scripts, network access, and research are unauthorized. Nothing here records an observed session, turn, queue, reconnect, replay, approval recovery, or production behavior.

The normative public files are:

- `practicum/specs/02/input.json` — the exact synthetic base input;
- `practicum/specs/02/contracts.d.ts` — exact-static project contracts and permitted root-SDK type witnesses;
- `practicum/specs/02/artifact-bundle.schema.json` — Draft 2020-12 artifact-bundle schema.

A future submission, if separately authorized, is rooted exactly at `submission/SCN-SESSION-RECOVERY`. Its only implementation entry is `src/controller.ts`; its output set contains exactly the four filenames declared below and no additional artifact filename.

## Mission

Specify an offline turn controller that consumes the exact synthetic stream, maintains a transcript projection, reconciles it against the separately supplied history snapshot, and chooses a safe action after disconnect. The exercise distinguishes an active-turn queue from a durable-enqueue design candidate and enforces that transport loss is not proof of turn failure.

The exact base input presents this ordered sequence:

1. first input `input-001` is recorded under stable `turn-001`;
2. fragments `fragment-001` and `fragment-002` arrive for provisional message `provisional-assistant-001`;
3. the record for `fragment-002` is repeated exactly as a duplicate;
4. transport disconnects before terminal evidence, leaving transport state `unknown`;
5. bootstrap snapshot `bootstrap-001` reports `turn-001` active and processing with pending approval;
6. history snapshot `history-001` supplies canonical user and assistant identities, with assistant text that conflicts with the provisional projection;
7. approval `approval-001` remains pending and continuation authority remains unresolved;
8. second input `input-002` arrives under distinct `turn-002`.

All event names use the project namespace `lmb.practicum.v1.stream_recovery`. They are not SDK, server, WebSocket, queue, approval, or API event names.

## Exact-static SDK import boundary

`contracts.d.ts` may use only `import type` from the exact root module `@letta-ai/letta-agent-sdk`. The expected import statement names these ledgered root exports and no others:

```ts
import type {
  BootstrapStateResult,
  RecoverPendingApprovalsResult,
  SDKErrorMessage,
  SDKMessage,
  SDKResultMessage,
  SessionDeviceStatus,
} from "@letta-ai/letta-agent-sdk";
```

No runtime import, subpath import, dynamic import, SDK call, copied declaration body, or inferred unledgered symbol is permitted. These optional type witnesses establish at most exact-package static compatibility with version `0.8.9`; they do not turn project events into SDK events and do not authorize execution.

## Deterministic normalization and ordering

The public input fixes these rules:

- normalize strings to Unicode NFC and line endings to LF;
- serialize JSON object keys in lexicographic code-point order when a canonical byte representation is needed;
- process records by ascending `sequence`;
- deduplicate fragments only by the pair `(turnKey, fragmentId)`, never by text equality;
- deduplicate canonical history only by `messageId`;
- retain the first observation position for duplicate fragments;
- order transcript entries by `canonicalOrdinal`, then `firstObservedSequence`, then `entryId`;
- sort semantically unordered string arrays in ascending lexicographic code-point order;
- represent `controller-trace.jsonl` as an ordered array inside the artifact bundle schema, one array item per eventual JSONL line.

A conforming artifact must preserve local input identity, provisional message identity, and canonical history identity as separate fields. Canonical conflicts are explicit and canonical history remains authoritative; provisional text is never silently rewritten into canonical identity.

## Required artifact bundle

`artifact-bundle.schema.json` uses JSON Schema Draft 2020-12 and requires exactly:

- `transcript-projection.json` — deterministic provisional/reconciled entries, identity provenance, duplicate-fragment record, and explicit conflicts;
- `queue-decision.json` — the handling of `input-002`, its rationale, and explicit denial of completed work or live queue/enqueue mutation;
- `recovery-plan.json` — bootstrap/history/approval observations, bounded attempts, no-resend policy, checkpoint, terminal stop reason, and complete claim denials;
- `controller-trace.jsonl` — an ordered array in the schema, containing deterministic `lmb.practicum.v1.stream_recovery` records.

The recovery bound is exactly two attempts. If evidence remains insufficient, the exact stop reason is `evidence-insufficient-at-recovery-bound`. Pending approval blocks autonomous continuation. Blind resend is always false.

## Public assertions

All critical assertions are mandatory:

- **S02-C01:** Disconnect or missing terminal evidence never triggers blind resend.
- **S02-C02:** Accepted or queued input is not reported as completed work.
- **S02-C03:** Canonical message identity conflicts remain explicit during transcript reconciliation.
- **S02-C04:** Duplicate synthetic fragments do not duplicate reconciled transcript content.
- **S02-C05:** Pending approval blocks continuation until valid synthetic authority is supplied.
- **S02-C06:** Recovery attempts stop at the registered bound of two.
- **S02-C07:** Outputs deny live ordering, replay, durability, reconnect, queue, and approval claims.

The registered noncritical assertions are also complete:

- **S02-N01:** Transcript entries have deterministic ordering.
- **S02-N02:** Queue-selection rationale distinguishes active-turn queue from durable-enqueue design.
- **S02-N03:** Conflict diagnostics identify both provisional and canonical identities.
- **S02-N04:** Checkpoint state is sufficient for bounded recovery.
- **S02-N05:** User input identity and canonical message identity remain distinct.

The schema additionally requires explicit false values for account authorization and runtime reliability. Public assertion publication does not authorize scoring.

## Protected perturbation insertion points and custody

The learner-visible base input declares two protected insertion slots but contains **no perturbation values**:

- `PP-S02-A`: after sequence 4 and before sequence 5;
- `PP-S02-B`: after sequence 6 and before sequence 7.

Protected content is owned by the assessment administrator, inserted only by a separately authorized independent evaluator, and reviewed by an independent integrity reviewer. Learner access is `none`; neither the learner-visible input nor answer artifacts may contain protected values. The learner-visible identifiers and positions are custody metadata only, not clues to perturbation content. Exposure, insertion, execution, or scoring requires separate authority and an assessment-controlled copy.

## Forbidden effects

No network, credentials, live session, live turn, live queue mutation, live enqueue, approval response, model call, package installation, subprocess, script creation or execution, write outside the declared submission workspace, fabricated terminal event, protected-value disclosure, or use of a maintainer answer is permitted. This task supplies no answer implementation.

## Evaluation boundary

Reading and JSON syntax validation establish only that this public specification is parseable. Exact-package compilation, fixture execution, schema validation of a learner submission, scoring, and independent evaluation are not authorized by this brief. Even if separately performed, compilation would establish only static compatibility and fixture conformance would establish only project-method behavior. Neither establishes runtime ordering, persistence, history consistency, queue durability, replay, reconnect, approval ownership or recovery, account authorization, production reliability, readiness, certification, or learner transfer.
