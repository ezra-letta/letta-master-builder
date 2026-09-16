# MOD-07 Tools MCP Permissions and Effects

| Metadata | Value |
|---|---|
| Status | ready |
| Design revision | 0.4 |
| Prerequisites | MOD-00 through MOD-06 |
| Capability IDs | CAP-TOOLS-LOCALITY; CAP-MCP-LIFECYCLE; CAP-PERMISSIONS-APPROVALS; CAP-EFFECT-RECONCILIATION |
| Evidence IDs | SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-DOCS-SDK-SESSIONS-20260916; SRC-DOCS-SDK-MCP-20260916; SRC-DOCS-SDK-PERMISSIONS-20260916; SRC-PRODUCTION-HEURISTIC |
| Discrepancy IDs | DISC-RECONNECT-OWNERSHIP-001; DISC-PORTABLE-ENTRY-001 |
| Pointer IDs | PTR-PERMISSIONS-001; PTR-MCP-001; PTR-APP-SERVER-TOOLS-001 |
| Project-method sections | authority envelope; effect ledger; reconciliation workflow |
| Source use | independently-restated; original examples |

## Learning contract

This module teaches how to design tool access without confusing technical reachability, model permission, business authority, and successful external effect. You will learn to classify tools by execution owner and locality, constrain discovery through toolsets and allowlists, design external callback boundaries, place MCP lifecycle and credentials, distinguish permission decisions from organizational authorization, and reconcile effects whose outcome is uncertain. The goal is an implementation-ready control design, not a claim that any tool ran.

The exact static baseline remains Agent SDK `0.8.9` with SDK-declared Code `0.32.11`. Package evidence supports names and static public shape only. No tool was exposed to a model or executed; no MCP server was started or contacted; no approval was classified, recovered, or answered. Reading this module authorizes no installation, process launch, credential use, network connection, model turn, file mutation, or external effect.

By completion, you should be able to inspect a proposed tool and answer: who registers it, who can select it, where it executes, where its secrets live, who approves invocation, who holds business authority, what evidence establishes completion, and what happens after timeout or disconnection. If any answer is absent, the design must narrow authority or stop.

## Why effect boundaries matter

Tools turn generated intent into changes outside the model's text. A harmless-looking invocation can write a file, send a message, change access, spend money, or trigger another system. Autonomous repetition magnifies mistakes: a timeout may cause duplicate delivery, a broad toolset may expose an unintended capability, or an approval callback may be mistaken for permission to violate a business rule.

The central boundary is between proposing an action and owning its consequences. A model may propose parameters. A session or harness may mediate tool selection. A client, runtime, server, or external service may execute. The controller still owns the authority envelope, budget, durable intent, reconciliation, and audit decision. These responsibilities cannot be inferred from a function signature.

Locality affects trust. Moving execution from a client process to a runtime or server changes which filesystem, network, identity, and credentials are reachable. The same display name does not establish equivalent implementation, policy, or effects. A portable entry point may also lack Node-specific integrations or expose different constraints; `DISC-PORTABLE-ENTRY-001` therefore prevents treating root and portable clients as interchangeable.

Effects also break the simple success/failure model. A callback can time out after the target accepted a request. A transport can disconnect while runtime work continues. A tool can return text that describes success without authoritative confirmation. Safe control needs at least four outcomes: confirmed success, confirmed failure, not attempted, and uncertain. Uncertainty is a state requiring investigation, not permission to retry.

## Tool classes and locality

Use three conceptual tool classes, while preserving exact surface-specific terminology in implementation records.

A **client tool** executes in application-controlled client space. The application owns its function body, local dependencies, process permissions, and result conversion. This placement can support access to application services, but it also means model-selected arguments approach trusted application capabilities. Validate inputs independently, limit outputs, and never infer that session permission supplies business authorization.

A **runtime tool** executes where the selected runtime owns execution. Its reachable files, processes, network, identity, and lifetime depend on topology and configuration. Closing a client connection does not by itself prove that runtime execution stopped. A controller must record the selected runtime and avoid projecting client cleanup semantics onto runtime state.

A **server or externally hosted tool** executes behind another service boundary. The caller may submit a request and later receive a callback, result, error, or status. The service owns part of execution, but the controller remains responsible for deciding whether the response corresponds to its intent and whether the external state is authoritative. Direct App Server external-tool details remain a distinct surface rather than ordinary Agent SDK behavior.

