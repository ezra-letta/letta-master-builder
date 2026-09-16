# MOD-05 Conversations Sessions Turns and Recovery

| Field | Value |
|---|---|
| Status | ready |
| Prerequisites | MOD-04 |
| Capability IDs | CAP-CONVERSATION-MANAGEMENT; CAP-SESSION-LIFETIME; CAP-TURN-STREAMING; CAP-MESSAGE-RECONCILIATION; CAP-QUEUES-ENQUEUE; CAP-RECOVERY-APPROVALS |
| Evidence IDs | SRC-DOCS-STATEFUL-AGENTS-20260911; SRC-DOCS-SDK-REFERENCE-20260916; SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-CODE-NPM-0.32.11; SRC-CODE-SOURCE-0.32.11; SRC-DESIGN-SYNTHESIS |
| Project-method sections | Typed lifecycle ledger; terminal-outcome gate; transcript reconciliation; recovery-state workflow |

## Learning contract and prerequisites

This module teaches how to control a conversation without confusing durable state, a live connection, one unit of inference, and the messages projected from that unit. By the end, you should be able to name every lifecycle object, choose between a virtual default conversation and a concrete conversation identifier, wait for session readiness, delimit session lifetime, distinguish sending from streaming, recognize terminal outcomes, reconcile a transcript by message identity, separate an active-turn queue from Cloud enqueue, and recover after interruption without duplicating work.

MOD-04 is required. You should already treat an agent identifier as canonical controller state and know that creation, retrieval, update, and deletion are separate operations. MOD-02 supplies the ownership model: an agent is a persistent entity, conversations are distinct threads associated with it, and client sessions are not the agent itself. MOD-03 supplies topology discipline. Local, Cloud, and other runtime surfaces cannot be assumed to have identical connection, delivery, or recovery semantics.

The primary lane is Agent SDK `@letta-ai/letta-agent-sdk@0.8.9` with its declared Letta Code `0.32.11` runtime dependency. The documentation and exact package/source records listed above provide current documented and static artifact evidence. No session was opened, no turn was submitted, no queue was exercised, and no event order was observed. This lesson therefore teaches conservative controller design, not a live ordering guarantee.

## Why lifecycle precision matters

A useful persistent agent may outlive applications, sockets, processes, computers, and user-interface tabs. That durability is valuable only if a controller knows which state is durable and which state is temporary. Closing a session must not be described as deleting an agent. Losing a stream must not be called a failed turn without reconciliation. Receiving assistant text must not be called successful completion when a later terminal result can report failure. Accepting enqueued input must not be called completed inference.

Revision 0.4 adopts a fail-closed rule for reconnect, replay, approval recovery, queue, abort, tool lifetime, and persistence. A declaration or source branch may establish that a method or event shape exists. It does not establish live behavior for an untested backend. The controller should accept only the guarantees supported by the selected surface, exact version, and separately registered runtime evidence.

## Vocabulary: six different objects

An **agent** is the persistent identity discussed in earlier modules. Its memory and configuration can be shared across its conversations. A **conversation** is a message thread belonging to an agent. It has its own identifier and can carry conversation-scoped configuration and history. Multiple conversations let one persistent agent maintain independent threads without pretending each thread is a new agent.

A **session** is a client-side or runtime-control lifetime used to interact with an agent and conversation. The exact SDK exports a session class and readiness and cleanup surfaces, but a session is not durable identity. Its process, transport, tool registration, callbacks, and approval handlers may disappear even while the agent and conversation remain. Session closure should be recorded as release of client/runtime resources, not deletion of persistent state.

A **turn** is one submitted unit of conversational work: input enters, reasoning and tool activity may occur, and a terminal outcome eventually classifies the attempt. A **run** is an execution correlation identity that may appear on streamed events or terminal records. Do not assume that “turn” and “run” are universally one-to-one. Preserve returned run identifiers and interpret their relationship only according to exact surface evidence.

A **message** is a durable or projected conversational record such as user input, reasoning, assistant content, tool call, or tool return. Exact SDK message shapes include fields such as UUIDs, output-turn identifiers, sequence identifiers, run identifiers, tool-call identifiers, and content. Different fields answer different questions. A message UUID may identify a record, a tool-call ID associates call and return, a run ID associates execution, and a sequence ID orders within a declared projection. Do not collapse them into one generic event ID.

