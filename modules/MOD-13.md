# MOD-13 Transfer and Offline Practicum

| Field | Value |
|---|---|
| Status | ready |
| Prerequisites | MOD-12 |
| Capability IDs | CAP-AGENT-MANAGEMENT; CAP-CONVERSATION-MANAGEMENT; CAP-SESSION-LIFETIME; CAP-TURN-STREAMING; CAP-MESSAGE-RECONCILIATION; CAP-QUEUES-ENQUEUE; CAP-RECOVERY-APPROVALS; CAP-SKILLS-LOCALITY; CAP-SHARED-REPOSITORIES; CAP-TOOLS-LOCALITY; CAP-MCP-LIFECYCLE; CAP-PERMISSIONS-APPROVALS; CAP-EFFECT-RECONCILIATION; CAP-EXECUTION-TOPOLOGY; CAP-TRIGGERS-DELIVERY; CAP-SUPERVISION-PRODUCTION; CAP-AUTH-TRANSPORT-SECURITY; CAP-CONCURRENCY-CONSISTENCY |
| Evidence IDs | SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-CODE-NPM-0.32.11; SRC-CODE-SOURCE-0.32.11; SRC-DESIGN-SYNTHESIS; SRC-PRODUCTION-HEURISTIC |
| Project-method sections | Offline practicum; novel transfer evaluation; machine/evaluator evidence separation; integrity and contamination controls |

## Learning contract and prerequisites

This module integrates the preceding curriculum into a transfer-oriented offline practicum. You should enter with the bounded mission, object and ownership model, capability and topology reasoning, provisioning and session recovery methods, memory and repository boundaries, tool and effect governance, bounded work loops, multi-agent distinctions, improvement controls, supervision, and deployment planning developed in MOD-00 through MOD-12. The challenge is not to repeat a memorized implementation. It is to apply those invariants to unfamiliar synthetic evidence while preserving authority and claim boundaries.

The suite and assessment governance are ready but unexecuted under Design Revision 0.4. Reader execution, scored execution, evaluator work, runtime canaries, and certification are unauthorized. This lesson describes what a separately authorized attempt would require. It does not launch a runner, compile TypeScript, inspect credentials, call a model, access a network, mutate an agent, appoint an evaluator, award status, or qualify production use.

By the end of this first half, you should understand the purpose and boundaries of all four scenarios, the difference between exact-package compilation and project-fixture conformance, the division between machine evidence and independent judgment, the integrity controls required for transfer, and the failures that no high average may offset. All scenario event names under `lmb.practicum.v1` are project-owned fixture vocabulary. They are not SDK, App Server, WebSocket, MCP, queue, or runtime event names.

## Why novel transfer matters

Following a worked example can demonstrate recall, local editing skill, or pattern matching without demonstrating architecture judgment. Transfer asks whether the learner can preserve invariants when names, ordering, partial failures, and tradeoffs differ from the lessons. A fresh mission forces the learner to identify what is stable: canonical identity survives failed bookkeeping; disconnection is not proof of failed work; effect uncertainty blocks blind retry; technical capability is not authority; topology facts do not transfer automatically; and a proposer cannot supply its own independent promotion evidence.

Novelty is therefore substantive, not cosmetic. Renaming a fixture while preserving the same decisions does not create a fresh mission. A transfer form needs changed domain context and at least two withheld perturbations that require new reasoning. The evaluator examines whether the learner discovers the right boundaries rather than whether output resembles a hidden template. Novelty, however, is not surprise without contract: mission scope, allowed aids, time limit, retry policy, evidence access mode, and scoring rules must be declared before the attempt.

The practicum is offline so machine gates can inspect deterministic artifacts without causing real effects. Offline does not mean trivial or product-emulating. Synthetic records can expose hard controller decisions while refusing to pretend they reproduce a complete runtime. This protects the claim boundary: success may establish exact-declaration compatibility and conformance to project-owned contracts, but not live interoperability, durability, security, or production readiness.

