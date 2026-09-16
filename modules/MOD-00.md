# MOD-00 Contract Evidence and Release Discipline

| Metadata | Value |
|---|---|
| Status | ready |
| Prerequisites | none |
| Capability IDs | CAP-EVIDENCE-RELEASES |
| Evidence and claim IDs | LMB-VERSION-001; LMB-VERSION-002; LMB-CURRICULUM-001; LMB-READER-001; LMB-LIFECYCLE-001; SRC-DOCS-20260916; SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-CODE-NPM-0.32.11; SRC-CODE-SOURCE-0.32.11; SRC-DESIGN-SYNTHESIS; SRC-PRODUCTION-HEURISTIC |
| Version IDs | VER-AGENT-SDK-0-8-9; VER-SDK-DECLARED-RUNTIME-0-32-11; VER-STANDALONE-0-32-11; VER-HOSTED-RUNTIME-UNKNOWN |
| Discrepancy IDs | DISC-VERSION-001; DISC-CREATE-OPTIONS-001; DISC-SDK-REFERENCE-EXPORTS-001; DISC-MEMORY-TRANSITION-001; DISC-SKILL-PARTIAL-SUCCESS-001; DISC-RECONNECT-OWNERSHIP-001; DISC-REPOSITORY-PARTIAL-SUCCESS-001; DISC-SANDBOX-LIFETIME-001; DISC-QUERY-TOPOLOGY-001; DISC-PORTABLE-ENTRY-001; DISC-CODE-0-32-11-LIFECYCLE-001; DISC-CODE-0-32-11-CHANNELS-001 |
| Pointer IDs | PTR-START-001; PTR-LEGACY-001; PTR-NEXT-PHASE-001 |
| Project-method sections | Evidence ledger; claim envelope; discrepancy disposition; fail-closed decision procedure; release and errata workflow; dossier artifact |
| Source use | independently-restated; original examples |

## 1. Learning contract and prerequisites

This module teaches a discipline before it teaches an API: how to decide what may be said, built, tested, maintained, or withheld. By the end, you should be able to classify evidence without promoting it, bind a claim to a precise release envelope, handle disagreement among sources, and produce a release decision that fails closed when evidence is missing. You should also be able to explain why a successful static check is not a runtime observation, why a runtime observation is not production qualification, and why a project safety method must not be presented as a Letta feature.

There are no curriculum prerequisites. The functional prerequisites are narrower and more important: you must be able to read structured records, distinguish identity from interpretation, and preserve an unknown instead of filling it with a plausible guess. You do not need prior Letta knowledge. This module supplies the vocabulary used by all later modules, so confidence without traceability is a liability rather than an advantage.

The teaching mode is read-only. Reading this lesson grants no authority to install packages, inspect a host, use credentials, call an API or model, create or mutate an agent, run an evaluator, execute a canary, deploy, publish, or alter release state. Those actions belong to separate authorization domains. Even integrity verification is an action rather than a property conferred by reading a digest. A learner may design a command or dossier field for later use, but must not treat the design as permission to execute it.

The canonical implementation lane for the curriculum is Agent SDK with Node in a Local topology; Cloud is a contrast topology. Direct App Server protocol, Remote Client, REST, ACP, browser or mobile entry points, and other adjacent surfaces are selection literacy unless a later release explicitly promotes them. This is a project curriculum decision, not a claim that one surface is universally superior or that other surfaces lack capabilities.

A successful review of this module should demonstrate transfer. Given an unfamiliar assertion such as “reconnect always replays the interrupted turn,” you should ask: which surface, exact artifact, backend, topology, target, date, and observation supports “always”? If those dimensions are absent, the correct output is not a polished explanation. It is a narrowed static statement, an opened discrepancy, or `unknown-not-tested`.

## 2. Why this matters to an autonomous-agent builder

