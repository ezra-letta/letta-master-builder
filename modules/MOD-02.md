# MOD-02 Objects Ownership and Locality

| Field | Value |
|---|---|
| Status | ready |
| Prerequisites | MOD-01 |
| Capability IDs | CAP-CONVERSATION-MANAGEMENT; CAP-SESSION-LIFETIME; CAP-TURN-STREAMING; CAP-MESSAGE-RECONCILIATION; CAP-MEMFS-CONTEXT; CAP-SHARED-REPOSITORIES; CAP-TOOLS-LOCALITY; CAP-EXECUTION-TOPOLOGY; CAP-CHANNELS; CAP-AUTH-TRANSPORT-SECURITY; CAP-CONCURRENCY-CONSISTENCY |
| Evidence IDs | SRC-DOCS-STATEFUL-AGENTS-20260911; SRC-DOCS-SDK-REFERENCE-20260916; SRC-DOCS-MEMFS-20260911; SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-DESIGN-SYNTHESIS; SRC-PRODUCTION-HEURISTIC |
| Project-method sections | Ownership model; four-axis matrix; boundary tests |

## Learning contract and prerequisites

This module teaches a disciplined answer to four questions: **what object is this, who governs it, where does it exist, and how long should it survive?** Those questions precede API selection and implementation. A builder who cannot answer them should not create an agent, open a session, move a file, expose a tool, or retry a failed operation. The visible symptom of an ownership error may be a missing transcript, duplicate message, inaccessible file, leaked credential, stranded runtime, or controller that believes work is complete when execution continues elsewhere. The underlying mistake is usually simpler: two different objects were treated as one, or one object was assumed to live on the wrong host.

You should enter with MOD-01’s bounded mission, acceptance criteria, stop conditions, and failure budgets. The mission states what outcome is wanted; this module assigns each part of that mission to a product object, project record, or runtime resource. It does not authorize live actions. Reading it grants no permission to install software, inspect a host, use credentials, call an API or model, create or mutate an agent, open a session, run a tool, synchronize memory, deploy, or publish.

By the end, you should be able to draw an object graph for a proposed autonomous system and annotate every node with persistence, locality, authority, and recovery ownership. You should distinguish an agent from its conversations, the virtual default from a canonical conversation identifier, a session from the state it accesses, and a turn or run from the messages that describe it. You should also distinguish the SDK client from an application controller, the state host from the execution host, MemFS from ordinary working files, and a route from the deployment that operates it. You are not expected yet to choose a model or deployment. MOD-03 will use this vocabulary to make those choices without collapsing their boundaries.

The evidence boundary matters. Current official documentation, represented here by `SRC-DOCS-STATEFUL-AGENTS-20260911` and `SRC-DOCS-SDK-REFERENCE-20260916`, describes persistent agents as distinct from conversations and SDK sessions. Exact package evidence for `@letta-ai/letta-agent-sdk@0.8.9`, represented by `SRC-SDK-NPM-0.8.9` and `SRC-SDK-SOURCE-0.8.9`, declares separate client, session, conversation, message, computer, and repository surfaces. These are documentation and static artifact facts, not observations of a selected runtime. The ownership rules and matrix method below are project guidance from `SRC-DESIGN-SYNTHESIS` and `SRC-PRODUCTION-HEURISTIC`. They do not claim that Letta supplies every controller record or transaction described.

## Why ownership literacy matters

Autonomous software crosses more boundaries than an ordinary request-response application. A user message can enter through one channel, identify an agent hosted elsewhere, start or resume work on another computer, read agent memory from a checkout, modify files in a working directory, call a tool carrying a narrowly scoped credential, and emit a result through a different route. A single line saying “the agent did it” hides all of those placements. That shorthand is acceptable in conversation but unsafe in architecture.