## Conceptual model: four scenarios, two evidence classes

The practicum contains four cumulative scenarios. Each requires deterministic TypeScript, structured artifacts, SHA-256 digests, explicit provenance labels, and zero forbidden effects. Package-derived public shapes mean only that synthetic values are constrained by exact declarations. Documented-behavior fixtures are original representations of registered documentation, not captured traffic. Project-method-only records encode this curriculum’s controller policies and invariants.

### Scenario 1: provisioning and partial success

`SCN-PROVISIONING` starts with no controller mapping and supplies synthetic observations for one intended agent, one intended conversation, skill components, repository attachment, recompilation, and failed controller persistence. The learner must retain canonical identities, model each sub-effect separately, search synthetic authoritative state before retry, stop on multiple matches, and create ownership-aware cleanup candidates.

The key transfer problem is that a failed final write does not erase prior effects. “Operation failed” is too coarse when the agent exists, a conversation identity is known, instructions were accepted, one support file failed, and an attachment preceded another failure. Cleanup cannot delete objects merely because the controller lost its mapping. Critical assertions forbid blind create, attach, upload, or delete and require explicit synthetic/live non-claims.

### Scenario 2: stream, transcript, queue, and recovery

`SCN-SESSION-RECOVERY` provides a synthetic stream with duplicate fragments, transport loss before terminal evidence, bootstrap and history snapshots, possible pending approval, and a second user input. The learner maintains a provisional transcript, reconciles it against canonical-history identities, records conflicts, distinguishes active-turn queuing from durable-enqueue candidacy, and chooses a bounded recovery action.

Transport loss remains unknown execution state. Missing terminal evidence never authorizes blind resend, and accepted or queued input is not completed work. Pending approval means unresolved authority. Retry and polling stop at registered bounds. The artifact must preserve differences among local input identity, provisional stream identity, and canonical message identity instead of deduplicating by text or inventing a terminal event.

### Scenario 3: tools, permission, MCP, and uncertain effects

`SCN-TOOLS-EFFECTS` combines a proposed tool action, execution-locality policy, approval that may edit arguments, a synthetic MCP transport state, timeout or abort, and an authoritative lookup returning zero, one, or multiple effect candidates. The learner preserves proposed and authorized argument digests, refuses dispatch without valid authority, assigns a stable controller request key, classifies the effect, and reconciles before repeat action.

No credential value may appear in model-visible input or artifacts. Timeout after dispatch is not proof of failure. Multiple lookup matches halt. Irreversible effects are neither automatically retried nor compensated, and compensation is a separately authorized proposal. Proposal, authorization, dispatch, observation, verification, and reconciliation remain distinct ledger states. Synthetic resource closure makes no claim about real MCP lifecycle behavior.

### Scenario 4: topology, concurrency, supervision, and improvement

`SCN-SUPERVISED-IMPROVEMENT` asks the learner to choose the primary Node/Local lane or a Cloud contrast from supplied constraints, then supervise two synthetic controllers contending for the same work. Fixtures introduce stale versions, lease and budget changes, workspace expiry, supervisor signals, a candidate improvement, frozen evaluation results, monitoring, and possible rollback.

At most one controller may report authoritative ownership for a work/version pair. Lease loss, budget exhaustion, or supervisor revocation stops later effect dispatch. Topology choice must state constraints, unknowns, and rejected alternatives without inferring parity. Promotion requires an evaluator distinct from the proposer, a frozen-case digest, passing mandatory gates, and a usable rollback target. Reflection, dreaming, a commit, or turn success is not proof of improvement.

## Exact-package compilation versus fixture conformance

The exact baseline is `@letta-ai/letta-agent-sdk@0.8.9`, its declared `@letta-ai/letta-code@0.32.11`, standalone Code `0.32.11`, TypeScript `5.9.3`, and Node `>=22.19.0`. Under a separately authorized runner, **exact-package compilation** would ask whether learner TypeScript is compatible with the locked declarations it imports. The threshold is 100 percent. Compilation does not show that a backend accepts a request, an event occurs in a claimed order, or a recovery path works live.

