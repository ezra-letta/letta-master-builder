# MOD-08 — Bounded Work Loops and Triggers

| Field | Value |
| --- | --- |
| Status | ready |
| Design revision | 0.4 |
| Prerequisites | MOD-00 through MOD-07 |
| Capability IDs | CAP-TRIGGERS-DELIVERY; CAP-CHANNELS; CAP-CONCURRENCY-CONSISTENCY; CAP-QUEUES-ENQUEUE; CAP-EXECUTION-TOPOLOGY |
| Evidence IDs | SRC-DESIGN-SYNTHESIS; SRC-PRODUCTION-HEURISTIC; SRC-CODE-SOURCE-0.32.11; SRC-CODE-NPM-0.32.11 |
| Pointer IDs | PTR-AUTONOMY-001; PTR-SCHEDULES-001; PTR-COMPUTERS-001 |
| Project-method sections | Work-loop state machine; work-unit record; lease and budget policy; trigger normalization; duplicate control; checkpoint and restart policy |

## Learning contract and prerequisites

This module teaches you to design one bounded unit of autonomous work and to admit inputs from several trigger mechanisms without confusing delivery with authority. By the end, you should be able to describe a project-owned controller that moves a work unit through intake, plan, lease, act, observe, reconcile, checkpoint, and one terminal disposition: complete, pause, or escalate. You should also be able to explain where budgets, deadlines, heartbeats, duplicate suppression, conversation selection, computer selection, route ownership, dead letters, and restart recovery belong.

The lesson is architectural and read-only. It does not authorize you to create a schedule, start a channel gateway, submit headless input, accept a webhook, enqueue a turn, select a computer, call a model, or execute a tool. The state machine and records below are original Master Builder methods. They are not Letta APIs, SDK methods, protocol states, or guarantees about hosted behavior.

You need the preceding modules because a loop cannot repair a missing contract. MOD-01 supplies immutable intent, acceptance criteria, and stop conditions. MOD-02 distinguishes agent, conversation, session, controller record, runtime, and computer. MOD-05 supplies turn and recovery vocabulary without equating queue acceptance with completion. MOD-06 keeps adaptive knowledge separate from operational state. MOD-07 classifies effects and requires reconciliation before retry. If any of those boundaries is unclear, pause here rather than hiding ambiguity inside “automation.”

## Why bounded loops matter

A persistent agent can remember across work, but persistence does not make work safe or finite. A trigger can arrive repeatedly. A session can disconnect while runtime work continues. A tool can produce an external effect before its result is recorded. A selected computer can disappear. A channel can redeliver an event. A scheduler can fire after a controller restart. Without an external bound, “continue until done” becomes an invitation to repeat costs, duplicate effects, monopolize a conversation, or run after the original need has expired.

The ownership rule is therefore strict: the agent owns adaptive working knowledge; the runtime owns execution state; the project controller owns authority. The controller, not model-editable memory, records intent, lease, budgets, allowed effects, trigger identity, checkpoint, and terminal decision. This is the three-loop separation from the design specification. The work loop may finish a task. It may not promote its own policy changes, award evaluation status, or expand its authority. Improvement and supervision remain separate loops.

## Conceptual model and vocabulary

### The durable work-unit record

A **trigger** is evidence that work may be wanted. It is not permission to perform every requested action. A **trigger adapter** translates one source’s envelope into a normalized intake proposal. An **intake proposal** is untrusted or partially trusted data awaiting validation. A **work unit** is the controller’s durable record for one bounded objective. A **step** is one authorized transition that consumes budget. An **attempt** is a particular execution try for a step. A **lease** is temporary, exclusive controller authority to advance a work unit. A **heartbeat** is evidence that the lease holder remains alive and still owns that authority. A **checkpoint** is durable continuation data written at a safe boundary. A **dead letter** is a trigger or work unit that cannot be safely admitted or resumed and is retained for inspection rather than silently discarded.

At minimum, the work-unit record should contain an immutable work ID; normalized trigger type and source identity; trigger occurrence identity and idempotency key; received time; intent and acceptance criteria; subject agent and exact conversation policy; selected computer or execution class; offline fallback policy; allowed tools, effects, and approval policy; plan revision; current state; lease owner, fencing generation, acquired time, heartbeat time, and expiry; step, retry, elapsed-time, cost, and failure budgets; durable deadline; process-local timeout data; effect intents and canonical external identities; observations; reconciliation decisions; checkpoint version; terminal result or pause/escalation reason; delivery route; and audit timestamps.

