# MOD-11 Supervision Security and Observability

| Field | Value |
|---|---|
| Status | ready |
| Design revision | 0.4 |
| Prerequisites | MOD-10 |
| Capability IDs | CAP-SUPERVISION-PRODUCTION; CAP-AUTH-TRANSPORT-SECURITY |
| Adjacent capability | ADJ-TEAMS-TENANCY (awareness only) |
| Evidence IDs | SRC-DESIGN-SYNTHESIS; SRC-PRODUCTION-HEURISTIC; SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-CODE-NPM-0.32.11; SRC-CODE-SOURCE-0.32.11; SRC-DOCS-APP-SERVER-20260911; SRC-DOCS-TEAM-PERMISSIONS-20260916; SRC-DOCS-SECRETS-20260916 |
| Pointer IDs | PTR-PERMISSIONS-001; PTR-SECRETS-001; PTR-SESSIONS-001; PTR-APP-SERVER-LIFECYCLE-001 |
| Project-method sections | Authority envelope; evidence ladder; structured status; incident workflow |

## Learning contract and prerequisites

This module teaches you to design a supervision boundary for bounded autonomous agents. By the end, you should be able to separate supervisor authority from worker capability, choose least-privilege controls, describe tenant and credential boundaries, distinguish process health from work progress, construct auditable status records, and respond to uncertain or harmful effects without inventing certainty. You will design these controls; this lesson authorizes no command, credential use, API call, agent mutation, canary, deployment, or incident action.

MOD-10 established that an agent may propose an improvement but may not independently evaluate and promote its own proposal. Retain that separation here. You should also carry forward the earlier object model: agents and conversations are persistent objects; sessions and turns are narrower execution lifetimes; tools have locality; effects require reconciliation; controllers own leases, budgets, and stop conditions. Supervision is not an extra prompt wrapped around those objects. It is the external control system that decides who may start, continue, broaden, interrupt, evaluate, or retire work.

The primary lane is the Agent SDK with Node and a Local runtime; Cloud is a contrast topology. Exact package evidence is `@letta-ai/letta-agent-sdk@0.8.9` and Letta Code `0.32.11`. Their declarations and source expose lifecycle, permission, approval, status, and abort surfaces, but this repository has not exercised them. Direct App Server protocol details remain selection literacy, not the mandatory implementation path. Hosted runtime behavior is unknown-not-tested.

## Why supervision matters

Autonomy multiplies both usefulness and consequence. A worker that can read broadly, write files, call services, delegate, or keep working after a client disconnect can produce value without continuous prompting. The same properties enlarge the blast radius of a mistaken goal, a compromised credential, an ambiguous approval, or a cross-tenant lookup. A conversational transcript alone cannot answer the operator’s essential questions: who authorized this run, under which policy, on whose data, with what tools, which external effects occurred, and what remains uncertain?

A reliable design therefore treats supervision as an authority loop, not a mood of attentiveness. It enforces limits before execution, observes evidence during execution, and makes continuation decisions after checkpoints. It must remain effective even if the worker is confused, adversarial input appears in retrieved content, or the model claims success prematurely. Instructions stored in model-editable memory are useful guidance, but they are not an authorization boundary. Leases, budgets, tenant scope, effect policy, promotion decisions, and immutable audit records belong outside that memory under controller or operator ownership.

## Supervisor and worker authority

A **worker** performs one bounded work unit. It may reason, retrieve allowed context, invoke exposed tools, produce candidate outputs, and report uncertainty. It does not define its own tenant, issue itself credentials, enlarge its toolset, raise budgets, approve its own blocked effect, erase audit history, declare an incident resolved, or production-qualify itself.

A **supervisor** is the controller-owned decision role. It binds immutable intent to a subject agent and conversation, verifies the requester and tenant, selects runtime locality, grants a finite lease, supplies budgets, narrows tools, routes approvals to an authorized human or policy, and records terminal disposition. The supervisor may be implemented by application code plus human procedures. Calling another language model “the supervisor” does not create authority unless a non-model controller constrains and authenticates its decisions.

Authority should be represented as an envelope with explicit dimensions: principal, tenant, subject objects, operation, data classes, tool names, effect classes, destination constraints, time window, cost and step budgets, approval requirements, and revocation state. Every delegated worker receives a subset. A child must never inherit more authority merely because delegation was convenient. If a worker needs broader access, it returns a structured escalation request; the supervisor evaluates a new grant rather than allowing the worker to rewrite the old one.