Persistence is not a property of the whole stack. The agent can remain while an SDK client process exits. A conversation can remain while the session that streamed it is closed. A message may persist while a transient stream event disappears. A controller lease may expire while runtime work continues. A working file may survive on one computer but be absent from the state host. A repository attachment can persist independently of a session. Conversely, an in-memory client object, pending callback, socket, environment variable, or temporary checkout may disappear without deleting the persistent product objects it once accessed.

Locality is likewise plural. “Local” might refer to the Node process containing the SDK, the runtime process that interprets a turn, the computer executing a tool, the filesystem holding working files, the storage service holding agent state, or the controller database holding budgets and audit records. These can coincide in a local topology, but coincidence is not identity. A design that works only because all layers happen to share one laptop is not portable until those assumptions are made explicit.

Authority is separate from capability. Possessing an agent ID allows software to name a target; it does not authenticate the caller, prove ownership, or authorize mutation. A tool being available does not mean the controller permits its effect. A route accepting input does not mean the sender may choose any agent. A model requesting a file write does not grant permission to write it. Credentials establish some access at a trust boundary, but they do not replace mission policy, approval rules, budgets, leases, or human override. The Master Builder method therefore assigns authority to controller-owned records outside model-editable memory.

## Precise object vocabulary

### Agent

An **agent** is the persistent subject whose identity, configuration, and adaptive knowledge support work across interactions. Current documentation treats it as a persistent entity distinct from conversations and sessions. An agent is not a running process, a chat window, a model invocation, an SDK object, or a computer. It can be inactive and still exist. Its identifier names the persistent subject, but does not authenticate a caller. In project language, the agent may own adaptive knowledge; the controller still owns whether, when, and within what limits that agent may act.

### Conversation and virtual default

A **conversation** is a persistent interaction context associated with an agent. It can carry its own history and configuration scope. Multiple conversations may belong to one agent, so an agent ID and conversation ID are not interchangeable even when a convenience API accepts either in different positions.

The **virtual default** is an addressing convention for “this agent’s default conversation,” not necessarily a durable conversation ID that should be copied into every record. Exact SDK 0.8.9 declarations include operations where an agent ID resumes the default conversation, and an enqueue surface where the literal target `default` requires an accompanying agent ID. The safe controller practice is to resolve and record the canonical conversation ID when an operation needs durable reconciliation. Treating `default` as a globally unique conversation identifier loses the agent namespace and creates ambiguity.

### Session

A **session** is an SDK/runtime control relationship used to initialize transport, send work, stream events, inspect state, and close session-owned resources. It is not the agent and not the conversation. Exact declarations expose a `LettaCodeSession` with agent, session, and conversation identifiers that become part of the resolved runtime relationship. A session may resume persistent state, but the JavaScript object and its connection are transient. Closing a session should never be interpreted as deleting its agent or conversation. Exact cleanup behavior remains topology and version scoped, especially for managed sandboxes.

### Turn, run, and message

A **turn** is one bounded interaction initiated by submitted input and followed through a terminal outcome, interruption, or unresolved state. A **run** is an execution identity that may be reported for work within that turn. Exact declarations permit result messages to carry multiple run IDs and stream messages to carry a run ID, so controller code must not assume one universal identifier covers turn, run, and message.

A **message** is an individual input, output, tool, reasoning, error, retry, queue, initialization, or status record or event, depending on the message family. Persistent conversation-history messages and transient SDK stream messages are related projections, not automatically identical records. Exact declarations expose message UUIDs, optional lineage or correlation keys, per-run sequence values, run IDs, tool-call IDs, and caller-supplied offline threading IDs. Each serves a purpose. None is a password, bearer token, or blanket retry guarantee.

### SDK client

The **SDK client** is an application-side library object that selects a backend and provides management and session entry points. In exact SDK 0.8.9 declarations, the client owns resources such as a pooled management connection and may own a locally started App Server for that pool, while sessions have independent lifecycles. Therefore, disposing a client and closing its sessions are separate obligations. The client is neither the persistent state host nor the application’s policy authority. It is a capability-bearing adapter used by the application.