Store the authoritative record outside agent-editable memory. Memory may summarize a project or suggest a next step, but it must not rewrite a deadline, refill a budget, seize a lease, or mark uncertain work complete.

## Implementation and design workflow

### The project-owned state machine

The canonical progression is:

`intake → plan → lease → act → observe → reconcile → checkpoint → complete | pause | escalate`

Loops are allowed, but only explicit ones. Reconciliation may return to plan when new facts invalidate the current plan. Checkpoint may return to lease for another bounded step. A transient, classified failure may return to act if retry budget remains and no uncertain effect exists. No transition may bypass authority validation.

### Intake

Intake authenticates the source where applicable, validates schema and size, normalizes the trigger, computes a stable deduplication key, resolves tenant and route scope, and decides whether the request is current. It rejects malformed, unauthorized, expired, impossible, or oversized inputs. It does not yet invoke the agent.

Duplicate control begins here. Prefer a source’s stable event ID combined with adapter namespace and route scope. For schedules, identify the task and intended fire occurrence, not merely the prompt text. For channel messages, include channel, account, chat, thread key, and platform message ID. For webhooks, use the provider’s signed event identifier. When no stable identity exists, derive a conservative key from normalized content and a bounded time window, record the weakness, and avoid irreversible action.

### Plan

Plan translates immutable intent into ordered, verifiable steps. Each step names its expected observation, effect class, authority requirement, budget charge, timeout, and safe checkpoint. Planning also chooses conversation scope. A recurring schedule may intentionally create a fresh conversation for each fire, while an incident follow-up may bind to an existing conversation. The controller must record that choice; it must not rely on whichever conversation a process last used.

Plan also chooses execution locality. A computer is where tools and files are available, while agent identity and memory are separate concerns. Record whether the task requires a named computer, permits a class of computers, allows an isolated fallback, or must pause offline. Never assume moving execution copies a project directory or secrets. A fallback is valid only when the acceptance criteria, required files, credentials, and effect policy remain satisfiable there.

### Lease

Before acting, a worker atomically acquires a lease if no unexpired valid lease exists. The lease has an owner, expiry, and monotonically increasing fencing generation. Every later write includes that generation so a delayed former owner cannot overwrite a newer worker’s checkpoint. Acquisition rechecks terminal state, trigger duplication, budget, deadline, and unresolved effects.

Lease duration should cover one bounded step, not the whole imagined mission. The worker heartbeats before expiry while useful work is in progress. A heartbeat is not proof that a model is correct or that an external effect succeeded; it only renews controller ownership. If heartbeat persistence fails, the worker stops initiating effects and moves toward a safe checkpoint. Another worker may take over only after expiry and reconciliation.

### Act

Act performs exactly the authorized next step. Generate stable effect-request keys before external mutation. Check deadline and remaining budgets immediately before expensive or irreversible action. Bind execution to the recorded agent, conversation, computer, working scope, tool allowlist, and approval policy. If any binding differs, stop rather than improvising.

One model turn is not necessarily one work unit, and one work unit may require multiple turns. Conversely, assistant prose is not evidence that a requested external delivery occurred. Act records submission identities and effect intent; it does not declare success from optimistic text.

### Observe

Observe gathers authoritative outcomes: terminal turn result, runtime status where available, tool result, queue status, external resource lookup, delivery receipt, or human decision. Streaming progress can support heartbeats and visibility, but partial text is not completion. A transport disconnect is an observation about the client connection, not automatic proof that runtime work failed.

Classify every observation as confirmed success, confirmed failure, pending, conflicting, or unknown. Preserve raw evidence references without placing secrets in the work record. When the observation channel itself fails, mark knowledge incomplete.

### Reconcile

Reconcile compares observed authoritative state with intent. For read-only work, that may mean validating that evidence satisfies acceptance criteria. For effects, look up the stable request key or canonical external identity before considering retry. If the effect exists once and matches intent, adopt it. If it does not exist and execution is known not to have occurred, a retry may be allowed. If multiple matches or ambiguous status remain, escalate. Never use retry as permission to repeat an uncertain irreversible effect.

