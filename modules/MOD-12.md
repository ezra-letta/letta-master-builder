# MOD-12 Deployment Reliability and Upgrades

| Field | Value |
| --- | --- |
| Status | ready |
| Design revision | 0.4 |
| Prerequisites | MOD-00 through MOD-11 |
| Capability IDs | CAP-EXECUTION-TOPOLOGY; CAP-SESSION-LIFETIME; CAP-RECOVERY-APPROVALS; CAP-EVIDENCE-RELEASES; CAP-SUPERVISION-PRODUCTION; CAP-AUTH-TRANSPORT-SECURITY; CAP-CONCURRENCY-CONSISTENCY |
| Evidence IDs | SRC-DESIGN-SYNTHESIS; SRC-PRODUCTION-HEURISTIC; SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-CODE-NPM-0.32.11; SRC-CODE-SOURCE-0.32.11; SRC-DOCS-SDK-DEPLOYMENT-20260916; SRC-DOCS-APP-SERVER-20260911 |
| Pointer IDs | PTR-DEPLOYMENT-001; PTR-COMPUTERS-001; PTR-APP-SERVER-DOCS-001; PTR-APP-SERVER-LIFECYCLE-001; PTR-SELF-HOSTING-001 |
| Project-method sections | Deployment decision record; process reliability envelope; state and backup inventory; immutable upgrade method; rollback gate; migration omission register |

## Learning contract and prerequisites

This module teaches deployment design without pretending that a diagram is a deployment. By the end of this first half, you should be able to choose among a Local application, Cloud-backed execution, a selected computer, and a separately operated App Server; decide whether the Agent SDK owns runtime startup or connects to an external runtime; distinguish a long-lived controller from a serverless request handler; define readiness, supervision, shutdown, state, files, secrets, backups, version coupling, release, upgrade, rollback, and migration boundaries; and record every unverified assumption.

The required background is cumulative. Earlier modules established evidence lanes, object ownership, topology, exact-surface recovery, effect governance, bounded loops, delegation, promotion, and supervision. Deployment must preserve those contracts rather than replace them with infrastructure defaults.

This lesson is read-only project guidance. It starts no process, opens no socket, creates no agent, selects no computer, copies no file, reads no secret, takes no backup, deploys no service, performs no migration, and spends no account resources. Product and package facts are bounded to registered evidence. The reliability and release workflows are project-owned methods, not Letta APIs or guarantees.

## Why deployment choices matter

A persistent agent system has several lifetimes. Agent and conversation state may outlive an SDK session. A runtime process may outlive one request but not a machine restart. Controller records must survive worker replacement. A selected computer may contain the only valid checkout, toolchain, or credential. A model provider may be reachable from one host and forbidden from another. An external effect may complete while a process is terminating. Deployment determines which lifetime failures can occur together.

Treating deployment as “where the code runs” is therefore insufficient. You must ask who starts the runtime, who observes readiness, who owns the connection, where tools execute, which filesystem is authoritative, what state is backed up, how secrets arrive, what happens during shutdown, which versions are paired, and how rollback restores a coherent set. A platform may restart a process successfully while the application remains unsafe because a stale lease, pending approval, uncertain effect, or incompatible runtime still exists.

Topology changes trust: Local may expose a checkout, Cloud may combine hosted state with another computer, App Server may centralize runtime, and serverless handlers may not own long-lived sessions. Deploy the smallest topology whose lifetimes match the mission. “Managed” is not a durability class, and “local” is not a backup strategy.

## Conceptual deployment model

A **deployment topology** places logical roles on actual hosts and networks. The **controller** owns application intent, canonical IDs, leases, budgets, reconciliation, audit records, and stop authority. The **SDK client** exposes the selected high-level programming surface. The **runtime** owns active agent execution and session protocol state. The **state service** persists agent and conversation data for its topology. The **computer** supplies shell, filesystem, installed software, and runtime-local credentials to tools. A **process supervisor** starts, monitors, restarts, and stops long-running processes. A **release unit** is the immutable set of application code, configuration schema, SDK version, runtime version, and migration expectations promoted together.