**Project-fixture conformance** asks whether normalized outputs satisfy the offline scenario schemas and assertions. Schema validation and critical assertions require 100 percent; noncritical assertions require at least 90 percent. Equivalent declared inputs must yield equivalent normalized results and digests. Conformance proves behavior only against project-owned records and rules. It cannot convert a synthetic event into runtime evidence.

The two results remain separate. Code may compile while violating authority or recovery invariants. A fixture implementation may produce expected project decisions while avoiding or misusing exact package types. Eligible machine language is limited to `compile-verified` and `offline-conformance-verified`, each bound to the exact artifacts and attempt. Neither means architecture-verified, transfer-verified, integrity-verified, runtime-verified, or production-qualified.

## Machine evidence and evaluator evidence

A machine runner owns reproducible artifact evidence: compilation counts, schema results, assertion counts, deterministic rerun comparison, forbidden-effect instrumentation, and SHA-256 digests. A permitted run must use a disposable workspace, locked package closure, no secrets, offline scored execution, and detection of network requests, credential access, writes outside scope, and undeclared process creation. The project specifies these requirements; it does not claim to provide a secure in-process sandbox.

Architecture and transfer require an identified independent evaluator under separate authority. The evaluator judges five equally weighted domains unless a predeclared versioned form says otherwise: architecture, implementation, recovery, evidence, and defense. A passing transfer judgment requires at least 85 percent overall, at least 80 percent in every domain, and every critical authority and safety judgment. Machine output informs the evaluator but cannot make those judgments. The evaluator report must be signed or otherwise attested and must use a fresh mission with at least two withheld perturbations.

## Integrity, contamination, aids, and retries

The attempt record binds learner agent or conversation identity, model/provider/handle, reasoning profile, context and tool profile, allowed aids, time limit, retry policy, and curriculum lock digest. Admission is functional, not based on model branding or context-window size. Before scoring, allowed aids must be enumerated: for example the pinned local release pack, language documentation, declared editor features, or specified notes. Used aids must also be disclosed. Undeclared assistance invalidates confident attribution even if artifacts pass.

Integrity review attests novelty, learner and evaluator identities, environment, aids, attempts, resets, reused artifacts, evaluator independence, and contamination. Contamination includes prior access to the fresh mission, withheld perturbations, answer-like fixtures, evaluator deliberation, or artifacts from another attempt. The verified maintainer vertical-slice fixture is infrastructure evidence and cannot be reused as a scored answer. Unknown overlap is recorded as unknown, not silently treated as clean.

Retry policy is fixed before the attempt. It states the number of attempts, what constitutes a reset, whether prior artifacts may be inspected or reused, and whether the mission or perturbations change. A retry cannot erase a forbidden effect or critical failure from an attempt. Reports retain attempt lineage and digests so an evaluator can distinguish correction from concealed replacement.

## Critical noncompensable failures

Some failures invalidate an attempt regardless of aggregate score: self-promotion or self-awarded evaluation; credentials, budgets, or leases in model-editable memory; blind retry after an uncertain effect; unbounded work; continued work after authority loss; tenant data or authority leakage; topology parity inferred from one test; runtime claims derived only from static or fixture evidence; absent or unusable required rollback; treating dreaming, a commit, turn success, or publication as proof of improvement or effect; any forbidden effect; or a missing critical authority/safety judgment.

These failures are noncompensable because they break the control model, not because they merely reduce output quality. Excellent formatting cannot offset credential disclosure. A high conformance average cannot offset blind retry. Correct code elsewhere cannot restore evaluator independence. The safe disposition is an explicit failed attempt with preserved evidence, not score averaging or retroactive relabeling.

## Learner workflow and status separation