### Controller record

A **controller record** is project-owned state that binds mission intent to operational authority. It should contain the subject agent and canonical conversation, selected runtime, work-unit identity, lease owner and expiry, budgets, allowed effects, approvals, correlation keys, checkpoints, result state, uncertainty, and audit references. This is not claimed as a built-in Letta object. Its purpose is to prevent model-controlled text or memory from awarding itself authority, budget, promotion, or completion. If controller storage and product state disagree, the controller reconciles from authoritative sources and stops on ambiguity.

### Runtime and computer

A **runtime** is the execution environment that interprets session control and advances work. A **computer** is a selectable host on which tools can execute and files can be accessed in topologies that support connected computers. The state host and execution host may differ. Exact SDK declarations describe computers using an environment record ID, stable device ID, rotating connection ID, name, status, and metadata. Persisting a display name or connection lease as if it were permanent device identity is fragile. More importantly, selecting a computer does not move agent identity into that computer: the computer hosts execution, while agent and conversation state may be hosted elsewhere.

### MemFS, working files, and repositories

**MemFS** is documented as git-backed agent memory. It represents agent-oriented durable knowledge with its own synchronization and version boundaries. A runtime may use a local checkout of that memory, but an uncommitted checkout edit is not automatically synchronized durable memory. The checkout’s path is also not the agent’s identity.

**Working files** are files available to execution in a current working directory or sandbox. They may include source code, generated artifacts, temporary inputs, and outputs. They are not automatically memory, not automatically synchronized, and not automatically available to another runtime. A tool that can access working files acts at the execution/file host boundary.

A **repository** is a separately identifiable shared resource with files, versions, and possible agent attachment relationships. It is not synonymous with an agent’s MemFS or a runtime checkout. Exact declarations include repository management plus persistent agent-repository relationships on a Cloud-specific surface. Attachment, projection, local checkout, and recompilation are separate states; static declarations do not prove atomic behavior on a live backend.

### Credentials, tools, routes, channels, and deployment

A **credential** is secret or capability-bearing material used to cross an authentication or authorization boundary. Credential values belong in controlled secret facilities or process boundaries, not messages, MemFS, working examples, route payloads, or model-editable policy. IDs name objects; credentials authorize some access to them. Confusing these categories causes both security failures and broken recovery.

A **tool** is a callable capability presented to runtime/model execution. Its declaration, availability, permission, execution location, credential source, and external effect are separate concerns. Exact SDK declarations include client-side tool functions executing in the SDK process, while other tool classes may be supplied by a harness or server. “The agent has a tool” therefore says too little: identify who registered it, where it runs, what it can reach, and who approves its effects.

A **route** maps ingress or egress to a target and policy. A **channel** is an integration surface carrying external messages and delivery state. Neither is the agent or controller. Routes decide where traffic is directed; channels transport and reconcile it. Authentication at ingress, target selection, deduplication, response delivery, and audit ownership must remain explicit.

A **deployment** is the operated arrangement of state hosts, execution hosts, SDK/controller processes, networks, storage, credentials, routes, and supervision. It is not an agent object and cannot be inferred from one backend string. A product may expose objects and capabilities; a project combines them into an application; a deployment runs one versioned arrangement in an environment. A runtime is one executing component within that deployment, not the whole deployed system.

## The four-axis matrix

Before implementation, create one row per object and answer four independent questions. **Persistence** asks what event creates, updates, archives, or destroys the object and whether it survives process, session, runtime, or host loss. **Locality** asks which state host, execution host, process, filesystem, or external service contains the authoritative form. **Authority** asks who may create, select, mutate, execute, disclose, or delete it, and what credential plus controller policy is required. **Ownership** asks who must reconcile it after partial success or uncertainty.