One host may fill several roles, but they stay logically separate. A Local controller and SDK client may share Node while the SDK coordinates a runtime; their states are not one atomic database. A separately operated App Server moves startup, authentication, network, supervision, and compatibility duties without inheriting project budgets or effect reconciliation.

**SDK-owned runtime** means the application uses the SDK’s supported lifecycle to start or manage the runtime for that client topology. The application still supervises its own controller, awaits readiness, handles session outcomes, and closes resources. **External runtime** means operators start and supervise an App Server or other documented runtime independently, and the SDK connects through a configured address and authentication boundary. The controller must not attempt both ownership models simultaneously. Duplicate startup authority can create port conflicts, split observations, inconsistent versions, or two workers believing they own execution.

A **readiness signal** shows a component can accept defined work, not merely that its process exists. **Liveness** asks whether it responds. **Drain** stops admission while allowing reconciliation and checkpoints. **Shutdown** releases resources after bounded disposition. Forced kill is a failure mode.

## Local, Cloud, computers, and App Server

The primary curriculum implementation lane remains Agent SDK, Node, and Local. A Local deployment can place controller, client, runtime, files, and tools on one machine, making locality inspectable. It is appropriate when required data and tools are local, one trusted operator controls the host, and availability requirements match that machine. Local does not mean automatically offline, durable, backed up, single-process, or production-ready. Machine loss can combine controller, runtime, agent-state, project-file, and credential loss unless each is protected separately.

Cloud is a contrast topology. Persistent state or runtime coordination may involve hosted services, while tool execution may occur on a selected connected computer or managed sandbox where supported. The computer remains distinct from the agent. Selecting another computer does not copy a checkout, dependencies, or secrets. Cloud design must state account and tenant ownership, controller credential placement, selected-computer policy, offline behavior, fallback equivalence, hosted completion observation, and target catalog availability.

This repository makes no claim that a reader has Cloud access, an available sandbox, a registered computer, or any hosted capability. A fallback from a named computer to an isolated environment is valid only when files, tools, credentials, policy, and acceptance criteria remain equivalent. Otherwise the controller pauses. Availability convenience cannot redefine success.

A separately operated App Server suits centrally supervised runtime or independent application lifecycles. Its operator owns authentication, network controls, version, state location, process manager, logs, health, capacity, and upgrades. Using it through the Agent SDK does not make the application a direct protocol implementation.

## Long-lived controllers and serverless request handlers

A long-lived controller can maintain sessions, consume events, heartbeat leases, coordinate approvals, and drain work while persisting authority externally. It still needs restart checkpoints; memory maps are not controller stores.

A serverless handler can validate ingress, persist work, query status, or request a bounded operation. Do not assume it owns indefinite sockets, listeners, Channel adapters, child processes, approval waits, or runtime supervision. Invocation limits, retries, concurrency, and termination can break ownership.

A safe split uses serverless ingress to authenticate and durably enqueue project work, while a separately supervised worker owns the long-running SDK session or runtime interaction. The durable work record arbitrates duplicates and leases. If the selected SDK operation is genuinely bounded and supported within one invocation, a serverless worker may perform it, but only with explicit timeout, idempotency, reconciliation, and shutdown rules. Never rely on a platform retry to determine whether a prior model turn or effect happened.

## Process supervision, readiness, and shutdown

The process supervisor should know only operational facts needed to manage a process: executable release, configuration reference, restart policy, resource limits, health endpoint or command, log destination, and termination grace. It should not invent application completion or refill work budgets. Repeated crashes must trip a bounded restart policy and alert supervision instead of producing an infinite crash loop.

Readiness has layers. The controller store must be readable and writable. Configuration schema and exact release identities must match. For an external runtime, the connection and authentication path must be usable. For Local SDK-owned startup, the SDK must report its supported readiness boundary. Required state and working directories must exist with correct ownership. A selected computer must be the one authorized for the work. Provider or model readiness remains target-specific and should be tested only under separate authority. A health check that calls a paid model on every probe is neither necessary nor safe by default.