Separate capability from authority. A tool being loaded means the model can see or request it. A permission mode governs how some tool requests are approved. Neither proves that the application’s user is entitled to perform the domain action. The controller must still check tenant ownership, resource scope, requested effect, current policy, and approver identity. Official App Server guidance likewise places domain authorization, durable jobs, external clients, and secrets in the application controller. This is consistent with the project method, but does not imply the platform supplies your business authorization layer.

## Least privilege and tenant isolation

Least privilege begins before a permission prompt. Do not expose a tool that the task cannot need. Narrow file roots, repositories, service operations, destinations, and time windows. Prefer read-only queries to writes, idempotent operations to irreversible ones, and single-resource grants to account-wide credentials. Set the restrictive baseline first; add a capability only when its purpose, owner, evidence, and revocation path are known.

Exact SDK 0.8.9 types distinguish `allowedTools` from permission modes. An allowlist limits which tools are available to a session, while modes such as `standard`, `acceptEdits`, `unrestricted`, and `strict` influence approval behavior. A `canUseTool` callback can allow, deny, or alter a request, and can correlate request and tool-call identities. Treat these as useful product surfaces, not complete security. “Unrestricted” is not an acceptable synonym for “authorized by the customer.” In unattended work, prefer a small allowlist and deterministic controller checks over an approval UI nobody is present to answer.

Tenant isolation must hold across every index and cache, not only the final API call. Bind tenant identity to job records, agent and conversation mappings, repository attachments, retrieval filters, credential handles, event streams, status pages, and audit queries. Never accept a model-supplied tenant identifier as authoritative. Derive it from an authenticated principal and verify every referenced object belongs to that scope. Use separate runtime processes, machines, storage roots, or accounts when the risk model requires stronger isolation; application labels alone are not proof of isolation.

Current official team documentation describes organization roles and separate sharing controls, and says agent access, conversation access, and local tool permissions are distinct. Those documented controls may inform a selected Cloud design, but do not establish your application’s tenancy model, plan entitlement, or regulated isolation. The adjacent tenancy topic remains awareness only. No compliance certification follows from using organization roles.

## Credentials, transport, origin, and TLS boundaries

A credential is authority in portable form. The worker should normally receive a reference to a narrowly scoped secret, not its literal value. Keep values out of prompts, memory, source, fixtures, status, traces, approval cards, and error messages. Separate credentials by tenant, environment, service, and purpose; rotate and revoke them through a controller-owned procedure. Logs may record a secret name, policy version, and use decision, but never the value. Redaction is defense in depth, not permission to collect secrets indiscriminately.

Current Letta secrets documentation describes named secret substitution at shell execution, output scrubbing, and different storage locality for local and Cloud agents. These are product facts from current documentation, not a universal non-disclosure guarantee. A downstream service, child process, file, crash dump, or malicious command can create another disclosure path. Design so a compromised tool receives only the credential it needs, for the shortest practical period, and cannot use it against unrelated resources.

Map each transport hop: user to product backend, backend to SDK or runtime, runtime to tool host, tool host to external service, and telemetry or audit export. For every hop identify endpoint owner, authentication, authorization, encryption, certificate validation, proxy termination, origin policy, replay protection, timeout, and data classification. TLS protects data in transit between validated endpoints; it does not authenticate the end user to your domain, sanitize prompts, isolate tenants, or make the receiving system trustworthy.

Exact Letta Code 0.32.11 static source describes listener and `Origin` behavior. `SRC-DOCS-APP-SERVER-20260911` supports only the App Server statements within that dated snapshot, including its documented non-loopback authentication and TLS guidance. Do not generalize either source into a secure deployment claim. A browser cannot safely receive a controller credential merely because it can open a socket. Browser access requires a trusted backend or proxy that authenticates the user, enforces tenant and operation scope, and protects the upstream credential. Network exposure, proxy configuration, certificates, and origin behavior require exact-topology tests before any production claim.

## Observability and the evidence ladder

Observability should let an independent operator reconstruct decisions without reading the model’s mind. Record append-only **audit events** for authorization grants and denials, run creation, lease changes, tool exposure, approval requests and decisions, credential-reference use, external effect intent and reconciliation, pauses, aborts, process termination, policy changes, human escalation, and incident closure. Each event needs an event ID, timestamp, actor and acting principal, tenant, subject agent and conversation, run and tool-call correlation where available, policy version, action, outcome, reason code, evidence references, and redaction classification.

