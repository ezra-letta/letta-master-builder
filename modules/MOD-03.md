# MOD-03 Capability Topology and Model Selection

| Field | Value |
| --- | --- |
| Status | ready |
| Design revision | 0.4 |
| Prerequisites | MOD-00; MOD-01; MOD-02 |
| Capability IDs | CAP-MODELS-CONFIG-SCOPE; CAP-EXECUTION-TOPOLOGY; CAP-PORTABLE-CLIENT; CAP-QUERY-PROMPT; CAP-ALTERNATIVE-SURFACES |
| Evidence IDs | SRC-DESIGN-SYNTHESIS; SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-CODE-NPM-0.32.11; SRC-CODE-SOURCE-0.32.11; SRC-DOCS-SDK-REFERENCE-20260916; SRC-DOCS-APP-SERVER-20260911; SRC-DOCS-REMOTE-CLIENT-20260911 |
| Pointer IDs | PTR-SDK-001; PTR-APP-SERVER-001; PTR-REMOTE-001; PTR-APP-SERVER-DOCS-001; PTR-REMOTE-CLIENT-DOCS-001; PTR-DEPLOYMENT-001; PTR-COMPUTERS-001 |
| Project-method sections | Selection frame; topology ownership map; model decision record; safe-subset workflow |

## Learning contract and prerequisites

This module teaches selection before implementation. By the end of this first half, you should be able to choose a defensible Letta surface, backend topology, client entry point, execution host, and model configuration scope for a bounded application. You should also be able to explain why another plausible option was rejected, which facts come from exact package evidence, which come from current documentation, which are project-owned decisions, and which remain unknown until a target is observed.

The mandatory curriculum lane is the Letta Agent SDK in TypeScript on Node, using the SDK’s Local backend as the primary implementation setting. Cloud is a contrast topology, not an assumed entitlement or a drop-in synonym for Local. Direct App Server protocol, Remote Client, direct REST, ACP, browser, React Native, and one-shot query surfaces are selection-literacy topics here. They do not replace competence in the mandatory lane, and this lesson does not authorize connecting to any of them.

You should arrive with three prior boundaries intact. MOD-00 separated documentation, exact artifacts, runtime observations, project methods, and production qualification. MOD-01 defined a mission, acceptance criteria, autonomy envelope, and stop conditions. MOD-02 separated persistent agent identity, conversations, sessions, runtime state, controller state, files, and computers. If you cannot say who owns each object or what evidence supports a capability, do not select a topology by convenience. An architectural diagram cannot repair an ambiguous mission or make an unavailable capability real.

This is a read-only design lesson. It creates no agent, session, computer, model call, credential, deployment, or runtime evidence. Package exports and source structure establish only an exact static surface for the pinned releases. They do not prove that a hosted account exposes a model, that a computer is connected, or that an operation behaves identically across backends.

## Why selection matters

A persistent agent application crosses more boundaries than a conventional function call. The controller may hold credentials and policy. A client library may launch or contact a runtime. The runtime may execute model turns. Tools may run in a different process or on another computer. Files needed by a task may exist only on one host. Agent state may persist while a session and its process disappear. A model handle accepted in one environment may be absent in another. Choosing “the SDK” therefore does not finish the architecture; it begins a series of locality and ownership decisions.

Poor selection often looks harmless. A builder assumes a cloud execution environment has local files, treats a browser client like the Node root entry point, hard-codes a documented model as universally available, or substitutes a one-shot helper for persistent identity. Each mistake confuses mechanical availability with operational suitability.

Selection controls the failure model. Local and Cloud differ in process, execution, computer, credential, and network boundaries. Portable and remote clients add their own lifecycle duties. These choices change what can fail, where evidence resides, and which component must recover.

The Master Builder rule is to choose the smallest supported surface that satisfies the mission while keeping authority and recovery explicit. Do not choose the lowest-level surface merely because it exposes more protocol detail. Do not choose a hosted topology merely because it sounds durable. Do not choose a model solely by benchmark rank. A selection is good when its ownership boundaries match the mission and its unknowns are visible.

## Precise vocabulary

A **capability** is an operation or behavior required by the mission, such as persistent conversation management, tool execution, or computer selection. A **surface** is the interface through which the application attempts that capability: Agent SDK, direct App Server protocol, Remote Client, REST, ACP, CLI, or another supported interface. A surface is not a backend.

