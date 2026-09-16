# MOD-01 Mission Autonomy and Acceptance

| Field | Value |
|---|---|
| Status | ready |
| Prerequisites | MOD-00 |
| Capability IDs | CAP-EFFECT-RECONCILIATION; CAP-TRIGGERS-DELIVERY; CAP-SUPERVISION-PRODUCTION; CAP-AUTH-TRANSPORT-SECURITY; CAP-CONCURRENCY-CONSISTENCY |
| Evidence IDs | SRC-DESIGN-SYNTHESIS; SRC-PRODUCTION-HEURISTIC |
| Project-method sections | Mission framing; autonomy envelope; acceptance model; AgentSpecification workflow |

## Learning contract and prerequisites

This module turns an attractive idea for an autonomous agent into a bounded specification that another builder, controller, reviewer, and operator can interpret consistently. The central artifact is an **AgentSpecification**: a project-owned design record that defines why an agent should exist, whose outcome it serves, what evidence counts as success, which actions are permitted, and when work must stop. The name is curriculum vocabulary. It is not a documented Letta API type, SDK interface, request body, or claim that a product object with this exact shape exists.

You should enter with MOD-00’s evidence discipline. Keep official documentation, exact package declarations, project methods, runtime observations, evaluator results, and production qualification on separate axes. In this first half, the substantive rules come from `SRC-DESIGN-SYNTHESIS` and `SRC-PRODUCTION-HEURISTIC`; they are project methods. They do not claim that Letta automatically supplies mission records, leases, budgets, evaluators, or supervisory policy. Later modules may connect parts of a specification to supported product surfaces, but no field introduced here should be passed to an SDK merely because it appears in the curriculum artifact.

By the end of this half, you should be able to distinguish a mission from a prompt, acceptance from a plausible response, autonomy from unlimited discretion, and a failure budget from permission to cause harm. You should be able to write an AgentSpecification that is testable without pretending every future operational detail is known. You should also know which unknowns block implementation, which may remain selection questions, and which require a human policy decision.

The teaching mode remains read-only. Nothing here authorizes package installation, host inspection, credential access, API or model calls, agent creation, tool execution, filesystem mutation, assessment, canaries, deployment, or publication. The workflow designs records for later use under separate authority. It makes no live claim about a backend, account, model, runtime, or deployment.

## Why mission framing matters

A prompt asks for behavior now. A mission defines the durable purpose and governing limits within which behavior may be requested. “Monitor our project and keep releases healthy” sounds useful, but it omits the stakeholder, source of truth, meaning of healthy, permitted effects, deadline, escalation path, and proof of completion. An agent could optimize that sentence by creating noise, hiding failures, spending without limit, or changing release state without approval. Fluency cannot repair an underspecified objective.

Autonomy magnifies ambiguity because the system can make several locally reasonable choices without a person inspecting each one. It may choose inputs, sequence steps, invoke tools, update memory, retry failures, or hand work to another actor. If “done” is defined only inside the same model context, the agent can mistake its narrative for evidence. If the agent can rewrite its own budget or acceptance criteria, a difficult task can expand until success becomes whatever happened. Mission framing places stable intent and authority outside adaptive model behavior.

A bounded mission enables recovery. After interruption, a controller needs to know whether the objective still matters, what may be repeated, what evidence exists, and whether any effect is uncertain. A durable specification provides invariants for judging a checkpoint.

Mission framing protects stakeholders from proxy optimization. A support agent measured only on short response time may close unresolved cases. A release agent measured only on publication may ship unreviewed text. A research agent measured only on quantity may collect irrelevant or sensitive material. Acceptance must therefore combine positive outcomes, quality thresholds, prohibited outcomes, and evidence from the owner of the relevant state. A concise mission is valuable only when paired with those controls.

Framing also separates product, project, and deployment. Supported product surfaces supply capabilities; the project decides their business purpose and authority; a deployment operates the application. This module defines the project specification, not product fields or production qualification.

## Conceptual model and vocabulary: mission, acceptance, and autonomy

### Mission

A **mission** is a stable statement of stakeholder value. It names the subject, outcome, domain, and reason for work, remaining meaningful across prompts. “Produce an evidence-backed draft release note for human review from approved change records” is a mission. “Read three files” is a task step; “be helpful” is not testable.