Do not collapse evidence into one “done” flag. Use a ladder:

1. **Run evidence** says a bounded turn or job was accepted, started, streamed, or reached a typed terminal result. SDK 0.8.9 exposes result success, stop reason, duration, cost when available, conversation identity, and associated run IDs.
2. **Tool evidence** says a particular tool call was requested, approved or denied, began, and returned a result. Correlate request ID, tool-call ID, run ID, normalized input digest, executor, timestamps, and bounded output reference.
3. **Effect evidence** says the authoritative external system reflects the intended change. It requires a stable request key, canonical external identity, verification read, and explicit state such as verified, rejected, compensated, or uncertain.

Assistant prose is below all three. “I sent the invoice” is not run completion, a successful tool return is not necessarily external delivery, and delivery acceptance is not necessarily the intended business outcome. Move up the ladder only with evidence from the owner of the relevant state.

## Health, progress, and structured status

**Health** asks whether a component can perform its role: process alive, listener ready, transport connected, credential usable, queue accessible, storage writable, or dependency responding. **Progress** asks whether a particular work unit is advancing toward acceptance: checkpoint completed, items processed, approval pending, retry scheduled, or effect verified. A healthy listener can host a stuck run. A progressing run can continue after an observer disconnects. Never infer one from the other.

Current App Server documentation describes readiness and health probes as listener/process signals. Exact SDK and Code evidence also expose device status, loop status, active run IDs, pending controls, typed stream events, retries, and results. These are distinct observations. Because lifecycle discrepancies remain open and no runtime canary exists, do not promise replay, ordering, recovery, or persistence beyond the exact documented surface. On gaps, mark status stale and reconcile from authoritative history or a supported snapshot rather than fabricating continuity.

A controller-owned status record should be machine-readable and monotonic where possible:

```text
work_unit_id, tenant_id, agent_id, conversation_id
state: queued | running | waiting_approval | paused | aborting | terminal | uncertain
health: healthy | degraded | unreachable | unknown
last_observed_at, evidence_cursor, active_run_ids
budget_used, budget_remaining, lease_owner, lease_expires_at
pending_approval_ids, active_tool_call_ids
last_verified_effect, unresolved_effect_ids
terminal_reason, incident_id, human_owner
```

Store human-readable summaries as projections of this record, not replacements for it. Include freshness. “Running” observed twenty minutes ago is not current running state. Unknown is a valid status and safer than a guessed transition.

## Pause, abort, and kill

A **pause** is a controller policy state: admit no new work and do not issue new effect authority. It may wait for a safe checkpoint, leave the process and session available for inspection, and preserve a resumable lease. Product surfaces may use the word differently; define your project transition explicitly. A pause request is not proof the current tool stopped.

An **abort** requests cancellation of the active turn. Exact SDK 0.8.9 exposes `session.abort()`, and current docs instruct consumers to continue reading until a terminal result. Record request and acknowledgement separately, then inspect in-flight tools and reconcile effects. Abort should not close the session by definition, and it cannot reverse an effect already committed.

A **kill** forcibly terminates an execution owner such as a process, sandbox, connection, or machine. It is the last resort for imminent harm, loss of control, or failed graceful cancellation. Kill may leave orphaned work, locks, pending approvals, partial files, or uncertain external effects. Closing an SDK session is also not universally a kill: exact source distinguishes session cleanup from sandbox lifetime, and a managed sandbox may survive depending on topology and options. Therefore name the target precisely: abort turn, close session, terminate sandbox, stop process, revoke credential, or isolate network.

## Incident-response workflow

When evidence suggests cross-tenant access, credential exposure, abusive use, unauthorized effects, or lost execution control, follow a controller-owned sequence.

First, **detect and classify** without trusting the worker’s summary. Capture the alert source, affected tenant and objects, current health, observed run and tool identities, effect uncertainty, and data classes. Open an incident ID and assign a human owner.

Second, **contain** with the smallest reliable action: pause admission, deny pending approvals, revoke a scoped credential, isolate a tenant runtime, abort active turns, or kill an execution owner if harm is continuing. Preserve unrelated tenants when isolation is credible; widen containment when it is not. Never retry an uncertain effect during containment.

Third, **preserve evidence**. Snapshot controller records, append audit events, retain relevant redacted protocol and tool metadata, and note clocks and gaps. Do not copy raw secrets or excessive private content into the incident dossier. Restrict access to responders with a need to know.