A **backend** is the SDK’s broad connection and execution arrangement, such as Local, Remote, or Cloud. A **topology** is the fuller map of application process, SDK client, runtime, state service, controller store, model provider, tool host, computer, and network boundaries. Two systems can name the same backend while differing materially in credentials, runtime placement, tools, or controller durability.

The **controller host** runs application-owned policy: intent validation, canonical identifiers, budgets, leases, reconciliation, audit records, and supervision hooks. The **client host** is where SDK code executes. In the primary lane these may be the same Node process, but that is a design choice rather than an identity. The **runtime host** owns active session and turn execution. The **tool host** is where a particular tool actually executes. The **computer** is the environment whose shell, files, software, and credentials are available to runtime tools. The **state host** persists agent and conversation state. Never collapse these roles into a single box labeled “agent.”

A **connection** is a live transport relationship and is usually more temporary than the state it accesses. A **session** is the SDK/runtime interaction lifetime discussed in later modules. A **conversation** is persistent message scope. An **agent** is the persistent identity and adaptive state owner. Resuming an agent or conversation does not guarantee reuse of the same process, socket, session, computer, working directory, or provider connection.

A **client entry point** is a published package path with a particular supported environment and export set. The **root entry point** is the Node-oriented `@letta-ai/letta-agent-sdk` lane inventoried by this project. The **portable client entry point** is `@letta-ai/letta-agent-sdk/client`, intended for browser and React Native constraints. Mechanical overlap between their public names does not make them interchangeable. Exact package evidence records differences around Node-only integrations, local paths, images, MCP, credentials, and runtime support. The safe decision is to use the root entry point for the mandatory Node controller and select the portable entry only when the actual host requires it and its reduced trust boundary satisfies the mission.

A **model** is the inference configuration selected for agent turns. A **provider** supplies or brokers access to models. A **model handle** is the runtime-facing identifier used for selection. A **catalog** is a target-scoped set of currently discoverable choices, not a timeless list promised by package declarations. **Availability** means a particular target can actually use a model under its credentials, account, provider, region, plan, and runtime conditions. Documentation may describe supported providers, and exact types may expose model-management structures, but neither establishes availability for an unobserved target.

**Reasoning configuration** controls a supported model’s inference effort or related mode where the selected surface and model permit it. It is not an independent capability that every provider implements identically. **Configuration scope** says where a choice applies: creation-time agent configuration, persistent agent default, conversation configuration, session override, turn request, client default, or provider setup. A value appearing in a TypeScript option does not prove every backend accepts it at every scope. Record scope explicitly and prefer a verified safe subset when exact source narrows an exported type.

## Primary lane: Agent SDK, Node, Local

The primary lane places original TypeScript controller code and the Agent SDK root entry point in a trusted Node environment. The SDK’s Local backend delegates turn execution to the maintained Letta Code runtime associated with the pinned SDK lane. For this design revision, static evidence is bound to Agent SDK `0.8.9` and its declared Letta Code `0.32.11`. The separately interpreted standalone `0.32.11` artifact remains another evidence lane even though artifact identity matches. No runtime was executed, so process launch, lifecycle, recovery, provider behavior, and persistence beyond registered claims remain unobserved.

Local is pedagogically useful because locality can be named directly. The controller can own its application store, the Node client can use a deliberate working directory where supported, and local files and tools remain on the selected machine. Credentials can stay in a trusted host rather than an untrusted browser.

Local does not mean one atomic process, guaranteed offline inference, or universal option support. It does not remove the need for identifiers, reconciliation, deadlines, or recovery. Classify untested behavior as unknown.

The recommended first shape is modest: a trusted Node controller imports the root SDK entry point, keeps authority in its own store, identifies the agent and conversation, chooses working scope and tool policy, and records results without treating process state as durable truth. Later modules teach those operations.

## Cloud as a contrast topology

Cloud changes placement rather than erasing ownership. The controller may still run in a trusted application host, while persistent state and runtime coordination involve hosted services. Tool execution may use a selected connected computer or managed sandbox according to current, target-specific support. The agent’s identity and memory remain conceptually distinct from the computer. Moving execution does not copy local project files, installed software, or secrets.