A **stream event** is an observation delivered while a turn is in progress. It may contain a delta, a projected message, retry information, tool activity, or a terminal result. It is not automatically a durable transcript row. The controller needs an explicit mapping between observed events and later authoritative message history.

## Virtual default and concrete conversations

Some surfaces accept a special `default` conversation selector associated with an agent. Treat this as a **virtual selector**, not as permission to invent a concrete ID. A controller may use the selector when the exact operation documents it, but it should capture the concrete conversation ID returned by initialization, bootstrap, a terminal result, retrieval, or creation when the operation supplies one.

This distinction matters during recovery. The word `default` is scoped to an agent. It is not globally unique, and it should not be placed into a store as if it were a backend-issued conversation identity. A controller work record should contain both fields when necessary: `requestedConversation = default` and `resolvedConversationId = conversation-…`. Subsequent status checks, message retrieval, and direct thread continuation should prefer the resolved canonical ID when the selected surface supports it.

Create a separate concrete conversation when the thread needs independent configuration, audit scope, retention, permissions, or user intent. Continue an existing concrete conversation when continuity is required. Do not silently switch threads after a transient failure. If resolution yields no ID, multiple candidates, or an agent mismatch, stop and reconcile rather than guessing.

## Session readiness, lifetime, and close

Session construction does not necessarily mean the runtime is ready for input. Revision 0.4 requires an explicit readiness gate. The controller should create or resume the session, await the exact readiness signal supplied by the SDK surface, capture initialization facts such as agent and conversation IDs, and only then permit turn submission. A timeout before readiness produces an unknown or failed-to-initialize session state, not a safe invitation to submit through another connection.

Close has a narrow meaning: stop using the client/session resources according to the exact API contract. It must not be generalized into cancellation of all accepted work, destruction of a managed sandbox, deletion of a conversation, or deletion of an agent. Sandbox lifetime is separately scoped, and accepted remote work may continue after a waiting client disappears. If work could still be active, reconcile it before declaring the work unit closed.

## Send, stream, and terminal outcomes

A convenience send may aggregate work and return a final result. A streaming send exposes intermediate events while the turn runs. Choose based on control needs, not merely presentation. Streaming is appropriate when the application must render progress, serve external tool calls, process approvals, or maintain liveness. Aggregated sending is simpler when only the terminal result matters and the connection budget safely covers the operation.

In either form, submission is not success. Persist a controller-generated request identity before sending. Record the target agent and conversation, immutable input hash, allowed effects, and attempt number. Once submission may have crossed the boundary, a timeout becomes **outcome unknown** until status or history reconciliation proves otherwise. Do not resend the same semantic request merely because no terminal event was observed.

Intermediate assistant content is not the terminal gate. Exact SDK static shapes include a result record with success, result, conversation ID, stop reason, error information, recoverability, recovery attempts, run IDs, duration, and cost fields. The controller should consume the exact result shape defensively: confirm correlation, classify success or failure, preserve stop and error data, and then apply task-level acceptance criteria. A successful runtime result can still fail the application contract.

No event ordering beyond the static shape is claimed here. Implement stream handling as a state machine that tolerates unknown event variants, deduplicates known identities, and refuses to infer a missing terminal outcome. If the stream ends without a terminal record, mark the turn uncertain and enter recovery.

## Message identity and transcript projection

A displayed transcript is a **projection**, not automatically the authoritative event log. Streams may expose text deltas and complete message records. Message listing may later return persisted rows. Reconnect or bootstrap may replay overlapping material. A correct accumulator therefore keys records by the strongest available identity and associates deltas with their output-turn or message identity rather than blindly appending strings.

Keep raw observations separate from normalized transcript rows. For each observation, preserve source, receive time, type, UUID when present, output-turn ID, sequence ID, run ID, tool-call ID, and content hash. The normalized projection can then coalesce deltas, pair tool calls with tool returns, and mark provisional rows until persisted history confirms them. Unknown event types should be retained as opaque evidence instead of discarded or rendered as assistant speech.