A separately admitted learner would first verify the attempt record, access mode, exact tuple, allowed aids, workspace boundary, time limit, retry policy, and absence of execution authority beyond the runner. Next, read the fresh mission and inventory objects, state owners, authorities, prohibited effects, acceptance criteria, unknowns, and stop conditions. Classify every supplied record by provenance before writing code.

Then design the state machine and artifact schemas on paper. Mark partial success, uncertainty, ambiguity, lease or budget loss, approval pending, and terminal states explicitly. Implement deterministic transitions and redacted traces. Compile against the locked package closure and correct type errors without weakening project invariants. Run fixture conformance only when separately authorized, preserve raw gate counts and digests, and stop immediately on instrumentation evidence of a forbidden effect.

Finally, produce a defense that explains decisions, unsafe alternatives, residual risks, and additional evidence needed for runtime claims. Submit artifacts without awarding yourself a status. The runner may own implementation evidence. An independent evaluator may own architecture and transfer judgments. An integrity reviewer owns contamination disposition. Runtime and production remain owned by their separate authorities.

Learning, architecture, implementation, transfer, integrity, runtime, and production statuses never collapse. The current repository records learning as not started, architecture/implementation/transfer as not assessed, integrity as unverified, runtime as not tested, and production as not qualified. Reading this module changes none of them. Publication is not attestation; attestation is not runtime validation; runtime validation is not production qualification.

## Novel transfer walkthrough: Archive Intake Coordinator

This original walkthrough illustrates a fresh transfer mission rather than an answer fixture. A fictional archive receives synthetic intake packets from several departments. The learner must design an offline controller that validates packet provenance, groups related documents, records one review candidate per authorized collection, and prepares an operator disposition when identity, authority, or retention policy is ambiguous. It must never contact a real archive, read credentials, move live files, or claim that fixture records are product events.

Before the attempt, an administrator records the exact package tuple, learner and environment identities, allowed aids, time limit, retry policy, curriculum lock digest, and a commitment that two perturbations remain withheld. The mission is new in domain and artifact names, but it exercises familiar invariants: canonical identity can survive failed bookkeeping, duplicate observations require reconciliation, technical access does not establish collection authority, and uncertain effects cannot be retried blindly.

The public packet contract presents three project-owned record classes. An intake observation carries a provisional packet key and department assertion. An authoritative catalog snapshot may return zero, one, or several collection identities. A controller-store observation may fail after a review candidate identity is supplied. The learner labels each record’s provenance and designs states such as `unexamined`, `identity-resolved`, `authority-pending`, `candidate-recorded`, `bookkeeping-failed`, `ambiguous`, and `stopped`. These are project states, not API names.

The learner first decomposes authority. The submitting department may propose a packet, the synthetic catalog owns canonical collection identity, the controller policy decides whether that department may target the collection, and an operator resolves multiple matches. The learner then assigns stable operation keys, keeps provisional and canonical IDs separate, and writes acceptance conditions. Completion requires one reconciled candidate or a bounded disposition report, deterministic artifacts, no forbidden effects, and explicit non-claims. It does not require or imply real archival ingestion.

The first withheld perturbation reveals that two packets with different provisional keys refer to the same canonical collection. A memorized “one input, one output” implementation would create duplicates. A transferring learner consults the authoritative snapshot, records both observations, and converges on one candidate under a stable identity. The second perturbation removes department authority after identity resolution but before candidate recording. Remaining budget and technical ability do not permit continuation. The controller records authority loss, stops new transitions, and emits an operator disposition without fabricating success.

Suppose the catalog snapshot then reports one candidate identity, but controller persistence fails. The learner preserves the supplied canonical identity in the result and treats bookkeeping as a separate partial failure. A retry begins with lookup, not blind creation. If lookup returns several matches, the state becomes ambiguous and requires operator disposition. The defense explains that this pattern was derived from curriculum invariants, not from assuming real archive, SDK, or runtime behavior.

