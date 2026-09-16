# MOD-04 Agent Provisioning and Management

| Field | Value |
|---|---|
| Status | ready |
| Prerequisites | MOD-00, MOD-01, MOD-02, MOD-03 |
| Capability IDs | CAP-AGENT-MANAGEMENT |
| Evidence IDs | SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-DOCS-SDK-AGENTS-20260916; SRC-DOCS-SDK-REFERENCE-20260916 |
| Project-method sections | Controller record; request-tag reconciliation; partial-success state machine; deletion guardrails |
| Design revision | 0.4 |

## Learning contract

This module teaches how a trusted TypeScript controller should provision and manage one persistent Letta agent without confusing an attempted request, a returned object identity, and locally recorded ownership. By the end, you should be able to select a conservative subset of `CreateAgentOptions`, treat the value returned by `client.createAgent()` as the canonical agent ID, use `client.agents` operations within their declared boundaries, design a controller record, and recover from creation that succeeds before local persistence does. You should also be able to explain why tags aid reconciliation but do not make creation idempotent, why hiding differs from deleting, and why destructive operations require policy outside the SDK call.

The prerequisite modules established evidence discipline, bounded mission design, object ownership, and topology selection. Bring forward four distinctions. An agent is a persistent entity, not a session. The runtime owns its authoritative agent object; the controller owns intent, authority, and bookkeeping. Local is the primary implementation lane, while Cloud is a contrast topology rather than an interchangeable deployment. Finally, exact declarations, source inspection, documentation, fixtures, and live observations are separate evidence axes.

Nothing here authorizes execution. Do not install packages, use credentials, call a backend, create or mutate an agent, or run the example merely because it is readable. The lesson describes code that could later be implemented under separate authority.

## Why provisioning deserves controller logic

A naive builder sees creation as one line: call an SDK method, receive a string, and continue. An autonomous-agent builder must account for everything around that line. Was this request already fulfilled? Which mission approved it? Which backend owns the resulting object? Which identifier should later sessions use? What happens if the backend succeeds and the controller database fails? Who may rename, hide, reconfigure, or delete the object? How will an operator distinguish an intentional worker from an orphan?

Provisioning is an external effect. It can leave durable state even when the initiating process reports an error or crashes before its final write. Blind retry therefore risks duplicates. Duplicates are not merely untidy: two persistent agents can acquire different memory, receive different work, consume independent budgets, and make ownership ambiguous. Safe provisioning wraps the product operation in a project-owned protocol that preserves evidence and uncertainty.

Management has the same concern. Listing is discovery, not proof of exclusive ownership. Retrieval is observation, not permission to mutate. Update is a partial configuration operation, not a general replacement of agent state. Delete is irreversible from the controller’s perspective unless a separately proven restore mechanism exists. A robust controller makes these boundaries visible in types, state transitions, and operator review.

## Conceptual model and vocabulary

A **provisioning request** is the controller’s durable intent to obtain one agent for a stated purpose. It has a stable request key, desired metadata, topology, policy references, and lifecycle state. A **creation attempt** is one invocation of `client.createAgent(options)`. Attempts may be repeated, but repetition is never assumed safe merely because the inputs match.

The **canonical agent ID** is the identifier returned by successful creation and confirmed through management retrieval. In the selected SDK evidence, `client.createAgent()` resolves to a string. Store that string exactly; do not synthesize an ID from the name, parse a display label, or use an array position from a listing. Names are operator-facing metadata and may change or collide. Descriptions communicate purpose but do not confer identity. Tags classify and correlate. None replaces the canonical ID.

A **controller record** is application-owned state linking the request key to the canonical ID and the authority that governs it. A minimal record contains:

- stable request key and canonical agent ID;
- mission or workstream identifier and intended owner;
- selected backend and exact evidence baseline;
- desired name, description, hidden flag, and tags;
- creation state, attempt count, and timestamps;
- last authoritative retrieval result or digest;
- reconciliation status and ambiguity notes;
- update policy, deletion policy, and approval references.

This record is a project method, not a Letta resource promised by the SDK. The controller should not mirror every backend field. Record what is necessary to prove intent, ownership, recovery, and policy; retrieve authoritative product state when freshness matters.