Admission begins only after required readiness gates pass. During a readiness loss, stop taking new work; do not necessarily kill active work blindly. Observe whether runtime execution continues, preserve connection-loss evidence, and reconcile. Liveness probes must allow for legitimate long turns without interpreting quiet output as death. Heartbeats for project leases are separate from process-health signals.

Readiness answers whether components can accept their role; capacity admission answers whether this work may consume a bounded reservation now. Admission requires fresh implementation-owned evidence. Missing or stale capacity evidence fails closed without becoming a claim about model quota, account credit, provider availability, runtime throughput, or accepted work.

Graceful shutdown starts with drain. Mark the instance unavailable for new leases, stop trigger intake or transfer it durably, and identify active work. For each work unit, finish a safe bounded step or request cancellation where appropriate, observe the response, reconcile uncertain effects, checkpoint, release or allow expiry of leases, close SDK sessions and clients according to their ownership, flush audit records, and then terminate. If the grace period expires, record forced termination so restart recovery treats active effects as uncertain.

## State, files, secrets, and backups

Inventory state by owner. Controller state includes intents, leases, budgets, checkpoints, effect records, evaluations, release decisions, and audits. Agent and conversation state belongs to the selected Letta topology. Runtime state includes active sessions, connections, queues, and approvals whose durability must not be generalized. Project files belong to a computer or repository. Configuration describes topology but must not contain secret values. Logs and metrics are evidence stores with retention and privacy obligations.

A backup plan names each durable store, consistency boundary, encryption owner, schedule, retention, restore order, and restore test. Backing up controller data without agent state may preserve authority but lose context; backing up agent state without controller data may revive context without knowing effects or budgets. Copying a working directory is not necessarily a consistent backup, and synchronizing files is not proof that a restorable snapshot exists.

Secrets remain outside prompts, memory, source, fixtures, logs, and backup reports. Record secret names, owner, injection host, rotation policy, and revocation procedure, never values. Determine whether restored data references credentials that have rotated. A backup containing secrets requires stricter handling; excluding them requires a documented re-provisioning path. Neither choice is automatically correct.

Restore is part of backup design. Restore into an isolated target, verify identities and integrity, prevent outbound effects, reconcile clocks and leases, and prove that the application can distinguish restored historical work from currently authorized work. A successful archive write does not prove recovery.

## Exact version coupling and immutable releases

Revision 0.4 statically binds the Agent SDK to `@letta-ai/letta-agent-sdk@0.8.9` and its declared Letta Code `0.32.11`. Standalone Letta Code `0.32.11` is a separate evidence lane even when artifact identity matches. Hosted runtime version remains unknown. Package installation and source inspection did not execute lifecycle behavior.

Treat SDK, runtime, controller code, configuration schema, and migration expectations as coupled. An exact SDK may depend on a specific runtime contract; a separately upgraded App Server may change protocol, events, options, or recovery behavior. “Compatible with latest” is not an immutable release statement. Record exact package integrity, source identity, Node and TypeScript baseline where applicable, backend, topology, and configuration revision.

Build releases immutably: one artifact identity per content set, no mutable tags as sole provenance, no in-place dependency update, and no startup-time installation that silently changes the tested closure. Configuration changes need versioned review because switching backend, computer, model scope, permission, or runtime address can alter the system as much as code.

An upgrade begins as a candidate, not an overwrite. Refresh documentation and exact package evidence, compare public surfaces and source restrictions, update discrepancy mappings, compile authorized examples, rehearse state/configuration changes, and evaluate on frozen cases. Promote through a bounded canary only when runtime authorization exists. Preserve the prior release artifact and rollback data.