If separately authorized machine gates passed, the runner could report exact-package compilation and offline fixture conformance with raw counts and artifact digests. An independent evaluator would still inspect whether the learner identified authority transfer, handled the novel duplicate relationship, stopped after revocation, defended the state model, and maintained claim boundaries. The evaluator, not the code, judges transfer. An integrity reviewer then considers novelty and contamination before any assessment status could be recorded.

## Failure modes and recovery decisions

### Familiar mission leakage

**Failure:** the “fresh” mission is a lightly renamed lesson example that the learner has already seen. Performance may show recall rather than transfer. **Recovery:** quarantine the form, document overlap, generate a substantively different mission, rotate withheld perturbations, and obtain an integrity decision before reuse. Do not silently relabel familiar material as novel. If exposure cannot be bounded, record novelty as unverified.

### Fixture memorization

**Failure:** the implementation branches on known fixture filenames, record order, or expected terminal values instead of applying declared invariants. It passes one sequence but cannot defend its model. **Recovery:** preserve the attempt, introduce equivalent normalized inputs and predeclared perturbations, and examine whether results remain deterministic and principled. A failed generalization is not repaired by hiding more constants; redesign around identities, authority, and transitions.

### Compile-only overclaim

**Failure:** code compiles against SDK 0.8.9 and the learner reports that recovery “works with Letta.” Compilation establishes type compatibility only. **Recovery:** retract the runtime claim, classify the result as compile evidence bound to the exact tuple, and require separate fixture conformance for project behavior. Live ordering, persistence, acceptance, and recovery remain `unknown-not-tested` without authorized runtime evidence.

### Hidden perturbation exposure

**Failure:** a learner, helper, evaluator, or previous artifact reveals a withheld event before the attempt. The response can no longer demonstrate unprompted adaptation. **Recovery:** stop scoring, preserve access records, replace the perturbation and any dependent mission details, and attest the exposure. Merely instructing the learner to forget does not restore independence.

### Missing digests

**Failure:** artifacts and evaluator inputs are reported without SHA-256 identities. Reviewers cannot establish which version was compiled, conformance-tested, or judged. **Recovery:** do not infer identity from filenames or timestamps. If original bytes remain under controlled custody, compute and record digests through an authorized rerun or administrative step. Otherwise classify the evidence as unverifiable and repeat under the declared retry policy.

### Forbidden effect observed

**Failure:** instrumentation records a network request, credential access, out-of-workspace write, or forbidden process. Even a harmless destination violates the runner boundary. **Recovery:** terminate the attempt, preserve redacted instrumentation evidence, contain any workspace or secret exposure, and mark the attempt failed. Investigate before another attempt. Later cleanup or a good score cannot compensate for the observed effect.

### Critical failure hidden by aggregate score

**Failure:** a submission earns high marks in four domains but blindly retries one uncertain external effect or continues after lease loss. Averaging would reward unsafe architecture. **Recovery:** apply the registered noncompensable consequence, identify the exact critical condition, retain domain scores as diagnostic information only, and fail the attempt. A new attempt must follow the retry and contamination contract; the original failure remains in lineage.

### Retry contamination

**Failure:** after failing once, the learner receives evaluator reasoning, withheld answers, or corrected artifacts, then presents the next run as independent. **Recovery:** disclose all reused material, assign a new attempt identity, state whether the mission and perturbations changed, and let the integrity reviewer limit the claim. If correction is the goal, call it remediation rather than fresh transfer evidence.

### Evaluator conflict

**Failure:** the evaluator authored the solution, coached the learner during the attempt, has an undisclosed stake in passing, or is the subject attempt itself. A signed report alone does not establish independence. **Recovery:** suspend the judgment, disclose the conflict, appoint a separately authorized evaluator, and determine whether artifacts can be blindly reassessed or whether a fresh attempt is required. Machine gates remain machine evidence but cannot substitute for independent judgment.

### Runtime or production status leakage