A Cloud design must answer what a Local prototype may avoid: account and tenant ownership, credential residence, required or replaceable computer, offline behavior, fallback equivalence, target catalog availability, completion observation, and post-disconnect authority. None follows from the word “Cloud.”

The project makes no claim that the current user has Cloud access, a connected computer, a sandbox entitlement, any provider, or any model. Hosted runtime version and behavior are `unknown-not-tested`. Cloud is appropriate only when the target is separately verified and its placement, credentials, cost, recovery, and fallback contracts fit the mission.

## Other surfaces and the safe boundary

Direct App Server protocol is a lower-level control surface. It can be appropriate when an application needs protocol-level ownership not supplied by the high-level SDK, but it also moves connection lifecycle, synchronization, correlation, and recovery duties toward the controller. It is an advanced elective, not the greenfield default.

Remote Client is a distinct hosted discovery, authentication, relay, and recovery path for controlling registered remote environments. It should not be described as ordinary Local SDK behavior over a longer cable. Its hosted and connected-runtime versions are unobserved here.

Direct REST can expose documented resource operations when a high-level abstraction is insufficient, but endpoint existence does not make REST the preferred agent-turn controller. ACP, CLI, browser, and mobile surfaces each serve different client roles. One-shot prompt or agent-free query helpers are useful for bounded disposable interactions, smoke checks, or evaluation shapes where supported; they do not substitute for persistent agent identity, conversation recovery, and controller governance.

## A selection workflow

Begin with the mission rather than a product menu. Write the required persistent objects, effects, files, tools, latency, interaction style, concurrency, trust boundary, and recovery objective. Mark each as mandatory, preferred, or optional. A mission requiring a specific private checkout has a computer-locality constraint; a mission requiring durable multi-conversation learning has an agent-state constraint; a public browser UI has a portable-client and credential constraint.

Next, build an ownership map. Name the controller host, client host, runtime host, state host, tool host, computer, provider boundary, and human approval surface. For every edge, state the transport, credential owner, durable identity, timeout, and recovery owner. If a box or edge is “managed,” still record what your application must observe and what remains unknown.

Then choose the highest-level surface that satisfies mandatory capabilities. Default to the Agent SDK for this curriculum. Use the Node root entry point for the primary trusted controller. Select the portable client only for an actual browser or React Native host and move secrets or privileged operations behind an appropriate trusted boundary. Consider direct protocol or REST only when a named requirement cannot be met safely through the mandatory surface, and document the additional lifecycle burden.

Choose backend and execution placement separately. Compare Local and Cloud against file locality, tool locality, credential residence, persistence, network dependence, supervision, and cost controls. For Cloud, specify the computer selector policy and whether fallback is forbidden, paused, or allowed only to an equivalent environment. Never use an automatic fallback that changes the meaning of success.

Now select model policy. Query or inspect the target catalog only under separately authorized execution; until then, record required capabilities rather than a fictional available model. Define context needs, tool-use quality, modality, latency ceiling, cost budget, provider restrictions, and acceptable reasoning configuration. Identify configuration scope: persistent default versus conversation, session, or turn override. Include a fallback policy based on capability equivalence, not merely a cheaper or similarly named model.

Finally, reconcile evidence. For each decision, label documented-current, exact-package, project-method, or unknown-not-tested. Apply every registered discrepancy and choose the safe subset. Record rejected alternatives and the event that would trigger reconsideration: a package upgrade, topology change, new runtime observation, catalog change, unavailable computer, or altered mission. A valid selection record ends with explicit non-claims: it does not establish account availability, runtime success, model quality, security compliance, production readiness, or permission to execute.

## Worked example: the repository caretaker

Consider an original mission: maintain a private TypeScript repository on one workstation, inspect issues supplied by an internal controller, propose patches, and stop before publishing. Acceptance requires reading the actual checkout, writing only approved files, preserving a durable agent identity, and returning a controller-readable result. The workstation has the required source tree and development tools. No remote execution or public UI is required.