A mission must identify **stakeholders**: beneficiaries, accountable owners, affected parties, and approvers. These roles may differ. The person triggering work is not automatically the owner of every affected resource. Record whose interests govern tradeoffs and who resolves ambiguity. Avoid imaginary users such as “the business” when a real accountable role is required.

The mission also declares **prohibited outcomes**. These are states that invalidate apparent success: publishing without review, disclosing credentials, modifying source material, crossing tenants, exceeding a deadline, or representing a draft as approved. Prohibitions are not merely negative acceptance criteria. They are boundaries that stop or escalate work even when a positive target appears reachable.

### Objective, task, and plan

An **objective** is a bounded result contributing to the mission. A **task** is an assigned unit of work with inputs and completion conditions. A **plan** is a revisable sequence proposed to satisfy an objective. Keep them separate because plans should adapt while mission and authority remain stable. The model may propose a different plan after learning that an input is missing; it may not silently replace the objective or authorize a new effect.

### Acceptance criterion and evidence

An **acceptance criterion** is a falsifiable condition that must hold before the controller can classify the objective as satisfied. Good criteria state the observable, the expected condition, the evidence source, and any tolerance. “Draft is good” is not adequate. “The draft covers every approved change identifier, contains no unapproved claim, passes the declared structural checks, and is placed in the review queue with an acknowledgement” can be inspected.

An **acceptance evidence source** is the authority that can establish a criterion. Assistant prose does not prove external delivery. A tool return may not prove canonical effect state, and queue acknowledgement may prove intake rather than completed inference. Human approval requires recorded identity, scope, and decision. Match each criterion to its state owner.

A **terminal state** is the controller’s classification after reconciliation. Useful states include completed, rejected, cancelled, paused, escalated, and uncertain. “Model stopped speaking” is not a terminal business state. Completion requires all mandatory criteria and delivery obligations. Uncertain means available evidence cannot safely establish whether a consequential action occurred; it must not be disguised as failure and retried blindly.

### Autonomy and discretion

**Autonomy** is delegated discretion inside an explicit envelope. It may include choosing a plan, selecting among allowed read operations, ordering reversible steps, or proposing a memory update. It does not mean choosing the mission, granting credentials, widening tool access, extending budgets, approving an irreversible effect, evaluating its own improvement as sufficient, or promoting itself. A useful specification says both what the agent may decide and what remains controller-, supervisor-, or human-owned.

The **autonomy envelope** is the complete set of bounds around one mission class. It includes allowed inputs, data scope, tool classes, effect classes, approval requirements, execution locality constraints, budgets, deadlines, retry rules, stop conditions, escalation routes, and forbidden actions. An action outside the envelope is unauthorized even if technically possible or likely beneficial.

An **effect** is an externally meaningful state change. As a project method, classify effects as read-only, idempotent, compensatable, or irreversible. Classification guides approval and recovery but proves no service guarantee. Reconcile uncertain effects through an authoritative source before retry; a request key alone does not guarantee deduplication.

### Budgets, deadlines, and stop conditions

A **budget** caps consumption or exposure. Separate step, turn, tool/effect, retry, time, cost, and failure budgets. A **failure budget** counts tolerated classified failures before pause or escalation; it never permits violating a prohibition, repeating an uncertain effect, or ignoring security controls.

A **deadline** states when the objective ceases to be useful or authorized. A **timeout** bounds waiting for one operation. A timeout does not prove cancellation, and a passed deadline does not prove an in-flight effect did not happen. Both require observation and reconciliation. A **stop condition** blocks new action: acceptance already satisfied, cancellation confirmed, authority or lease lost, mandatory budget exhausted, deadline passed, required approval absent, target ambiguous, prohibited data encountered, or effect state uncertain. A **pause condition** permits later continuation after a recoverable dependency changes. An **escalation condition** requires judgment beyond delegated discretion.

### Work, improvement, and supervision loops

The Master Builder method separates three loops. The **work loop** pursues one bounded task. The **improvement loop** proposes a reversible change, freezes evaluation cases, and submits the candidate to independent judgment. The **supervision loop** controls authority, budgets, incidents, promotion, and rollback. Success in one loop grants no authority in another. An agent that completes a task may propose a better procedure; it may not declare that procedure evaluated, promoted, or production-ready.