When retrieving history, respect pagination and truncation. A partial page is not the complete conversation. Reconcile overlaps by identity, detect contradictory content under the same identity, and stop if two records cannot be safely ordered from supported fields. Wall-clock arrival at one client is not proof of canonical runtime order.

## Active-turn queue versus Cloud enqueue

An **active-turn queue** holds additional input associated with a conversation whose turn is already active. Exact static surfaces include queue-item and queue-update shapes and removal control. Removing a queued item should be understood narrowly: it removes that pending input when supported; it does not stop the active turn. Queue identity must be recorded separately from message, turn, and run identity.

**Cloud enqueue** is a durable submission surface represented in the exact SDK by enqueue options and a result shape. Its acceptance boundary differs from completing inference. A returned receipt can establish HTTP or service acceptance and provide correlation data, but it does not prove that a model turn started, that tools ran, that a reply was produced, or that application acceptance passed.

Do not assume active queues and Cloud enqueue have the same durability, placement, cancellation, or recovery behavior. Choose one only from exact topology evidence. For either, persist a client message or idempotency identity before submission. If acceptance is uncertain, inspect authoritative conversation state before retrying. If removal or cancellation is unsupported or ambiguous, expire controller authority and reconcile eventual results rather than claiming the work vanished.

## Recovery-state workflow

The project-owned recovery workflow begins with a durable controller ledger. Before submission, write `prepared` with request identity, input hash, target IDs, lease, budgets, approval policy, and effect classification. After the call may have crossed the boundary, write `submitted-unknown` unless a specific receipt proves acceptance. A positive receipt advances to `accepted`, not `completed`.

While connected, associate stream observations with the attempt and checkpoint provisional transcript state. A terminal result advances the runtime attempt to `terminal-success` or `terminal-failure`. Then validate application acceptance and external effects. Only accepted output advances the work unit to `completed`.

After disconnect, process restart, missing terminal output, or timeout, freeze retries. Re-establish the exact agent and concrete conversation identity. Use supported bootstrap, message listing, status, or approval-recovery surfaces to reconstruct state. Check whether the original input exists, whether a matching run or terminal result is visible, whether a tool effect may have occurred, and whether an approval remains pending. Exact `0.8.9` and `0.32.11` source presence does not prove that every topology supports the same recovery route.

If a terminal result is found, attach it to the original attempt and validate it. If input is accepted but still active, resume observation only when the exact surface supports doing so; otherwise wait or escalate under the lease. If a pending approval is recovered, reapply current controller policy rather than automatically approving the prior request. If an external effect is uncertain, query its authoritative system using the stable request identity before allowing another execution.

If no evidence distinguishes “never accepted” from “accepted but not projected,” remain `unknown` and require human or supervisor resolution. Do not manufacture success, failure, or safe retry. Record the evidence searched, pagination limits, topology, exact versions, timestamps, and remaining uncertainty. This conservative state machine preserves durable agent work without turning transport loss into duplicate action.

## Original worked trace: interrupted evidence review

Consider an application controller that asks a persistent research agent to review a fixed evidence bundle and return three claims with source identifiers. This trace is an original project scenario, not a record of live SDK behavior. Its transitions show what the controller should know and what it must leave unknown.

**State 0 — prepared.** The controller generates input identity `review-041`, computes a hash of the exact prompt and evidence manifest, and records agent `A`, requested conversation selector `default`, attempt `1`, read-only effect class, deadline, and acceptance criteria. It has not contacted a runtime. The controller can safely abandon this state because no submission occurred.

**State 1 — session opening.** The controller opens a session for agent `A` and the default selector. It stores `opening`, but sends no input yet. A session object existing in application memory is not readiness evidence. When the declared readiness mechanism succeeds, initialization supplies concrete conversation `C17`; the controller records `requested = default`, `resolved = C17`, and advances to `ready`. If readiness times out, it closes what it can and marks initialization failed or unknown according to whether any runtime start may have crossed the boundary. It does not submit through a second session merely to see whether that works.