An ordinary library mistake may fail one request. An evidence mistake in an autonomous controller can become policy. If a builder assumes an exported option is accepted everywhere, a controller may repeatedly submit invalid creation requests. If it assumes disconnect means failure, it may blindly resend an operation that already caused an external effect. If it confuses an attractive model response with verified delivery, it may close a work item while the intended recipient received nothing. Autonomy multiplies the consequences of unsupported inference because the inference can govern retries, permissions, schedules, promotion, and recovery without a human examining every step.

Release discipline is therefore safety architecture. Controllers need accurate ownership and uncertainty; maintainers need change impact; evaluators need evidence class; production owners must know that static, fixture, and runtime outcomes alone do not qualify credentials, tenancy, backups, incidents, or capacity.

Evidence discipline prevents both overclaiming and needless paralysis. Separation permits stable project methods to be taught while unknown product behavior remains unknown. A project rule such as “stop after losing a lease” does not claim that Letta supplies that lease. A package export does not establish backend acceptance, and a discrepancy can narrow one claim without blocking unrelated lessons.

Maintenance cost is also a design input. A claim surface too broad to revalidate drifts into false precision. Reduce claim-bearing scope, retain adjacent features as awareness, and spend capacity on the bounded graduate claim.

This discipline creates inspectable trust. “Current,” “supported,” “verified,” and “ready” are incomplete unless they name an axis. Replace them with dated pages, exact artifacts, scoped observations, evaluated artifacts, or qualification for one implementation and environment.

## 3. Conceptual model and vocabulary

### 3.1 The evidence axes

Treat evidence as a set of independent axes, not a ladder on which every higher-looking item absorbs the lower ones.

**Official documentation snapshot** records what an official page described at a retrieval date and revision. It supports documented-current statements within the page's scope. An index hash covers the index body, not every linked page. Documentation may communicate intended supported use, but it does not prove that a selected target behaved that way, that an account is entitled to the feature, or that every public package export appears in an overview.

**Exact SDK artifact** records immutable package metadata, integrity, declarations, and a corresponding source tag or commit. It supports statements about public shape and static implementation evidence for that exact package. It does not prove that any backend accepted a request or emitted events in a particular order.

**SDK-declared runtime artifact** is the runtime dependency declared by the SDK. It must remain distinct from an independently selected runtime, because dependency context is part of interpretation. Artifact identity can match another lane while the claim boundary remains separate.

**Standalone runtime artifact** records the independently interpreted runtime package. It may have the same package name, version, integrity, and source commit as the SDK-declared lane. Equality of bytes does not collapse questions such as how the artifact was selected, integrated, configured, or observed.

**Hosted or selected runtime observation** is evidence created only by a separately authorized operation against a named target. A useful record binds operation, tuple, backend, topology, environment, target identity, timestamp, effects, cleanup, stop conditions, and result. This curriculum has no such observation for the baseline, so hosted behavior is `unknown-not-tested`.

**Project fixture or simulation** is an original teaching artifact that evaluates a project invariant. It can demonstrate that learner code handles a synthetic partial-success record or stops on ambiguity. It cannot establish event ordering, durability, replay, approval behavior, or cleanup in a real runtime.

**Learner or evaluator result** reports competence against declared material and conditions. Compilation, offline conformance, architecture review, transfer, and assessment integrity remain separate outcomes. Passing an exercise cannot manufacture product evidence.

**Production qualification** applies to one implementation and environment. It addresses matters such as supervision, credentials, tenancy, recovery, observability, backups, rollback, capacity, cost, privacy, and incidents. It is not a badge inherited from curriculum publication, package inspection, a canary, or learner success.

Never silently promote one axis into another. Correlation is not promotion. If declarations, source, and docs align, they strengthen a static statement; they still do not become a runtime observation.

### 3.2 The exact baseline tuple

The exact package baseline is `@letta-ai/letta-agent-sdk@0.8.9` with its declared `@letta-ai/letta-code@0.32.11`, plus standalone `@letta-ai/letta-code@0.32.11` as a separate lane. In compact form, the package tuple is **0.8.9/0.32.11**. The two Code lanes share artifact identity in this release but are retained separately. The hosted runtime version is unknown and untested. The release cutoff is 2026-09-16. Node `>=22.19.0` and TypeScript `5.9.3` describe the compile slice toolchain; they do not describe an observed runtime target.