## AgentSpecification design workflow

The AgentSpecification is a project dossier section written before provisioning. It uses domain language, not invented SDK arguments. When later implementation maps a decision to a documented product option, that mapping belongs in a separate version-scoped adapter or API card.

### 1. Record provenance and scope

Assign a project specification ID and revision. Name the author, reviewer, design revision, evidence cutoff, mission class, and status. State that execution requires separate authority. List assumptions and unknowns. Mark unresolved topology, credential ownership, or effect authority honestly rather than selecting convenient defaults.

### 2. Write the mission in one bounded sentence

Use the pattern: “For [stakeholder], produce or maintain [observable outcome] from [authorized inputs] so that [durable value], without [principal prohibited outcomes].” Remove implementation choices from the sentence. A model name, SDK constructor, queue, filesystem path, and deployment region are not the mission. If the sentence contains several independent outcomes or stakeholders with conflicting authority, split it into mission classes.

### 3. Define stakeholders and decision rights

Create a role table for requester, beneficiary, resource and data owners, approver, operator, evaluator, and incident contact. People may hold several roles, but rights remain distinct. Name the owner for admission, scope expansion, effects, acceptance, memory changes, promotion, cancellation, and retirement. Never assign every right to the agent.

### 4. Inventory authorized inputs and prohibited data

Describe input classes, provenance requirements, freshness, tenant or project boundary, validation rules, and source authority. Separate content the agent may read from content it may retain or disclose. Identify secrets, personal data, untrusted instructions, and cross-tenant material that must not enter prompts, memory, artifacts, or logs. Specify what happens when provenance is missing: reject, quarantine, request approval, or escalate.

### 5. State outputs and acceptance criteria

List each output’s format, destination class, quality constraints, and owner. Number acceptance criteria and identify each verification method and evidence source. Include checks for prohibited outcomes and delivery acceptance. Draft completion, review approval, publication, and stakeholder outcome are distinct states.

### 6. Draw the autonomy envelope

Enumerate decisions the agent may make, those requiring controller checks or a human, and those always forbidden. Define tool and effect classes conceptually; later modules select exact tools. Add locality, credential references, data scopes, and approved destinations without secrets. Exclude capabilities not required for acceptance.

### 7. Set budgets and temporal limits

Assign step, turn, tool/effect, retry, cost, elapsed-time, and failure limits with accountable owners. Define a mission deadline and narrower operation timeouts. State whether unused budget expires and who may grant a new attempt. The agent must not refill or reinterpret its own budgets. A retry budget is subordinate to authority, deadline, and uncertain-effect rules.

### 8. Define stop, pause, escalation, and terminal rules

Write controller-observable predicates. For every stop, state whether active work is cancelled, observed, reconciled, or left pending evidence. Name the escalation recipient and context. Define completion only from acceptance evidence, and include an uncertain state when effect truth cannot be established.

### 9. Separate mutable from immutable fields

Mission intent, prohibitions, original acceptance criteria, and authority basis remain immutable for an admitted work unit. Plans, checkpoints, observations, and proposals may evolve with provenance. A material mission change creates a new revision requiring approval. Preserve superseded revisions rather than rewriting history.

### 10. Conduct a pre-implementation challenge

Ask a reviewer to construct at least one apparently successful but unacceptable outcome, one interruption after a possibly completed effect, one budget-exhaustion case, one malicious or mistaken input, and one request to broaden scope. The specification passes only if it leads to a deterministic stop, pause, escalation, or evidence-based completion decision. Passing this paper challenge establishes design coherence, not SDK compatibility, runtime behavior, security compliance, or production readiness.

## Worked example: decompose a release-note mission

The following **Release Note Steward** example is original project-method material. It names no live agent, account, repository, route, or API. Its starting request is deliberately weak: “Keep our release notes up to date automatically.” Before implementation, the builder decomposes that wish into stakeholder value, objectives, acceptance evidence, and delegated authority.