Queue acceptance belongs here as an intermediate fact. An accepted enqueue means ownership of delivery may have transferred; it does not mean inference or delivery completed. The controller follows the relevant completion source or pauses when that source is unavailable.

### Checkpoint

Checkpoint writes the smallest complete continuation boundary: state, plan revision, consumed budgets, last confirmed observation, unresolved effects, next step, lease generation, route, conversation, computer policy, and deadline. Write it before releasing the lease and after every effect reconciliation. Checkpointing is not dumping the transcript. It is a compact, durable decision record from which a different worker can reason safely.

After checkpoint, the controller either completes, pauses, escalates, or returns for another leased step. Completion requires acceptance criteria and delivery obligations to be independently satisfied. Pause means safe continuation is possible later, but a condition such as offline computer, required approval, rate limit, or scheduled window prevents progress. Escalate means human or supervisor judgment is required because authority, ambiguity, safety, repeated failure, or irreversible effect risk exceeds the loop’s envelope.

## Budgets, clocks, deadlines, and heartbeats

Use several independent budgets because one number cannot express every risk. A **step budget** limits plan advancement. A **turn budget** limits model invocations. A **tool/effect budget** limits operations, optionally by effect class. A **retry budget** limits repeated attempts and must never override uncertain-effect rules. A **cost budget** caps measured or estimated spend. A **failure budget** limits tolerated classified failures. An **elapsed-time budget** bounds total wall-clock opportunity. Exhausting any mandatory budget triggers pause or escalation, never an automatic refill by the agent.

Distinguish durable and process clocks. Durable timestamps—received time, deadline, lease expiry, scheduled occurrence, checkpoint time—must survive restart and be interpreted using a declared timezone or UTC. Process-local monotonic clocks are better for measuring one running attempt because wall clocks can jump, but they vanish on restart. Persist consumed duration or start markers needed to reconstruct the remaining budget; do not persist a monotonic counter as if another process could interpret it.

A **deadline** expresses when the objective ceases to be useful or authorized. A **timeout** limits waiting for one operation. A timeout does not prove cancellation, and a passed deadline does not prove an in-flight effect did not happen. On either boundary, observe and reconcile before terminal classification. Heartbeats renew only the lease, never the mission deadline or budget.

## Distinct trigger adapters

Keep adapter semantics separate even though they normalize into one intake schema.

A **human adapter** handles an explicit request or approval. It carries actor identity, scope, route, and a freshness window. Human interruption can pause or cancel work, but the controller must distinguish “stop future steps” from “effect definitely did not happen.” A later human message is a new trigger unless it explicitly references and is authorized to resume an existing work unit.

A **schedule adapter** represents a clock-selected occurrence. It records schedule identity, intended fire time, actual receipt time, recurrence occurrence, timezone, runner placement, conversation policy, and missed-fire policy. Current documentation distinguishes cloud-stored and local schedules, and execution placement can involve a selected computer or fallback. Treat those as product facts requiring current evidence, not universal controller guarantees. Your project still decides whether late work is skipped, coalesced, dead-lettered, or admitted under a remaining deadline.

A **Channel adapter** represents messaging ingress and route-scoped egress. It authenticates or applies platform access policy, resolves channel/account/chat/thread to one agent/conversation route, and retains platform message identity. A reply must use the originating route unless explicit policy authorizes another destination. Route existence does not grant broad tool authority. Channel progress indicators and draft messages are not durable completion. Prevent pair loops by rejecting self-originated or bot-originated echoes unless a narrowly designed policy exists.

A **headless adapter** represents process input from a script or CI host. It must define whether the invocation is ephemeral or persistent, select agent and conversation explicitly, parse structured terminal results, and own stdin/stdout backpressure and process exit. One-shot headless operation may lack an interactive control path; therefore work requiring human tool answers should pause or use an explicitly supervised bidirectional host, not silently auto-approve.

A **webhook adapter** terminates HTTP delivery. It verifies signatures, timestamps, replay windows, tenant mapping, body limits, and provider event IDs before acknowledging. Return transport acceptance promptly only after durable intake according to project policy. Provider retries are normal, so duplicate suppression is mandatory. A webhook is not a Channel unless it also implements conversational routing and outbound delivery semantics.

A **queue adapter** transfers a durable message from a producer/broker into intake. It records broker message ID, producer key, delivery count, visibility or acknowledgment deadline, ordering partition, and payload schema. Acknowledge only after the chosen durability boundary. Redelivery after worker death is expected. Queue order does not necessarily imply business order, and enqueue acceptance does not imply completed agent work.