| Object | Persistence expectation | Primary locality | Authority owner | Recovery owner |
|---|---|---|---|---|
| Agent | Persistent until an explicit lifecycle action | Selected product state host | Authenticated product access constrained by controller policy | Controller reconciles canonical agent ID |
| Conversation | Persistent context under an agent | Product state host | Controller selects scope; product validates access | Controller records canonical conversation ID |
| Virtual default | Addressing convention, not standalone durable identity | Resolution layer | Caller must supply agent context where required | Controller resolves before durable tracking |
| Session | Transient client/runtime relationship | SDK process plus runtime transport | Controller may open within a lease | Session owner closes; controller assesses unfinished work |
| Turn/run | Bounded execution; exact durability is topology scoped | Runtime and product execution records | Controller grants budget and effect envelope | Controller follows terminal or uncertain state |
| Message | Persistent history record or transient stream projection | Conversation store and/or transport | Sender and runtime act within route/session policy | Controller reconciles correlation and canonical IDs |
| SDK client | Process-lifetime adapter | Application process | Application construction and credentials boundary | Application disposes client-owned resources |
| Controller record | Durable project policy and audit state | Controller store | Supervisor/controller, never model memory alone | Controller database and operator procedure |
| Runtime/computer | Lease-, process-, sandbox-, or device-scoped | Execution host | Deployment and controller selection policy | Runtime operator plus controller reconciliation |
| MemFS | Intended durable agent knowledge when synchronized | Agent memory repository and runtime checkout | Agent may propose/edit within policy; controller governs promotion-sensitive facts | Memory workflow reconciles checkout, commit, sync |
| Working files | Host- and workspace-scoped | Current computer, sandbox, or mounted storage | Tool permission and controller effect policy | Execution owner preserves or transfers required artifacts |
| Repository | Persistent shared resource and attachment relations | Repository service plus checkouts/projections | Repository ACL and controller attachment policy | Repository/controller owners reconcile partial changes |
| Credential | Rotated secret or capability, never ordinary content | Secret store/process injection boundary | Human or security controller | Security owner revokes, rotates, audits |
| Tool | Declaration may persist; invocation is transient | SDK process, harness, runtime, or external service | Controller policy plus runtime approval | Effect owner verifies external state |
| Route/channel | Configuration plus per-delivery state | Integration/controller boundary | Channel administrator and routing policy | Delivery controller reconciles ingress and egress |
| Deployment | Operated lifecycle across versions | Infrastructure environment | Accountable operator | Operations and incident process |

Do not compress the matrix into a single “owner” column. The agent may be the conceptual owner of adaptive knowledge while the product hosts its persistent state, a computer holds the current checkout, a credential permits synchronization, and the controller decides whether a proposed memory change is within policy. Likewise, a runtime may own active execution after accepting work while the controller owns the budget and the channel owns final delivery reconciliation.

Use three boundary tests on every design. First, **process-loss test**: if the Node process exits now, which objects remain, which identifiers are needed to recover them, and which in-memory observations are lost? Second, **host-split test**: if state storage and tool execution move to different machines, which paths, credentials, and assumptions break? Third, **authority-substitution test**: if a model emits an ID, file path, approval phrase, or “done” message, what independent record proves it may be trusted? A safe answer names an authoritative lookup, controller decision, or external verification rather than trusting the text itself.

IDs deserve a final rule: preserve namespaces and roles. Agent IDs, conversation IDs, session IDs, run IDs, message IDs, tool-call IDs, device IDs, connection IDs, repository IDs, workflow IDs, and project work-unit IDs are not interchangeable. Record the object type beside each value. Do not infer authority from possession, durability from appearance, or global uniqueness beyond the contract that issued it. Correlation identifiers help match attempts and observations; credentials cross trust boundaries; controller leases grant bounded application authority. A robust design uses all three without confusing them.

## Original topology and ownership trace

Consider an original, hypothetical project called **Release Note Steward**. Its bounded mission is to inspect an already prepared software workspace, summarize approved changes, draft release notes, and return the draft for human review. It may read working files and an attached standards repository. It may propose a MemFS update when it learns a stable editorial preference. It may not publish, push, merge, disclose credentials, alter budgets, or declare its own memory proposal accepted. This trace is architecture material only; nothing here was executed.