A **reconciliation tag** is a controller-generated tag derived from the stable request key, such as `foundry-request:case-2026-0042`. It gives a later process a search handle when the ID was not durably saved. The tag is metadata, not a database uniqueness constraint. Two concurrent creators can both observe zero matches and both create agents carrying the same tag. Therefore zero matches permits an attempt only under the controller’s concurrency policy; one match permits recovery; more than one match is ambiguity requiring a stop.

**Created-unrecorded** means this invocation received a canonical ID, optionally retrieved that object, and then failed to persist the mapping. **Reconciled-unrecorded** means this invocation found one pre-existing tagged agent but again failed to save its mapping. These states are materially different. The first invocation caused the external creation; the second discovered an earlier effect. Neither should be flattened into generic failure, and the second must not claim it created anything.

## The safe creation subset

The exact `@letta-ai/letta-agent-sdk@0.8.9` declaration exports a broad `CreateAgentOptions` interface. Type availability does not establish acceptance by every backend. `DISC-CREATE-OPTIONS-001` records that backend-specific validation rejects or qualifies some exported values. The greenfield subset for this module is intentionally narrow:

- `name` for an operator-readable display name;
- `description` for concise purpose and ownership context;
- `hidden` when policy intentionally removes worker-style agents from default listings;
- `tags` for classification and reconciliation;
- `memfs: true` when the mission calls for a persistent agent with its own memory filesystem.

Even this subset is evidence-bounded rather than runtime-proven. The exact package and source support the shapes, and current official documentation presents these creation controls, but no hosted or selected runtime was observed. Keep model, embedding, memory content, personality, system prompt, skills, tools, permissions, working directory, skill sources, reminders, and dreaming outside this module’s provisioning baseline. Later modules decide those concerns with their own locality and lifecycle rules.

The omissions are deliberate. Exported legacy `memory`, `persona`, and `human` fields sit inside an active memory transition; greenfield design prefers MemFS and focused memory files. System-prompt presets represented in the type do not imply that creation backends accept preset values. `allowedTools` and `canUseTool` belong at session opening under the current documented guidance rather than being assumed portable at creation. Skill support files can introduce a second, backend-specific post-creation step, so skills would make “created” an insufficient description of completion. Dreaming and permission behavior likewise require later policy.

`hidden` needs special care. It expresses listing semantics for worker or subagent use; it is not confidentiality, authorization, archival, suspension, or deletion. A controller must still retain the ID and enforce its own access policy. `name` and `description` are mutable presentation/configuration fields. They should never contain credentials, private URLs, or the only copy of critical ownership information. Tags should be namespaced, bounded, and free of secrets.

An original TypeScript-oriented options builder can make the subset explicit:

```ts
import type { CreateAgentOptions } from "@letta-ai/letta-agent-sdk";

type DesiredAgent = {
  displayName: string;
  purpose: string;
  worker: boolean;
  requestKey: string;
  labels: string[];
};

function creationOptions(desired: DesiredAgent): CreateAgentOptions {
  const correlation = `foundry-request:${desired.requestKey}`;
  return {
    name: desired.displayName,
    description: desired.purpose,
    hidden: desired.worker,
    memfs: true,
    tags: [...new Set([...desired.labels, correlation])],
  };
}
```

This code is original curriculum material. It illustrates a policy boundary; it does not prove that a live backend accepts the request or enforces tag uniqueness.

## Management operations and configuration scope

The exact declarations expose `client.agents.list`, `retrieve`, `update`, and `delete`. Their compact signatures should not obscure their different jobs.

`list(options?)` returns agent objects and declares filters or pagination controls including cursors, limit, ordering, name search, exact name, tags, tag matching, and optional relationship inclusion. Use list for inventory and reconciliation. Never assume one unpaginated response is the complete estate, that default listings include hidden agents, or that list ordering has live guarantees absent observation. A tag-filtered result must still be checked for the exact reconciliation tag and counted defensively.

`retrieve(agentId)` fetches one authoritative agent object by canonical ID. Use it after reading a stored mapping, after creation, before consequential updates, and during deletion review. Retrieval can establish that the target currently resolves; it does not prove that the controller owns it or that no concurrent mutation follows. A missing retrieval should move the record to investigation rather than trigger automatic replacement. The object may have been deleted, the backend may be unavailable, credentials may lack access, or the mapping may be wrong.