Rollback means restoring a coherent release unit, not merely downgrading one package. Check whether new code wrote state the old release cannot understand, whether conversations or tools changed, whether effects occurred, whether credentials rotated, and whether a runtime or computer still runs the candidate. Pause admission, reconcile active work, restore compatible code and configuration, verify state, then reopen. Rollback cannot undo irreversible external effects; those require compensation or escalation.

## Migration omissions and topology selection workflow

A migration plan must state what it does **not** move. Common omissions include local checkouts, uncommitted files, installed tools, environment variables, provider credentials, computer registrations, active sessions, queued inputs, pending approvals, Channel adapters and routes, schedules, controller leases, audit history, sandbox contents, and external effect identities. Agent memory moving between surfaces does not prove any of these moved. Unknown omissions block automatic cutover.

Select deployment in order. First, restate mission availability, data locality, effect risk, recovery objective, privacy, latency, and operator capacity. Second, draw controller, SDK client, runtime, state, computer, tool, provider, trigger, and human hosts. Third, choose Local or Cloud and SDK-owned or external runtime ownership. Fourth, decide which components must be long-lived and which may be bounded handlers. Fifth, inventory state, files, secrets, backups, and restore order. Sixth, pin the immutable release unit and compatibility evidence. Seventh, specify readiness, drain, shutdown, restart, upgrade, rollback, and migration omissions. Finally, list unknown account, hosted, provider, computer, and runtime facts that require separate observation.

Reject any topology whose safety depends on an unnamed operator, an unbounded retry, an assumed filesystem, a mutable dependency, an untested restore, or a hidden migration. The output is a reviewable deployment decision, not a claim that the system has been deployed or production-qualified.

## Original walkthrough: upgrading the Harbor controller

Consider an original system named **Harbor**, a supervised Node controller for a persistent repository-review agent. Release H7 uses the Agent SDK `0.8.9` with its declared Letta Code `0.32.11` lane. Controller records live in a durable application database, agent state belongs to the selected Letta topology, and repository files remain on computer `review-host-1`. An external process supervisor owns the controller and a separately operated App Server. This is a project scenario, not evidence that either process was deployed.

Maintainers propose H8 with a newer application build and runtime candidate. They first freeze admission and copy the H7 release manifest, configuration schema, package integrity, runtime address, computer policy, backup inventory, and rollback prerequisites into an upgrade record. They do not replace H7 in place. The candidate receives a new immutable identity, isolated configuration, and no authority to publish or mutate repositories.

### Preflight and mismatch discovery

The candidate controller is built against one SDK line, but the staging App Server reports a different runtime release than the upgrade record expects. A successful socket connection would not erase that mismatch. Harbor marks readiness failed and blocks admission. Recovery is to install or select the coherent tested release unit, or explicitly reopen compatibility review. It must not average SDK declarations, standalone runtime identity, and a hosted observation into “close enough.”

During review, maintainers also discover that an operator has been launching the App Server manually in a terminal. When the terminal closes, the service disappears without drain or restart. H8 rejects this as unsupervised ownership. Recovery assigns one process supervisor, restart ceiling, log destination, health definition, graceful termination period, and accountable operator. The SDK is configured to connect to that external runtime; it does not also attempt to start another runtime.

The first health probe checks only that the process exists, so admission opens before the controller database is writable and before `review-host-1` is verified. This is lazy readiness: work can enter a system that cannot persist authority or reach its required files. Harbor replaces the probe with layered gates for configuration, exact versions, controller-store read/write, authenticated runtime connection, and selected-computer identity. Provider and model availability remain separately observed target facts, not assumptions embedded in readiness.

### Transport and serverless boundary

A staging turn loses transport after submission. The supervisor sees a healthy runtime process, while the client session is closed. Harbor does not classify the work as failed or resubmit automatically. It stops new effects, preserves correlation, observes authoritative state through the supported surface, reconciles the work checkpoint, and resumes only through a new valid session when permitted. Process liveness, transport liveness, and turn completion are three different facts.