## Stop, pause, escalation, dead letters, and restart

Stop before a new action when the mission deadline passes, any mandatory budget is exhausted, the lease is lost, the selected computer is unavailable without an authorized equivalent fallback, required route or conversation identity is ambiguous, approval is absent, input authority fails, acceptance is already satisfied, cancellation is confirmed, or an effect is uncertain. Pause when a recoverable dependency can later become available. Escalate when ambiguity or risk requires judgment. Complete only when acceptance and required delivery are confirmed.

Dead-letter malformed triggers, permanently unauthorized events, exhausted redeliveries, impossible route bindings, irreconcilable duplicates, and work whose deadline passed before safe admission. Include reason, source identity, redacted evidence, disposition owner, and whether replay is forbidden or requires approval. Never create a hot loop that repeatedly re-intakes its own dead letter.

On restart, scan nonterminal records; mark expired leases reclaimable; sort by deadline and policy; reconstruct remaining budgets; resolve trigger duplicates; inspect unresolved effect intents; verify conversation and computer bindings; and reconcile before acting. Do not resume from the last log line or repeat the last command. The durable checkpoint is the starting claim, and authoritative observation decides whether it is still true.

## Original trace: a routed incident-review loop

Consider an original scenario called **Northwind Review**. An operations team has a Channel route from account `ops-main`, chat `incident-room`, thread `thread-42` to one persistent agent conversation. A human posts, “Review incident bundle B-17 on workstation forge-2 and return a five-point summary in this thread. Do not modify systems.” The platform assigns message `msg-901`. At nearly the same time, a webhook relay and a queue redelivery both report the same incident bundle. The project controller allows read-only inspection, six steps, two model turns, eight tool calls, fifteen minutes, and no external mutation. The selected computer is `forge-2`; fallback is forbidden because the bundle exists only there. The response must return through the originating Channel route.

Keep the product/project boundary visible. Letta mechanisms may supply persistent objects, turns, computers where supported, Channels, queues, headless input, schedules, or delivery tools for an exact target. **Northwind’s work record, lease, fencing, budgets, deduplication, deadline, fallback, checkpoint, dead-letter policy, acceptance, and terminal disposition are project-owned.** They are not Letta transactions.

### Intake and duplicate convergence

The Channel adapter normalizes `msg-901`, authenticates the sender, resolves the route, and records agent and conversation IDs rather than using a process default. The webhook verifies event `bundle:B-17:created`; the queue receives its redelivery with delivery count two.

The controller computes business key `incident-review:B-17:read-only:v1`. That key deliberately differs from each transport identity. Transport IDs prove which deliveries arrived; the business key decides whether they represent one objective. Intake creates work unit `WU-417` from the first authorized event, then links the other two as duplicate trigger observations. It does not launch three turns, and it does not discard evidence of redelivery.

If the Channel message had requested a different scope—for example, remediation rather than review—the controller would not merge it merely because both mention B-17. It would either create a separately authorized work unit or escalate a conflict. Deduplication must preserve intent boundaries, not erase them.

### Plan, binding checks, and lease

Plan records the immutable objective, read-only effect policy, five-point output shape, route-scoped destination, named conversation, and required computer. Step one verifies bundle presence. Step two reads its manifest. Step three samples declared evidence. Step four asks the agent to synthesize findings. Step five validates the requested structure. Step six delivers once to the route and verifies the resulting platform identity where available.

Worker `controller-A` acquires lease generation 12 for ninety seconds. Immediately before opening a session, it compares the intended agent and conversation with the resolved route. Its local cache points to the agent’s default conversation instead of the incident thread’s conversation. That is a binding mismatch, not a harmless convenience. The worker refreshes the route and uses the recorded conversation. Had two routes or no authoritative route appeared, it would have released the lease and escalated rather than sending context into the wrong history.

The worker then resolves `forge-2`. The computer is offline. A managed sandbox may be available as a Letta mechanism on some target, but Northwind’s project policy forbids fallback because the source bundle and locality assumptions are not equivalent. `WU-417` checkpoints `paused:required-computer-offline`, consumes no model-turn budget, releases generation 12, and schedules no self-directed retry beyond the controller’s bounded availability policy. An operator later confirms `forge-2` is online, creating a resume trigger linked to the same work unit.