“Exact” means more than a version string. The records bind package name, version, integrity, source tag, source commit, and dependency relation. A later package with a similar API is not covered. An older tuple used during planning is historical drift input, not an alternate supported baseline. `DISC-VERSION-001` records that the tuple advanced through earlier candidates before static resolution on 0.8.9/0.32.11. This history demonstrates why “latest” must mean latest exactly verified at a named cutoff, never timelessly current.

Each release supports one exact tuple. A newer, older, modified, hosted, or alternate-topology submission needs compatibility preflight and its own bounded conclusion. Version equality also does not imply topology parity. Local and Cloud can involve different execution placement, account capabilities, lifecycle ownership, and external dependencies even when client artifacts match.

### 3.3 Docs, source, runtime, and project method

Four categories are commonly blended in weak technical prose.

A **docs statement** says, in original words, what a dated official page describes. A **source or package statement** says what an immutable artifact declares or statically implements. A **runtime statement** says what was observed under a scoped execution record. A **project-method statement** prescribes how this curriculum wants a controller to behave.

Consider the rule “after an uncertain external write, look up authoritative state before retrying.” This is sound project-owned effect governance. It is not evidence that an SDK automatically deduplicates the write, supplies a transaction ledger, or performs compensation. Conversely, finding a helper or result type in package declarations is product-shape evidence, not a requirement that every curriculum design use it.

Labeling permits a lesson to combine a dated documented concept, exact static package shape, and an original controller state machine without confusing ownership. State unobserved runtime behavior directly rather than implying it through an example.

### 3.4 Claims, non-claims, and claim envelopes

A **claim** is a bounded statement backed by registered evidence. Its envelope includes surface, package or page identity, versions, backend, topology, date, and classification. It also names discrepancies and recheck triggers. A claim is only as strong as its weakest omitted dimension.

A **non-claim** identifies a tempting inference that the evidence does not support. Non-claims are not defensive boilerplate. They are part of the instructional contract. For the baseline, exact artifact evidence does not prove live SDK behavior; standalone artifact evidence does not prove SDK-declared or hosted behavior; no runtime canary was performed; no hosted version was observed.

A useful test is to write the statement and its shadow together. Claim: “The release records an exact Agent SDK 0.8.9 artifact and Code 0.32.11 artifact.” Shadow: “No package was executed by this statement.” Claim: “The curriculum chooses Agent SDK as its mandatory path.” Shadow: “This is a curriculum decision, not a Letta product guarantee.” If the shadow feels surprising, the original sentence was probably too broad.

A claim registry controls freshness and impact by linking changed evidence to affected claims, capabilities, examples, and prose. If a necessary fact lacks a registered source or pointer, open a discrepancy or withhold it.

### 3.5 Discrepancies and unknowns

A **discrepancy** is a first-class record of tension between evidence or between an attractive design interpretation and a narrower implementation reality. It contains the competing values, status, resolution if any, runtime-canary state, and claim effect. It is not an invitation to average two sources.

The available dispositions form a practical vocabulary. **Historical-only** means a resolved earlier value remains useful as drift history but no longer supports current guidance. **Safe-subset-only** means teach only the intersection that remains defensible. **Awareness-only** means teach recognition and selection questions without implementation guidance. **Blocks-runtime-claim** means static material can be discussed, but no live behavior claim may pass until scoped evidence resolves the issue.

Examples include exported creation options whose acceptance is backend-qualified; docs overviews that omit package exports; compatibility memory fields that should not all be taught as greenfield defaults; skill or repository operations with possible partial success; reconnect semantics whose ownership differs by surface; sandbox lifetime depending on options and topology; query requirements hidden by a compact helper; and root versus portable entry-point differences. These are not minor editorial inconveniences. Each changes what a safe autonomous controller may assume.

