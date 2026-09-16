# Letta Master Builder — Revision 0.4 Design Specification

## 1. Purpose

Letta Master Builder is a one-pointer, read-only curriculum intended to teach a capable coding agent with no prior Letta knowledge how to design, implement, and supervise bounded autonomous persistent agents. The repository owns the learning method, architecture vocabulary, release discipline, and project examples. Official Letta sources and immutable released artifacts own changing product facts.

Revision 0.4 is an unpublished **curriculum release candidate**. It contains all fourteen mandatory chapters, original read-only practicum briefs, public assessment governance, dossier and traceability contracts, and validation infrastructure. It awards no learner status and remains publication-blocked by the recorded dependency review.

### Graduate claim

A successful independently evaluated learner is expected to move a bounded agent through:

`specification → creation/configuration → persistent memory/MemFS → skills/tools → bounded work loop → observation → improvement proposal → independent evaluation → promotion/rollback → supervision`

The repository now supplies the prose and machine-governed assessment design, but the claim still requires a separately authorized learner attempt, machine gates, independent evaluation, transfer assessment, integrity attestation, and any separately declared runtime evidence. No learner has earned it merely because Revision 0.4 content exists.

### Non-goals

- a generic app-building course;
- a live Agent Foundry service;
- an exhaustive copy of Letta documentation or source;
- automatic execution from a repository URL;
- runtime, security, compliance, or production certification;
- invisible model, provider, plan, hosted-runtime, or account assumptions.

Agent Foundry is conceptual application-owned vocabulary for discussing a controller that creates and supervises bounded agents. It is not a Letta product API and no endpoint, database, service, or deployment is implemented here.

## 2. Authority and status model

Normal reading follows only `curriculum.yml` → `reader_sequence`. `control_files` is an audit and lock inventory. A bare pointer authorizes no command, package install, environment inspection, credential use, API/model call, agent mutation, evaluator, canary, publication, or deployment.

Revision 0.4 tracks independent status axes:

- **content** — unavailable, authoring, complete;
- **learning** — not started, in progress, passed, failed;
- **architecture** — not assessed, passed, failed;
- **implementation** — not assessed, passed, failed;
- **transfer** — not assessed, passed, failed;
- **assessment integrity** — unverified, verified, invalid;
- **runtime** — not tested, partially observed, observed;
- **production** — not qualified, qualified, rejected.

No axis silently promotes another. Publication is not runtime validation. Runtime validation is not production qualification. Machine compilation is not learner competence. Assessment permission is not evaluator or canary permission.

## 3. Evidence model

### 3.1 Exact release lanes

The 2026-09-16 Revision 0.4 cutoff uses:

- Agent SDK `@letta-ai/letta-agent-sdk@0.8.9`, integrity and source commit recorded in `compatibility/versions.yml`;
- SDK-declared Letta Code `0.32.11`;
- standalone Letta Code `0.32.11`, interpreted as a separate lane even when artifact identity matches;
- TypeScript `5.9.3` and Node `>=22.19.0` for the compile slice;
- hosted runtime `unknown-not-tested`.

“Latest” always means latest exactly verified at a named cutoff. It never means timelessly current.

### 3.2 Claim ladder

Every claim-bearing artifact distinguishes:

1. `documented-current` — dated official page evidence;
2. `sdk-package-exact` — immutable npm artifact and declarations;
3. `sdk-declared-runtime-exact` — exact dependency declared by the SDK;
4. `standalone-runtime-exact` — exact separately installed package;
5. `live-canary-observed` — separately authorized scoped observation;
6. `project-method` — original controller policy, fixture, or heuristic;
7. `unknown-not-tested` — no qualifying evidence.

Discrepancies are first-class. An unresolved conflict produces a safe subset, awareness-only treatment, or a blocked runtime claim. It is not silently resolved by choosing convenient prose.

### 3.3 Source rules

`SOURCE_USE_POLICY.md` permits original code, independently restated facts, minimal attributed quotation, and a mechanical names-only export inventory. It forbids substantial copying or vendoring without a separate license decision. Project MIT licensing never absorbs upstream Apache-2.0 code, documentation, assets, or notices.

## 4. Capability architecture

### 4.1 Core taxonomy

`capabilities/core.yml` contains exactly 26 versioned capability classes spanning evidence, persistent objects, sessions/turns, recovery, models, memory, skills, repositories, tools, MCP, permissions, effect reconciliation, execution topology, portable clients, queries, triggers, multi-agent orchestration, Channels, alternative surfaces, supervision, security, and concurrency.

Each class records depth, product-versus-project classification, owner module, evidence, discrepancies, export symbols, practicum fixtures, and explicit non-claims. Revision 0.4 teaches every mandatory class at its declared depth while promoting only reconciled agent provisioning into executable compile-checked example code.