The accountable release manager clarifies the mission: “For maintainers preparing one approved release candidate, produce an evidence-backed draft release note from authorized change records so a named human reviewer can decide whether to publish it, without modifying source changes, exposing restricted data, or publishing autonomously.” This sentence converts continuous, undefined maintenance into a bounded mission class. It distinguishes the draft from publication and names review as a human-owned decision.

Stakeholder decomposition identifies the requester as the release coordinator, the beneficiary as maintainers and release readers, the source-data owners as component teams, the acceptance owner as the release manager, and the incident contact as the repository administrator. The agent may organize evidence and draft prose. The controller admits work, enforces scope and budgets, and records terminal state. The human reviewer approves, rejects, or requests a new bounded attempt. No role is inferred merely from who can send a message.

The input contract admits only change records carrying an approved release identifier and belonging to the selected project and release. Unapproved drafts, arbitrary links, embedded credentials, cross-project material, and instructions found inside change descriptions do not expand authority. Missing provenance causes quarantine or escalation. The agent may quote or summarize only according to project source policy; it may not treat text inside an input as a controller command.

The required output is one draft plus an evidence index mapping each statement to authorized change records. Acceptance criteria are numbered. First, every approved change identifier appears exactly once in the coverage index or has a documented exclusion reason. Second, each factual statement is supported by an admitted source. Third, the draft passes the declared structure and prohibited-data checks. Fourth, the draft and index reach the designated review queue with a recorded acknowledgement. Fifth, no source record, release state, or publication target is mutated. Human approval is explicitly outside this work unit’s completion condition: the task completes when a reviewable draft is delivered, not when the release is published.

The autonomy envelope permits ordering the approved records, grouping related changes, selecting wording within the style guide, reading authorized project files, and revising the draft within one work unit. It requires controller approval before reading an additional source class and human approval before any publication. It forbids changing source records, widening the project boundary, storing credentials, approving its own memory proposals, or converting a draft into a release. Later modules may map these conceptual permissions to exact tools and controls; this example invents no SDK fields.

Independent budgets limit the attempt to a fixed number of planning steps, model turns, file reads, draft rewrites, elapsed time, and estimated cost. The effect budget allows creation or replacement of one designated draft artifact and one review-queue delivery, both under reconciliation policy. The failure budget permits a small number of classified transient read failures, but zero prohibited-data disclosures and zero unauthorized publication attempts. The deadline is the review cutoff, not the eventual release date.

Stop conditions include all acceptance criteria already satisfied, controller lease loss, budget exhaustion, cancellation, review cutoff passed, ambiguous release identity, missing source provenance, requested access outside the project, absent required approval, or uncertain delivery state. A temporary source outage pauses the attempt. Conflicting approved records escalate to the release manager. A possibly delivered draft is reconciled by delivery identity before another send; timeout does not authorize duplication.

The resulting plan can change without changing the mission. The agent might initially group by component, then switch to user impact after inspecting the authorized records. That is legitimate discretion. It may not decide that publishing is more helpful than drafting, double its turn budget, or remove the human review requirement. If stakeholders later request automatic publication, that is a new specification revision with a new risk and approval analysis, not an optimization within the current plan.

## Failure modes, unsafe shortcuts, and recovery decisions

These failures concern project specification and controller policy. They do not assert that a Letta product surface caused, detects, or repairs them.

### Vague goals

**Failure:** “Improve release quality” provides no bounded subject, output, evidence, deadline, or owner. The agent can continue gathering data and redefine improvement after seeing results. **Unsafe shortcut:** add a longer prompt full of adjectives while leaving success subjective. **Recovery:** pause admission, interview accountable stakeholders, write one observable mission outcome, define prohibited outcomes, and assign acceptance evidence. If stakeholders cannot agree, record the mission as unresolved rather than provisioning an agent to discover policy through action.

### Proxy metrics replacing value

**Failure:** the specification rewards number of changes summarized or speed of delivery. The agent can maximize coverage by including irrelevant items or maximize speed by omitting verification. **Unsafe shortcut:** treat a dashboard threshold as acceptance. **Recovery:** identify the stakeholder outcome behind the metric, add quality and exclusion criteria, and test an apparently high-scoring but harmful output. Retain metrics as observations or bounded indicators, never as sole proof when they can diverge from value.

### Unbounded work