**State 2 — input submitted.** From `ready`, the controller submits the immutable input carrying `review-041` in controller correlation state. It records the returned turn or run identities when available and changes the attempt to `submitted`. The input hash remains fixed. **State 3 — provisional stream.** The stream emits text fragments associated with one output-turn identity. The transcript accumulator stores each raw observation with its sequence and run fields, then constructs a provisional assistant row: “Claim one…” followed by later fragments. It does not render each fragment as a separate durable message, and it does not treat readable prose as completion. A projected tool call and tool return, if present, are paired by tool-call identity rather than arrival proximity.

**State 4 — terminal result.** A terminal result reports success, concrete conversation `C17`, and its run identities. The controller correlates it with attempt `1`, closes the provisional stream, and retrieves or later reconciles conversation messages. A persisted assistant message with a stable UUID contains the same assembled content. The projection links the provisional output-turn row to that persisted message instead of displaying both. The controller then validates that exactly three claims, source identifiers, and uncertainty notes are present. Runtime success plus contract validation advances the work unit to `completed`; runtime success alone would have advanced only the attempt.

Now change the middle of the trace. While attempt `1` is active, a user asks, “Also list conflicts.” If the selected surface exposes an active-turn queue, the controller assigns queue item `Q9` and records it as pending input for `C17`. Acceptance into that queue does not prove the active turn consumed it. Removing `Q9`, if supported and confirmed, removes only that pending item; it does not cancel attempt `1`.

Alternatively, the application uses a Cloud enqueue surface for a separate follow-up carrying client identity `conflicts-042`. The receipt proves only the named acceptance boundary and is stored with the returned agent and conversation correlation. The controller does not mark the follow-up running or completed. It waits for supported status, transcript, or terminal evidence. **State 5 — disconnect uncertainty.** In a second run of the scenario, the stream ends after two deltas and before a terminal result. The controller has evidence that submission may have occurred and that some output was observed, but no terminal classification. It records `terminal-unknown`, freezes blind retries, retains the provisional deltas, and closes only its local session resources. It does not convert a transport disconnect into turn failure, and it does not assume that close stopped runtime work.

**State 6 — bootstrap and resume decision.** A replacement controller loads the durable ledger, reopens control for agent `A` and concrete conversation `C17`, waits for readiness, and invokes only recovery surfaces supported by the chosen topology. Bootstrap or message listing reveals the original input and a persisted assistant message but no trustworthy terminal result in the bounded evidence available. That proves more than silence but less than accepted completion. The controller reconciles overlapping deltas by identity and keeps the attempt uncertain. If a supported resume mechanism can reconnect to the same execution owner and recover a terminal outcome, it may use that path; source presence alone does not promise that it can.

Suppose bootstrap instead reports a pending approval for a repository-writing tool. The approval belongs to the recovered session/controller policy boundary, not to whichever process first displayed it. The replacement controller verifies request and tool-call identity, re-evaluates current lease, allowed path, proposed arguments, and user authority, and then explicitly allows or denies. It never assumes that prior silence was consent or that a recovered request inherits approval from attempt `1`'s read-only scope. **State 7 — reconciliation before retry.** The controller searches the complete supported history window for input identity, content hash, run correlation, terminal records, and possible external effects. If it finds a terminal success and matching output, it attaches that result to attempt `1` and validates it. If it finds terminal failure before any effect, policy may permit a bounded attempt `2`. If it finds input but no terminal evidence, it waits until deadline or escalates. If pagination is incomplete or an effect may have occurred, it remains unknown. At no point does “I did not receive the answer” authorize resending.

This trace preserves a simple invariant: every transition is justified by an artifact whose meaning is narrower than the state it enters. Readiness permits submission. A receipt establishes acceptance only. Deltas permit provisional display. A terminal result classifies runtime completion. Reconciled messages support transcript continuity. Application validation closes the work unit.

## Failure modes and bounded recovery decisions

**Submitting before ready.** The shortcut assumes object construction equals an initialized runtime. Recovery is to prohibit submission from every state except `ready`, preserve initialization errors, and retry session setup only within its own budget. **Blind resend after disconnect.** The shortcut treats missing client output as proof that input was not accepted. Recovery is to freeze the immutable request identity, inspect the concrete conversation, bootstrap supported state, reconcile external effects, and retry only after evidence establishes non-acceptance or a policy-approved idempotent path.