`update(agentId, options)` declares a bounded patch surface: name, description, model, model settings, system configuration, tags, hidden state, and context-window limit. In this module, constrain routine updates to name, description, tags, and hidden. Model and context scope belong with model/session design; system configuration belongs with prompt and memory governance. Treat the returned object as the post-update observation, and retrieve again when policy requires confirmation. Preserve the reconciliation tag when replacing a tag array. An update that accidentally drops it weakens later recovery.

`delete(agentId)` resolves without returning an agent object. That compact return says nothing about controller approval, dependent conversations, memory disposition, restore, propagation timing, or audit retention. Those are policy questions. Deletion must be guarded by canonical-ID match, fresh retrieval, lifecycle eligibility, dependency review, explicit approval, and an audit record. Prefer hiding only when the goal is to reduce default-list visibility; do not call hiding a reversible delete. Do not use name or tag alone as a deletion selector.

## Provisioning workflow

The controller’s project-owned workflow is reconcile before create:

1. Validate and durably register the request key, intent, backend, and policy.
2. Read the controller mapping. If an ID exists, retrieve it. Return `already-recorded` only when the retrieval is acceptable; otherwise stop for investigation.
3. Construct the namespaced reconciliation tag from the same stable request key.
4. List agents using that tag, then independently verify exact tag membership.
5. If there is one match, capture its canonical `id`, compare safe metadata, and attempt to persist the mapping. Return `reconciled` or `reconciled-unrecorded`.
6. If there are multiple matches, stop as ambiguous. Do not choose the newest, first, or best-named candidate automatically.
7. If there are zero matches and the request holds the required controller lease, build the safe options and call `client.createAgent()` once.
8. Preserve the returned string immediately as the canonical ID. Retrieve it to obtain an authoritative management object.
9. Persist the request-to-ID mapping. Return `created` if persistence succeeds or `created-unrecorded` if it fails.

A compact state trace shows why the result vocabulary matters. Request `case-2026-0042` has no stored mapping. Tag search finds no agent. Creation returns `agent-example-42`; retrieval confirms that same ID. The controller store then becomes unavailable. The correct result is `{ state: "created-unrecorded", agentId: "agent-example-42" }`. A later retry uses the same request key, finds exactly one tagged object, and tries the mapping write again. If the store is still unavailable, the new result is `reconciled-unrecorded`, not another `created-unrecorded`, because this retry did not create the object.

This protocol reduces duplicate risk but is not transactional idempotency. The tag is not proven server-enforced uniqueness, list visibility may have backend-specific timing, and a crash could occur after external creation but before the returned ID reaches durable controller state. A single controller lease or equivalent serialization narrows the race. Unknown outcomes still require inventory and operator judgment rather than unlimited retries.

## Update and deletion decisions

Manage desired state as a reviewed patch, not as a periodic overwrite of everything returned by retrieval. Compare only controller-owned fields, preserve backend-owned fields, and record why each difference is intentional. A rename may improve operator clarity without changing identity. A description update may clarify mission scope without authorizing new work. Adding or removing ordinary classification tags may change discovery, while the reconciliation tag should remain stable for the life of the mapping. Changing `hidden` affects visibility semantics but does not pause active work. Before each patch, verify the canonical ID and current lifecycle state; after it, record the returned identity and relevant values.

Deletion needs a two-stage decision. First mark the controller record `deletion-proposed` with reason, requester, dependencies, and expected disposition. Then obtain the approval required by mission policy and perform a fresh retrieval. Abort if the retrieved ID differs, the object is already absent in an unexplained way, work is active, dependent records remain, or evidence has drifted materially. Only then call delete with the canonical ID. Record the request and outcome while retaining the controller audit record as a tombstone. A successful void return is evidence about that SDK call, not proof of recoverability, immediate global disappearance, or secure erasure.

## Evidence boundary at the continuation point

The product facts in this module are limited to the registered current documentation and exact 0.8.9 package/source evidence. The safe subset, record schema, lease requirement, reconciliation states, and deletion workflow are project methods. The compile-verified vertical slice and its partial-success fixture demonstrate internal consistency only; they are not captured traffic. No Local, remote, Cloud, hosted, or production backend behavior was executed or observed. The remaining lesson will extend failure recovery, dossier construction, transfer review, and the handoff to MOD-05 without widening those claims.

## Worked trace: one request across two controller invocations