Fourth, **reconcile** from authoritative systems. Determine which messages were accepted, which tools executed, which resources changed, and whether duplicates or cross-tenant reads occurred. Classify every suspected effect as not attempted, attempted, verified, compensated, irreversible, or unknown.

Fifth, **eradicate and recover** under fresh authorization. Correct policy or mapping defects, rotate affected credentials, restore from a known state when justified, and resume only after the human owner approves a bounded recovery plan. Recovery completion is not incident closure.

Finally, **review and close**. Document cause, scope, user impact, unknowns, timeline, decisions, evidence, notification owner, follow-up controls, and validation required. A lesson, fixture, static source review, or successful restart does not certify production safety, privacy compliance, or regulatory compliance. Those claims require implementation-specific legal, security, operational, and runtime evidence beyond this curriculum.

## Original incident walkthrough: the silent export

A supervisor dashboard shows a green process-health indicator and a row labeled “running” for a bounded customer-report export. The row has not changed for eighteen minutes. This is the first signal, not proof of failure. The listener responds, storage is writable, and the runtime process is alive, so component health is healthy. The work unit, however, has produced no new checkpoint, stream evidence, tool correlation, or verified effect. The controller marks progress `stale-unknown` while preserving health as healthy. It does not restart merely because the UI looks stuck.

The operator opens incident `INC-204` and compares the UI projection with controller-owned run evidence. The dashboard row was last refreshed before a transport interruption and is not authoritative. Audit history shows one accepted run and a tool request to upload the export request; no typed terminal result is recorded. A tool result says “upload successful,” but the result contains only local staging information. The external archive owns delivery state, so tool success does not establish the intended external effect.

Before lookup, the responder validates tenant scope from the authenticated work record rather than trusting identifiers in the model transcript. The proposed archive path contains tenant `NORTH`, while the work unit belongs to tenant `SOUTH`. This mismatch is a potential cross-tenant effect. The supervisor pauses new admission for the affected controller, denies pending export approvals, and prevents additional archive writes. It does not pause unrelated tenants until isolation evidence is checked.

Tool metadata also reveals part of an archive token in a model-visible error. The owner treats this as leakage even if truncated, avoids copying it, revokes and rotates it, restricts affected records, preserves redacted evidence, and identifies possible use locations. Rotation does not disprove prior misuse.

Transport evidence shows that the observing client disconnected after the upload request. The runtime's execution state is not established. The queue view reports no active item, but no durable history proves whether the request was rejected, consumed, completed, or lost. Transport loss and queue ambiguity therefore produce an uncertain effect, not a failed effect. The controller freezes blind retry and searches the authoritative archive using the stable request key, expected digest, tenant, and time window.

The first lookup finds one object under tenant `NORTH` with the request key but a different content digest. The result cannot be attributed safely to this work unit. A second lookup under tenant `SOUTH` finds no object, but the archive's index freshness is unknown. The responder escalates rather than deleting the NORTH object, because deletion could damage another tenant. The suspected wrong-tenant write remains unresolved until the archive owner confirms canonical identity and audit history.

An operator proposes `session.abort()` because the dashboard says running. Abort is not containment: the active turn is unknown and it cannot reverse a write. Kill may stop harm but destroy volatile evidence while committed effects remain. The supervisor revokes credentials, denies tool authority, then targets the process only after telemetry shows continued archive attempts. The record distinguishes every intervention.

Post-kill inspection finds that the process was launched without a registered lease owner or human escalation route. That is an unsupervised-process defect independent of the suspected export error. Recovery requires a controller-owned launch record, finite lease, bounded budgets, heartbeat and progress checkpoints, tool allowlist, effect ledger, and named human owner before restarting. A healthy replacement process is not enough; the original uncertain archive effect still requires reconciliation.

The archive owner later confirms that the NORTH object predates this run and that the SOUTH request never crossed the service's authorization boundary. The tool's “success” referred only to staging. The effect is classified confirmed-not-attempted externally, and retry may be considered only under fresh tenant validation, rotated credentials, renewed lease, and human authorization. The incident remains open until transcript exposure scope, credential-use audit, process-launch defect, and dashboard freshness defect are addressed.