**Assistant text mistaken for completion.** A polished partial message can precede a failure or missing terminal result. Recovery is to keep streamed content provisional, require a correlated terminal classification, and separately evaluate acceptance criteria. If terminal evidence cannot be recovered, preserve the text as evidence but keep the attempt unknown.

**Transcript duplication or corruption.** Naive clients append deltas, projected messages, bootstrap replay, and listed history into one string. Recovery is to retain raw observations, normalize by message, output-turn, run, sequence, and tool-call identities, and stop on contradictory records. Never invent canonical order from local receive timestamps.

**Default-selector confusion.** A controller persists `default` as though it were a concrete conversation or resumes it under the wrong agent. Recovery is to retain both requested selector and resolved backend identity, verify the agent relationship, and block thread continuation when resolution is ambiguous.

**Queue acceptance promoted to execution.** A queued item or Cloud enqueue receipt is reported as completed work. Recovery is to model `queued`, `accepted`, `active`, `terminal`, and `validated` separately. A timeout expires the controller wait, not necessarily the accepted work. Remove only the identified queued item when supported and reconcile before replacing it.

**Approval ownership lost on recovery.** A new process approves because an old process apparently intended to do so, or denies without recording why. Recovery is to bind every approval to agent, conversation, request, tool-call, lease, arguments, and current policy. Recovered approval is a fresh authorization decision about the same pending request, not replayed consent.

**Session close overclaimed.** The application closes its session and announces cancellation, sandbox destruction, or agent deletion. Recovery is to report only confirmed cleanup, retain identities for still-uncertain work, and invoke separate supported cancellation or deletion operations when independently authorized.

**Unbounded recovery loop.** A controller reconnects forever, repeatedly lists history, or alternates abort and resend. Recovery needs its own attempt, time, and cost budget. On exhaustion, produce a dossier containing last confirmed state, receipts, message identities, pagination bounds, pending approvals, possible effects, and a specific supervisor question. “Unknown” is a valid bounded outcome.

## Conversation and Session Lifecycle dossier

The concrete artifact for this module is a **Conversation and Session Lifecycle dossier**. A learner may design it now and populate it later only under separate execution authority. It is a controller record, not agent memory and not a substitute for the backend transcript. Its purpose is to let another operator reconstruct what was intended, what identifiers were resolved, what evidence crossed the boundary, and why a retry or closure decision was made.

Begin with an immutable work header: dossier version, work-unit ID, controller owner, creation time, mission, input hash, acceptance criteria, prohibited outcomes, effect class, budget, lease expiry, selected topology, and exact package tuple. Record the agent ID, requested conversation selector, resolved concrete conversation ID, and how that resolution was obtained. Keep null or unknown values explicit. Never replace an unknown concrete ID with `default`, a display name, or a guessed identifier.

Add a session section for every connection attempt. It should contain a controller attempt number, session-local identity if one is exposed, open time, readiness state and evidence, close request and result, execution location, working directory, controller-owned tools, approval callback owner, and reason for termination. Session rows must not imply that closure deleted persistent objects or cancelled accepted work. When readiness was never confirmed, record whether submission was impossible, known not to have occurred, or merely uncertain.

The turn ledger records request identity, immutable input hash, submission attempt, receipt class, conversation and run correlations, first and last observed event, terminal state, terminal result identity, stop or error information, and application acceptance. Separate `receipt`, `runtime terminal`, and `accepted by contract` columns prevent promotion by convenience. Include any active-queue item ID or Cloud enqueue correlation in typed fields rather than combining them with turn or message IDs.

A transcript-evidence section preserves the projection method. List raw event artifact locations, message UUIDs, output-turn IDs, run IDs, sequence ranges, tool-call pairs, history page boundaries, truncation flags, duplicate resolution, and contradictions. The reader should be able to tell which displayed rows were provisional, which were confirmed by retrieved history, and which evidence was unavailable. Store hashes or controlled references when raw content is sensitive; do not use the dossier as an excuse to duplicate secrets or private transcripts.