For every tool, maintain a locality card: registration owner, selection surface, execution host, credential host, input validator, effect target, timeout owner, cancellation semantics, result authority, and cleanup owner. If “server-side” is the only locality description, the card is incomplete.

### Toolsets and allowlists

A toolset groups discoverable capabilities; an allowlist constrains which capabilities are eligible in a particular authority envelope. Neither is a substitute for parameter validation or business policy. Allowing a messaging tool does not authorize every recipient. Allowing a filesystem tool does not authorize every path. Discovery should be minimal for the mission, and high-impact tools should require narrower invocation controls.

Resolve effective access as an intersection: tools registered for the surface, tools included by the selected toolset, tools allowed for the agent or work unit, tools permitted by session policy, and actions authorized by controller policy. An empty or ambiguous intersection should fail closed. Avoid denylist-only designs because newly added tools may become reachable before policy review.

Record stable tool identity rather than relying on a display name. Version the schema and policy assumptions. When a tool changes from read-only to effectful, treat that as an authority change even if its name remains unchanged.

## External callbacks, results, and errors

An external callback is a trust boundary. Treat callback arguments as untrusted input, even when initiated by a model-mediated request. Validate schema, size, identifiers, tenant, and correlation key before execution. Bind the callback to a durable intent and current lease. Reject stale, duplicate, cross-tenant, or unauthorized requests without exposing secret values in diagnostics.

Separate three products of execution. A **tool result** is structured data returned to the session or model. An **authoritative effect record** comes from the system that owns the changed state. An **audit record** explains what the controller authorized and observed. A fluent result string is not authoritative evidence. Store canonical external identity where available, then verify state through an appropriate read path.

Errors must preserve stage. Validation rejection means execution was not attempted. Precondition failure may establish no change. Transport timeout after submission is uncertain. A structured remote rejection can be confirmed failure if identity and scope match. Serialization failure after a completed effect is partial success. Flattening these into one exception invites unsafe retries.

Return only necessary information to model-visible context. Operational diagnostics may contain paths, account identifiers, or sensitive payloads that belong in protected logs. Model-facing errors should remain useful but bounded, while controller records retain correlation and evidence needed for reconciliation.

## Node MCP lifecycle and credentials

Static package evidence exposes MCP-related shapes such as `McpServers` and `McpServerConfig`; it does not prove that a server starts, authenticates, reconnects, or shuts down correctly. Node MCP integration is a lifecycle relationship among the client application, transport, MCP process or endpoint, session, and controller. Design ownership before configuration.

A lifecycle plan names who creates the transport, starts or connects to the server, waits for readiness, registers capabilities, handles loss, removes stale capability exposure, and closes resources. Current SDK documentation states that normal session close or asynchronous disposal closes the session's MCP connections and the child processes it started. That contract does not mean an independently hosted remote MCP service is terminated, nor does it prove cleanup after abnormal host death. Preserve those boundaries, await asynchronous disposal, and do not assume reconnect restores in-flight tool ownership.

Credentials belong on the host that needs them and outside model-editable memory, prompts, tool descriptions, fixtures, source files, and ordinary results. Pass opaque secret references where possible. Separate credentials for MCP transport authentication from credentials used by a downstream tool. The model may know that a capability is available without seeing the credential that powers it.

Define trust zones: controller-only secrets, execution-host secrets, service-issued short-lived tokens, and model-visible nonsecret identifiers. Log secret names or redacted fingerprints only when operationally necessary. Rotation, revocation, expiry, and incident handling remain controller or platform responsibilities, not instructions entrusted to agent memory.

## Permissions, approvals, edits, and interactive input

Package evidence includes permission-related public shapes such as `PermissionMode`, `CanUseToolCallback`, and `SessionDiffPreview`. These establish a static vocabulary, not observed ordering or recovery behavior. `DISC-RECONNECT-OWNERSHIP-001` limits assumptions about pending approvals after disconnect or reconnect.

A permission mode defines how a harness mediates candidate tool use. An approval callback decides whether a particular proposed invocation may proceed under that session policy. It should inspect stable tool identity, validated arguments, work-unit authority, tenant, risk class, remaining budget, and current lease. Avoid callbacks that approve solely by tool name or natural-language rationale.