**Failure:** “Monitor continuously and fix whatever arises” has no work-unit boundary, budgets, deadline, or completion state. Resource use and authority expand with every discovery. **Unsafe shortcut:** rely on the model to stop when satisfied. **Recovery:** split the mission into admitted work units triggered by validated events, give each immutable intent, independent budgets, lease, and deadline, and require checkpointed continuation. Broad monitoring may remain a controller concern; each agent attempt stays bounded.

### Hidden authority

**Failure:** a tool, credential, writable directory, or requester identity silently determines what the agent may do. Technical access is mistaken for business authorization. **Unsafe shortcut:** state “use available tools as needed.” **Recovery:** inventory every effect class and resource owner, remove capabilities unnecessary for acceptance, name approval owners, and encode project and tenant scope outside model text. Where authority cannot be demonstrated, deny or escalate. Capability discovery never grants new mission authority.

### Model-editable budgets

**Failure:** budgets and stop conditions are stored only in a prompt or memory file the agent can revise. When progress is difficult, it grants itself more turns or reclassifies failures. **Unsafe shortcut:** instruct the model never to change the limits and trust compliance. **Recovery:** place authoritative counters, deadlines, leases, and policy versions in controller-owned state; present them to the model as constraints, not writable truth. A supervisor may issue a new approved work unit or revision. The original audit record remains unchanged.

### Missing stop or escalation behavior

**Failure:** the specification names risks but says nothing about what to do when one occurs. The agent encounters conflicting sources or uncertain delivery and improvises. **Unsafe shortcut:** use “ask for help if needed” without a recipient, response deadline, or safe holding state. **Recovery:** express stop, pause, escalation, and uncertainty as controller-observable predicates. Name the recipient, package the minimum redacted evidence, forbid new effects while authority is unclear, and specify whether active work is observed, cancelled, or reconciled.

### Outcome-versus-output confusion

**Failure:** creation of a polished draft is treated as proof that readers understand the release or that publication succeeded. The artifact, delivery, approval, and stakeholder outcome collapse into one status. **Unsafe shortcut:** accept assistant prose such as “release notes completed.” **Recovery:** define a ladder: artifact created, artifact verified, delivery acknowledged, human review decided, publication reconciled, and stakeholder outcome measured where appropriate. Assign each rung an authoritative evidence source. Complete only the rung promised by the mission; report later outcomes as separate work rather than retroactively inflating the claim.

Across all seven failures, recovery starts by stopping unsupported action, preserving original intent and observations, and returning authority to the accountable controller or human. The specification should make safe refusal and escalation possible before implementation. A richer model cannot compensate for missing governance, and a successful dry design review cannot establish runtime or production behavior.

## Dossier artifact: Mission and Autonomy Specification

Under separate implementation authority, produce a **Mission and Autonomy Specification** as the MOD-01 dossier artifact. It is a project-owned design record, not a Letta API payload and not evidence that an agent, runtime, route, credential, or deployment exists. Its purpose is to make mission intent reviewable before product configuration begins. Give the artifact a project ID, schema or template revision, author, accountable reviewer, approval status, evidence cutoff, and explicit `execution_authorized: false` unless a distinct authority record validly changes that status.

The first section states the mission in one bounded sentence, followed by stakeholders, objectives, prohibited outcomes, assumptions, and open policy decisions. For every stakeholder, record the role and decision rights rather than only a name. Distinguish requester, beneficiary, resource owner, data owner, effect approver, acceptance owner, operator, evaluator, and incident contact. If one person occupies several roles, preserve the logical separation. Record who can admit a work unit, broaden scope, change a deadline, approve an effect, accept an output, cancel work, or authorize another attempt.

The input register describes each authorized source class, its provenance requirement, freshness limit, project or tenant scope, permitted uses, retention rule, and rejection behavior. It separately identifies prohibited or sensitive classes. Use secret names or policy references only; never include credential values. For untrusted content, state that embedded instructions do not modify the mission or autonomy envelope. Include a decision for missing provenance: reject, quarantine, pause, or escalate. “Use anything relevant” is not an input policy.