Consider a controller provisioning a hidden research worker for mission `audit-quarterly-17`. Its durable request key is `provision-audit-17`, and its reconciliation tag is `foundry-request:provision-audit-17`. The desired safe configuration contains a display name, a purpose description, `hidden: true`, `memfs: true`, an ordinary `role:research` tag, and the reconciliation tag. Assume every event below is a project-designed trace, not captured backend traffic.

At time T0, the controller writes a request record with state `planned`, no canonical ID, attempt count zero, and a lease owner. At T1, it reads its mapping store and finds no ID. At T2, `client.agents.list({ tags: [correlationTag] })` returns no exact matches. The controller records that observation, increments the attempt count, and enters `creating`. This zero-match result is permission to proceed only because the same request still owns the provisioning lease; it is not proof that no concurrent or temporarily invisible creation exists.

At T3, the controller invokes `client.createAgent(options)`. The promise resolves to `agent-example-a17`. That string immediately becomes the canonical identity for this attempt. The controller must not wait for its database write before preserving the value in its in-memory result and structured event. At T4, retrieval by `agent-example-a17` returns an object carrying the expected reconciliation tag. The external effect is now known to this invocation: one agent was created and can be addressed by its backend identity.

At T5, the controller attempts to store the request-to-ID mapping, but its durable store rejects the write. The operation is not wholly failed. Reporting only an exception would erase the most important fact and tempt a caller to create again. The controller returns `created-unrecorded` with `agent-example-a17`, marks the request as requiring reconciliation if any available journal permits, and instructs the caller to retry with exactly `provision-audit-17`. It does not generate a replacement key.

A second invocation begins after the store recovers partially. Its mapping read still returns nothing because T5 never committed. The controller searches for the same reconciliation tag and receives exactly one match: `agent-example-a17`. It does not invoke creation. Instead, it retrieves that ID, compares the controller-owned safe fields, and retries persistence. If this write succeeds, the result is `reconciled`: the invocation recovered an earlier effect. If the write fails again, the result is `reconciled-unrecorded`. That label preserves causality. `Created-unrecorded` says “this invocation created the agent but could not record it”; `reconciled-unrecorded` says “this invocation found the earlier agent but still could not record it.” Both retain the canonical ID and require the same request key, but only the first attributes creation to the current invocation.

Suppose instead that the second search returns `agent-example-a17` and `agent-example-b17`. The controller enters `ambiguous`, releases no new creation attempt, and produces an operator dossier containing both IDs, their exact tags, retrieved metadata, timestamps if available, and the known attempt history. It must not choose whichever result appears first, has the newest timestamp, or most closely matches the name. Those heuristics could adopt an unrelated object or hide a concurrency defect. An authorized reviewer must determine ownership, repair the controller mapping, and separately decide whether any duplicate qualifies for guarded deletion.

## Failure modes and recovery decisions

**The creation call rejects before returning an ID.** This is not automatically proof that no agent exists. Validation errors raised before transport are good candidates for a corrected, separately reviewed request, but transport interruption or timeout can leave an uncertain effect. Classify the error by the strongest available evidence. When the effect may have reached the backend, do not immediately retry creation. Mark `creation-outcome-unknown`, retain the request key and lease history, search by the reconciliation tag, and escalate if visibility remains inconclusive. The safe response to uncertainty is reconciliation, not optimistic repetition.

**The type checker accepts an option but creation rejects it at runtime.** `CreateAgentOptions` is a broad declaration, while `DISC-CREATE-OPTIONS-001` records backend-specific rejection or qualification. A preset-shaped system prompt, memory preset name, creation-time `allowedTools`, callback, or other typed value may therefore fail for a selected backend. Recovery is to preserve the rejection as evidence scoped to that exact backend and version, remove the unsupported value only through design review, and return to the documented safe subset. Do not cast through the error, suppress validation, or claim the declaration promised universal runtime support. Compilation proves shape compatibility, not backend acceptance.

**Retrieval after creation fails.** If creation returned an ID, preserve it and do not create another agent. Record a `created-verification-pending` or equivalent uncertain verification state, then retry retrieval under a bounded policy. The returned canonical ID is stronger evidence than a later transient read failure, although live consistency behavior remains unproven. If retrieval persistently reports absence, escalate with the ID, request key, backend, attempt evidence, and errors rather than converting absence into permission to create.