Approval may include edits. Treat edited arguments as a new candidate requiring validation and policy evaluation. Preserve the original proposal, reviewer or policy identity, edits, and final approved form. A diff preview is evidence for review, not proof that the intended patch was applied. After execution, reconcile authoritative state rather than declaring completion from the preview.

Interactive input is another authority boundary. A model request for clarification is not permission to fabricate an answer or indefinitely block an autonomous loop. Define who may answer, through which authenticated channel, within what deadline, and whether the response can expand scope. Sensitive input should not be copied into transcript or memory merely because a tool prompt requested it. On timeout, expire or suspend the work unit according to policy.

### Approval versus business authorization

Harness approval and business authorization answer different questions. Approval asks whether this technical invocation may proceed under session rules. Business authorization asks whether the organization permits this actor, purpose, target, amount, timing, and data use. A callback can approve technically valid syntax while the action remains commercially, legally, or operationally forbidden.

Require business authorization before or within the approval decision, using controller-owned policy or an authoritative service. Examples include recipient ownership, spending limits, change windows, separation of duties, and tenant consent. Never let model confidence, tool availability, or a human's generic session approval silently expand those constraints.

## Effect-reconciliation workflow

The following workflow is project-owned architecture guidance, not a Letta transaction API.

1. Classify the operation as read-only, idempotent, compensatable, or irreversible. Identify the authoritative system and verification path.
2. Validate mission scope, business authorization, tenant, tool identity, arguments, lease, and budgets before exposing approval.
3. Create a durable intent with a stable idempotency or correlation key before execution. Record expected effect and preconditions.
4. Obtain technical approval without treating it as broader authority. Preserve edits and the final authorized arguments.
5. Execute once through the selected locality. Mark `submitted-unconfirmed` when control passes to an effect owner.
6. Capture structured result, error stage, canonical external identity, timestamps, and transport state. Redact secrets.
7. Verify authoritative external state. Compare identity, tenant, parameters, and expected postcondition rather than trusting result prose.
8. Mark confirmed success or confirmed failure only when evidence supports it. Otherwise mark outcome uncertain.
9. For uncertainty, look up by stable key or canonical identity. Do not blind-resend. Stop on zero unverifiable matches, multiple matches, stale authority, or lease loss.
10. If policy allows, compensate a confirmed undesired effect through a separately authorized operation. Reconcile the compensation itself.
11. Persist terminal state, evidence links, costs, approvals, and residual risk. Escalate irreversible ambiguity to supervision.

Consider an original invoice-submission design. The callback times out after sending request key `INV-42`. The controller records uncertainty. A lookup finds one invoice with that key and matching tenant, amount, and recipient; authoritative status shows accepted. The controller marks success without resending. If two invoices match, it stops and escalates. This trace tests project policy only; it makes no claim about an SDK invoice tool, callback ordering, durability, or runtime behavior.

## Original uncertain-effect trace: controlled supplier suspension

A procurement controller receives a proposal from an agent: suspend supplier account `SUP-17` because three invoices appear inconsistent. Suspension blocks new orders and is reversible, but it can disrupt operations. The proposal is not an instruction to execute. The controller records proposal `P-701`, the evidence references supplied by the agent, the requested duration, and the asserted reason. It classifies the action as effectful and compensatable, with a high business impact. The proposal remains model-authored and untrusted until policy checks finish.

The controller next obtains business authorization. An authoritative policy service confirms that the work unit belongs to the correct tenant, the supplier is within the requester's portfolio, and temporary suspension is permitted only when a procurement manager and fraud reviewer approve. The manager approves a twenty-four-hour suspension; the fraud reviewer approves only twelve hours. The controller does not average the two limits or select the broader one. It derives the safe intersection: twelve hours, no cancellation of existing orders, and mandatory review before extension. It records both authorizers, policy revision, scope, expiry, and the resulting authorization envelope.

Only then does the controller prepare technical permission review. The proposed tool is identified by stable registry identity rather than display name. Its locality card says that the callback runs in the application process, uses a service client held outside model context, and submits to the procurement system. The allowlist permits `supplier.suspend` for this work unit but not deletion, order cancellation, or credential management. Arguments include tenant, supplier, reason code, twelve-hour expiry, and correlation key `SUSP-P701-1`.