Another proposal moves all controller work into a serverless HTTP function. The function can authenticate a webhook and durably create work, but its invocation may freeze while a WebSocket is active, retry concurrently, or terminate before approval and shutdown. Harbor keeps serverless ingress bounded and gives a long-lived supervised worker the session lifecycle. The database lease prevents two retried functions from both claiming execution. If a future operation is proven bounded within one invocation, it may receive a separate design; no blanket serverless compatibility is claimed.

### Backup and secret rehearsal

The H8 backup rehearsal initially archives the repository checkout and calls that a system backup. It omits controller leases, effect records, agent/conversation state, configuration, routes, and audit decisions. A second attempt saves controller data but not the files required to reproduce review output. Both are wrong because backup scope follows ownership and recovery order, not whichever directory is easiest to copy.

The corrected inventory names every durable store, consistency point, retention, encryption owner, and restore dependency. The team restores into an isolated target with outbound effects disabled, expires historical leases, verifies canonical IDs, and confirms that restored checkpoints cannot masquerade as current authority. Repository synchronization and archive creation remain insufficient until restore behavior is tested.

H8 also moves the controller from one host to another. Copying configuration does not relocate secrets safely. The upgrade record names each credential, old injection host, new secret owner, rotation or re-provisioning step, and revocation condition without recording values. If a credential cannot be supplied through the approved boundary, migration pauses. Maintainers do not put it in agent memory, a container image, logs, or a backup report to make startup pass.

### Computer, sandbox, and migration omissions

During rehearsal, `review-host-1` is unavailable and an isolated sandbox is selected automatically. The repository is absent, so a model response cannot satisfy acceptance. In another topology, a managed sandbox could also expire independently of session cleanup assumptions. Harbor treats sandbox identity and lifetime as target-scoped. Its policy pauses repository-bound work when the named computer is offline and permits fallback only for tasks whose files, tools, credentials, and acceptance criteria were declared equivalent.

The migration checklist reveals more omissions: active queues, pending approvals, Channel routes, schedules, working-directory settings, uncommitted files, installed tools, external effect identities, and controller audit history. Agent state alone cannot carry these. Harbor assigns each item a migrate, recreate, drain, reconcile, abandon-with-approval, or explicitly-not-applicable disposition. Any unresolved omission blocks cutover because invisible loss is not a recovery plan.

### Supply-chain gate and partial upgrade

The exact dependency review reports a security advisory in the candidate closure and incomplete licensing disposition for a newly introduced artifact. Compilation still succeeds. Harbor blocks promotion because build success does not waive security or license review. Recovery is remediation, removal, or accountable documented disposition under project policy; it is not hiding the dependency or marking the release production-ready.

An operator then upgrades the controller but leaves the external runtime on H7. This partial upgrade recreates the version mismatch after preflight. Another operator updates the runtime while an old controller instance remains active. Harbor drains all old workers, verifies no stale leases or candidate processes remain, and promotes controller, runtime reference, configuration schema, and migration expectations as one release unit. Supervisors use immutable identities rather than a mutable `latest` label.

### Rollback incompatibility and qualification

H8 writes a new controller checkpoint field during rehearsal. The H7 reader cannot interpret it. A naive package downgrade would therefore produce rollback incompatibility. Harbor pauses admission, preserves both datasets, uses the rehearsed backward transformation or compatible H7 reader, reconciles active work, restores H7 configuration and runtime together, and verifies state before reopening. If no safe reverse path exists, rollback is blocked and recovery becomes a forward repair under supervision. Irreversible external effects are never undone by changing package versions.

Finally, staging passes its bounded static and simulated checks. A manager proposes labeling Harbor “production qualified.” The evidence supports only the named review gates. No live capacity, restore under real load, hosted behavior, incident response, credential rotation, privacy, tenancy, or runtime canary has been established. Harbor records the candidate as not production-qualified. Publication, runtime observation, and production qualification remain independent axes.

## Failure modes, unsafe shortcuts, and recovery decisions