### 4.2 Adjacent ecosystem

`capabilities/adjacent.yml` contains exactly 18 decision domains. `core` means required competence; `awareness` means selection literacy; later releases may add `planned-elective`, `out-of-scope`, or `review-pending`. Awareness records never imply implementation or operational support.

### 4.3 Dual-entry SDK ledger

`capabilities/sdk-exports.yml` is generated from both package entry points `.` and `./client`. Every public exported symbol receives a deterministic ID, declaration kind, class/interface members where applicable, runtime-value flag, disposition, and capability mapping. Mechanical presence does not make a symbol curriculum-bearing. Review-pending rows remain non-claims.

## 5. Fourteen-module mandatory graph

1. **MOD-00 Contract, Evidence, and Release Discipline** — claims, exact releases, sources, discrepancies, licensing, status axes.
2. **MOD-01 Mission, Autonomy, and Acceptance** — bounded goals, users, outcomes, stop conditions, failure budgets.
3. **MOD-02 Objects, Ownership, and Locality** — agent, conversation, session, turn, controller state, runtime/device, files, memory.
4. **MOD-03 Capability, Topology, and Model Selection** — Agent SDK lane, Local/Cloud contrast, alternative surfaces, provider/model reasoning.
5. **MOD-04 Agent Provisioning and Management** — creation, canonical IDs, safe options, retrieval, reconciliation, updates, deletion policy.
6. **MOD-05 Conversations, Sessions, Turns, and Recovery** — readiness, streaming, completion, abort, queues, disconnects, approval recovery.
7. **MOD-06 Memory, Context, Skills, and Shared Knowledge** — MemFS, context placement, compaction, skills, repositories, conflicts.
8. **MOD-07 Tools, MCP, Permissions, and Effects** — execution locality, approvals, idempotency, uncertain effects, compensation.
9. **MOD-08 Bounded Work Loops and Triggers** — controller-owned leases, budgets, schedules, channels, enqueue, checkpoints.
10. **MOD-09 Multi-Agent Orchestration** — subagents, forks, persistent agents, messaging, parent/child authority and attribution.
11. **MOD-10 Improvement, Evaluation, Promotion, and Rollback** — proposals, frozen tests, contamination control, canary promotion.
12. **MOD-11 Supervision, Security, and Observability** — audit trails, incidents, tenancy, credentials, privacy, human override.
13. **MOD-12 Deployment, Reliability, and Upgrades** — topology selection, health, recovery, backups, drift rehearsal, migration.
14. **MOD-13 Transfer and Offline Practicum** — novel specification, implementation, incident diagnosis, evidence and handoff.

The graph is acyclic and cumulative. Its completed prose lives at `modules/MOD-00.md` through `modules/MOD-13.md`; the manifest and module checker enforce identity, order, required sections, and the 70,000–74,000-word aggregate contract.

### 5.3 Advanced elective — direct App Server protocol

Direct App Server protocol work is not a Revision 0.4 implementation lane. A future elective may teach capability negotiation, one-socket lifecycle, event ownership, authentication, and version pairing after current evidence and a separate authorization exist.

### 5.4 Advanced elective — Remote Client API

Remote Client work is not a Revision 0.4 implementation lane. A future elective may teach relay topology, connection ownership, recovery, environment selection, and hosted-runtime uncertainty without treating it as ordinary Agent SDK Local behavior.

## 6. Bounded autonomous work loop

The agent owns adaptive working knowledge; the runtime owns execution state; the controller owns authority. A controller work unit must record at least:

- immutable intent and acceptance criteria;
- subject agent/conversation and selected runtime;
- lease owner and expiry;
- input/event identity and idempotency key;
- allowed tools/effects and approval policy;
- step, time, cost, retry, and failure budgets;
- checkpoint and continuation state;
- terminal result, uncertainty, and audit evidence.

The controller never equates queue acceptance with completion, assistant text with external delivery, a disconnected client with failed runtime work, or retry with permission to repeat an uncertain side effect.

### Effect-state method

For every external effect:

1. classify it as read-only, idempotent, compensatable, or irreversible;
2. generate a stable request key before the effect;
3. persist an intent/lease when the topology permits;
4. execute once;
5. capture canonical external identity;
6. verify authoritative state;
7. persist controller reconciliation state;
8. retry only through lookup/reconciliation;
9. stop on ambiguity or multiple matches.

This is project-owned architecture guidance, not a built-in Letta distributed transaction.

### 6.5 Three-loop model

The **work loop** performs one bounded task, the **improvement loop** proposes and evaluates changes, and the **supervision loop** controls authority, budgets, incidents, promotion, and rollback. Keeping them separate prevents a successful task from self-awarding a system change or production status.