A stakeholder asks whether the corrective controls prove compliance. The supervisor records an explicit non-claim. This incident process can produce useful evidence, but it does not establish compliance with a statute, contractual framework, certification, privacy regime, or security standard. Such a claim requires defined controls, scope, accountable interpretation, implementation evidence, independent review where required, and continuing operation. The curriculum cannot award it.

This walkthrough is an original project-method scenario. It does not claim that the exact packages emit these records, that a queue behaves this way, that abort or kill has a universal meaning, or that any runtime or archive was tested.

## Failure modes and recovery decisions

### Healthy but no progress

A process answers probes, so the supervisor declares the work complete. Recovery preserves health while marking progress stale, blocked, or unknown. Inspect checkpoints, active run identity, budget movement, approvals, and effect evidence. Restart only when a bounded recovery decision supports it; healthy dependencies cannot substitute for acceptance evidence.

### UI row treated as run evidence

A stale dashboard row becomes the sole basis for pause, retry, or closure. Recover by reading its observation timestamp and source, then reconcile against controller records, typed terminal evidence, supported history, and active execution ownership. The UI is a projection. Correct the projection without rewriting underlying history, and retain unknown when continuity cannot be reconstructed.

### Tool success treated as external effect

A callback returns successfully after placing data in a local buffer, and the work item is closed as delivered. Recovery requires the stable effect key, canonical external identity, and verification from the system owning the business state. Classify absent or contradictory evidence as uncertain. Do not resend until authoritative state proves absence and authority remains valid.

### Wrong-tenant access

A model-provided tenant or path is accepted without binding it to the authenticated principal. Immediately stop affected effects, deny pending approvals, isolate the suspected scope, and open an incident. Reconcile every read and write by canonical tenant ownership. Do not “clean up” another tenant's resource without its authority. Repair all indexes, caches, mappings, retrieval filters, and audit queries that permitted the mismatch.

### Secret leakage

A credential appears in prompt, memory, status, trace, result, error, or approval card. Stop propagation, restrict the evidence, revoke or rotate through the secret owner, and assess previous use. Reports should use a redacted fingerprint or secret reference rather than repeat the value. Recovery also narrows credential scope and removes the collection path; redaction alone is insufficient.

### Transport loss and queue ambiguity

A disconnected observer assumes the turn failed, while an empty queue is interpreted as proof that nothing ran. Recover by separating observer transport, execution owner, queue state, terminal run evidence, and external effect state. Mark unresolved work uncertain, use supported history or snapshots where available, and reconcile effects independently. Never blind-resend an effectful request because a client missed output.

### Pause, abort, and kill misuse

Pause is treated as tool cancellation, abort as rollback, or session close as process termination. Recovery names the intended target and verifies each action separately. Pause prevents new authority; abort requests turn cancellation; kill terminates a named execution owner. Revoke credentials or isolate networks when effects can continue elsewhere, and inspect orphaned tools, locks, approvals, files, and external changes afterward.

### Unsupervised process

A worker process continues without a finite lease, controller registration, budgets, checkpoints, or human owner. Contain it with the least destructive reliable action, escalating to kill when control is lost or harm continues. Preserve evidence, reconcile its effects, and prohibit restart until launch policy supplies ownership, expiry, authority, observation, escalation, and cleanup.

### Unsupported compliance claim

A team labels the system compliant because it uses TLS, role controls, secret substitution, or an incident checklist. Withdraw the claim. Record only the controls actually evidenced for the exact implementation and environment. Route legal and regulatory interpretations to accountable specialists, identify gaps and testing requirements, and never turn package features, static review, or one successful incident response into certification.

## Scenario and evidence boundary

The scenario and decisions above are project-owned supervision guidance. No process, queue, tool, archive, credential, tenant boundary, transport, pause, abort, kill, runtime, or compliance control was executed or observed. Exact static evidence cannot establish live ordering, persistence, containment, recovery, isolation, or production suitability.

## Supervision Security and Incident dossier artifact

Under separate implementation or assessment authority, produce one **Supervision, Security, and Incident Record** for each bounded autonomous service and link an incident supplement whenever abnormal evidence appears. This dossier is controller-owned and append-only in its decision history. It is not model memory, a transcript summary, or a dashboard screenshot.

Begin with identity and scope: dossier ID, release digest, exact tuple, implementation commit, environment, topology, owners, tenants, subject objects, mission classes, and cutoff. Classify entries as design, static evidence, fixture, runtime observation, evaluator result, or production qualification. Keep unknowns explicit.

