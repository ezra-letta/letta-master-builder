# Letta Master Builder

Letta Master Builder is an independent, unofficial, read-only Ezra/Fimeg curriculum project. Its intended graduate can design, implement, and supervise bounded persistent autonomous agents on a release-pinned Letta Agent SDK path. It is not official Letta documentation, endorsement, certification, production accreditation, runnable Agent Foundry software, or a general application-development course.

## Revision 0.4 status

This repository is an unpublished **release candidate**. All fourteen mandatory modules, four read-only practicum briefs, a public assessment rubric, evaluator-report contract, misconception registry, dossier template, traceability registry, and local validation infrastructure are present. A bare reader must stop at:

`ASSESSMENT_REQUIRED`

That state means the curriculum path is available but no learner assessment or independent evaluator run has occurred. Reading does not award Master Builder readiness, runtime validation, certification, production qualification, or permission to execute anything. Publication remains blocked by the dependency review recorded in `release/dependency-review.yml`.

## Read-only entry

A bare repository URL authorizes only deterministic reading through `curriculum.yml` → `reader_sequence`. It does not authorize recursive ingestion, environment inspection, dependency installation, commands, tests, examples, evaluators, credentials, accounts, API/model calls, agent creation, canaries, deployment, publication, or mutation.

Begin at [START_HERE.md](START_HERE.md). Machine-readable manifests outrank prose for stage, file inventory, order, evidence identity, and terminal state. Stop and report a conflict rather than guessing.

## Exact implementation evidence

The Revision 0.4 cutoff is 2026-09-16:

| Evidence lane | Exact value | What it establishes |
|---|---:|---|
| Agent SDK artifact | `@letta-ai/letta-agent-sdk@0.8.9` | Package identity, declarations, and compile dependency |
| SDK-declared runtime | `@letta-ai/letta-code@0.32.11` | The runtime dependency declared by that SDK artifact |
| Standalone runtime | `@letta-ai/letta-code@0.32.11` | Separately interpreted standalone package lane |
| TypeScript compile toolchain | `5.9.3` | Exact compiler used by the vertical slice |
| Hosted runtime | `unknown-not-tested` | No hosted version or behavior was observed |

Static package/source/docs evidence, compile success, runtime observation, assessment, and production qualification are separate axes. The compile-only dependency closure currently reports upstream high-severity `sharp`/libvips advisories, so publication remains blocked pending upstream remediation or an accountable review decision.

## Scope and architecture

The mandatory lane is **Agent SDK + Node**, with Local as the primary implementation topology and Cloud as a contrast lane. Direct App Server, Remote Client, REST, ACP, Channels, schedules, computers/sandboxes, mods, and portable clients are selection-literacy surfaces unless promoted by a later reviewed release.

The learned pipeline is:

`specification → creation/configuration → persistent memory/MemFS → skills/tools → bounded work loop → observation → improvement proposal → independent evaluation → promotion/rollback → supervision`

Agent Foundry remains conceptual application-owned vocabulary only.

## Curriculum and maintainer vertical slice

The mandatory prose is in `modules/MOD-00.md` through `modules/MOD-13.md`. The offline practice briefs are under `practicum/scenarios/`; public assessment governance is under `assessments/`; dossier and traceability contracts are under `dossier/` and `traceability/`. They are designed for later separately authorized work and evaluation, not automatic execution from the repository pointer.

`vertical-slice/` contains original compile-checked TypeScript for reconciled agent provisioning, an API card, a labeled project fixture, and a partial-success lesson. Installing or running its checks requires separate maintainer authorization. No Letta API, model, agent, channel, schedule, deployment, or runtime canary is invoked by the static check.

See `SOURCE_USE_POLICY.md`, `DESIGN_SPEC.md`, `SECURITY.md`, and `sources/UPDATE_POLICY.md` for source, claim, and safety boundaries.