### Act, budget loss, and stale heartbeat

Worker `controller-B` acquires generation 13, verifies the conversation and computer again, and starts the first read-only step. After three tool calls it writes a heartbeat and checkpoint. A controller-store outage then prevents heartbeat renewal. The model process may still be active, but the worker can no longer prove its authority. It stops initiating new tools, requests cancellation only if the selected mechanism supports an appropriate bounded request, and records the uncertainty locally for later reconciliation. It must not keep acting merely because its in-memory timer says the lease should still be valid.

When storage returns, generation 13 has expired and `controller-C` has acquired generation 14. A delayed heartbeat from B arrives. The fencing check rejects it. B may contribute observations tagged as stale-owner evidence, but it cannot checkpoint, deliver, or refill budgets. This prevents an old worker from overwriting C’s state.

Controller C reconstructs consumed budgets from the durable checkpoint: three of eight tool calls, one of six steps, and no confirmed model result. It does not reset counters because a process restarted. It observes the selected computer and the conversation before resuming. If the remaining budget cannot satisfy the plan, C pauses for an explicit budget decision. Neither agent memory nor a worker may grant itself additional calls.

### Observe, ambiguous completion, and reconciliation

The runtime history contains assistant text resembling a five-point summary, but no terminal result correlated with C’s current attempt. There is also no verified Channel delivery identity. The text is evidence that useful generation may have occurred; it is not proof that the turn completed or the route received a response. C marks model completion `unknown` and delivery `not-observed`.

Reconciliation first checks whether the summary belongs to the intended conversation and work lineage. If it can establish one matching result, it adopts that output and avoids another model turn. If no authoritative result exists and execution is known to have stopped before completion, it may spend the remaining turn budget. If multiple plausible summaries exist or lineage is ambiguous, it escalates rather than selecting whichever text appears last.

Before delivery, C verifies that `ops-main`, `incident-room`, and `thread-42` still map to the conversation. It does not use a default chat, direct message, or parent room merely because it is reachable. Drafts, typing indicators, and assistant text do not satisfy delivery. The controller records the outbound identity and verifies one scoped delivery.

If the send times out after the external platform accepts it, the effect is uncertain. C looks up the stable request key or route history rather than sending again. One matching message is adopted; none may permit a bounded retry only when authoritative evidence shows the first send did not occur; multiple matches escalate.

### Restart, dead letter, and terminal authority

Suppose the controller process restarts after synthesis but before delivery. Startup scans `WU-417`, sees expired generation 14, reads the checkpoint, and finds an unresolved delivery intent. It does not repeat the last command from logs. Generation 15 first reconciles the route and platform state, then either records the existing message or performs the still-authorized send. The checkpoint, not transcript position, determines the next safe question.

During recovery, another queue delivery arrives without a producer event ID and with a malformed bundle reference. It cannot be safely correlated or authorized. The queue adapter retains transport metadata, and the controller places it in a dead-letter record with reason `missing-stable-identity-and-invalid-reference`. It acknowledges or rejects the broker delivery according to the separately designed queue boundary, but it never feeds the malformed payload repeatedly to the agent. Replay requires a human to correct the reference and issue a new authorized trigger.

The five-point summary passes structure validation and the route confirms one delivery. Who may mark completion? Not the model, because assistant confidence is not controller authority. Not the Channel adapter, because transport success does not establish acceptance. Not the runtime, because a terminal turn does not assess the project’s full objective. The current fenced controller lease may propose `complete`, but only under the immutable acceptance policy. A human with cancellation authority can stop future steps; a supervisor can pause or escalate; neither should rewrite whether an already uncertain external effect occurred. Stop authority controls future action, while reconciliation establishes past fact.

The final record says acceptance satisfied, no mutations attempted, budgets consumed, bindings verified, duplicate triggers linked, one scoped delivery confirmed, and generation 15 released. A passed deadline, confirmed cancellation, challenged read-only boundary, or exhausted mandatory budget would instead require pause or escalation.

## Failure modes, unsafe shortcuts, and recovery decisions

Converge duplicate triggers only when intent and business identity match, preserving transport receipts. Otherwise plan separately or escalate. On wrong or ambiguous conversation, stop and resolve the route authoritatively. On wrong device, rebind only through policy. Offline execution follows the declared fallback rule, never improvisation.

