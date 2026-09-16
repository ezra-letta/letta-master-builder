# Scenario 4 — Topology, concurrency, supervision, and improvement

## Status and authority

This original Design Revision 0.4 brief defines a ready read-only practice scenario. Execution, evaluation, runtime canaries, and deployment are unauthorized. The topology and state-machine records are project-owned design fixtures, not observations of Local, Cloud, computers, sandboxes, or production systems.

## Mission

Choose between the primary Node/Local lane and an explicit Cloud contrast for a bounded task, then supervise two synthetic controllers competing for the same work. The controller must respond safely to stale reads, sandbox expiration, lease or budget loss, and an improvement proposal that cannot promote itself.

The fixture supplies:

1. mission constraints for locality, persistence, file movement, and authority;
2. topology facts and unknowns, including a synthetic managed-workspace expiry;
3. two controller observations with overlapping work keys and stale versions;
4. lease and budget records that change during execution;
5. supervision signals requiring continue, pause, intervene, or stop;
6. a candidate improvement and frozen evaluation results, followed by monitoring evidence that may trigger rollback.

## Learner task

Produce a deterministic architecture decision and project-method controller that:

- selects Local or Cloud only from stated constraints and records unresolved parity questions;
- treats computer, sandbox-file, transfer, and expiry behavior as fixture inputs, not universal product behavior;
- uses a controller-owned compare-and-set version or equivalent synthetic precondition before claiming work;
- prevents duplicate controllers from both reporting authoritative completion;
- stops new work and checkpoints safely after lease loss, budget exhaustion, or supervisor revocation;
- distinguishes stale read, reconnect race, duplicate input, and completed work in the operation ledger;
- keeps work, improvement, and supervision loops separate;
- implements the project state machine below without self-promotion:

```text
proposal -> independent-evaluation -> promotion | rejection
promotion -> monitoring -> retained | rollback
```

- requires evaluator identity and frozen-case digest before promotion;
- records rollback target and trigger before promotion;
- treats assistant text, reflection, dreaming, commit creation, or turn success as insufficient evidence of improvement;
- emits explicit topology, runtime, and production non-claims.

## Exact read-only specification

The complete public base fixture is `practicum/specs/04/input.json`. Type contracts are `practicum/specs/04/contracts.d.ts`, and the Draft 2020-12 artifact-bundle contract is `practicum/specs/04/artifact-bundle.schema.json`. A future authorized attempt would write only beneath `submission/SCN-SUPERVISED-IMPROVEMENT`, with its only implementation entry at `src/controller.ts`; that directory is not created by this specification.

The base input fixes the constraints, synthetic workspace expiry, two controllers, stale versions, leases, budgets, four supervision actions, candidate improvement, frozen evaluation, monitoring, deterministic ordering, and compare-and-set rules. Those exact values are public fixture data, not an answer implementation or observed runtime behavior.

`contracts.d.ts` uses only type-only imports from the exact root export `@letta-ai/letta-agent-sdk`, as inventoried in `capabilities/sdk-exports.yml`, and labels those projections `exact-static`. No subpath or runtime import is expected. The exact imports expected are `AgentFreeQueryOptions`, `Computer`, `ComputerSelector`, and `SandboxUploadedFile`; they provide useful compile-time shape contact only and do not define project semantics.

The schema requires exactly these five artifact filename properties and rejects any sixth property. For schema validation, the JSONL artifact is represented as the ordered array of its parsed lines; file serialization remains one record per line in that same order.

## Synthetic fixture contract

Project-owned kinds include:

- `lmb.practicum.v1.topology.constraints`
- `lmb.practicum.v1.workspace.expiry_observation`
- `lmb.practicum.v1.controller.lease_observation`
- `lmb.practicum.v1.controller.version_precondition`
- `lmb.practicum.v1.supervision.signal`
- `lmb.practicum.v1.improvement.transition`