**SDK/runtime mismatch:** fail readiness, stop admission, identify exact artifacts, and restore a coherent pair before testing behavior. **Unsupervised process:** appoint one startup owner and process supervisor; bound restart and shutdown. **Lazy readiness:** gate on required stores, runtime connection, configuration, and computer identity rather than PID existence.

**Transport loss:** preserve correlation and reconcile; never equate disconnect with failed runtime work. **Serverless WebSocket ownership:** split durable ingress from a supervised session worker unless bounded lifecycle is proven. **Wrong backup:** inventory state and files by owner, then test isolated restoration. **Secret relocation:** re-provision or rotate through the approved host boundary; never copy values into prompts or images.

**Sandbox expiry or wrong fallback:** treat sandbox lifetime and contents as target-scoped, pause when equivalence is absent, and reconcile any active work. **Migration omission:** assign every queue, approval, route, schedule, file, tool, lease, and effect identity an explicit disposition. **Dependency, security, or license blocker:** halt promotion even when compilation passes.

**Partial upgrade:** drain old instances and promote the immutable controller, SDK, runtime, configuration, and migration unit together. **Rollback incompatibility:** use a rehearsed reverse transformation or forward repair; do not blindly downgrade. **False production qualification:** report only the evidence axis actually passed and retain production status as unqualified until target-specific gates succeed.

These are Master Builder deployment policies. Letta mechanisms may provide SDK clients, runtimes, computers, sandboxes, state, or documented lifecycle surfaces for an exact topology. They do not supply Harbor’s release gate, backup inventory, migration decisions, qualification status, or rollback authority.

## Builder artifact: Deployment Reliability dossier

The module artifact is a **Deployment Reliability dossier**. It may be completed later only under separately authorized implementation or assessment. It is not an infrastructure template, deployment command, or production certificate. Use placeholders for hosts and secret names; never include credential values, private addresses, or copied operational data.

Begin with release identity: dossier revision, application artifact, configuration schema, Agent SDK package and integrity, SDK-declared runtime, separately operated runtime if any, Node and TypeScript baselines, source commits, backend, and topology. Record documentation retrieval dates separately from package versions. Name the candidate and retained rollback release. Mutable tags may be convenient pointers, but they are never sole provenance.

Add an ownership topology. For controller, SDK client, runtime, state service, computer, tool hosts, provider boundary, trigger adapters, and human operator, record host, trust level, startup owner, credential owner, durable state, files, health owner, logs, and loss behavior. Mark whether runtime lifecycle is SDK-owned or external. If external, identify its supervisor, authentication boundary, network exposure, capacity owner, and version pairing. If serverless components exist, limit each to bounded work and name the supervised process that owns long-lived sessions.

The readiness and process section defines configuration validation, controller-store read/write, exact-version checks, runtime connection, required directories, selected-computer identity, and any separately authorized capability probe. Define liveness without assuming quiet turns are dead. Specify restart ceiling, crash-loop escalation, admission control, drain, termination grace, forced-shutdown evidence, and startup recovery. Keep process health distinct from project lease heartbeat and turn completion.

Create a state inventory with controller records, agent and conversation state, runtime-local state, queues, approvals, schedules, Channel routes, files, repositories, logs, metrics, and external effect identities. For each, state owner, durability claim, backup method, consistency boundary, encryption, retention, restore order, and omission disposition. A restore rehearsal section describes an isolated target, outbound-effect prevention, identity verification, expired-lease handling, credential re-provisioning, and evidence that historical work cannot regain current authority.

The secrets section lists names and purposes only. It identifies injection host, storage owner, access scope, rotation, revocation, backup inclusion or exclusion, and migration procedure. The computer and filesystem section names required working directories, tools, uncommitted-state policy, repository revision, sandbox policy, expiry assumptions, and fallback equivalence. If equivalence is unproven, the dossier requires pause.