An **unknown** is valid when it names why: not tested, unspecified target, stale evidence, open conflict, or absent authority. “Insufficient evidence” is often the most accurate answer.

### 3.6 Status axes

Status is orthogonal. Keep at least these axes separate:

- content: whether curriculum material is unavailable, a release candidate, available, stale, or withdrawn;
- learning: whether a learner has started or completed the path or formative work;
- architecture: whether a design is unassessed, a candidate, independently verified, or failed;
- implementation: whether code is unassessed, compile verified, offline-conformance verified, or failed;
- transfer: whether novel work is unassessed, independently verified, failed, or invalidated;
- assessment integrity: whether conditions are unverified, attested, compromised, or invalidated;
- runtime: whether a named claim is planned, observed, passed, failed, stale, or withdrawn;
- production: whether one implementation and environment are qualified, rejected, or not qualified.

Repository revisions may use narrower stage labels, but the invariant is unchanged: no axis silently promotes another. A file can exist while content is draft. A compile-verified example does not make curriculum content available. Publication does not validate runtime behavior. A runtime pass does not prove learner transfer. Production qualification is not assigned to a learner in the abstract.

Avoid an unqualified label such as “Master Builder Ready — Verified.” If a future program uses a label, it must name release, exact tuple, verification mode, evaluator, artifact digests, and non-claims. Precision protects both the learner and downstream users.

## 4. Implementation and design workflow

Use the following workflow whenever authoring a lesson, designing a controller operation, reviewing an example, or preparing a release.

**Step 1: State the decision.** Write the smallest actionable question. “Does reconnect work?” is too vague. “May a Local controller on tuple 0.8.9/0.32.11 automatically resend an interrupted effectful turn after transport loss?” exposes surface, tuple, topology, and consequence.

**Step 2: Classify the statement.** Decide whether it is a product fact, exact-package fact, runtime observation, project method, learner result, or production claim. If a sentence contains more than one class, split it.

**Step 3: Bind the evidence envelope.** Record source IDs, claim IDs, version IDs, retrieval or observation date, backend, topology, and target. For volatile facts, include recheck triggers. For a project method, identify the project source and explicitly deny product ownership.

**Step 4: Inspect relevant discrepancies.** Search by capability and affected claim, not merely by keyword. Apply the registered claim effect. A safe-subset discrepancy narrows the design. An awareness-only discrepancy prevents implementation teaching. A blocks-runtime-claim discrepancy leaves live behavior unknown even when source looks persuasive.

**Step 5: Write claim and non-claims together.** State what the evidence supports, then list the strongest plausible overextensions it rejects. Include authority boundaries: a page or package record does not permit execution.

**Step 6: Decide fail closed.** If identity, scope, freshness, authority, or conflict handling is incomplete, stop the affected action. Valid outputs include `needs-current-reference`, `insufficient-evidence`, safe-subset design, awareness-only treatment, compatibility preflight required, or release blocked. Fail closed does not require abandoning unrelated work.

**Step 7: Separate artifact checks.** Static validation can inspect schemas, reciprocal references, compilation, fixtures, cold-reader behavior, source use, secrets, links, and integrity records. Runtime canaries require separate authorization and records. Production review requires a still broader implementation-specific dossier.

**Step 8: Record status per axis.** Update only the axis justified by the evidence. If compilation succeeds, set an implementation status; do not alter runtime or production status. If a docs hash changes, mark affected claim rows stale; do not invalidate unrelated project methods automatically.

**Step 9: Review source use and licensing.** Verify that prose is independently restated and examples are original. If material uses another mode, block publication until an accountable license decision records scope, license, notices, attribution, and rationale.

**Step 10: Prepare maintenance hooks.** Every volatile claim needs an owner, freshness class, and recheck condition. Package changes trigger tuple review. Normative page changes trigger affected-claim review. Security or deprecation signals trigger a fail-closed banner pending retain, withdraw, or patch decision.