The planned topology separates five places. A controller service and SDK client run in Node process **P1**. Product state for agent **A7** and conversation **C42** resides on state host **S**. Tools execute through runtime **R9** on computer **D3**. The software workspace `/work/acme` exists on **D3**. Agent MemFS has an authoritative repository on the memory state service and a checkout `/memory/A7` on **D3**. Shared repository **K5** contains editorial standards and is attached read-only to **A7**. A channel adapter **H2** receives an authenticated project event and later returns the draft to a review queue. Controller database **CDB** stores authority and audit records. Secrets remain in a secret facility and are injected only into components that need them.

The trace begins with ingress. **H2** receives event **E18**, authenticates its source, validates the route, and maps it to controller work unit **W73**. The event cannot choose arbitrary agent authority. The controller record maps this mission to **A7**, permits read-only inspection, and sets limits. It contains no secret value. The controller acquires expiring lease **L73** and records correlation key **Q73** before contacting the SDK.

Next comes target resolution. **P1** constructs a client for the selected backend under deployment configuration. The stored agent ID **A7** names the agent but supplies no authentication by itself. The client’s credential boundary establishes product access; controller policy establishes whether this work unit may use that access. The controller asks to resume **A7**’s virtual default, then obtains canonical conversation ID **C42** during readiness. It updates **W73** with both the addressing intent and canonical identity. If resolution instead returned a different conversation, work would stop for investigation rather than silently continuing.

Session **SS6** now links **P1** to **R9** for **C42**. Opening it does not create another agent. It does not transfer **A7** into **P1**, and closing it will not mean deleting **C42**. The runtime selection points tool execution to **D3**. This is the critical state-host/execution-host split: conversation state remains on **S**, while filesystem operations occur on **D3**. The controller verifies that **D3** is the intended stable device and that `/work/acme` is the expected workspace. A rotating connection identity may describe the current lease, but it is not persisted as though it were the physical device’s durable identity.

Before sending input, the controller checks resources. The workspace is working files, not memory. **K5** is an attached shared repository, not a directory **A7** owns. `/memory/A7` is a MemFS checkout, not proof of synchronized memory. The runtime exposes read tools and draft writing in one designated path; no publication tool is present. Credentials are not supplied to the model or prompt.

The controller submits one user message with correlation identifier **M73**. That value helps match the optimistic input, queue state, stream projection, and persistent history record. It does not authorize the turn. The controller marks **W73** as `submitted`, not `complete`. Runtime **R9** begins bounded execution and reports run identity **RUN8**. Stream events mention message IDs, tool-call IDs, sequence positions, and **RUN8**; the controller records their types and scopes rather than placing every identifier in one generic `id` field.

During the turn, the agent reads `/work/acme/CHANGELOG.fragment` and relevant files projected from **K5**. Tool call **TC4** runs on **D3**, even though the agent and conversation persist on **S**. Its result enters the session stream, but the file read does not migrate the workspace into product state. The agent writes `/work/acme/out/release-draft.md`; that artifact now exists as a working file on **D3**. Assistant text saying “draft written” is useful progress, not authoritative verification. The controller or a constrained verifier confirms the path, content digest, and policy limits before recording the artifact.

The agent also proposes a stable preference: headings should use sentence case for this project. It writes a candidate change in the MemFS checkout. That edit is not automatically durable, synchronized, evaluated, or promoted. The memory workflow records a proposed diff with provenance from **W73**. A separately governed review may later approve synchronization. The work loop cannot turn its own suggestion into controller policy, and a memory commit would still not prove that the preference improves outcomes.