The permission callback returns an approval with an edit: it changes the free-form reason to the standardized code `suspected-invoice-fraud`. The edit produces a new candidate rather than mutating the already checked request invisibly. The controller validates the code, confirms that business authorization permits it, compares the complete argument diff, and records original and approved forms. Had the edit changed supplier, tenant, duration, or operation class, the controller would have restarted business authorization instead of accepting the callback's authority expansion.

Before dispatch, the controller writes durable intent `E-880` with state `authorized-not-dispatched`, expected postcondition, stable correlation key, current lease, and a lookup procedure. It checks the lease and budget again, then calls the client-local callback once. When control passes to the service client, state becomes `submitted-unconfirmed`.

The callback does not return before its deadline. The controller requests abort through the available client boundary, but receives no authoritative confirmation that the remote procurement system cancelled processing. Abort here expresses a request to stop; it does not reverse time or prove that the target ignored the submission. The controller therefore records both timeout and abort attempt, preserves the original key, and transitions to `outcome-uncertain`. It does not report failure to the model and does not dispatch a second suspension.

The lookup phase uses a separate read capability and the stable key. First lookup returns no record, but its response carries a replica timestamp earlier than dispatch. The controller refuses to interpret this stale negative as proof of absence. It waits only within the work unit's bounded reconciliation policy and queries the authoritative record path. That lookup finds one operation with key `SUSP-P701-1`, correct tenant and supplier, accepted at a time after dispatch. A subsequent supplier read shows suspension active with the approved reason and twelve-hour expiry.

Verification compares more than existence. The controller checks canonical supplier identity, tenant, operation type, effective and expiry times, reason code, and source correlation. All match the authorized intent. The state becomes `confirmed-success`; no retry occurs. The audit record links proposal, business approvals, technical approval and edit, dispatch, timeout, abort request, lookup evidence, and verified postcondition. The model may receive a bounded summary without service credentials or protected diagnostic content.

Different lookup outcomes produce different decisions. A fresh authoritative lookup proving that no operation was accepted can permit retry only if the lease, authorization, budget, and retry limit remain valid and the same stable key is reused. One matching accepted operation means verify and close, not retry. A matching operation with an unauthorized thirty-day expiry requires a separately authorized compensation, such as restoring the supplier or correcting expiry, followed by reconciliation of that compensation. Two plausible records, a tenant mismatch, missing authoritative reads, expired authorization, or lost lease requires escalation and no further mutation. An irreversible effect with ambiguous outcome cannot be “fixed” by speculative repetition; supervision owns the next decision.

This original project-method trace does not claim that Letta supplies these tools, policy services, states, abort guarantees, lookup consistency, or compensation semantics.

## Failure modes and recovery decisions

### Tool locality confusion

A design registers a tool in a client but documents it as runtime-local, causing reviewers to assume different filesystem, identity, and cleanup boundaries. Another design treats a server callback as if client disconnection terminated it. Recovery begins by suspending effectful use, rebuilding the locality card from registration through execution and verification, and removing unsupported cleanup assumptions. If execution owner cannot be identified, the tool remains unavailable.

### Overbroad allowlist scope

An allowlist names a general administrative toolset when the mission requires one read and one bounded update. A newly added destructive capability could become discoverable without work-unit review. Recover by using stable tool identities, positive mission-specific grants, parameter and target constraints, expiry, and explicit default denial. Re-evaluate the effective intersection whenever toolset membership or schema changes. A tool name alone never grants all arguments or effects.

### MCP credential and lifecycle ambiguity

An MCP configuration places a long-lived token in model-visible instructions, while no component owns transport closure or capability removal after loss. Stop before connection. Move credentials to the execution host's protected secret mechanism, replace values in records with opaque references, rotate exposed credentials, and identify creation, readiness, loss, reconnect, shutdown, and stale-registration owners. Do not assume a session close killed a process or that a reconnected transport recovered pending calls.

### Secret exposure through results and diagnostics