The selection record chooses the Agent SDK root entry point in a trusted Node controller with the Local backend. The controller host and client host are the same application process, while controller authority remains in a separate durable store. The runtime host is local but is not treated as the authority store. The workstation is the required computer and tool host because acceptance depends on its checkout. Agent and conversation identifiers are explicit. A model is selected only from the target’s observed catalog during separately authorized operation; until then the record specifies tool-use competence, context requirement, cost ceiling, and acceptable latency rather than a name.

Cloud is rejected, not because it is inferior, but because it adds no mission benefit and could separate execution from the only verified checkout. Portable client is rejected because the controller is trusted Node software, not a browser. Direct protocol is rejected because the SDK satisfies the named capabilities without transferring connection recovery into application code. A one-shot prompt is rejected because the mission requires persistent identity and repeatable conversation ownership. If the workstation becomes unavailable, the task pauses. It does not silently move to a sandbox where the repository, tools, or credentials may differ.

## Worked example: supervised review from a web application

A second mission accepts review requests from a team web application. Users need persistent project agents and separate conversations, but browser code must not hold privileged provider or controller credentials. Some reviews need a repository on a registered machine; others can use uploaded, non-sensitive material in an isolated environment. The application must show status and allow cancellation, while authoritative budgets and audit records stay server-side.

The selection uses a server-side Node controller and the Agent SDK root entry point. The browser is presentation only; a portable client does not inherit controller authority. Cloud is a candidate because execution may need a selected computer, but account access, computer state, sandbox support, model catalog, and hosted lifecycle remain unknown until observed. Repository-bound requests pause while that computer is offline. Only filesystem-independent tasks may use an approved isolated fallback.

Direct App Server access is not selected merely to stream richer UI events. The team first asks whether the high-level SDK supplies the needed lifecycle. Remote Client is rejected unless controlling registered remote environments is itself a requirement and the team is prepared to own its discovery, authentication, relay, acknowledgment, and recovery boundary. This avoids converting a UI preference into a lower-level operational commitment.

## Alternative-surface decision cards

Use **direct App Server protocol** when a named integration requirement genuinely needs protocol-level control and the controller can own startup negotiation, input correlation, event processing, synchronization, abort semantics, reconnect, and tool callbacks. Do not use it to avoid learning the SDK or because “lower level” sounds more capable. Its documented existence does not prove exact behavior for the pinned or hosted target.

Use **Remote Client** only for the distinct problem of custom control through hosted discovery and relay to registered remote environments. It adds two relevant availability questions: the hosted transport and the connected runtime. Neither is observed by this curriculum. Never substitute it for ordinary SDK Local merely because execution is on another machine.

Use **direct REST** for a documented resource operation when the SDK abstraction is insufficient and the operation’s authentication, idempotency, pagination, error, and backend scope are understood. A REST endpoint is not automatically a complete streaming-turn or persistent-session architecture. Do not invent Agent Foundry endpoints or attribute application-owned controller routes to Letta.

Use **ACP** when an ACP-compatible client is the actual integration boundary and its capability subset satisfies the mission. Treat it as an alternative client protocol, not evidence that every SDK option, runtime event, tool, or recovery behavior is available through ACP.

An **OpenAI-compatible bridge** may help an existing application submit a request through a familiar shape. Compatibility of request and response envelopes does not confer persistent-agent semantics, full event fidelity, conversation governance, approval recovery, or identical tool behavior. Select it only for a deliberately constrained compatibility edge, and keep the durable controller behind that edge.

Use the **CLI or headless CLI** for operator workflows, scripts, and bounded automation when process input, output parsing, permissions, conversation selection, and exit handling are explicitly owned. The CLI is a product surface, not a substitute name for the SDK. A shell process result also does not replace application-level reconciliation.

Use the **desktop application** when a human needs an interactive local surface, computer selection, approvals, or direct conversation work. It is not the server-side controller for a custom product merely because both can reach an agent. Desktop preferences and UI state must not become hidden application policy.

Use **Channels** when the mission is conversational ingress and route-scoped egress through a supported messaging platform. A Channel binds sender, account, chat, and thread context to an agent conversation and has access-control and delivery concerns. It is not a generic webhook, job queue, or unrestricted command bus. Channel availability, adapter setup, and live delivery remain untested here.

## Prompt and query are not persistent-agent substitutes