**A stored mapping points to an object that cannot be retrieved.** Do not silently delete the mapping or provision a replacement. Possible explanations include deletion, authorization change, wrong topology, outage, or corrupted controller state. Freeze mutation for that request and investigate. Replacement creation requires a new explicit decision because it may produce a second agent while the original still exists but is temporarily inaccessible.

**One tagged match has configuration drift.** Identity recovery and configuration correction are separate decisions. First persist or otherwise stabilize the canonical mapping if ownership is sufficiently established. Then compare only fields the controller owns. A changed name or description may be an authorized human update; a missing reconciliation tag may be accidental; a different hidden flag may affect operator discovery. Do not overwrite blindly. Record the difference, policy owner, and chosen patch. Never use model, system, or context updates as incidental provisioning repair.

**Multiple exact tag matches appear.** Stop all automatic creation and mutation. This state demonstrates that reconciliation tags are not uniqueness locks. Preserve all candidates and the query conditions, check controller leases and attempt logs, and require an ownership decision. Even if one duplicate seems unused, deletion must follow the full destructive-operation policy. Ambiguity is information to resolve, not an inconvenience to average away.

**Deletion is requested as cleanup after a failed test or duplicate.** “Cleanup” does not weaken deletion guardrails. Resolve the exact canonical ID, retrieve it freshly, establish that no active work or dependent controller record remains, identify memory and conversation consequences as unknown unless separately evidenced, and require the designated approval. Record a proposed deletion before issuing it and retain a tombstone afterward. If deletion rejects or its outcome becomes uncertain, do not repeat indefinitely; retrieve and reconcile. If the object remains, decide whether a bounded retry is authorized. If retrieval cannot distinguish deleted from inaccessible, report uncertainty rather than success.

**An operator wants to hide an agent instead of deleting it.** Updating `hidden` can be the safer response when the goal is reducing routine-list clutter while preserving identity for investigation. It is not sufficient when policy requires termination, nor does it prove work has stopped. Record hiding as a visibility update, preserve the canonical mapping, and leave deletion state unchanged.

Across these cases, recovery follows one invariant: never discard an external identity or replace uncertainty with a convenient Boolean. Each decision should state what is known, which evidence produced that knowledge, what remains unknown, and which next action is authorized. That discipline lets later modules open conversations and sessions against a stable agent identity instead of inheriting an ambiguous provisioning history.

A useful incident record also separates observation from decision. Record the attempted method, sanitized options category, request key, lease owner, timestamps, returned ID if any, exact tag-match count, persistence outcome, and next authorized transition. Do not log secrets or entire backend objects merely for convenience. If an operator intervenes, record which candidate was adopted, why the evidence supported it, and who approved any mutation or deletion. This record makes recovery reviewable without pretending the controller and backend share one transaction.

Finally, bound every retry path. Validation correction should produce a reviewed new attempt; persistence retry should reuse the same identity and key; uncertain creation should reconcile before any new effect; deletion retry should first observe current state. A retry budget exhausted in uncertainty ends with escalation, not forced success. These rules preserve both resources and truthful status when dependencies remain unavailable.

## Dossier artifact: agent provisioning and custody record

Under separate execution authority, the learner can produce an **Agent Provisioning and Custody Dossier**. The dossier is a durable, reviewable artifact for one provisioning request from intent through current lifecycle state. It is not a raw log dump and not a substitute for the backend’s authoritative object. Its purpose is to let another controller or human supervisor determine what was requested, what external effects are known, which identity is canonical, what remains uncertain, and which management actions are permitted next.

Begin with an intent sheet. Record the stable request key, mission reference, owner, intended agent role, acceptance criteria, selected topology, exact SDK and runtime evidence lane, creation authority, retry budget, and stop conditions. Include the desired safe-subset fields: name, description, hidden state, MemFS decision, ordinary tags, and generated reconciliation tag. State why each field is needed. Explicitly list deferred configuration such as model, system behavior, tools, skills, permissions, and conversation settings so omission cannot be mistaken for accidental incompleteness.

Add an identity and reconciliation sheet. It should contain the canonical agent ID if known, the source of that ID, every creation attempt state, controller lease holder, exact-match search counts, candidate IDs discovered by listing, retrieval outcomes, and mapping-store outcomes. Distinguish `created`, `created-unrecorded`, `reconciled`, `reconciled-unrecorded`, `already-recorded`, `ambiguous`, and `creation-outcome-unknown`. For each transition, write a short justification based on observations rather than conclusions alone. If no ID is known, say so; never insert a guessed identifier.