The output and acceptance section names each artifact, state change, or delivery promised by the mission. For every criterion, record a unique criterion ID, observable condition, verification procedure, authoritative evidence source, tolerance, mandatory or advisory status, and failure disposition. Build an **acceptance ladder** when several owners are involved: artifact produced, artifact verified, delivery acknowledged, approval decided, external effect reconciled, and stakeholder outcome measured. Highlight the rung at which this mission ends. This prevents a draft from masquerading as publication or a response from masquerading as impact.

The autonomy-envelope section uses four decision classes: agent-discretionary, controller-checked, human-approved, and forbidden. Describe tool and effect classes conceptually without inventing product fields. For every allowed effect, record scope, destination, effect classification, approver, stable correlation requirement, verification owner, retry rule, and compensation or incident path. Include data, repository, filesystem, tenant, route, and execution-locality constraints where known. Unknown placement remains unresolved rather than silently becoming local or trusted.

The budget table includes separate limits for planning steps, turns, tool calls, consequential effects, retries, elapsed time, cost, and classified failures. Each row names the unit, initial limit, consumed-value authority, exhaustion transition, and person permitted to approve a new work unit. Zero-tolerance events such as credential disclosure or cross-tenant access are prohibitions, not ordinary failure-budget entries. State that budgets are controller-owned and immutable to the subject attempt. A model may report consumption or request escalation; it cannot refill, reinterpret, or reset a counter.

The temporal and transition section distinguishes mission deadline, operation timeout, controller lease expiry, and evidence freshness. Write stop, pause, escalation, cancellation, uncertain, and completion predicates. A stop predicate blocks new action; it must also say how active work is observed or reconciled. A pause records the dependency whose change permits continuation. An escalation names the recipient, urgency, minimum redacted evidence package, and effects forbidden while awaiting judgment. Completion cites acceptance criterion IDs, never general confidence. Uncertain state records the missing authoritative fact and prohibits unsafe retry.

Add a risk register with at least mission ambiguity, proxy optimization, excessive authority, sensitive-data exposure, uncertain external effect, budget overrun, stale inputs, unavailable approver, and acceptance-evidence failure. For each risk, identify cause, affected stakeholder, likelihood and impact rationale, preventive control, detection signal, containment, recovery owner, and residual risk acceptance. Numerical scores may help triage but cannot replace accountable judgment. A high total does not automatically reject work, and a low total does not waive a prohibition.

Finish with change control. Mark mission intent, prohibitions, original acceptance criteria, and admitted authority as immutable for a work unit. Permit versioned plans, observations, checkpoints, and proposals. Define changes requiring a new revision and approval. Record challenge outcomes for apparent success with harm, a possible effect, exhausted budget, hostile input, absent approver, and broader scope. Sign-off establishes only readiness for the next gate.

## Formative transfer questions

1. A team proposes, “Make customer support excellent.” Rewrite it as a bounded mission without selecting a model or tool. Who owns acceptance, and what prohibited outcome prevents a fast but harmful optimization?
2. An agent creates a correct report but sends it to the wrong tenant. Which positive criterion may have passed, which prohibition failed, and why must overall completion be denied?
3. A dashboard rewards tickets closed per hour. Construct an apparently successful behavior that harms the stakeholder. What acceptance evidence and counter-metric would reveal the proxy failure?
4. A work unit has ten turns remaining but its controller lease expires. May the agent continue because budget remains? Identify the authority owner and required transition.
5. A tool call times out after requesting an external publication. Which fact is unknown? Why are a retry budget and a correlation key insufficient by themselves, and who must reconcile the effect?
6. The model edits a memory file to increase its cost budget after discovering more work. Which part may be a useful proposal, which part has no authority, and where must the real budget live?
7. Define separate stop, pause, and escalation responses for an unavailable source, an expired deadline, and two contradictory approved inputs. Explain why one generic `failed` state loses recovery information.
8. A requester has valid application access but asks the agent to inspect another project. What evidence establishes input authority, and why does authentication alone not grant expanded scope?
9. A draft reaches a review queue, but no reviewer responds before the deadline. Which output and delivery criteria may pass? Should the work complete, pause, expire, or escalate under your mission definition?
10. Design independent budgets for a read-mostly research mission. Which budget constrains model reasoning, which constrains external exposure, and which prevents repeated transient failures from becoming an infinite loop?
11. An agent discovers that a broader rewrite would create a better artifact. When is changing the plan legitimate, and when does the change require a new mission revision and renewed approval?
12. A specification says publication requires human approval but does not identify an approver or holding state. What hidden operational risk remains? Write the missing escalation predicate.
13. The agent reports “all requirements met.” List the authoritative evidence needed before the controller can accept artifact quality, delivery, an external effect, and stakeholder outcome.
14. A zero-tolerance credential disclosure occurs during an otherwise successful task. Why should this be modeled as a prohibition rather than one consumed failure-budget unit? What containment comes first?
15. One manager owns mission acceptance and also evaluates an improvement proposed by the agent. Which separation still matters between work, improvement, and supervision loops, even when a person holds multiple roles?
16. A team wants to copy the AgentSpecification directly into an SDK creation call. Explain the product/project boundary and describe the evidence needed before mapping any project decision to a real option.