## 7. Memory and improvement governance

Persistent agents learn through curated memory, skills, and project repositories—not by treating every transcript or tool result as durable truth. Stable identity and policy stay compact; volatile state remains external and explicitly loaded. Shared repositories require provenance and conflict control.

An improvement loop is separate from a work loop:

1. observe a bounded failure or opportunity;
2. preserve evidence and baseline behavior;
3. propose a reversible change;
4. freeze evaluation cases before candidate execution;
5. run an independent evaluator under a declared rubric;
6. attest novelty, contamination limits, allowed assistance, and environment;
7. promote only on all mandatory gates;
8. canary under a limited blast radius when runtime evidence is authorized;
9. roll back on regression or uncertain effects;
10. retain the decision record.

Reflection or dreaming may propose memory changes; it is not independent proof of improvement.

## 8. Assessment contract

The assessment has four equal dimensions: architecture, implementation, transfer, and supervision/evidence. Critical machine gates are binary. Architecture and transfer require an identified evaluator distinct from the subject attempt. The base contract can assess only the exact pinned package tuple. Newer, older, modified, hosted, or alternate-topology submissions require a compatibility preflight or receive no compatibility claim.

`assessments/contract.yml` keeps the repository-level learner statuses at not-started or not-assessed and denies execution without separate authorization. `assessments/PUBLIC_RUBRIC.md`, `misconceptions.yml`, and the evaluator-report template define public governance; no hidden answer key or executed evaluation exists in Revision 0.4.

## 9. Offline practicum design

The read-only practicum uses four original scenarios:

1. bounded provisioning with partial-success reconciliation;
2. stream, transcript, queue, and recovery reasoning;
3. tools, MCP, permissions, and uncertain-effect control;
4. topology, concurrency, supervision, improvement, and rollback design.

Fixtures must identify provenance: package-derived public shape, documented-behavior fixture, or project-method-only. A fixture never becomes a live runtime claim.

## 10. Revision 0.4 vertical slice

The maintainer-only slice implements one original TypeScript operation: reconciled agent provisioning. It uses the root Agent SDK types and a controller store, applies a stable request tag, searches before creation, retrieves the canonical ID, persists the mapping, reports partial success, and stops on ambiguity.

The slice includes:

- exact nested `package-lock.json`;
- strict TypeScript compilation using bundler module resolution and full library checking;
- a claim-bounded API card;
- a project-only partial-success fixture;
- a failure lesson for “agent exists, controller write failed”;
- no network call, credential, model turn, or agent creation during validation.

The exact dependency closure currently reports upstream high-severity `sharp`/libvips advisories. The root control plane remains audit-clean, but the slice is publication-blocking until remediation or accountable review. No automatic exception is granted.

## 11. Runtime and production boundaries

`runtime-claims/registry.yml` is empty and execution-disabled. Future runtime evidence must bind exact operation, package tuple, backend, topology, target identity, environment, timestamp, effects, stop conditions, cleanup, and result. A static source statement or fixture cannot populate it.

Production qualification is implementation-specific and covers supervision, credentials, tenancy, recovery, observability, backups, rollback, capacity, cost, privacy, and incident response. Curriculum completion never awards it.

## 12. Release and maintenance

Every release candidate must:

1. refresh official docs and exact package evidence;
2. compare both SDK entry points and all claim-bearing members;
3. reclassify affected capabilities and discrepancies;
4. compile examples against the exact lock;
5. run schema, reciprocal-reference, cold-reader, clean-copy, legacy-boundary, secret, link, and integrity gates;
6. run the drift rehearsal and measure maintainer effort;
7. obtain independent content, code, evidence, and licensing review;
8. keep runtime and production claims absent unless separately evidenced.

The support horizon target is current plus one prior minor line, but that is a maintenance goal rather than a shipped guarantee. The desired release-response interval is seven calendar days for high-impact upstream change, and the maintenance ceiling is eight maintainer hours per monthly refresh. Revision 0.4 records one drift rehearsal from SDK 0.8.6/Code 0.32.8 to SDK 0.8.9/Code 0.32.11. Publication remains blocked by dependency advisories and incomplete transitive license metadata; no waiver is implicit.

## 13. Revision 0.4 implementation boundary

Authorized local A–D work and the later explicit curriculum-authoring phase include contracts, schemas, registries, source/licensing policy, exact package evidence, one vertical slice, fourteen modules, practicum and assessment artifacts, validators, static tests, lock/integrity regeneration, cold-reader checks, clean-copy checks, and independent final review.

It excludes learner/evaluator execution, live Letta API/model calls, agent creation, runtime canaries, deployment, publication, commits, pushes, releases, and dependency-risk waivers.