Preserve channel, account, chat, thread, agent, and conversation for route-scoped delivery. On lease loss, cease new effects. On budget-store loss, assume no refill and reconcile consumption. Reject stale-heartbeat authority through fencing while retaining observations as evidence.

For ambiguous completion, separate turn, effect, acceptance, and delivery. On restart, use durable checkpoint plus authoritative observation, not logs or agent recollection. Dead-letter unsafe inputs and require explicit replay disposition. Stop authority remains outside agent-editable memory: designated humans and controllers constrain future work, but cannot make uncertain history convenient.

## Builder artifact: Bounded Work and Trigger dossier

The artifact for this module is a **Bounded Work and Trigger dossier**. A learner may produce it later only under separate implementation or assessment authority. It is a design and audit record, not permission to launch work. It contains placeholders rather than credentials, live identifiers, or private payloads.

Begin with immutable intent: dossier ID, work-unit ID scheme, mission reference, acceptance criteria, prohibited effects, cancellation actors, deadline, and terminal dispositions. Define the normalized intake envelope with adapter type, source event identity, business idempotency key, tenant and actor, received time, freshness limit, requested agent and conversation, requested computer, route, and redacted payload reference. Explain how transport duplicates converge without merging materially different intent.

Document the state machine and every permitted transition. For intake, list authentication, schema, size, route, deduplication, and expiry checks. For plan, name expected observations and safe checkpoints. For lease, specify acquisition transaction, owner, fencing generation, duration, heartbeat interval, expiry, and stale-owner rejection. For act, identify tools and effect classes. For observe and reconcile, name authoritative sources and ambiguity handling. For checkpoint, define the durable continuation fields. Completion, pause, and escalation each need objective entry conditions.

Add a budget ledger covering steps, turns, tools, retries, failures, elapsed time, and cost. State which clock governs each limit. Durable deadlines and lease expiries use durable timestamps; attempt timeouts can use a process monotonic clock. Describe restart reconstruction and forbid automatic budget refill. Record who may approve a budget change and how the old and new values remain auditable.

Create one adapter card for each admitted trigger. Human cards define actor and resume authority. Schedule cards define schedule identity, intended fire, timezone, lateness, conversation policy, runner placement, and missed-fire disposition. Channel cards define account, chat, thread, route, sender policy, and delivery verification. Headless cards define persistence mode, explicit identity selection, input/output framing, and approval limitations. Webhook cards define signature and replay checks. Queue cards define broker identity, redelivery, acknowledgment boundary, ordering, and dead-letter behavior.

Finish with a recovery matrix for duplicate input, unavailable computer, forbidden fallback, wrong conversation, route drift, lease loss, stale heartbeat, exhausted budget, disconnect, uncertain effect, ambiguous completion, restart, and malformed input. Each row names detection evidence, immediate stop, reconciliation source, safe continuation, and escalation owner. Include explicit product and runtime non-claims. A reviewer should be able to decide whether one more step is authorized without consulting agent memory.

## Synthesis checkpoint after MOD-08

You can now connect earlier competencies into a bounded autonomous unit. Mission defines useful completion and stop conditions. Object ownership separates agent and conversation from controller records, sessions, runtime, and computers. Tool governance classifies effects. This module adds temporary authority, budgets, durable continuation, and normalized triggers.

You should be able to explain why an event is only a proposal, why a lease is not a mission grant, why a heartbeat proves neither correctness nor completion, and why accepted enqueue or assistant text is not final delivery. You should distinguish durable deadlines from process timeouts, and route identity from conversation identity while preserving both. Most importantly, you should stop on ambiguity rather than turning recovery into repetition.

The work loop remains distinct from improvement and supervision. Successful task completion cannot promote a policy, increase budgets, approve its own changes, or production-qualify the system. Those decisions remain externally governed.

## Transfer-focused formative questions