A strong answer identifies state and authority owners, not merely preferred behavior. It distinguishes remaining capability from remaining permission, a temporary dependency from a terminal prohibition, an output from its downstream outcome, and a recoverable failure from an uncertain effect.

## Source and evidence boundaries

The vocabulary, AgentSpecification workflow, example, dossier, budgets, transitions, three-loop separation, and recovery guidance are project methods supported by `SRC-DESIGN-SYNTHESIS` and `SRC-PRODUCTION-HEURISTIC`. `LMB-AUTONOMY-001` supports separating bounded work, improvement, and supervision. `LMB-SECURITY-001` supports keeping leases, budgets, effect authority, evaluation, promotion, rollback, and audit state outside model-editable memory. These are governance heuristics, not SDK guarantees.

This module introduces no SDK method, request field, tool name, model handle, backend guarantee, or hosted feature. `AgentSpecification`, its role table, risk register, acceptance ladder, and transitions belong to this project. Future mappings require exact registered evidence at the relevant cutoff.

No scenario was executed: no agent, session, model, tool, effect, runtime-enforced budget, or acceptance result was observed. Examples establish conceptual consistency only. Persistence, permission, abort, cost, deduplication, disconnection, and status behavior remain version- and topology-scoped. Unsupported behavior stays `unknown-not-tested` pending separately authorized evidence.

## Explicit non-claims

This module does not claim that Letta supplies an AgentSpecification object, mission controller, business authorization system, lease store, budget ledger, risk register, evaluator, promotion gate, or complete supervision plane. It does not claim that wording a prohibition causes a runtime to enforce it or that a model will obey limits without external controls. It does not claim that any product option corresponds one-to-one with a dossier field.

It does not claim that assistant confidence proves acceptance, that queue intake proves delivery, that a tool return proves an external outcome, or that a timeout proves cancellation. It does not claim that possession of an identifier or credential grants mission authority. It does not claim that a retry key guarantees idempotency, that a failure budget permits harm, or that remaining budget permits work after authority, lease, approval, or deadline is lost.

Completing the artifact does not authorize execution and does not establish SDK compatibility, live runtime behavior, hosted availability, model suitability, account entitlement, security compliance, operational reliability, learner competence, or production qualification. A design review can approve a specification for the next gate; it cannot promote static reasoning into runtime or production evidence.

## Handoff to MOD-02

MOD-01 has defined **why** bounded work exists, **what** outcome is acceptable, **how much** discretion is delegated, and **when** authority must stop, pause, or escalate. MOD-02, **Objects Ownership and Locality**, asks where those decisions attach. It will distinguish agent, conversation, virtual default, session, turn or run, message, SDK client, controller record, runtime or computer, memory, files, repositories, credentials, tools, routes, channels, and deployment.

Carry the Mission and Autonomy Specification forward. For every mission field, ask which object persists it, which host contains authoritative state, who may mutate it, and who reconciles it after partial success. Do not assume that the agent owns its budget because it sees the limit, that a session owns the mission because it carries a turn, or that a runtime owns acceptance because it produced an output. MOD-02 will turn these authority assignments into explicit persistence, locality, ownership, and recovery matrices.

The handoff remains read-only. No product object has been created, no topology selected, no controller deployed, and no mission accepted for live execution. Later implementation must preserve this module’s immutable intent and evidence requirements while using only documented, exact-version surfaces under separate authority.