This process produces a traceable record even when the answer is “no claim,” showing that uncertainty arose from disciplined scope.

## 5. Worked example: the Atlas release decision

A fictional maintainer is reviewing an original controller lesson called Atlas. The draft says: “When the network disconnects, the SDK safely resumes the turn, so the controller may resend the request if no final message appears.” No command has been run, and the maintainer has only repository evidence.

First, the maintainer decomposes the sentence. “The SDK resumes the turn” is a runtime lifecycle claim. “The controller may resend” is a project policy with a potential external effect. “No final message appears” is an observation rule that assumes event completeness. Three different assertions were hidden inside one sentence.

Second, the maintainer binds the baseline: Agent SDK 0.8.9, SDK-declared Code 0.32.11, Node/Local primary lane, no named target, and no runtime observation. Exact source can reveal lifecycle-related code shape, but the hosted or selected runtime axis remains unknown.

Third, the discrepancy review finds `DISC-RECONNECT-OWNERSHIP-001` and `DISC-CODE-0-32-11-LIFECYCLE-001`. Both block runtime claims. Their summaries indicate that recovery ownership varies across SDK session, App Server listener, transport, execution owner, and version. The maintainer may not select whichever static fragment makes the draft convenient.

The claim is therefore rejected. The lesson is rewritten as project method: “After connection loss, classify the operation state as uncertain. Do not infer failure from missing client output. Before any retry, recover or query authoritative state through a topology-specific mechanism whose behavior is separately evidenced. Stop if completion or effect state cannot be distinguished.” The accompanying non-claims say that no reconnect, replay, approval recovery, event ordering, or runtime persistence was observed for the baseline.

Now trace the controller's project-owned state machine. Atlas records intent `I-204`, request key `K-77`, effect class `compensatable`, and lease expiry at a hypothetical logical time. It enters `submitted-unconfirmed`. A transport-loss fixture arrives. The state becomes `outcome-uncertain`, not `failed`. Blind resend is forbidden. A synthetic lookup fixture returns two plausible external records, both lacking a unique correlation key. The controller enters `ambiguous-stop`, preserves both identities, and requests supervised reconciliation. It does not choose the newest record, because that would turn a heuristic into evidence.

This trace proves only that the original fixture and controller policy handle ambiguity according to the project method. It does not prove that the SDK emits such an event, that a real lookup endpoint exists for every effect, or that any backend supports exactly-once execution. The names are intentionally project-owned rather than disguised SDK events.

Suppose a reviewer then notices a newer package on a registry page. That fact does not automatically replace the tuple. It triggers package review. The release remains bound to 0.8.9/0.32.11 until exact metadata, dependency relation, source, exports, discrepancies, examples, and release gates are reassessed. If the high-impact change affects recovery, the seven-calendar-day release-response target guides triage, but it is a maintenance objective, not a guarantee of a patch within seven days.

Finally, status is recorded carefully. Atlas may become `compile-verified` if separately authorized static compilation succeeds. Its project fixture may become offline-conformance evidence. Runtime remains `not-tested` or absent because no canary ran. Production remains `not-qualified`. Content remains draft until factual, pedagogical, traceability, licensing, and cold-reader review pass. The example demonstrates that a useful lesson can emerge from refusing an unsupported product claim.

## 6. Failure modes, unsafe shortcuts, and recovery decisions

**Treating the docs index as all documentation.** An index digest identifies one body, not every linked page. Recovery: bind each normative page independently or narrow the statement to index presence.

**Equating an export with universal support.** Types may include values narrowed by backend validation, and reference pages may omit exports. Recovery: use exact declarations for shape, inspect registered restrictions, and teach only a safe subset.

**Collapsing equal artifacts into one lane.** SDK-declared Code 0.32.11 and standalone Code 0.32.11 share identity, but their evidentiary roles differ. Recovery: retain both version IDs and deny cross-lane behavior inference.