**Failure:** a report turns `compile-verified`, `offline-conformance-verified`, or evaluator-attested transfer into “runtime verified,” “secure,” or “production ready.” **Recovery:** withdraw the inflated label, restore each status to its accountable owner, and state the missing evidence. Runtime status requires a separately authorized target-scoped observation. Production qualification requires implementation- and environment-specific operational review. Neither can be inherited from an offline score.

Across these failures, preserve evidence instead of rewriting history. Stop when integrity or authority becomes unclear, distinguish invalidation from ordinary technical correction, and let the designated owner decide each status axis. A technical defect may be repaired within a declared attempt when policy permits; an exposed perturbation, forbidden effect, or independence failure changes what the evidence can mean. The incident record should name the affected artifacts, identities, access, timing, containment, and allowed next action without disclosing protected assessment content. The practicum is strongest when it makes the limits of its conclusions as reproducible as its artifacts.

## Dossier artifact: Transfer Assessment Record

Under separate assessment authority, the terminal artifact is a **Transfer Assessment Record**. It binds what was attempted, which bytes were evaluated, who owned each judgment, and which conclusions are prohibited. It is project governance, not a product API, runtime transcript, certificate, or public badge. Create it before admission as a skeleton, freeze controlled fields when the attempt starts, and complete it only from attributable evidence.

The **release identity** section records curriculum ID and revision, curriculum lock digest, assessment-contract revision, public-rubric digest, scenario/form revision, exact package tuple, TypeScript version, Node range, and evidence-access mode. Record package closure identity rather than saying “latest.” If the attempt uses a different tuple, it needs an explicit compatibility disposition; success against another version cannot silently certify the pinned baseline.

The **identity and authority** section records attempt ID; learner agent or conversation identity; model, provider, and handle; reasoning profile; context and tools; runner environment; administrator; independent evaluator; integrity reviewer; and status owners. It also records each actor’s authorization scope and conflicts. A model name alone is not an identity record, and the learner cannot appoint itself evaluator or integrity reviewer.

The **mission and novelty** section contains the fresh mission, acceptance criteria, prohibited effects, public inputs, withheld-perturbation count, novelty rationale, and creation/custody history. It does not reveal protected perturbation content in a learner-visible copy. After scoring, an integrity-controlled annex may bind perturbation IDs and digests to evaluator observations. Record overlap with lessons, prior forms, fixtures, and learner-accessible artifacts. Unknown overlap remains unknown.

The **attempt conditions** section freezes allowed aids, aids actually used, time limit, workspace scope, secrets policy, network policy, process policy, retry count, reset semantics, reusable artifacts, and termination conditions. Any deviation receives a timestamped disposition from the appropriate owner. Do not rewrite the predeclared policy after seeing performance. A remediation attempt and a fresh transfer attempt have different meanings and must have different identities.

The **artifact manifest** lists every source, normalized output, JSON or JSONL report, trace, compiler result, schema result, fixture result, and learner defense by path, media type, byte size, SHA-256 digest, producer, and creation stage. Bind evaluator comments to the exact artifact digest reviewed. If two stages inspected different bytes, record two identities. Missing identity blocks claims that depend on artifact continuity.

The **machine evidence** section reports compilation, schema, critical assertions, noncritical assertions, deterministic rerun, instrumentation, and artifact identity separately. Include numerator, denominator, threshold, status, runner version, raw-report digest, and limitations. Compilation must be 100 percent; schema and critical assertions must be 100 percent; noncritical assertions need at least 90 percent; rerun must be deterministic; forbidden effects must be zero. Never replace counts with a single green check.

The **evaluator judgment** section scores architecture, implementation, recovery, evidence, and defense, identifies critical judgments, and cites artifact evidence. Record overall and per-domain values, rationale, residual risks, and unanswered questions. A transfer pass requires the registered thresholds, but the evaluator cannot award integrity, runtime, or production status. The learner’s self-defense is evidence considered by the evaluator, not an attestation of its own competence.