The recovery section starts whenever a session ends without a trustworthy terminal classification or an effect remains uncertain. Record the trigger, last confirmed state, exact recovery surface attempted, bootstrap or resume result, message ranges inspected, pending approvals, effect reconciliation, remaining uncertainty, and retry decision. Every retry needs a reason tied to evidence, a new attempt number, and confirmation that the lease and budgets still permit it. “No response appeared” is not a sufficient reason.

For approvals, record request identity, tool-call identity, requested arguments or a safe digest, policy version, approving principal, decision time, and decision rationale. A recovered approval must show that current ownership and authority were re-established. For closure, record final controller state, unresolved runtime work, orphaned resources, cleanup owner, and the precise supervisor question if the dossier ends unknown.

## MOD-05 synthesis checkpoint

The central synthesis is that persistence and connection are orthogonal. The agent and conversation may remain after a session disappears; a session can be ready without a turn; a turn can emit messages without reaching a terminal outcome; and a terminal runtime success can still fail application acceptance. A controller must preserve those layers rather than compressing them into “the chat worked.”

Lifecycle control is evidence driven. Readiness evidence permits submission. Submission evidence proves only that an attempt may have crossed a boundary. A queue or enqueue receipt proves only its named acceptance boundary. Stream deltas support provisional presentation. A terminal result classifies runtime execution. Retrieved messages support transcript reconciliation. Frozen acceptance criteria determine whether the work unit is complete. No earlier layer silently promotes a later one.

Recovery is therefore not “run it again.” It is a bounded investigation of the original attempt. Resolve the concrete conversation, inspect supported state, correlate messages and runs, recover approval ownership, reconcile effects, and only then decide whether to resume, wait, retry, deny, compensate, or escalate. Unknown is preferable to an invented failure that authorizes duplication.

Finally, the controller owns lifecycle policy. The model can produce content and request tools, while the runtime carries execution state. Leases, retry budgets, approval authority, acceptance decisions, and audit records remain outside model-editable memory. This ownership split will carry into memory governance in MOD-06.

## Formative transfer questions

1. A UI receives a complete-looking assistant paragraph, then its transport connection closes without a terminal result. Which states may the UI and controller report, and what evidence would be required before either reports successful completion?

2. An SDK call was made using the `default` selector, but the application persisted only the word `default`. After restart, two agents are in scope. Design the safe resolution sequence and state the condition that blocks recovery.

3. A Cloud enqueue response returns acceptance data. A product manager wants the dashboard to mark the job done. Explain the strongest justified dashboard state and name the later evidence needed for runtime completion and application acceptance.

4. A conversation already has an active turn. One user follow-up enters an active queue while another arrives through a durable enqueue path. Which identities must be stored separately, and why can neither receipt be used as proof that its content was consumed?

5. A replacement process discovers a pending file-write approval during bootstrap. The previous process had a broader permission mode. Who owns the new decision, what facts must be rechecked, and what should happen if the original lease expired?

6. Stream replay contains deltas already displayed before disconnect, while message history contains one assembled assistant record. Describe a reconciliation strategy that avoids duplicate text without claiming unsupported canonical ordering.

7. Session close succeeds while authoritative status remains unavailable. List the claims the controller may make and the claims it must not make about the turn, conversation, agent, tools, and sandbox.

8. A terminal result reports success, but one required source identifier is absent from the answer. Distinguish runtime status, application status, retry eligibility, and the dossier evidence that should be retained.

9. History listing returns one page with the original input but no output and indicates that more pages may exist. Is blind resend allowed? State the next bounded actions and the result if the recovery budget expires first.

10. Two records have the same message UUID but different content hashes. Why is choosing the later client receive time unsafe? Propose a fail-closed dossier entry and escalation question.

11. Design a minimal lifecycle ledger for a read-only turn. Which fields are mandatory before submission, which are learned at readiness or runtime, and which can remain explicitly unknown?

12. Compare aggregated send and stream for an approval-bearing tool workflow. What additional ownership and recovery obligations does streaming introduce, and which obligations remain even with aggregated sending?