A callback includes authorization headers or service payloads in a tool error returned to the model. Treat this as a security incident, not merely poor formatting. Halt propagation, revoke or rotate affected secrets, preserve a protected incident record without repeating values, and review transcript, memory, fixtures, and logs for exposure. Redesign error conversion so model-facing output contains bounded codes and safe context while protected diagnostics retain necessary correlation.

### Approval argument-edit drift

An approver changes an innocuous field but the callback applies a broader argument object, silently altering tenant, recipient, amount, path, or duration. Recovery requires treating every edit as a new candidate, producing a complete structural diff, rerunning schema and policy checks, and renewing business authorization for material changes. Preserve the original, proposed edit, final authorized form, and approver identity. If the final dispatched arguments cannot be reconstructed exactly, mark the outcome unverified and investigate authoritative state.

### Approval mistaken for business authority

A human clicks approve because the tool invocation is technically safe, but organizational policy forbids the transaction during a change freeze. Stop dispatch even though harness approval exists. Obtain authorization from the owning policy or accountable role and bind it to actor, purpose, tenant, target, limits, and time. Generic consent, model urgency, or prior approval for a similar request cannot fill the gap.

### Irreversible effects without reconciliation

A controller sends an irreversible notification or destructive request without a stable key, authoritative lookup, precondition, or bounded confirmation plan. After timeout, no safe automatic retry exists. Escalate immediately, preserve every available identity and timestamp, and prevent further effects on the same subject until supervision resolves ambiguity. For future operations, prefer staged or reversible designs, dry-run validation, dual authorization, unique correlation, and authoritative postcondition checks. If an effect cannot be verified or compensated, its approval threshold and stop conditions must be stricter before first dispatch.

### Abort interpreted as rollback

A controller issues abort and marks the external effect cancelled. Abort may only stop local waiting or request cancellation while remote execution has already completed. Recovery is to mark uncertainty, query authoritative state, and compensate only under new authority. Never use an abort acknowledgement from the wrong ownership layer as proof of target rollback.

### Result prose treated as completion

A tool returns “done,” but no canonical identity or target read supports the statement. Keep the work item unconfirmed. Parse structured identifiers, verify the authoritative system, and distinguish accepted request from achieved business outcome. If no verification path exists, narrow the tool's permitted use or require supervised confirmation.

## Tool and Effect Authority dossier artifact

Under separate implementation or assessment authority, produce one **Tool and Effect Authority Record** for each claim-bearing tool operation. The record connects mission intent to an inspectable effect boundary. It is not a tool configuration alone and not a transcript summary. It must let a reviewer reconstruct why an invocation was reachable, authorized, dispatched, interpreted, and closed.

Begin with identity and scope: dossier ID, curriculum release and digest, work-unit ID, tenant, accountable controller, agent and session references when applicable, exact package tuple, surface, backend, topology, and evidence cutoff. Record the tool's stable identity, schema revision, tool class, toolset membership, allowlist rule, risk class, and effect classification. Display names may appear for readability but cannot serve as durable identity.

Add a locality map naming registration owner, discovery surface, execution host, filesystem and network boundary, credential host, target system, timeout owner, cancellation owner, result receiver, authoritative verification path, and cleanup owner. For MCP, include server or endpoint identity, transport class, process owner, readiness boundary, capability registration and removal owner, reconnect policy, shutdown procedure, and credential reference. Never place credential values in the dossier.

The authority envelope records immutable mission purpose, permitted operation, subjects and targets, tenant, parameter constraints, time window, lease, cost and retry budgets, business-policy source, required roles, separation-of-duty rules, and explicit prohibitions. Attach business authorization identities and revisions without treating a generic human approval as unlimited consent. If authority expires or the lease is lost, the dossier must show that dispatch stops even if a session still offers the tool.

The permission section preserves the original model proposal, validated candidate, permission mode, callback decision, approver or policy identity, complete argument diff, and final authorized request. Material edits trigger renewed business authorization. Interactive input records who may answer, authenticated channel, deadline, permitted scope, redaction policy, and the state reached on timeout. Answers do not silently widen the authority envelope.

The effect ledger begins before dispatch. Record a stable correlation or idempotency key, expected preconditions, expected postcondition, dispatch attempt count, state transitions, canonical external identity, structured result, staged errors, abort or cancellation requests, and timestamps. Distinguish `authorized-not-dispatched`, `submitted-unconfirmed`, `confirmed-success`, `confirmed-failure`, `outcome-uncertain`, `compensation-pending`, and `escalated-stop`. These are project-owned dossier states, not SDK events.