**Calling a package inspection a runtime test.** Source review, declaration extraction, compilation, and fixtures remain static. Recovery: use “declares,” “exports,” “compiles,” or “fixture-conforms,” never “works” without scoped observation.

**Generalizing from one topology.** Local behavior cannot establish Cloud, hosted, portable, direct protocol, or Remote Client parity. Recovery: attach topology to every observation and require compatibility preflight for another lane.

**Averaging a conflict.** Combining broad docs prose with narrow source behavior may create a statement supported by neither. Recovery: open or apply a discrepancy, then choose historical-only, safe-subset, awareness-only, or blocked treatment.

**Turning a fixture into product semantics.** Synthetic event ordering can teach a recovery policy while accidentally looking official. Recovery: use a project namespace, machine-label provenance, and state explicit runtime non-claims.

**Letting an agent govern its own authority.** Putting leases, budgets, promotion, or audit truth in model-editable memory permits self-extension. Recovery: keep authority and immutable decision state controller-owned. This is project safety guidance, not a product guarantee.

**Blind retry after uncertainty.** Missing output is not proof of failed execution. Recovery: move to uncertain state, look up authoritative identity, reconcile, compensate if defined, or stop. Never repeat an irreversible or ambiguous effect merely because a client disconnected.

**Status promotion by enthusiasm.** A polished module file may be called available; passing compilation may be called verified; a canary may be called production-ready. Recovery: update one status axis at a time and preserve non-claims at every handoff.

**Using “latest” without a cutoff.** The phrase decays immediately and conceals maintenance duties. Recovery: say “exactly verified at the 2026-09-16 cutoff” and bind identifiers.

**Silently editing a released bundle.** Replacing a file destroys digest-based reproducibility and makes old assessments uninterpretable. Recovery: preserve the bundle, publish a signed or versioned erratum against its digest, and issue a patch release or withdrawal when severity requires.

**Assuming project MIT terms absorb upstream material.** External packages remain under their own licenses, and official docs are not automatically project text. Recovery: summarize independently, write examples from scratch, preserve notices where required, and block unusual reuse for license review.

**Promising continuous maintenance.** A broad perpetual-current claim exceeds finite capacity. Recovery: define a support horizon target, response objective, and maintenance ceiling; reduce scope when rehearsal exceeds capacity.

**Proceeding with exposed credentials or unexpected scope.** Evidence gathering never overrides safety boundaries. Recovery: stop, avoid reproducing the secret in reports or diffs, and seek separate authorization through the governing process.

## 7. Release discipline, support horizon, and maintenance

A release is a bounded evidence package, not a timeless promise. Its manifest should bind curriculum revision, exact tuple, docs cutoff, source identities, toolchain, primary and contrast lanes, capability digest, discrepancies, practicum and validator versions, and checksums. It must also state dependency and licensing blockers, runtime status, and explicit non-claims.

The support horizon target is the current minor line plus one prior minor line. This is a maintenance goal, not a shipped guarantee. The base release still certifies only its exact tuple. Supporting a prior line requires evidence and compatibility treatment; the phrase “support horizon” must not be used to imply that every operation has already been revalidated there.

For a high-impact upstream change, the desired release-response interval is seven calendar days. “Response” means accountable triage and a decision path: retain with rationale, mark stale, withdraw, or prepare a patch. It does not promise full remediation, upstream repair, or publication in seven days. The monthly refresh ceiling is eight maintainer hours. If representative drift work exceeds that budget, maintainers should narrow claim-bearing scope, reduce duplicated prose, or demote peripheral material to awareness. They must not preserve an unaffordable appearance of currency.

Freshness is event-driven as well as release-driven. A selected package or dependency change blocks a candidate pending tuple review. A changed normative docs hash marks linked claims stale until reviewed. A new adjacent page begins as review-pending and becomes nonblocking only after a named owner records why it does not affect the bounded claim. A security, licensing, or deprecation signal produces a fail-closed warning until an accountable decision exists. Every release cutoff also receives a full manual review.