A result message eventually reports success and associates the turn with **C42** and **RUN8**. The controller reconciles persistent conversation history using **M73**, confirms the expected terminal result, verifies the draft artifact, and checks that no prohibited effect occurred. It records **W73** as `awaiting_human_review`, not `published`. **H2** receives a delivery record containing the draft reference and review status. Delivery through the channel has its own identity and acknowledgement; a successful model turn does not prove successful external delivery.

Cleanup follows object boundaries. Session **SS6** is closed, and client-owned resources are disposed when **P1** no longer needs them. The controller releases **L73** only after durable checkpointing. Closing **SS6** does not delete **A7**, **C42**, **K5**, the working file, or the MemFS proposal. Nor is the controller entitled to assume that every runtime or sandbox resource vanished; cleanup expectations are deployment-specific. The trace leaves typed identifiers and verified facts for another controller process to continue without pretending its predecessor’s in-memory stream still exists.

## Ownership failures and recovery decisions

### Failure: using an ID as a credential

A developer places **A7** in a URL and accepts any request containing that value. The route now treats target knowledge as authorization. Recovery begins by disabling the route, reviewing access logs, and rotating any credentials that may have been exposed. The repaired design authenticates the caller, authorizes the project-to-agent mapping, and treats **A7** only as an identifier. Even an unguessable ID is not a permission system unless its contract explicitly makes it a capability token.

### Failure: collapsing virtual default and canonical conversation

A controller stores only the string `default`. After handling multiple agents, recovery cannot tell which conversation received a message. Do not retry blindly. Use the agent ID and authoritative conversation lookup to resolve the canonical target, correlate by the original message key, and stop if multiple matches remain. Future records should preserve agent ID, address form, canonical conversation ID, and resolution time separately.

### Failure: equating session loss with work failure

Process **P1** crashes after submission. A replacement process sees no local session and marks **W73** failed, then sends the same instruction with a new correlation key. The first run may still be active, producing duplicate work or effects. Correct recovery treats session loss as loss of observation. Inspect authoritative conversation, queue, run, or controller state using the original correlation key. Resume or reconcile only under exact supported semantics. If execution state remains unknowable, classify the work as uncertain and require supervision rather than asserting success or failure.

### Failure: equating assistant text with completion

The stream says “I wrote the draft,” but the tool result failed or the file resides on another computer. Recovery checks the authoritative file host, expected path, digest, and terminal result. The controller records claims and verifications separately. A text response can communicate intent or a model conclusion; it is not a filesystem acknowledgement, external delivery receipt, or production acceptance decision.

### Failure: confusing state host with execution host

The controller resumes cloud-hosted conversation **C42** on computer **D8**, where `/work/acme` does not exist. Retrying the read will not move the files. Recovery stops the turn, preserves the conversation checkpoint, and selects the intended computer or explicitly transfers approved files under a separate operation. It then starts a new bounded attempt with recorded provenance. Never infer that files accompany agent identity, conversation identity, or channel routing.

### Failure: promoting an unsynchronized MemFS edit

The agent edits `/memory/A7/preferences.md`, and the application immediately reports that the agent “will remember forever.” The checkout could be uncommitted, unsynchronized, conflicting, or on the wrong device. Recovery inventories checkout state without exposing secrets, identifies the authoritative memory repository, preserves the candidate diff, and subjects it to the memory workflow. If provenance or synchronization status cannot be established, retain it as an untrusted proposal rather than durable knowledge.

### Failure: treating repository attachment as atomic projection

An attachment relationship changes, but recompilation or projection fails. Repeating the whole operation without inspection can obscure the actual state. Recovery first queries the authoritative relationship, then separately verifies the conversation projection or required recompile. The open discrepancy `DISC-REPOSITORY-PARTIAL-SUCCESS-001` limits claims here: static SDK evidence supports designing for partial success, but this module does not claim live ordering or atomicity.

### Failure: storing credentials in memory or working artifacts