1. A daily schedule fires twice after a listener restart. Which identities determine whether these are duplicate deliveries, distinct schedule occurrences, or separate work units?
2. A Channel message requests a reply in its thread, but the agent’s default conversation is easier to resume. Which bindings must the controller preserve, and where should it stop if they conflict?
3. A named workstation is offline while an isolated computer is available. What evidence would establish equivalent fallback, and when must the work pause?
4. A lease holder keeps producing output after its heartbeat expires. How can a new worker use those observations without granting the stale worker checkpoint or delivery authority?
5. The controller store fails after a tool call but before budget persistence. Which assumptions are safe about consumed budget and effect state?
6. A queue acknowledges intake, the runtime emits assistant text, and the Channel shows a typing indicator. Which completion claims, if any, have been established?
7. A webhook and a human message name the same resource but request different outcomes. Why is content similarity insufficient for deduplication?
8. A deadline expires during a delivery timeout. How do stop authority and reconciliation divide future action from uncertain past effect?
9. After restart, logs show the last command but the checkpoint predates it. What is the safe recovery sequence?
10. A malformed event has been redelivered ten times. What belongs in its dead-letter record, and what authority is required to replay it?
11. A recurring task uses one conversation forever and its context becomes crowded. How would conversation policy change without losing work-unit attribution?
12. A human says “cancel.” What must be distinguished among stopping future steps, requesting runtime abort, removing queued work, and proving that an external effect did not occur?

Strong answers apply the state machine and evidence hierarchy to the new facts rather than assuming that a product mechanism supplies controller policy.

## Source and evidence boundaries

`SRC-DESIGN-SYNTHESIS` and `SRC-PRODUCTION-HEURISTIC` support the project-owned separation of agent knowledge, runtime execution state, and controller authority. They govern the work-loop method, leases, budgets, checkpoints, and three-loop separation. These records do not claim that Letta implements the dossier or distributed transactions.

`SRC-CODE-NPM-0.32.11` and `SRC-CODE-SOURCE-0.32.11` identify exact static artifact lanes relevant to schedules, Channels, queues, lifecycle, and execution ownership. Static package or source evidence does not prove live ordering, durability, buffering, fallback, queue completion, route delivery, or multi-controller consistency. `PTR-SCHEDULES-001` and `PTR-COMPUTERS-001` direct maintainers to current documentation but authorize no action. `PTR-AUTONOMY-001` identifies the mandatory project invariant.

`DISC-CODE-0-32-11-LIFECYCLE-001` blocks generalized runtime claims about recovery, locally recorded turns, schedule attribution, or handoff. `DISC-CODE-0-32-11-CHANNELS-001` keeps Channels awareness-only and warns against stale configuration and ownership guidance. `DISC-RECONNECT-OWNERSHIP-001` prevents one universal reconnect guarantee. `DISC-SANDBOX-LIFETIME-001` prevents treating session cleanup as universal execution cleanup. Missing evidence narrows the design or leaves behavior `unknown-not-tested`; it is never replaced by optimism.

## Explicit non-claims

This module does not claim that any schedule was created, stored durably, fired on time, retried, missed, or assigned to a particular runner. It does not claim a selected computer exists, is online, accepts work, or falls back to a sandbox. Current schedule placement descriptions remain version-, topology-, account-, and target-scoped.

It does not claim any Channel account, adapter, sender policy, route, thread, buffer, or outbound delivery exists or works. No message was received or sent. A route does not grant effect authority, and agent text does not prove external delivery. Custom and first-party Channel setup remain outside this implementation claim.

No human trigger, headless process, webhook, broker queue, SDK session, runtime turn, tool, heartbeat, lease, abort, enqueue, reconciliation lookup, or restart recovery was executed. The trace and dossier are original project artifacts. They do not establish live concurrency, exactly-once processing, distributed locking, queue durability, timeout behavior, or effect atomicity.

Reading or completing this lesson does not authorize execution and does not production-qualify a system. Production qualification separately requires target-specific security, credentials, tenancy, privacy, observability, incident response, capacity, cost, backup, recovery, deployment, and rollback evidence.

## Handoff to MOD-09

MOD-09 extends one bounded loop into multi-agent orchestration. Carry forward the rule that the controller owns authority. A parent, subagent, fork, persistent delegate, or direct message must not create authority from relationship alone. Delegation needs explicit intent, budget, conversation and computer scope, attribution, effect limits, checkpoint ownership, and terminal reporting.

The next module will ask who may spawn whom, which context crosses the boundary, how child work is correlated, and whether parent cancellation stops future child action or merely requests it. Your Bounded Work and Trigger dossier becomes the single-agent baseline. If one work unit cannot survive duplicates, lease loss, uncertain completion, and restart, adding agents will multiply ambiguity rather than capability.