For reconciliation, preserve each lookup's source, freshness, authority, matches, tenant and identity comparison, and conclusion. State why retry was permitted or forbidden. If compensation occurs, create a linked effect record with its own authorization and reconciliation rather than rewriting the original effect as though it never happened. Residual ambiguity, irreversible impact, and supervisor decisions remain visible.

Close the dossier with model-visible output boundaries, protected diagnostic references, secret-exposure review, costs, cleanup evidence, final status on each relevant axis, non-claims, and reviewer sign-off. A static exercise may populate design fields and synthetic transitions, but runtime fields remain `unknown-not-tested` unless separately authorized evidence exists. Production qualification requires a distinct environment-specific record.

A reviewer should be able to ask six questions and point to exact fields: What capability was reachable? Where did it execute? What business authority applied? What request was actually dispatched? What authoritative evidence established the outcome? What prevented repetition after uncertainty? If the dossier cannot answer one, the operation is not ready for unsupervised effect authority.

## Formative transfer questions

1. A model can see a tool because it belongs to a registered toolset, but the work-unit allowlist does not mention it. Is the tool eligible, and which intersection determines the answer?

2. A client callback uses a server credential and returns a timeout after submission. Which component owns the credential, which state should the controller enter, and why is immediate retry unsafe?

3. An approval callback changes a destination path while leaving the tool name unchanged. Which validations and authorizations must be repeated before dispatch?

4. A human approves a payment tool invocation, but the amount exceeds an authoritative business limit. Explain why technical approval cannot override that policy.

5. An MCP transport reconnects and advertises the same capability names. What evidence is still needed before treating prior in-flight calls or approvals as recovered?

6. A runtime-hosted tool and client-local tool share a display name and schema. List at least five locality properties that may still differ.

7. A result says that a message was delivered but supplies no canonical recipient record or authoritative status. Which conclusions are allowed, and what verification path should the controller seek?

8. A fresh lookup finds no effect under the stable key. Under what additional conditions may retry be considered, and which conditions still require stopping?

9. An effect succeeded with edited arguments outside business authorization. Why is this not simply a confirmed success, and how should compensation be governed?

10. A secret appears in model-visible tool output. Describe immediate containment, evidence preservation, rotation, and redesign without repeating the secret.

11. A session normally closes after starting an SDK-owned MCP child process. What does the documented close/dispose contract cover, what independently hosted or abnormal-termination cases remain outside it, and what evidence should operations retain?

12. An irreversible operation lacks a lookup endpoint. How should that limitation change approval threshold, dispatch design, and timeout response?

13. Distinguish validation rejection, confirmed remote rejection, transport timeout after submission, and serialization failure after effect completion. Which permit ordinary retry?

14. A controller loses its lease after technical approval but before dispatch. What state and audit decision should follow?

15. A project fixture demonstrates correct uncertain-effect handling. Which implementation status might it support, and which runtime and production claims remain forbidden?

16. Design the smallest allowlist for a mission that may read one supplier and suspend it for no more than twelve hours. Identify constraints beyond the tool name.

17. A diff preview exactly matches an authorized file patch. Why must the controller still verify the applied state after execution?

18. Explain how a dossier can preserve useful protected diagnostics while preventing secret or sensitive payload exposure to the model.

## Exact evidence and discrepancy boundaries

The exact static package lane for this module is `@letta-ai/letta-agent-sdk@0.8.9` with SDK-declared `@letta-ai/letta-code@0.32.11`. `SRC-SDK-NPM-0.8.9` and `SRC-SDK-SOURCE-0.8.9` support static public package shape for tool, MCP, and permission-related symbols registered to this curriculum. `SRC-DOCS-SDK-SESSIONS-20260916`, `SRC-DOCS-SDK-MCP-20260916`, and `SRC-DOCS-SDK-PERMISSIONS-20260916` support the dated documented session cleanup, MCP locality/lifecycle, allowlist, permission-mode, approval-edit, and recovery semantics used here. None establishes that a selected target accepts every represented option or that abnormal cleanup and reconnect behave beyond the documented scope.