Add a management-boundary sheet. Declare which fields the controller owns and which it merely observes. For this module, routine ownership is limited to name, description, selected tags, and hidden state. Record approved update reasons, expected before-and-after values, fresh retrieval evidence, returned update state, and any drift requiring review. Inventory list operations must include filters, pagination handling, and whether hidden objects were expected. A retrieve record should identify the canonical ID queried and the meaning assigned to success, absence, or access failure. Do not copy complete objects containing unnecessary data into the dossier.

Add a deletion decision sheet even when deletion is not planned. State who may propose and approve deletion, required dependency checks, active-work checks, retention expectations, and the rule that names and tags are never deletion selectors. For an actual proposal, include fresh retrieval, the exact canonical ID, reason, alternatives considered, effects that remain unknown, approval evidence, bounded retry policy, and final status. Preserve a tombstone after a completed deletion attempt. The tombstone records controller history; it does not claim backend recovery or secure erasure.

Conclude with an evidence ledger and an operator handoff. Classify each statement as documented-current, exact-package or exact-source, project method, fixture result, or unknown-not-tested. Link only registered evidence IDs. List open discrepancies affecting the request. The handoff should answer: Is creation allowed now? Is one canonical identity established? Is persistence complete? Is configuration drift accepted? Are any destructive actions pending? What is the next authorized operation? A cold reviewer should be able to answer those questions without relying on oral context.

A strong dossier is concise enough to audit but complete enough to prevent blind repetition. It must not contain credentials, private endpoints, unrestricted environment snapshots, or fabricated runtime evidence. The vertical-slice fixture may be cited as a project example of partial success, but it cannot be presented as this dossier’s observed execution. Producing the dossier later does not itself authorize another SDK call.

## Formative transfer questions

These prompts test whether you can transfer the method to unfamiliar incidents. Answers should identify evidence, uncertainty, and the next authorized decision, not merely recite method names.

1. A controller has no local mapping. `client.agents.list` returns one exact reconciliation-tag match whose name differs from the desired name. What must happen before any call to `client.createAgent`, and why is the name difference not evidence of a different identity?

2. Creation returns a canonical ID, retrieval succeeds, and the mapping write fails. Describe the result state, the information returned to the caller, and the first three actions on retry. How would your answer change if retry persistence failed after finding the same agent?

3. A creation request times out without returning an ID. Explain why neither “failed” nor “created” is justified. Design a bounded reconciliation sequence and identify the condition under which a new creation attempt could eventually be reviewed.

4. Two agents carry the same controller reconciliation tag. One has the desired description; the other has a newer creation timestamp. Why must automation stop? What evidence belongs in the ambiguity dossier, and which tempting selection heuristics must be rejected?

5. The TypeScript compiler accepts a system-prompt preset in `CreateAgentOptions`, but the chosen backend rejects it. Which evidence axis established type acceptance, what discrepancy limits the runtime claim, and how should the creation design be narrowed without pretending the SDK is internally uniform?

6. An inventory job calls `client.agents.list()` once and concludes that every governed agent is present. Identify the pagination, filtering, hidden-state, and topology assumptions in that conclusion. How would you design the inventory result so incompleteness remains visible?

7. A controller record contains `agent-example-9`, but `client.agents.retrieve` cannot currently resolve it. Why is immediate replacement unsafe? List plausible explanations and define the state and escalation evidence you would preserve.

8. An operator wants to rename an agent and change its tags. Describe a safe `client.agents.update` workflow that distinguishes canonical identity from mutable metadata, preserves reconciliation capability, handles concurrent drift, and records the returned state.

9. A hidden worker is no longer needed. Compare updating `hidden`, leaving it governed but inactive, and calling `client.agents.delete`. What does each decision accomplish, and what does none of them prove about active sessions, dependent conversations, memory erasure, or restoration?

10. A cleanup routine proposes deletion based on an exact name match. Rewrite the decision using canonical-ID retrieval, ownership evidence, dependency review, approval, and a tombstone. If deletion returns without a value but later retrieval is unavailable, what can and cannot be claimed?

11. Design a typed result union for controller reconciliation without copying the walkthrough. Which states need an agent ID, which require operator intervention, and which permit a same-key persistence retry but prohibit creation?