Maintenance should compare both SDK entry points, claim-bearing members, discrepancies, examples, and prose impact. Static gates include schemas, reciprocal references, exact-lock compilation, fixtures, legacy boundaries, source use, secrets, links, cold-reader traversal, clean-copy behavior, and integrity generation. Independent factual, pedagogical, traceability, licensing, and code review remain necessary even when automation passes.

The current manifest also demonstrates that “compile-verified” can coexist with “publication blocked.” Its compile-only dependency closure carries known upstream advisories and incomplete transitive license metadata. A successful compile does not cancel dependency risk. Release discipline permits multiple truths to remain visible rather than compressing them into one green or red badge.

### Immutability and errata

Once published, a release bundle, tag, and assets are immutable. Corrections are separate signed or versioned errata records that name the affected release digest, describe scope and severity, identify replacement guidance, and preserve review history. A reader can then reconstruct what was originally assessed and what was later corrected.

A serious API, security, or licensing error requires withdrawal and a patch release rather than mutation of the old bundle. Withdrawal is not historical erasure. The old digest remains identifiable as withdrawn, preventing it from being mistaken for current material while preserving auditability. Minor wording corrections can be errata when they do not change the assessed contract; claim changes require stronger treatment.

Release immutability preserves the meaning of exact digests cited by evaluator reports, learner artifacts, and production designs. Reproducibility is both an evidence and fairness property.

## 8. Source use and licensing boundaries

This module uses independently restated facts and original examples. That pattern governs later authoring. Official documentation may be linked and summarized in original language. Exact public package names, exports, methods, fields, result names, and restrictions may appear in compact structural summaries. A mechanical ledger may record names and declaration kinds. None of these permissions authorizes copying implementation bodies, source comments, declaration text, tests, diagrams, or substantial prose.

Short quotation is exceptional. Use it only when exact wording matters, keep it minimal, identify publisher, title, canonical URL, version or retrieval date, and preserve required notices. Any broader copying or vendoring requires a separate reviewed license decision before publication.

`@letta-ai/letta-agent-sdk` and `@letta-ai/letta-code` are external Apache-2.0 dependencies. Their versions, integrity values, tags, commits, and licenses are evidence; they are not project source. Dependencies remain governed by their own terms even when installed under separate maintainer authority. The project's MIT license covers original project text and code unless another notice says otherwise. It does not relicense upstream documentation, declarations, examples, assets, or notices.

Attribution is not a substitute for permission, and open source code licensing does not automatically license documentation, logos, trademarks, or brand assets. Do not use presentation that implies official endorsement. Do not remove copyright or NOTICE requirements. When provenance is uncertain, omit the material or block publication for review.

Source-use discipline also improves pedagogy. Original examples expose project ownership without inheriting upstream assumptions, while independent restatement preserves limitations and distinguishes product facts from project method.

## 9. Dossier artifact for later production

Under separate execution and assessment authority, the learner can produce an **Evidence and Release Decision Record**. It should be a normalized artifact, not eight loosely synchronized documents. For each decision, record:

- decision ID, author, reviewer, date, and curriculum release digest;
- exact claim text and classification;
- surface, backend, topology, target, and operation scope;
- package tuple and version IDs;
- source, claim, capability, discrepancy, and pointer IDs;
- evidence cutoff and freshness triggers;
- non-claims and authority exclusions;
- discrepancy disposition and unknowns;
- proposed controller rule, owner, and safety rationale;
- static check result, fixture provenance, and learner/evaluator status axes;
- runtime record link or `unknown-not-tested`;
- production qualification link or `not-qualified`;
- release decision: retain, narrow, awareness-only, stale, block, withdraw, or patch;
- maintenance owner, response target, estimated effort, and budget impact;
- source-use mode, license review state, notices, and attribution;
- errata or supersession links.