Current official documentation may describe intended tool, permission, MCP, or direct App Server use when a registered dated source is attached. A docs statement remains separate from exact declarations, immutable source, selected runtime observation, and project method. Pointer IDs locate evidence under the repository contract; following them grants no authority to connect, install, approve, or execute.

`DISC-PORTABLE-ENTRY-001` limits parity claims between the root Node entry point and the portable client. Node MCP, image, skill-path, and credential capabilities cannot be projected onto browser or React Native surfaces. Portable selection remains separately scoped. `DISC-RECONNECT-OWNERSHIP-001` blocks generalized claims about approval and execution recovery across SDK sessions, App Server listeners, and transports. Pending approval, replay, reconnect, and callback ownership remain exact-surface and runtime questions.

`SRC-PRODUCTION-HEURISTIC` supports this module's project-owned effect reconciliation and governance guidance. Stable keys, controller intents, leases, budgets, business-authorization records, effect states, lookup rules, compensation, and escalation are mandatory Master Builder methods where applicable. They are not presented as built-in Letta transactions, APIs, persistence guarantees, or production controls.

No Letta runtime, model, MCP server, tool, or effect was queried for this module. Dated documentation was retrieved as documentary evidence, but no fixture or prose trace promotes itself into runtime evidence. Unknown behavior stays unknown until a separately authorized observation binds exact operation, package tuple, target, topology, timestamp, credentials boundary, effects, stop conditions, cleanup, and result.

## Explicit non-claims

This module does not claim that any client, runtime, server, or external tool was registered, discovered, exposed to a model, selected, invoked, cancelled, or completed. It does not claim equivalent tool availability, filesystem reach, network access, process permissions, cleanup, or result semantics across Local, Cloud, hosted, direct App Server, portable, or other topologies.

It does not claim that a toolset or allowlist enforces business policy by itself, that an allowed tool permits every argument, or that model selection proves authorization. It does not claim callback ordering, delivery, durability, uniqueness, replay, timeout meaning, abort effectiveness, cancellation, or exactly-once execution. Tool result prose is not claimed to prove an external business outcome.

It does not claim that an MCP server was started, contacted, authenticated, made ready, reconnected, or shut down. It does not claim that session close terminates an MCP process, that transport recovery restores pending calls, or that root Node MCP behavior applies to portable clients. No MCP credential exists in this lesson, and no storage, injection, rotation, or revocation mechanism was tested.

It does not claim that any permission mode was exercised, any approval was requested or answered, any argument edit was applied, any diff was generated, or any interactive input was recovered. Harness approval is not claimed to establish organizational, legal, financial, tenant, or data-use authorization. Business authorization does not prove technical execution.

It does not claim that secret values are safe merely because examples omit them. No credential boundary, protected log, redaction mechanism, secret manager, transport authentication, TLS property, account entitlement, or tenant isolation was tested. A controller design cannot certify security compliance.

The uncertain-effect workflow is project method. It does not guarantee idempotency, authoritative lookup, compensation, rollback, durable controller storage, or reconciliation support from Letta or an external service. Static package evidence, compilation, an original trace, and project fixture conformance do not prove runtime behavior. Runtime observation, if later authorized, does not automatically establish reliability, security, scalability, cost control, incident readiness, or production qualification.

## Handoff to MOD-08

MOD-07 placed one tool invocation inside a bounded authority and reconciliation envelope. MOD-08, **Bounded Work Loops and Triggers**, expands from one effect to repeated work: leases, checkpoints, retry and failure budgets, queue ownership, schedules, Channels, external triggers, and stop conditions. Carry forward the Tool and Effect Authority Record. Every loop step that can cause an effect must preserve stable intent, locality, business authorization, technical permission, uncertain outcome, and authoritative reconciliation.

Do not let repetition weaken this module's controls. A schedule is not standing permission for unlimited effects. Queue acceptance is not completion. A trigger does not renew an expired lease or budget. A disconnected controller must not assume failed execution. MOD-08 will govern when another cycle may begin, while MOD-07 continues to own reconciliation of each individual effect.

The handoff grants no authority to create a schedule, enqueue work, route a Channel message, run an agent loop, use credentials, or execute a canary. Product behavior remains exact-version and topology scoped; runtime behavior remains unobserved here; production remains not qualified.