A model copies an access token into MemFS so future sessions can reuse it. The token may enter history, commits, logs, or shared projections. Recovery stops further disclosure, revokes and rotates the secret through its accountable owner, removes exposed copies where policy and evidence preservation permit, and opens an incident record. The replacement stores only a secret name or capability reference in controller configuration and injects values at the narrow runtime boundary. Deletion from one file does not prove removal from all histories or backups.

### Failure: assigning tool authority to the model

Because a publication tool appears in a tool list, the agent calls it after drafting. Availability was mistaken for approval. Recovery determines whether an external effect occurred using the external system’s canonical identity. If no effect occurred, tighten allowlists and approval policy before retrying. If it occurred, follow compensation or incident procedure; do not issue a second publish call merely because the first acknowledgement was lost. Tool registration, model selection, runtime permission, controller authority, and external authorization must all align.

### Failure: conflating product, project, and runtime boundaries

A team calls its controller table a “Letta work unit,” describes its route as a product endpoint, and interprets a fixture as runtime proof. Recovery relabels every element. Agents, conversations, and declared SDK surfaces belong to the product evidence lane. Leases, mission budgets, dossier format, and promotion rules are project methods. The selected process, host, connection, filesystem, and observed behavior belong to a versioned runtime and deployment. Claims are then narrowed to their evidence. Clear labels are a recovery mechanism because they show which authority can answer each question.

## Dossier artifact: Object Ownership and Locality Record

Under separate implementation authority, the learner can produce an **Object Ownership and Locality Record** for one bounded mission. It is a design dossier, not a command transcript and not evidence that any object exists. Begin with mission ID, revision, author, review status, prerequisites, and explicit excluded effects. Add a topology diagram naming controller process, SDK client, product state host, runtime, computer, filesystems, repository services, channel boundary, secret facility, and operator boundary.

The object register gives every object a typed label, canonical product ID if validly observed, parent, persistence class, authoritative source, execution locality, credential boundary, mutation authority, cleanup owner, and recovery query. Keep virtual addressing separate from resolved identity. Never paste credentials, private endpoints, personal data, or live tokens.

Add four matrices. The **persistence matrix** lists survival across client disposal, session close, process crash, runtime restart, disconnect, and deployment replacement. Unknown cells say `unknown-not-tested`. The **locality matrix** distinguishes state host, execution host, checkout, working directory, controller store, and external service. The **authority matrix** separates authentication, selection, permission, effect approval, deletion, and supervision. The **reconciliation matrix** names correlation keys, canonical lookups, ambiguity stops, partial success, and responders.

Then add lifecycle traces for normal completion and three failures: lost session after submission, absent working file, and memory or repository partial success. State each transition’s precondition, actor, mutation, acknowledgement, checkpoint, timeout response, and prohibited retry. Finish with assumptions, evidence classification, relevant source and discrepancy IDs, unresolved questions, and a reviewer sign-off field. A strong dossier enables a new operator to answer “what remains?” and “who may act next?” without trusting model narrative or process memory.

## Formative transfer questions

1. A webhook payload contains an agent ID and the word `default`. What additional authentication, mapping, and canonical identity must the controller establish before submitting work?
2. A session closes immediately after a user message is sent. List three states that remain possible and identify an authoritative reconciliation path for each.
3. An agent is hosted remotely, tools run on a connected laptop, and a draft exists only in the laptop workspace. Which host owns agent state, execution, and the artifact? What must a handoff transfer explicitly?
4. Two sessions access one MemFS checkout concurrently. Which facts belong in agent knowledge, runtime execution state, and controller concurrency policy? Where can a conflict become durable?
5. A stream message has a message UUID, run ID, sequence value, and correlation key. Explain why no single one should replace the others in the controller schema.
6. A computer reconnects with a new connection ID but the same stable device ID. Which identifier should a long-lived selection record prefer, and what must still be revalidated before execution?
7. An attached repository is visible in the relationship list but absent from the current conversation projection. Is attachment complete, failed, or partially successful? What facts must be queried before recovery?
8. A model asks to store an API key in MemFS “for convenience.” Which ownership and locality boundaries does that violate, and what non-secret reference could replace it?
9. The agent reports that it published a release note. Name independent evidence needed for turn completion, external effect completion, channel delivery, and human acceptance.
10. A local development topology places client, runtime, state, files, and controller on one machine. Redraw it after splitting state and execution hosts. Which previously invisible assumptions become network, credential, or transfer requirements?
11. Your project calls a controller lease a “session.” What ambiguity does that create beside the SDK session, and how would you rename and model both lifecycles?
12. A manager asks whether passing the module proves the planned deployment is secure and production-ready. Use the product/project/runtime/production boundaries to answer precisely.