A prompt convenience may run one bounded interaction against an agent, while an agent-free query may omit persistent identity. Either can suit a smoke check or disposable transformation when exact requirements are met. Neither replaces an architecture requiring durable memory, stable identity, conversation continuity, resumption, or controller-owned history.

Ask what must remain after the process disappears. If that includes learned state, conversation lineage, pending approvals, unresolved effects, or resumable work, a disposable call is insufficient. If computer, tools, model scope, deadline, and recovery are merely helper defaults, selection is incomplete.

The reverse is also unsafe. Do not create a persistent agent for every stateless classification. Persistence adds identity, memory, deletion, privacy, and evaluation obligations. Choose it because the mission needs continuity.

## Unsafe substitutions and recovery decisions

**Local to Cloud without locality review:** A developer changes the backend and assumes the same working directory, files, tools, secrets, and provider configuration exist. Recovery is to stop before effects, restore the last known topology, inventory every locality dependency, and qualify the new computer or sandbox independently. Never copy secrets or source merely to make an accidental substitution succeed.

**Cloud computer to automatic sandbox:** A selected machine goes offline and work continues elsewhere. If acceptance depends on that machine, the result is invalid even if the turn succeeds. Recovery is pause, preserve the conversation and controller checkpoint, and resume only on the required computer. Fallback is allowed only when the mission record previously defined equivalence.

**Node root to portable client:** Bundler pressure leads a team to switch import paths while retaining Node MCP, local path, image, or credential assumptions. Recovery is to compare the exact entry-point ledgers, move privileged behavior to a trusted server, narrow the portable client’s role, and retest the architecture statically before any runtime claim.

**SDK to direct protocol or bridge:** A missing convenience method prompts an unreviewed transport rewrite. Recovery is to identify the exact missing capability, verify whether a supported high-level route exists, and, if not, create a separate advanced design with lifecycle and reconciliation owners. Do not reuse SDK guarantees across the new boundary.

**Model-name substitution:** An unavailable model is replaced by a similarly named, cheaper, newer, or larger-context model. Names and context sizes do not prove equivalent tool use, modality, reasoning controls, latency, or policy fitness. Recovery is to pause the task, inspect the target-scoped catalog under authority, evaluate candidates against the recorded requirements, and apply the change at the intended configuration scope. Preserve the prior model decision and state that quality remains unevaluated.

**Reasoning or scope substitution:** A reasoning option is applied globally when only one bounded session needed it, or a session override is mistaken for a persistent agent default. Recovery is to retrieve authoritative configuration where supported, identify affected conversations and turns, restore the intended scope, and treat outputs produced under the unintended configuration as needing review rather than silently equivalent.

Every recovery updates the selection record rather than rewriting history. Record the mismatch, affected identities, uncertainties, rollback point, and evidence required before retry. Account entitlements, hosted availability, live catalogs, connected computers, and runtime equivalence remain unknown until separately observed on the exact target.

## Builder artifact: topology decision dossier

The concrete artifact is a **topology decision dossier**, produced later only under relevant authority. It is not a deployment file and contains no credentials, private endpoints, or inferred entitlements. It makes selection reviewable before implementation.

Start with an immutable mission header: dossier ID and revision, mission ID, actors, bounded outcome, acceptance criteria, prohibited effects, stop conditions, and the date at which evidence was reviewed. Name every capability as mandatory, preferred, optional, or rejected. For each mandatory capability, identify the selected surface and evidence class. “SDK supports it” is too vague; record whether the basis is current documentation, exact package shape, project method, or a future target observation.

Add a topology map that names controller host, client host, runtime host, state host, tool hosts, computer, provider boundary, approval surface, and human operator. Each node records owner, trust level, durable state, credentials by name only, files or tools expected there, and loss behavior. Each edge records transport class, authentication owner, identifiers carried, timeout owner, retry owner, and reconciliation source. A single-machine primary lane still needs separate logical nodes because process loss, runtime loss, and controller-store loss have different consequences.

The surface decision section records the Agent SDK Node root entry point as the curriculum default or gives a requirement-based reason for another choice. It lists considered alternatives—portable client, direct App Server, Remote Client, REST, ACP, compatibility bridge, CLI, desktop, or Channels—and states why each was selected, deferred, or rejected. Reasons must concern mission fit, ownership, and recovery rather than taste. If a lower-level surface is selected, enumerate the additional lifecycle duties the application accepts.