13. A developer claims that an exported resume-related type proves every backend can reconnect to an active turn. Classify the evidence error and rewrite the claim so it respects exact package, topology, and runtime boundaries.

14. When can attempt `2` reuse the same semantic work identity, and when should it become a distinct work unit? Address input mutation, idempotent effects, terminal failure, and uncertain acceptance.

## Exact evidence, source, and discrepancy boundaries

The documented-current lane consists of `SRC-DOCS-STATEFUL-AGENTS-20260911` and `SRC-DOCS-SDK-REFERENCE-20260916`. It supports the conceptual persistent-agent distinction and documented SDK lifecycle surface as of the recorded retrieval dates. Documentation describes a product contract at its own scope; it is not evidence that this repository opened a session or that an account, backend, model, or topology currently offers every described behavior.

The exact SDK lane is `@letta-ai/letta-agent-sdk@0.8.9`, recorded by `SRC-SDK-NPM-0.8.9` and `SRC-SDK-SOURCE-0.8.9`. The immutable artifact and source establish package identity, declarations, exported message shapes, conversation management surface, session lifecycle surface, transcript helpers, enqueue records, and recovery-related static paths. The SDK declares Letta Code `0.32.11`; that declared-runtime lane remains distinct from interpreting the same `0.32.11` artifact as a standalone runtime. Artifact identity does not merge evidence meaning.

`DISC-SDK-REFERENCE-EXPORTS-001` limits completeness claims because the official reference overview does not enumerate every public export and member found in exact declarations. Therefore this module names only curriculum-relevant structures and does not present itself as a complete API reference. `DISC-RECONNECT-OWNERSHIP-001` blocks generalized replay and approval-recovery claims because connection, execution-owner, listener, session, and transport boundaries can differ. `DISC-CODE-0-32-11-LIFECYCLE-001` blocks runtime claims because exact Code changes affect execution-owner recovery, locally recorded resume, and related lifecycle attribution. `DISC-SANDBOX-LIFETIME-001` prevents session close from being equated with managed-sandbox termination.

The project-owned lifecycle ledger, terminal gate, transcript projection, recovery states, no-blind-resend rule, and dossier are supported as maintainer synthesis by `SRC-DESIGN-SYNTHESIS`. They are not SDK methods, hidden Letta guarantees, or a distributed transaction facility. When project policy is stricter than an available client convenience, the stricter controller policy governs this curriculum architecture.

## Explicit non-claims and handoff to MOD-06

No live session, turn, queue, enqueue, approval, abort, reconnect, resume, bootstrap, message listing, tool execution, or cleanup operation was performed for this module. It makes no observed claim about event ordering, message ordering, delta ordering, terminal delivery, replay boundaries, duplicate suppression, queue consumption, enqueue durability, disconnect behavior, approval survival, cancellation, or sandbox lifetime.

It makes no claim that session readiness, close, resume, bootstrap, or recovery work identically across Local, Cloud, App Server, Remote Client, portable clients, or any hosted runtime. It makes no exactly-once, at-least-once, lossless-stream, durable-queue, atomic-turn, or distributed-consistency guarantee. It does not claim that a waiting client controls accepted remote work after disconnection. Unknown behavior remains unknown until an exact, separately authorized runtime canary records otherwise.

It makes no account claim: no provider entitlement, model availability, organization membership, billing status, computer availability, Cloud access, sandbox availability, or credential scope was inspected.

It also makes no security, privacy, reliability, compliance, deployment, or production-readiness claim. Static declarations, documentation, a completed dossier, or a successful learner exercise cannot production qualify an implementation. Production qualification would require separate topology-specific supervision, incident, credential, tenancy, capacity, recovery, backup, observability, and rollback evidence.

MOD-06, **Memory, Context, Skills, and Shared Knowledge**, begins from this boundary. Conversation history is evidence of interaction, not automatically curated knowledge. The next module asks what belongs in active context, agent-owned MemFS, focused memory, reusable skills, or shared repositories; who may change each resource; and how provenance and conflicts are controlled. Carry forward the concrete agent and conversation identities, transcript-projection limits, and controller dossier. Do not promote every message, provisional delta, tool return, or recovered assertion into durable memory merely because it appeared in a conversation.