A compact decision line might read: “Automatic resend after disconnect: blocked for runtime claim; project method requires uncertain-state reconciliation; tuple 0.8.9/0.32.11; Local design lane; no target observation; discrepancies DISC-RECONNECT-OWNERSHIP-001 and DISC-CODE-0-32-11-LIFECYCLE-001.” That line is more useful than a page of confident but unbounded prose.

The dossier is designed now and produced later. This lesson does not authorize fetching sources, compiling code, running fixtures, executing canaries, signing attestations, or publishing a release. When those activities are authorized, their records should be appended without rewriting earlier evidence history.

## 10. Formative review and transfer prompts

1. A declaration exposes a configuration field, while source validation narrows it on one backend. What claim can you safely teach, what discrepancy disposition applies, and what must remain unclaimed?

2. The SDK-declared and standalone runtime packages have identical version and integrity. Give two reasons to retain separate evidence lanes.

3. A learner's code compiles against 0.8.9 and passes an original recovery fixture. Which status axes may change, and which must not?

4. An official docs page changes after release, but the exact package does not. Describe the impact-analysis path without declaring the entire curriculum invalid.

5. A Local canary observes one reconnect outcome. Why does that not establish Cloud, hosted, portable-client, or production behavior?

6. Rewrite “the SDK reliably retries failed turns” into a bounded claim or a project method with appropriate non-claims.

7. The monthly drift rehearsal consumes eleven hours against an eight-hour ceiling. What should maintainers change, and why is silently exceeding the budget unsafe?

8. A minor factual correction is found in a published bundle. When is an erratum sufficient, and when should withdrawal plus a patch release occur?

9. Explain why a response target of seven calendar days is not an uptime promise or guaranteed patch deadline.

10. A copied upstream example is technically accurate and attributed. What additional questions must be answered before publication?

11. A reviewer cannot identify the runtime target or credentials boundary for a requested canary. What is the fail-closed decision, and what information would be required for reconsideration?

12. Construct a claim-and-shadow pair for a package export, a docs statement, and a project controller rule.

13. An evaluator calls a learner “production ready” after an offline practicum. Identify every unsupported status promotion in that phrase.

14. A new adjacent feature appears in official docs. Under what conditions can it remain nonblocking, and who must record the relevance rationale?

15. Why is `unknown-not-tested` a higher-quality answer than inference from source comments when deciding whether to repeat an uncertain external effect?

## 11. Source and evidence boundaries

The exact static baseline is supported by registered package metadata and immutable source records for Agent SDK 0.8.9 and Code 0.32.11, plus the dated official docs index. The curriculum path, evidence method, ownership rules, release budgets, and fail-closed procedure are project-owned synthesis. The package tuple is exact evidence, not evidence of execution.

No live call, model turn, agent creation, channel delivery, schedule, queue, reconnect, approval recovery, memory synchronization, tool effect, deployment, or canary is claimed here. No hosted runtime version, account entitlement, provider availability, event ordering, durability, replay, topology parity, security compliance, or production readiness is known from this module. Open discrepancies continue to narrow or block affected statements. The support horizon and response interval are goals, not guarantees.

The source lists are traceability aids, not grants of authority. If a current source becomes unavailable, retain stable project method where appropriate, mark volatile product facts stale or unavailable, and stop claim-bearing guidance that requires the missing evidence. Do not substitute web popularity, memory, or an older example for the registered source.

## 12. Handoff to MOD-01

You now have the contract for saying only what evidence supports and for stopping when authority or knowledge is incomplete. MOD-01, **Mission Autonomy and Acceptance**, uses that discipline to define a bounded mission, stakeholders, acceptance criteria, stop conditions, and failure budgets. Carry forward the evidence ledger and status axes: a mission statement is project intent, not proof that an agent can accomplish it; an acceptance test is not a runtime observation until executed under explicit authority; and neither curriculum work nor runtime success production-qualifies a deployment.

This module makes no product-runtime or production claim. It does not assert that any unobserved Letta operation works, that the 0.8.9/0.32.11 tuple is suitable outside its exact evidence envelope, or that any implementation is secure, reliable, compliant, available, or production ready.