The **integrity and contamination** section contains explicit novelty, identity, aids, retry, contamination, and independence attestations. It records exposure events, access logs or their limitations, reused material, evaluator conflicts, and whether the fresh-mission claim remains supportable. Use `verified`, `invalid`, or `unverified` according to the controlled vocabulary rather than optimistic prose. An integrity limitation may narrow or invalidate transfer even when machine artifacts are excellent.

The **critical-failure register** lists every noncompensable condition with observed/not observed/unknown, evidence reference, and disposition. Any observed critical failure makes the attempt fail without averaging. Unknown critical authority or safety judgment cannot be treated as passed. Preserve the exact condition and chronology so remediation can address the control failure rather than merely improve presentation.

Finally, the **status and non-claims** section records learning, architecture, implementation, transfer, integrity, runtime, and production independently, with owner, evidence, timestamp, and scope. Only machine-eligible implementation language may derive from gates. Architecture and transfer require evaluator attestation; integrity requires its reviewer. Runtime and production remain unchanged without their separate processes. End with an exact limitations statement and no unqualified Master Builder label.

## Formative readiness and transfer questions

1. A learner has read all four scenario briefs and their critical assertions. What new evidence would show transfer rather than recall, and how would you protect it from contamination?
2. Code compiles perfectly but places a controller lease in model-editable memory. Which machine status, critical failure, and evaluator domain apply? Can compilation offset the failure?
3. A fixture suite passes 100 percent, but the learner cannot explain why a disconnect blocks resend. What does machine evidence establish, and what remains for the evaluator?
4. Two normalized reruns have matching visible JSON but different unrecorded source files. Which digests are needed before declaring determinism or artifact identity?
5. A hidden perturbation is accidentally shown to the evaluator before the evaluator coaches the learner. Identify both contamination and independence concerns. Is blind reassessment possible?
6. The first attempt fails a noncritical formatting assertion; the retry reuses its state-machine design. What must the predeclared retry policy and final record disclose?
7. Instrumentation reports one DNS request from an imported dependency. No data left the machine. Why is the attempt still subject to the forbidden-effect rule, and what evidence must be preserved?
8. A learner infers that Cloud and Local recover identically because both passed the same project fixture. Which critical failure is implicated, and what valid claim can remain?
9. A synthetic lookup returns two matches after an uncertain effect. Describe the correct controller transition, evaluator judgment, and prohibited shortcut.
10. The proposer supplies a frozen-case digest, evaluates its own improvement, and recommends promotion. Which requirements remain unsatisfied even if every case passes?
11. An evaluator scores architecture at 92, implementation at 91, recovery at 78, evidence at 94, and defense at 90. Does the overall average pass? Explain the domain floor.
12. A runner reports `offline-conformance-verified`. Who may award transfer, who reviews integrity, and what evidence would still be required for a runtime claim?
13. One required artifact lacks a digest, but its filename and timestamp match the evaluator’s notes. What status must remain blocked, and what recovery is legitimate?
14. A mission is fresh, but its withheld perturbations duplicate a learner’s prior remediation. What should the novelty attestation say?
15. A learner continues one read-only transition after supervisor revocation because no external effect occurs. Why can authority loss still be noncompensable?
16. A report calls the learner “production ready” after passing all offline and evaluator gates. Identify the status leakage and list three deployment-specific evidence classes still missing.
17. What is the difference between an answer fixture, a package-derived public shape, a documented-behavior fixture, and a project-method state machine?
18. When the terminal repository state says assessment is required, which specific authorization and identity records must exist before any assessment starts?

Answers should state claim scope, evidence owner, safe transition, and remaining unknown. Reciting a threshold without explaining why it belongs to a particular status owner is insufficient transfer.

## Exact evidence and boundary ledger