The authority envelope records authenticated principals, tenant derivation, subject objects, permitted data classes, tools, effect classes, destinations, time windows, leases, budgets, approval policies, business-authorization sources, delegation limits, and revocation paths. Include the rule that a worker cannot enlarge its own scope, approve its own effects, promote itself, erase evidence, or declare an incident closed. Record how child authority remains a subset of parent authority.

Add a tenancy map covering job records, agent and conversation mappings, repositories, retrieval indexes, caches, credential references, streams, status views, and audit queries. For every boundary identify the authoritative tenant source and isolation mechanism. Application labels are not proof of isolation; document process, account, machine, storage, and service boundaries where used.

The credential and transport section stores references, owners, purpose, scope, rotation, revocation, and permitted hosts, never values. Map each hop's owner, authentication, authorization, encryption, certificate validation, proxy, origin policy, timeout, and data class. Separate browser-to-controller trust from runtime credentials.

Define observability records: audit event schema, run and tool correlation, effect ledger, health probes, progress checkpoints, queue evidence, status freshness, redaction class, retention, access policy, and clock assumptions. State which system owns each fact. A human-readable row must link back to machine evidence and observation time. Include explicit states for unknown, stale, and uncertain rather than forcing every event into running, failed, or complete.

The intervention plan distinguishes pause admission, pause at checkpoint, deny approval, abort turn, close session, revoke credential, isolate network, terminate sandbox, stop process, and disable controller. For each action name authority, target, expected effect, confirmation evidence, collateral risk, and follow-up reconciliation. A kill plan must include orphan discovery and evidence preservation.

An incident supplement records incident ID, detection source, severity rationale, affected and potentially affected tenants, data classes, runs, tools, credentials, external effects, human owner, and timeline. Append containment decisions, preserved evidence references, uncertainty, authoritative reconciliation, eradication, recovery authorization, user or regulatory notification owners, corrective controls, validation plans, and closure decision. Never overwrite an earlier mistaken belief; append the correction and its evidence.

Close with status on separate axes: design review, static implementation, assessment integrity, runtime claims, and production qualification. Add exact non-claims, known discrepancies, unresolved risks, reviewer identities, expiry or recheck triggers, and links to withdrawal or rollback plans. A dossier can show disciplined preparation without claiming live effectiveness.

## MOD-11 synthesis checkpoint

Combine earlier controls into one supervision view. Retain MOD-00 evidence lanes, discrepancies, statuses, and fail-closed decisions; MOD-01 mission, acceptance, stops, and budgets; MOD-02 ownership and locality; and MOD-03 surface, topology, model, provider assumptions, and unknown account availability.

MOD-04–05 contribute canonical identities, reconciliation, lifecycle states, queue uncertainty, and no-blind-resend policy. MOD-06 keeps authority outside model-editable memory. MOD-07 contributes tool locality, authorization, secrets, and effects. MOD-08 contributes bounded cycles and concurrency; MOD-09 delegation and attribution; MOD-10 independent evaluation, promotion, canaries, and rollback.

Test the synthesis with one invariant: every meaningful status or decision must name its owner and evidence. The worker owns proposals and candidate output. Runtime evidence owns observed execution facts within scope. External systems own their business state. The controller owns authority, budgets, leases, and decision records. Independent evaluators own their assessments. Production owners own environment qualification. No owner may silently inherit another's conclusion.

Before proceeding, verify that the design can answer: who may act, on whose data, through which topology, with which credentials and tools, under what budget, how progress differs from health, how external effects are verified, how intervention is confirmed, who investigates incidents, and what remains unknown. A missing answer blocks unattended operation; it does not invite a model-generated guess.

## Formative transfer questions

1. A listener is healthy while a work unit has no checkpoint for twenty minutes. Which statuses should change, and what evidence would justify intervention?

2. A dashboard says failed after the observer disconnects, but an active run ID remains. Why is retry unsafe, and what should be reconciled first?

3. A tool returns success while the destination system has no canonical record. Classify run, tool, and effect evidence separately.

4. A worker supplies a tenant identifier matching its prompt but not the authenticated job. Which identity governs, and what incident actions follow?

5. A token appears in a redacted-looking error. Why must responders still consider revocation, scope assessment, and protected evidence handling?

6. Distinguish pause, abort, session close, process kill, credential revocation, and network isolation by target and expected evidence.

7. An abort request is acknowledged while an external write remains uncertain. Which state should the effect retain?

