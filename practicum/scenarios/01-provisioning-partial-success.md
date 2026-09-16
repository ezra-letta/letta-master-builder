# Scenario 1 — Provisioning with partial success

## Status and authority

This is a ready read-only Design Revision 0.4 practice specification. Learner execution, evaluator execution, and scoring are unauthorized. It contains no answer implementation, scripts, runtime evidence, network research, or verified product-behavior claim. It is not the verified maintainer vertical slice and must not reuse that fixture as an answer.

## Mission

Design, but do not execute, a deterministic TypeScript controller that converges on one intended agent and one intended conversation while processing synthetic skill and repository outcomes that succeed only partly. The controller must retain canonical identities, distinguish completed effects from failed bookkeeping, reconcile before retry, and produce a bounded cleanup plan.

The exact public base fixture is `practicum/specs/01/input.json`. It starts with an empty controller mapping and contains exactly seven bounded, ordered records:

1. an agent provisioning observation with a canonical project ID;
2. a conversation provisioning observation with a canonical project ID;
3. a skill manifest accepted;
4. one skill support file rejected;
5. a repository attachment recorded before synthetic recompilation failure;
6. an agent mapping write failure after canonical identity is known;
7. a conversation mapping write failure after canonical identity is known.

All fixture vocabulary uses the project-owned `lmb.practicum.v1.provisioning` namespace. It is not an SDK event stream, App Server protocol, captured traffic, or declaration of an upstream API name.

## Read-only specification files

- `practicum/specs/01/input.json` — exact synthetic base input, limits, intended objects, and normalization rules.
- `practicum/specs/01/contracts.d.ts` — TypeScript interfaces for input and complete artifacts.
- `practicum/specs/01/artifact-bundle.schema.json` — Draft 2020-12 schema for the complete submitted artifact bundle.

These files specify an exercise only. They do not authorize compiling, running, scoring, installing dependencies, making network calls, or producing an answer implementation.

## Exact imports expected

A future separately authorized submission may use these exact type-only root imports and no other SDK imports:

```ts
import type {
  AgentRepositoriesClient,
  AgentSkill,
  AgentsClient,
  ConversationsClient,
  CreateAgentOptions,
  SkillItem,
  SkillSource,
} from "@letta-ai/letta-agent-sdk";
```

Every listed symbol has `entrypoint: .` in `capabilities/sdk-exports.yml`. These imports are labeled **exact-package static** and constrain package-derived public shapes only. They are never runtime evidence. Runtime imports, imports from `@letta-ai/letta-agent-sdk/client`, deep imports, and imports from any other package are outside this specification.

## Learner contract

When execution is separately authorized in the future, a submission must:

- consume the supplied fixture without mutating it;
- use a stable operation key for each intended object or attachment;
- persist or report canonical agent and conversation identities independently;
- record skill and repository sub-effects separately instead of flattening them into one success boolean;
- search supplied synthetic authoritative state before any retry that could duplicate an object or attachment;
- stop on zero-to-many ambiguity where the contract requires exactly one match;
- record cleanup candidates without deleting an object whose ownership is uncertain;
- keep controller state, package-shaped values, and project-method state visibly distinct;
- emit only the required artifacts without secrets, network access, or writes outside the submission directory.

If an attempt is separately authorized, its only implementation entry is `submission/SCN-PROVISIONING/src/controller.ts`. The release supplies no answer implementation or executable runner.

## Submission directory contract

The exact submission root is:

```text
submission/SCN-PROVISIONING/
```

In addition to `src/controller.ts`, its output artifact set contains exactly these four filenames and no other artifact files:

```text
submission/SCN-PROVISIONING/provisioning-result.json
submission/SCN-PROVISIONING/reconciliation-report.json
submission/SCN-PROVISIONING/cleanup-plan.json
submission/SCN-PROVISIONING/controller-trace.jsonl
```

For schema validation, the four files are represented as one object whose required top-level properties are those exact filenames. The value of each `.json` property is that file's parsed full content. The value of `controller-trace.jsonl` is the ordered array obtained by parsing each nonempty JSONL line; array position is line order. The schema validates complete content and rejects additional top-level artifact names.

## Deterministic ordering and normalization

A conforming future submission must apply these rules before serialization:

1. Input records are consumed by ascending `sequence`; source array order breaks no ties because duplicate sequence values are invalid fixture mutations.
2. Artifact entries carrying `order` or `sequence` are emitted in strictly ascending numeric order.
3. Candidate identifiers, tags, operation keys, paths, preconditions, stop conditions, assertion evidence, and other set-like arrays are deduplicated and sorted by Unicode code-point order.
4. Object keys are serialized in Unicode code-point order at every depth.
5. JSON uses UTF-8, two-space indentation, LF line endings, and one trailing LF. JSONL uses one compact JSON object per line, LF line endings, and one trailing LF.
6. No current time, random value, environment-derived path, platform-specific separator, secret, or network-derived value may enter an artifact.
7. Fixed fixture strings and identifiers are preserved byte-for-byte; absent values use explicit `null` only where the contract permits it.
8. Repeated normalization and serialization of the same supplied input must be byte-identical.

## Public assertions

All critical assertions are mandatory. The complete public assertion set is:

### Critical

- **S01-C01:** The controller never blindly creates, attaches, uploads, or deletes after an uncertain or partial outcome.
- **S01-C02:** Supplied canonical agent and conversation identities survive later controller-store failure.
- **S01-C03:** Skill-component and repository-attachment sub-effects retain separate partial-success states.
- **S01-C04:** Multiple authoritative matches halt for operator disposition.
- **S01-C05:** Cleanup is bounded by recorded ownership and preconditions.
- **S01-C06:** Outputs label synthetic behavior and make no live-runtime claim.

### Noncritical

- **S01-N01:** Stable operation keys are human-auditable.
- **S01-N02:** Report entries use deterministic ordering.
- **S01-N03:** Diagnostics identify the failed sub-effect without erasing completed effects.
- **S01-N04:** Retry prerequisites are explicit.
- **S01-N05:** The ownership table distinguishes controller and synthetic authoritative state.

Each artifact carries assertion results in the exact public order above. The read-only schema requires complete positive evidence fields; only a separately authorized evaluator may determine scoring consequences.

## Protected evaluator perturbations

The public base fixture contains no protected values. A separately authorized evaluator may create a private in-memory derivative only at these insertion points:

- immediately before the first provisioning observation;
- immediately after either canonical identity observation and before its related controller-store outcome;
- adjacent to an authoritative-match array used for agent, conversation, skill-component, or repository-attachment reconciliation;
- between repository attachment recording and recompilation outcome interpretation;
- immediately before artifact normalization.

Protected perturbations may vary bounded match cardinality, ordering, duplicate presentation, one failed sub-effect, one mapping outcome, or ownership certainty, but must preserve the public namespace, record limit, schema-valid types, forbidden-effects boundary, and deterministic normalization contract. No protected value, expected private output, secret seed, private digest, or scoring oracle may be committed to these specification files or disclosed to the subject.

Custody remains with an identified evaluator who is independent from the subject attempt and separately authorized. The evaluator records only opaque perturbation IDs and an attested outcome in protected assessment records; the subject receives neither values nor oracle logic. Any private derivative is created inside a disposable offline evaluator workspace, is never written into `practicum/specs/01/input.json`, and is destroyed or retained under evaluator policy after assessment. This section reserves insertion points and custody only; it does not authorize an evaluator run.

## Required artifact semantics

- `provisioning-result.json` — canonical identities, per-effect terminal or uncertain state, failed controller mappings, provenance, diagnostics, and public assertion evidence.
- `reconciliation-report.json` — matches considered, match cardinality, ambiguity decisions, retry prerequisites, ownership table, allowed next action, stop reason, and public assertion evidence.
- `cleanup-plan.json` — at most four bounded candidates with ownership certainty, preconditions, stop conditions, rationale, and public assertion evidence.
- `controller-trace.jsonl` — at most 32 deterministic project-namespace trace entries represented as an ordered array for bundle-schema validation.

## Forbidden effects

Network requests, credential reads, live agent or conversation mutation, live skill or repository operations, writes outside `submission/SCN-PROVISIONING/`, undeclared subprocesses, dependency installation, evaluator execution, scoring, and use of the verified vertical-slice fixture as a scored answer are forbidden. The read-only specification itself authorizes no command beyond local JSON syntax validation by its maintainer.

## Evaluation boundary

Future exact-package compilation and project-fixture conformance, if separately authorized, are separate outcomes. Neither could establish backend acceptance, uniqueness enforcement, support-file behavior, repository attachment semantics, cleanup behavior, authorization, durability, production readiness, or learner transfer. No execution or scoring has been authorized or performed.