The backend and computer section compares Local and Cloud without assuming parity. Record required filesystem, working directory, installed tools, network access, and secret locality. For Cloud candidates, specify selected-computer policy, offline behavior, sandbox equivalence criteria, and whether fallback pauses, escalates, or proceeds. Mark account access, hosted runtime version, connected-computer state, and sandbox availability unknown until separately observed.

The model decision section describes required capabilities before naming a model: context need, tool-use requirement, modalities, latency target, cost ceiling, provider restrictions, reasoning behavior, and fallback constraints. Record the intended configuration scope and who may change it. A target-scoped catalog observation, when separately authorized, can later populate candidates. Until then, the dossier must not convert a documentation example or type member into an availability claim.

Finish with a failure and reconsideration register. Include unavailable model, provider rejection, missing computer, changed checkout, runtime disconnect, client-entry mismatch, unsupported option, and package drift. For each, state detection evidence, safe stop, rollback, reconciliation owner, and conditions for reselection. Add explicit non-claims and reviewer sign-off fields. A useful dossier lets a new maintainer reconstruct why the topology is safe without relying on the original builder’s memory.

## Synthesis checkpoint after MOD-03

At this point in the curriculum, you should be able to connect mission, object ownership, and implementation surface in one chain. The mission defines required continuity and effects. The ownership model identifies persistent agent and conversation state separately from session, process, computer, and controller records. The topology decision then places each responsibility on a named host and chooses the highest-level supported surface that meets those requirements.

You should be able to defend the primary lane: TypeScript controller code on trusted Node; root Agent SDK entry point; Local backend as the implementation baseline; controller authority outside agent-editable memory; and static evidence pinned to Agent SDK `0.8.9` with its declared Letta Code `0.32.11`. You should also be able to contrast Cloud without claiming that it exists for the learner or behaves like Local. Cloud introduces target-specific account, hosted runtime, computer, sandbox, credential, catalog, and recovery questions.

You are not yet expected to provision an agent, open a session, stream a turn, recover a disconnect, or execute a tool. Selection precedes those skills. The checkpoint is passed when you can identify what must be verified before each operation and refuse to fill missing runtime facts with optimism.

## Transfer-focused formative questions

1. A team wants to move a repository-maintenance agent from a laptop to Cloud because “the agent memory is already there.” Which objects may persist, which local resources do not follow automatically, and what evidence must the team gather before authorizing fallback execution?

2. A browser application imports the portable client but its design also assumes local filesystem paths, Node-hosted MCP processes, and a privileged provider key. Redraw the trust boundary. Which responsibilities move to a server-side controller, and what remains legitimately portable?

3. An engineer proposes direct App Server protocol because a custom progress display is difficult through the current application layer. What requirement would justify the lower-level surface, and which connection, synchronization, correlation, abort, tool, and recovery duties must enter the dossier?

4. A target rejects the preferred model handle. The operator proposes another model from the same provider family. Why is family resemblance insufficient? Define the capability-equivalence and configuration-scope checks required before substitution.

5. A stateless query returns an excellent repository summary. The product mission also requires the agent to learn project conventions and resume unresolved review work tomorrow. Explain why output quality from one query does not satisfy the persistence architecture.

6. A team uses an OpenAI-compatible bridge to minimize client changes and concludes that approval recovery and conversation durability match the Agent SDK. Identify the unsupported inference and design a constrained role for the bridge that preserves controller ownership.

7. Two diagrams both say “Agent SDK Cloud.” One executes tools on a named workstation; the other permits a managed sandbox. List at least five acceptance or recovery facts that can differ despite the shared backend label.

8. A CLI script exits successfully after printing assistant text, but the mission required an external record update. What must be reconciled before completion, and why is process success not effect success?

9. A model override intended for one diagnostic session becomes a persistent conversation setting. How would you detect the scope error, classify outputs produced afterward, and restore the intended policy without pretending they were generated under the original configuration?

10. The exact package exports an option that current source narrows for some backends. Which evidence wins for the planned operation, and how should the discrepancy appear in code plans and the topology dossier?

11. A channel message reaches an agent conversation. Why does that not make the channel a generic job queue or grant authority to act on every requested effect? Identify route, sender, conversation, and controller-policy checks.