12. A teammate says tags make `client.createAgent` idempotent. Refute the claim using a concurrent zero-match scenario. What controller mechanism narrows the race, and why does it still not create a distributed transaction with the backend?

13. A reconciled object has correct identity but unexpected model and system configuration. Which changes belong in this module’s routine update scope, and which must be deferred to later governance? Explain why identity recovery should not smuggle in unrelated reconfiguration.

14. Given create, list, retrieve, update, and delete, assign each operation a purpose, required precondition, authoritative output, and one dangerous overinterpretation. Then place controller reconciliation around the sequence rather than treating it as a sixth product method.

15. Review a hypothetical dossier that reports only “provisioning failed.” What minimum observations would you request to distinguish validation rejection, uncertain transport outcome, created-unrecorded partial success, reconciled-unrecorded persistence failure, and multiple-match ambiguity?

## Evidence synthesis and exact boundaries

The evidence for this lesson is deliberately layered. `SRC-DOCS-SDK-AGENTS-20260916` and `SRC-DOCS-SDK-REFERENCE-20260916` support documented-current statements about creating persistent agents, receiving an agent ID, and managing agents through the client surface. Documentation is dated and may change; it is not an immutable declaration for version 0.8.9 and does not prove a target backend’s behavior.

`SRC-SDK-NPM-0.8.9` identifies the exact published package and declarations. It supports the existence and TypeScript shapes of `LettaAgentClient`, `CreateAgentOptions`, `AgentsClient`, the string-returning `createAgent` method, and declared list, retrieve, update, and delete operations. `SRC-SDK-SOURCE-0.8.9` permits static reasoning about validation and backend branches in that immutable source revision. Neither package installation, declaration inspection, source reading, nor compilation is a live request.

`DISC-CREATE-OPTIONS-001` narrows broad creation types to a safe subset because some typed values are rejected or qualified by backend-specific validation. `DISC-SDK-REFERENCE-EXPORTS-001` prevents the official overview from being treated as a complete mechanical API ledger and prevents declaration exports from being promoted automatically into curriculum promises. The lesson resolves neither discrepancy. It teaches within their claim-limiting effects.

The controller record, request key, namespaced reconciliation tag, lease, state vocabulary, ambiguity stop, retry policy, deletion guardrails, and dossier are project-owned methods. Tags are product metadata used by that method; uniqueness is not claimed. The partial-success vertical slice and `FIX-PROVISIONING-PARTIAL-SUCCESS` are static project artifacts. They show that the proposed TypeScript boundary and simulated recovery story are coherent, not that any runtime produced those events.

## Explicit non-claims

This module does not claim that a Local, remote, Cloud, hosted, self-hosted, or production backend accepted or executed any operation. It does not claim ordering, pagination completeness, hidden-agent visibility, read-after-write timing, tag uniqueness, atomic creation, transactionality with a controller store, exactly-once behavior, automatic rollback, or safe blind retry. It does not establish account access, provider or model entitlement, credentials, quotas, latency, cost, availability, tenancy isolation, security compliance, or production readiness.

It does not claim that update controls every aspect of an agent, that hiding suspends work or secures an object, or that delete archives, cascades, immediately disappears everywhere, can be undone, or securely erases memory and conversations. It does not prove that a missing retrieval means deletion, that one list page is exhaustive, or that names and descriptions are unique. It does not authorize package installation, code execution, API calls, agent creation, mutation, deletion, evaluator use, canaries, deployment, or publication. Those actions require their own explicit authority and scoped runtime plan.

## Handoff to MOD-05

Provisioning ends when the controller has an evidence-bounded canonical agent identity, a durable or explicitly incomplete mapping, and a truthful management state. It does not end when the agent has completed useful work. The next module introduces conversations, sessions, turns, and recovery: the layers through which a controller opens or resumes interaction, submits work, consumes streams, identifies terminal outcomes, handles disconnects, and recovers pending state.

Carry three invariants into MOD-05. First, pass the canonical agent ID rather than a name or listing position. Second, preserve the distinction between the persistent agent, its conversations, and an active session connection. Third, do not let successful provisioning imply session readiness, turn completion, message durability, or recovered execution. MOD-05 begins from a governed identity and adds temporal execution without weakening the reconciliation discipline established here.

**Product/runtime/production non-claims at handoff:** no session was opened, no default conversation was observed, no message was sent, no event ordering or reconnect behavior was tested, and no deployment was production-qualified.