8. A queue is empty after transport loss. Give at least three explanations and explain why none alone establishes completion or failure.

9. A child worker needs account-wide access to finish a narrow task. How should the supervisor handle the escalation?

10. A browser can connect to a protected endpoint. Why does transport reachability not justify placing a controller credential in the browser?

11. A healthy replacement process starts after an incident. What unresolved evidence can prevent recovery completion or incident closure?

12. A project passes static security checks. Which runtime, privacy, compliance, and production conclusions remain unsupported?

13. Design a status projection that exposes freshness, health, progress, pending approval, unresolved effects, and human ownership without revealing secrets.

14. A reviewer proposes deleting a suspected wrong-tenant object. What authority and identity evidence are required before that action?

15. An agent says it has fixed its own safety policy and requests promotion. Apply the supervision and independent-evaluation boundaries.

16. Which dossier fields would reveal that an unsupervised process lacks a lease, owner, budget, or escalation route?

17. Explain why TLS, organization roles, and secret substitution are useful controls but not a compliance certification.

18. A runtime canary passes one Local recovery scenario. What may the claim say, and why can it not establish Cloud parity or production readiness?

## Exact evidence and security boundaries

The exact static package evidence is Agent SDK `@letta-ai/letta-agent-sdk@0.8.9` and Letta Code `0.32.11`. Package metadata, declarations, and immutable source support bounded statements about exposed types and statically inspected surfaces. They do not prove that a selected target accepts operations, preserves ordering, recovers after disconnect, enforces tenant isolation, protects secrets, or responds to intervention as designed.

`SRC-DOCS-TEAM-PERMISSIONS-20260916` supports dated organization-role and agent/conversation/tool-access distinctions, but not every sharing control or this project's tenant isolation. `SRC-DOCS-SECRETS-20260916` supports dated substitution, command scanning, output scrubbing, and storage-locality statements; these are not a universal nondisclosure guarantee. Documentation remains distinct from source and runtime observation. It authorizes no credential use, network exposure, mutation, incident action, or deployment. Hosted behavior remains unknown-not-tested.

Open lifecycle discrepancies require caution around reconnect, replay, approval recovery, queue state, turn resume, execution ownership, and session cleanup. Static agreement cannot erase the need for an exact topology and scoped runtime record. Unknown or conflicting lifecycle behavior narrows status language and blocks automatic retry.

Security methods in this lesson derive from project synthesis and production heuristics: controller-owned authority, tenant binding, least privilege, secret references, evidence separation, effect reconciliation, independent supervision, and immutable audit decisions. These are required design controls, not claims that Letta implements a complete business-authorization, tenancy, incident, privacy, or compliance system.

## Explicit compliance privacy runtime and production non-claims

No agent, session, turn, tool, approval, queue, process, transport, credential, tenant boundary, intervention, or effect was exercised or observed. No topology was tested. Static evidence does not establish ordering, persistence, replay, reconnect, cancellation, cleanup, or isolation.

This lesson does not claim secrets cannot reach prompts, files, processes, logs, tools, or services; correct transport or account configuration; or resistance to malicious content, credential theft, privilege escalation, tenant leakage, or abuse.

It makes no privacy claim concerning lawful basis, consent, minimization, retention, deletion, residency, access requests, cross-border transfer, or breach notification. It makes no compliance or certification claim under any law, regulation, contract, framework, or industry standard. Product features, role controls, encryption, checklists, static analysis, or one incident response cannot substitute for accountable scoped assessment.

It does not production-qualify supervision, reliability, recovery, observability, backups, capacity, cost, incidents, or operations. Curriculum, evaluation, static checks, fixtures, and canaries remain separate axes. Qualification belongs to one implementation and environment.

## Handoff to MOD-12

MOD-12, **Deployment Reliability and Upgrades**, extends supervision into topology, health, recovery, backups, capacity, drift, migration, and rollback. Carry forward the dossier, tenant and credential maps, evidence ladder, and intervention targets across restarts, machine loss, version change, and handoff.

Do not let deployment vocabulary promote status. A reachable service is not a progressing work unit. A redundant process does not prove effect correctness. A backup is not recoverable until restoration is tested under authority. An upgrade that compiles does not preserve runtime behavior. MOD-12 must bind every reliability statement to exact topology, tuple, environment, observation, and rollback decision.

The handoff grants no execution or publication authority. Runtime behavior remains unobserved here, compliance and privacy remain unassessed, and production remains not qualified.