## Source and evidence boundaries

Product concepts in this module are independently restated from registered evidence. `SRC-DOCS-STATEFUL-AGENTS-20260911` supports the documented distinction among persistent agent, conversations, and sessions. `SRC-DOCS-SDK-REFERENCE-20260916`, `SRC-SDK-NPM-0.8.9`, and `SRC-SDK-SOURCE-0.8.9` support exact static awareness of separate client, session, message, computer, repository, and identifier surfaces. `SRC-DOCS-MEMFS-20260911` supports the documented git-backed MemFS concept. The matrices, controller dossier, boundary tests, Release Note Steward scenario, and recovery policy are original project methods grounded in `SRC-DESIGN-SYNTHESIS` and `SRC-PRODUCTION-HEURISTIC`.

No example was run. No network ordering, persistence after failure, reconnect, queue delivery, repository projection, sandbox lifetime, credential transport, tool effect, MemFS synchronization, or channel delivery was observed. Open discrepancies narrow the lesson. `DISC-RECONNECT-OWNERSHIP-001` and `DISC-CODE-0-32-11-LIFECYCLE-001` block universal recovery claims. `DISC-SANDBOX-LIFETIME-001` prevents equating session cleanup with runtime destruction. `DISC-REPOSITORY-PARTIAL-SUCCESS-001` requires relationship and projection reconciliation. `DISC-MEMORY-TRANSITION-001` keeps compatibility options from becoming greenfield defaults. Unknown behavior remains `unknown-not-tested` until separately authorized evidence binds an exact version, backend, topology, target, and operation.

## Explicit non-claims

This module does not claim that every Letta backend persists, resumes, reconnects, cleans up, routes, or executes identically. It does not claim that an SDK declaration proves a live service accepts an operation. It does not claim that agent state and tool execution share a host, that closing a client closes independent sessions, that closing a session deletes a sandbox, or that a stream contains a complete persistent transcript. It does not claim that virtual default is a canonical global ID, that IDs confer access, or that correlation keys guarantee deduplication outside their exact contract.

It does not claim that a checkout edit is synchronized memory, that a commit proves improvement, that repository attachment and projection are atomic, or that working files automatically follow an agent. It does not claim that tool availability grants effect authority, that assistant text proves external state, or that queue acceptance equals turn completion. The project controller record, leases, budgets, dossier, and recovery state machine are project-owned methods, not hidden product APIs.

Completion does not authorize or establish implementation, runtime observation, account entitlement, hosted availability, security compliance, deployment correctness, reliability, or production qualification. Production qualification remains implementation-specific and requires independent operational evidence.

## Handoff to MOD-03

You now have the nouns and boundary questions needed for selection. MOD-03, **Capability Topology and Model Selection**, will compare the mandatory Agent SDK Node Local lane with Cloud as a contrast topology and will place alternative surfaces at selection-literacy depth. Carry forward the dossier’s unresolved cells. Do not choose a backend or model merely because its name sounds local, persistent, or capable. Ask which product objects it exposes, where state and execution live, which client surface controls them, what credentials cross each boundary, and which claims are exact static evidence versus runtime observation.

The handoff is a design transition, not an operational one. No topology is deployed, no live-account model is selected, and no runtime is qualified. MOD-03 refines capability and placement choices; later modules address implementation under separate evidence and authority contracts.