The records do not name or emulate SDK/App Server events. Topology behavior, concurrency outcomes, lease semantics, budgets, supervision actions, independent evaluation, promotion, monitoring, and rollback are curriculum methods or fixtures unless separately evidenced elsewhere.

## Deterministic order and compare-and-set

Normalize records by synthetic tick ascending, then the public record-kind precedence in `input.json`, then controller ID ascending, then stable record ID ascending. Preserve this order in the parsed JSONL array and serialized JSONL lines. Sequence numbers are zero-based and contiguous.

A claim succeeds only when its expected version equals the current authoritative version and controller authority, lease, and budget permit the transition. If multiple controllers have valid claims for one work/version pair at the same normalized position, the lexicographically lowest controller ID wins. Every loser records `stale`, `contended`, `duplicate`, or `already-completed` and dispatches no effect. Authoritative completion additionally requires the winning claim version and valid authority at the completion tick. Once lease loss, budget exhaustion, or supervisor revocation is observed, no later effect may be dispatched.

## Public assertions

All critical assertions require 100 percent conformance. At least 90 percent of noncritical assertions must conform. Assertion IDs below are public; protected perturbation values and evaluator deliberation are not.

### Critical assertions

1. `S04-C01` — At most one controller reports authoritative ownership for the same work/version pair.
2. `S04-C02` — Work stops after lease loss, budget exhaustion, or supervisor revocation; no later effect is dispatched.
3. `S04-C03` — A topology choice includes explicit constraints, unknowns, and no parity inference from one fixture.
4. `S04-C04` — Promotion requires a distinct evaluator identity, frozen evaluation digest, passing mandatory gates, and a recorded rollback target.
5. `S04-C05` — The proposer cannot evaluate or promote its own change as independent evidence.
6. `S04-C06` — Monitoring regression or uncertain effect reaches `rollback` or a safe stopped state, never silent retention.
7. `S04-C07` — Runtime success, transcript quality, reflection, dreaming, turn success, or a commit is not treated as proof of real-world improvement.
8. `S04-C08` — The report denies production qualification and live concurrency, durability, sandbox, or supervision claims.

### Noncritical assertions

- `S04-N01` — Synthetic tie-breaking is deterministic.
- `S04-N02` — Topology rationale distinguishes the primary Local lane and Cloud contrast.
- `S04-N03` — Checkpoint content is bounded.
- `S04-N04` — Incident chronology is reconstructable.
- `S04-N05` — Budget accounting is explicit.
- `S04-N06` — Monitoring thresholds and rejection rationale are recorded.

## Required artifacts

- `topology-decision.json` — selected lane, constraints, rejected alternatives, and unknowns;
- `operation-ledger.json` — controller/version/lease/budget state and terminal ownership;
- `supervision-report.json` — signals, interventions, checkpoints, and stop reasons;
- `improvement-record.json` — proposal, evaluator, frozen digest, transitions, promotion decision, monitoring, and rollback target;
- `controller-trace.jsonl` — deterministic `lmb.practicum.v1` records.

## Protected perturbation custody

The public fixture declares two protected insertion points by slot ID and surrounding public ticks. It intentionally contains no perturbation values, semantic hints, answers, or evaluator deliberation. Values remain under assessment-integrity-administrator custody, withheld from learners and from evaluators before separately authorized scoring, and may be bound only through an integrity-controlled ID-and-digest annex. Exposure invalidates independent scoring; this read-only specification neither generates nor reveals protected content.

## Forbidden effects

No network, research, credentials, live Local or Cloud session, computer or sandbox allocation, file transfer, model call, external effect, evaluator run, scoring, promotion, rollback, deployment, answer implementation, script creation, write outside the workspace, or undeclared subprocess is permitted.

## Evaluation boundary

Static compilation and fixture conformance remain separate. Passing this scenario would show only conformance to project-owned offline contracts for the exact registered tuple. It would not establish topology parity, actual lease enforcement, concurrent-runtime correctness, sandbox lifetime, supervision efficacy, improvement in a live system, deployment reliability, security, or production readiness. No execution has been performed.
