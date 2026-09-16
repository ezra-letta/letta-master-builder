# Agent Operating Contract

## Current state

This repository is Letta Master Builder Revision 0.4, an unpublished curriculum release candidate. Fourteen mandatory modules and public offline practice/assessment contracts are available. The only bare-reader terminal report is `ASSESSMENT_REQUIRED`; reading awards no readiness, runtime, certification, or production status.

## Bare-reader authority

A repository pointer grants deterministic read-only traversal through `curriculum.yml` → `reader_sequence` and nothing else. Do not recursively discover or index files, inspect the host, install packages, execute code/tests/examples/evaluators/canaries, use credentials, call APIs/models, create or mutate agents, deploy, publish, or write progress state.

Machine-readable contracts outrank prose for stage, inventory, order, evidence identity, and terminal state. Stop on missing, contradictory, repeated, unsafe, or undeclared targets. Reading does not authorize integrity verification.

## Maintainer authority

Maintainer implementation, static checks, assessment, independent evaluation, runtime canaries, and production qualification are separate scopes. Each requires explicit authorization. Never infer live authority from a prior read-only or static implementation request. Runtime work additionally requires a target, exact versions, topology, credentials boundary, effects, budget, cleanup, stop conditions, and renewed approval after material drift.

## Claim discipline

Preserve these axes independently:

1. official documentation snapshot;
2. exact SDK artifact;
3. SDK-declared runtime artifact;
4. standalone runtime artifact;
5. hosted or selected runtime observation;
6. project fixture or simulation;
7. learner/evaluator result;
8. production qualification.

Never promote one axis into another. Product claims require registered evidence and exact version/backend/topology limits. Project methods must be labeled as project-owned. Unknown behavior remains unknown. Open discrepancies narrow or block claims rather than being averaged away.

## Safety and source use

Follow `SOURCE_USE_POLICY.md` before writing claim-bearing prose or examples. Do not copy substantial upstream docs, declarations, examples, tests, or source. Do not expose secrets in output, fixtures, reports, diffs, or logs. Stop on unexpected scope, ambiguity, credential exposure, unsafe dependency behavior, or conflicting governing records.

Do not create commits, push, publish, deploy, or run live Letta actions unless the user explicitly asks for that specific action.