Finish with upgrade, migration, and rollback matrices. Every changed package, runtime, schema, state writer, tool, permission, model scope, computer policy, and route receives compatibility evidence and a reversal plan. Migration omissions receive explicit migrate, recreate, drain, reconcile, abandon-with-approval, or not-applicable dispositions. Security advisories, dependency drift, license uncertainty, failed restore, unresolved effects, partial upgrade, and absent runtime evidence are promotion blockers. The sign-off page reports content, implementation, runtime, and production status independently.

## Synthesis checkpoint after MOD-12

You should now be able to translate an autonomous-agent design into a deployment plan without erasing ownership. Agent persistence does not imply process persistence. Runtime readiness does not imply controller-store readiness. A connected computer does not imply required files or credentials. A backup does not imply a tested restore. A package downgrade does not imply a coherent rollback.

The primary static lane remains Agent SDK `0.8.9` with its declared Letta Code `0.32.11`; standalone `0.32.11` remains separately interpreted, and hosted runtime remains unknown. You can explain SDK-owned versus external runtime lifecycle, choose long-lived versus bounded handlers, supervise startup and drain, inventory state and secrets, pin immutable releases, expose migration omissions, and stop partial upgrades.

This checkpoint does not require a deployment. It requires a reviewable answer to: who owns each lifetime, what survives each failure, which evidence establishes compatibility, and what blocks promotion? If the answer depends on “managed,” “latest,” “the cloud,” or “we have backups” without an exact owner and test, the design is incomplete.

## Transfer-focused formative questions

1. A controller and runtime run on one laptop. Which logical stores and lifetimes must still be backed up and supervised separately?
2. A service manager reports the App Server process healthy while the controller cannot authenticate. Is the system ready, live, both, or neither for new work? Defend the admission decision.
3. A serverless function receives Channel traffic and keeps a WebSocket open for turns. What invocation, retry, concurrency, and shutdown failures threaten ownership, and how would you split the topology?
4. A Cloud task falls back from a named workstation to a sandbox. Which files, tools, secrets, permissions, and acceptance facts must be equivalent before continuation?
5. A transport disconnect occurs during an external effect. Why is restarting the client insufficient, and which state must be reconciled first?
6. The controller database is backed up nightly, but agent state and effect identities are omitted. What can the restore know, and what unsafe actions must it prevent?
7. A secret rotates during migration. How should old backups, restored configuration, old workers, and the new injection host be handled without recording the value?
8. A candidate upgrades the SDK while an external App Server remains unchanged. Which evidence determines whether this is a valid pair, and what is the safe default?
9. The candidate’s dependencies compile but include an unresolved advisory and uncertain license. Which status axes have passed, and why is promotion blocked?
10. A new release writes state that the prior controller cannot read. Design rollback choices without assuming package downgrade reverses the write.
11. A migration transfers agent memory but not schedules, queues, Channel routes, approvals, or local files. Which items can be recreated, which need reconciliation, and which block cutover?
12. A restore rehearsal succeeds with outbound networking enabled and replays old queued work. Why is this a failed safety rehearsal despite recovered data?
13. Quiet model work exceeds the liveness probe threshold. How should readiness, liveness, turn progress, and project heartbeats be separated?
14. A staging canary passes one turn. Which reliability and production questions remain unanswered?

Good answers identify owners, exact evidence, stop conditions, and uncertainty. They do not infer production readiness from infrastructure vocabulary.

## Source, package, dependency, and migration boundaries

`SRC-DESIGN-SYNTHESIS` and `SRC-PRODUCTION-HEURISTIC` support the project-owned ownership, supervision, release, backup, migration, and production-status methods. They do not assert that Letta provides the dossier, process supervisor, backup transaction, migration engine, upgrade gate, or rollback coordinator.

`SRC-SDK-NPM-0.8.9` and `SRC-SDK-SOURCE-0.8.9` identify the exact SDK package and static source lane. `SRC-CODE-NPM-0.32.11` and `SRC-CODE-SOURCE-0.32.11` identify exact Letta Code artifact lanes. The SDK-declared and standalone interpretations remain separate even when artifact identity matches. Package integrity proves artifact identity, not startup, persistence, performance, compatibility with an independently changed server, or hosted behavior.