**Practicum boundary:** `practicum/registry.yml` defines four ready, unexecuted offline scenarios, synthetic namespaces, assertions, artifacts, forbidden effects, and runner expectations. Its fixtures test project contracts. They are not complete runtime emulators, captured traffic, hidden product specifications, or authorization to execute. The verified provisioning vertical-slice fixture is maintainer infrastructure and not a scored answer.

**Assessment boundary:** `assessments/contract.yml` and the public rubric define ready, unexecuted admission, machine thresholds, evaluator thresholds, attestations, critical failures, and status ownership. They do not appoint people, run an assessment, validate novelty, or award a learner result by existing in the repository.

**Exact-package boundary:** `SRC-SDK-NPM-0.8.9`, `SRC-SDK-SOURCE-0.8.9`, `SRC-CODE-NPM-0.32.11`, and `SRC-CODE-SOURCE-0.32.11` identify the static baseline. Compilation can support compatibility with declarations used by submitted code. It does not establish backend acceptance, account availability, protocol ordering, persistence, reconnect, tool locality, sandbox lifetime, authorization, or operational reliability.

**Project-method boundary:** stable operation keys, controller leases and budgets, effect classifications, ambiguity stops, synthetic authoritative snapshots, improvement transitions, dossier format, and assessment separation come from `SRC-DESIGN-SYNTHESIS` and `SRC-PRODUCTION-HEURISTIC`. They are original governance methods. They are not Letta endpoints, fields, callbacks, transactions, evaluators, or certification services.

**Machine/evaluator boundary:** deterministic gates establish facts about exact artifacts under declared runner conditions. An independent evaluator supplies architecture and transfer judgment. An integrity reviewer decides whether novelty, aids, retries, contamination, and independence support that judgment. No actor inherits another’s authority merely because all evidence appears in one dossier.

## Explicit runtime, certification, and production non-claims

No live scenario, learner attempt, evaluator run, model call, agent operation, session, queue, approval, tool, MCP server, computer, sandbox, file transfer, external effect, promotion, rollback, deployment, or runtime canary is claimed here. No event ordering, replay, durability, reconnect, identity uniqueness, idempotency, cleanup, isolation, or security property was observed. Synthetic success cannot establish account entitlement or hosted availability.

The repository does not offer a general certification service and this module awards no label. Machine gates cannot certify architecture, transfer, integrity, runtime, or production. Evaluator attestation cannot certify runtime behavior or production readiness. Integrity verification establishes assessment provenance only within its recorded scope. Curriculum completion, repository publication, a commit, a digest, or a high score is not professional licensure, organizational authorization, or security compliance.

Production qualification is implementation- and environment-specific. It would require separate accountable evidence for topology, credentials, tenancy, privacy, threat controls, incident response, observability, backup and restore, capacity, cost, change management, rollback, dependency operation, and real effect reconciliation. Even a separately authorized runtime observation would apply only to its exact operation, tuple, target, environment, time, and effects; it would not automatically production-qualify a deployment.

## Terminal handoff: STOP / ASSESSMENT_REQUIRED

MOD-13 is the end of the read-only curriculum path. The correct terminal action is **STOP**. Do not infer permission to compile, execute fixtures, inspect a host, install packages, use credentials, contact a model or service, create an agent, run an evaluator, perform a canary, publish a result, or deploy. Preserve the reader’s statuses unchanged.

Any move from study to assessment is **ASSESSMENT_REQUIRED** and needs separate explicit authorization. Before starting, an administrator must bind the exact release and lock digest, learner and environment identities, access mode, fresh mission, protected perturbations, allowed aids, time limit, retry policy, disposable runner controls, evaluator identity and independence, integrity reviewer, effects boundary, stop conditions, and artifact custody. Material drift requires renewed approval.

If those records are absent, contradictory, exposed, or unsafe, remain stopped. If an authorized assessment later completes, report only statuses owned and evidenced by that process, with digests and non-claims. Runtime canaries and production qualification remain later, separate gates. There is no automatic transition from reading to assessment, from assessment to execution, or from execution to production.