12. The hosted target cannot be inspected before design review. What useful decisions can still be made, and which claims must remain explicitly unknown rather than blocking all architecture work or being guessed?

## Source, package, and discrepancy boundaries

This module uses independently restated facts and original project examples. `SRC-DESIGN-SYNTHESIS` establishes the curriculum’s mandatory Agent SDK path and its topology vocabulary. It is a project design authority, not product implementation evidence. `SRC-SDK-NPM-0.8.9` and `SRC-SDK-SOURCE-0.8.9` identify the exact SDK artifact and static source lane. `SRC-CODE-NPM-0.32.11` and `SRC-CODE-SOURCE-0.32.11` identify the exact declared and standalone runtime artifact lanes. Artifact identity and source inspection do not demonstrate a live turn.

`SRC-DOCS-SDK-REFERENCE-20260916` supports current documented SDK concepts at its retrieval cutoff. `SRC-DOCS-APP-SERVER-20260911` and `SRC-DOCS-REMOTE-CLIENT-20260911` support selection literacy for those distinct surfaces. Documentation may change independently of package releases and does not prove behavior on an unobserved backend. Pointer records direct future maintainers to refresh volatile facts; they grant no execution authority.

Several registered discrepancies narrow this module. `DISC-VERSION-001` preserves the exact `0.8.9` and `0.32.11` baseline while treating prior tuples as historical. `DISC-CREATE-OPTIONS-001` warns that exported options are not universally accepted by backend-specific creation paths, so later implementation must use a safe subset. `DISC-SDK-REFERENCE-EXPORTS-001` prevents treating an overview page as a complete export ledger. `DISC-QUERY-TOPOLOGY-001` keeps agent-free query from becoming a universal substitute and records backend/computer constraints. `DISC-PORTABLE-ENTRY-001` requires separate root and portable-client treatment. `DISC-SANDBOX-LIFETIME-001` blocks simplistic cleanup assumptions. `DISC-RECONNECT-OWNERSHIP-001` and `DISC-CODE-0-32-11-LIFECYCLE-001` block generalized live recovery claims.

When these sources disagree or leave a gap, choose the narrower safe subset or mark the behavior unknown. Do not average documentation, types, and source into a convenient guarantee. A future runtime observation applies only to its exact version, backend, topology, target, and operation.

## Explicit non-claims

This module does not claim that any reader has a Letta account, hosted access, provider credential, model entitlement, connected computer, managed sandbox, Channel adapter, Remote environment, or deployable App Server. It does not claim any model is currently listed, usable, suitable, inexpensive, fast, or equivalent to another model. No catalog was queried and no provider was contacted.

It does not claim that Local, Remote, and Cloud share lifecycle, persistence, tool, filesystem, approval, queue, timeout, sandbox, or recovery behavior. It does not claim the root and portable entry points are interchangeable. It does not claim a documented endpoint, protocol, bridge, CLI flag, or UI makes every capability available on every backend.

No SDK code, runtime, model turn, query, prompt, session, computer, tool, channel, credential, API call, or effect was executed for this lesson. Static source and package evidence do not establish runtime ordering, durability, reconnection, performance, cost, security, privacy, or correctness. The worked examples are project-authored designs, not fixtures proving Letta behavior.

Completion of this module does not production-qualify an application. Production qualification separately requires target-specific security, tenancy, credentials, observability, incident response, capacity, cost, backup, recovery, migration, privacy, and rollback evidence. Reading this file grants no authority to install, connect, create, mutate, deploy, publish, or spend.

## Handoff to MOD-04

You now have a bounded mission, an ownership map, and a selected primary topology. MOD-04 applies those decisions to agent provisioning and management. It will treat creation as a reconciled controller operation rather than a one-line success story: establish a stable request identity, search before creation, retrieve a canonical agent ID, persist the mapping, handle partial success, and stop on ambiguity.

Carry the topology decision dossier forward. MOD-04 must know which backend is selected, where controller state lives, which exact package lane applies, which creation options belong to the safe subset, and which agent identifiers become durable application records. It must not reopen model, computer, or surface choices casually during provisioning. If implementation evidence contradicts the dossier, return to selection and revise explicitly rather than hiding topology drift inside agent creation.