`SRC-DOCS-SDK-DEPLOYMENT-20260916` supports the dated documented distinction among Cloud managed sandboxes, Cloud-selected computers, SDK-owned Local App Server subprocesses, and separately operated remote App Servers. `SRC-DOCS-APP-SERVER-20260911` supports dated lower-level App Server selection literacy. `PTR-DEPLOYMENT-001`, `PTR-COMPUTERS-001`, `PTR-APP-SERVER-DOCS-001`, `PTR-APP-SERVER-LIFECYCLE-001`, and `PTR-SELF-HOSTING-001` identify documentation that maintainers must refresh before volatile implementation guidance. Pointers authorize no installation, connection, server exposure, computer registration, or deployment.

Registered discrepancies narrow claims. `DISC-SANDBOX-LIFETIME-001` prevents assuming session cleanup destroys a sandbox. `DISC-RECONNECT-OWNERSHIP-001` prevents universal reconnect semantics. `DISC-CODE-0-32-11-LIFECYCLE-001` blocks runtime claims about execution ownership and recovery. `DISC-VERSION-001` fixes this revision’s static tuple while retaining prior releases only as historical drift. Missing target evidence remains `unknown-not-tested`.

Dependency review is part of release evidence, not proof of application safety. A known advisory, changed transitive closure, missing integrity, unsupported engine, or unresolved license blocks the project’s promotion policy until remediated or accountably dispositioned. Conversely, a clean dependency scan does not prove runtime security. Upstream Apache-2.0 packages remain governed by their own terms; this project’s MIT license does not absorb upstream code, documentation, or notices.

Migration evidence applies only to the named source, destination, versions, data classes, and topology. Copying files, memory, or a database cannot establish that queues, approvals, routes, schedules, computers, secrets, effects, or runtime state moved. Every omission remains explicit.

## Explicit non-claims

No Local, Cloud, App Server, computer, sandbox, provider, model, controller, serverless function, process supervisor, queue, Channel, schedule, or network was started or observed. No SDK-owned startup, external connection, readiness check, shutdown, reconnect, sandbox expiry, migration, upgrade, rollback, or effect behavior was tested. Hosted runtime version and account availability remain unknown.

This module does not claim exactly-once startup, delivery, backup, restore, queue processing, or effect execution. It does not claim session closure terminates all runtime resources, transport loss cancels work, a process restart resumes safely, or a sandbox survives any duration. It does not claim Local and Cloud store identical state or that files and secrets move with an agent.

No security assessment was performed. The lesson does not establish secure authentication, network isolation, secret storage, encryption, tenancy, privacy, vulnerability remediation, supply-chain safety, or compliance. A named control is a design requirement, not evidence that it exists.

No backup was written and no restore was tested. The dossier cannot guarantee recoverability, retention, consistency, data loss bounds, or disaster recovery. No migration tooling or backward-compatible state transformation is provided.

Content completion, static package evidence, compilation, simulated walkthroughs, staging checks, runtime observation, and production qualification are separate axes. This module does not production-qualify any deployment. Production requires implementation-specific capacity, reliability, security, credentials, tenancy, privacy, observability, incidents, backups, restores, upgrades, rollback, cost, and accountable operations evidence. Reading grants no execution or publication authority.

## Handoff to MOD-13

MOD-13 tests transfer through an offline practicum. Carry the Deployment Reliability dossier together with the mission, ownership map, topology record, bounded-work dossier, effect ledger, orchestration plan, evaluation evidence, and supervision design. The practicum will present unfamiliar requirements and failures rather than ask for memorized product facts.

You will need to select a topology, produce type-correct plans or code against exact static substitutes, diagnose interrupted work, preserve uncertain effects, propose an upgrade or rollback, and state every evidence limit. MOD-13 must not convert offline success into live-runtime or production status. The final handoff is therefore disciplined: demonstrate what the evidence supports, identify what remains untested, and refuse authority that the exercise did not grant.
