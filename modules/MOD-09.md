# MOD-09 Multi-Agent Orchestration

| Field | Value |
|---|---|
| Status | ready |
| Prerequisites | MOD-08 |
| Capability IDs | CAP-MULTI-AGENT; CAP-CONCURRENCY-CONSISTENCY |
| Evidence IDs | SRC-DOCS-STATEFUL-AGENTS-20260911; SRC-DOCS-SDK-AGENTS-20260916; SRC-DOCS-SUBAGENTS-20260916; SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-CODE-NPM-0.32.11; SRC-CODE-SOURCE-0.32.11; SRC-DESIGN-SYNTHESIS; SRC-PRODUCTION-HEURISTIC |
| Project-method sections | One-agent default; orchestration decision; delegation contract; lease and join policy; validation and dossier |

## Learning contract and prerequisites

This module teaches how to decide whether work should remain with one principal agent or cross an agent boundary, and how to make that boundary explicit when it is justified. The goal is not to maximize parallelism. It is to preserve authority, attribution, context, and recoverability while obtaining a focused result. By the end, you should be able to distinguish a fresh task subagent, a forked conversation, a persistent agent, direct agent-to-agent messaging, controller-mediated delegation, and client-side orchestration. You should also be able to state what identity, memory, history, tools, files, and computer each worker can actually use rather than relying on the vague word “inherit.”

MOD-08 is required. You should already understand bounded work units, controller-owned leases, step and cost budgets, triggers, checkpoints, idempotency, uncertain effects, and the difference between queue acceptance and completed work. You also need the object distinctions from MOD-02 and MOD-05: an agent is not a conversation, a conversation is not a session, and a turn is not a durable controller record. MOD-06 and MOD-07 supply the memory, repository, tool, permission, and effect boundaries used here.

This is a design lesson. Reading it authorizes no child launch, message send, agent creation, conversation fork, computer routing, or runtime experiment. `SRC-DOCS-SUBAGENTS-20260916` is dated documentation evidence, while exact Agent SDK `0.8.9` and Letta Code `0.32.11` artifacts are separate static lanes. `DISC-SUBAGENT-DOCS-0-32-11-001` limits claims where the page and exact source differ. No multi-agent runtime was executed, so timing, delivery, recovery, and cleanup remain unobserved.

## Why orchestration matters

Multi-agent systems fail in ways that single-agent systems cannot. Two workers may edit the same file, consume the same budget, repeat the same irreversible effect, answer different interpretations of the task, or each assume the other owns cancellation. A parent can receive a launch receipt and mistake it for a verified result. A child can produce polished prose without satisfying acceptance criteria. A message may be accepted while no reply ever arrives. An apparently helpful fork can inherit sensitive history that the delegated task did not require.

These are governance failures, not merely model-quality failures. In the Master Builder ownership model, agents own adaptive knowledge, runtimes own execution state, and the controller owns authority, leases, budgets, evaluation records, and audit state. Delegation never transfers more authority than the controller records. A parent prompt saying “handle everything” cannot silently expand tool permissions, effect scope, data access, or production status.

Good orchestration therefore starts with subtraction. Ask what can be removed: another identity, another transcript, another working directory, another queue, another lease, another completion channel. Every extra worker creates coordination cost and another partial-success boundary. Parallelism is worthwhile only when its expected benefit exceeds that cost and the work can be separated without unsafe shared effects.

## The one-agent default

Use one principal agent unless you can name a concrete reason not to. One agent is usually enough when the task is sequential, tightly coupled, small enough for its context budget, dependent on one evolving interpretation, or likely to touch the same resources throughout. It is also the safe default when acceptance criteria are still ambiguous, when external effects cannot be partitioned, when there is no reliable join process, or when the controller cannot supervise more than one lease.

A principal agent may still use ordinary tools, checkpoints, summaries, and external files. Context management does not automatically require another agent. A long task can be divided into phases handled by the same identity. A specialist prompt can be supplied for a bounded turn without creating a durable specialist. A second worker should solve an isolation, expertise, latency, or context problem that simpler structure cannot solve.

A useful test has five questions. Is the delegated output independently specifiable? Can its inputs be frozen or versioned? Can it run without conflicting writes? Can the principal validate its result without replaying all of its reasoning? Can the controller stop, expire, or abandon it without losing the whole work unit? If any answer is no, keep the work serial or redesign the boundary first.

Avoid accidental fleets. Do not create a persistent agent merely because a role name sounds useful. Do not let children recursively create children unless the contract explicitly permits depth greater than one. Do not spawn one worker per minor question when direct inspection is cheaper. Keep a controller-owned cap on active children, total descendants, cumulative tokens, elapsed time, and effect authority. A fleet is an architectural commitment, not a prompt-writing style.

## Conceptual model and vocabulary: six forms of delegated work

### Fresh task subagent

A fresh task subagent is a specialized worker created for a bounded invocation. Current official documentation says built-in subagents are fresh by default and run with their own system prompt, tools, and model; the principal receives the final answer rather than every intermediate tool event. Exact Letta Code `0.32.11` static source shows the task path tracking a task ID, a subagent tracking ID, an agent ID when available, a conversation ID when available, an output artifact, and a completion notification. Those identifiers are related but not interchangeable.

Treat this form as disposable even if implementation machinery creates underlying objects. Give it only the inputs and tools required. It is suitable for independent research, a read-only review, a bounded implementation in an isolated resource set, or parallel analysis whose results will be joined. It is not automatically stateless in every technical sense; “stateless task subagent” here means the controller does not rely on durable identity or accumulated memory after the assignment.

### Forked conversation

A fork creates a new conversation trajectory from a point in the parent’s history. Current official docs describe the built-in fork worker as having full context and tools. Exact `0.32.11` static evidence further shows a hidden forked conversation, the same parent agent identity, inherited parent history through the fork point, retention of the parent system prompt, and explicit handling for a fork toolset. A fork is therefore not a fresh specialist with no history and not a new persistent persona.

Use a fork when the worker must understand the conversation trajectory and can explore an alternative without contaminating the principal thread. The inherited history is both benefit and exposure. Do not fork when a concise dossier would provide enough context, when history contains material the child should not see, or when two branches might make concurrent writes to one resource. A fork does not imply that filesystem changes are isolated or that a later merge exists.

### Persistent agent used as a worker

A persistent agent has its own identity, memory, configuration, and potentially many conversations. Current documentation says an existing agent may be deployed as a subagent by agent ID, retaining its rich memory, personality, and skills. A conversation ID selects a particular thread; an agent ID alone identifies the durable entity and may lead to a new thread according to the selected surface.

Use this form when durable expertise or an ongoing relationship is genuinely required: for example, a maintained reviewer with curated policy memory. Do not use it merely to preserve one result; store the result in the controller dossier instead. Persistent agents require lifecycle ownership: who provisions them, who may update memory, who reviews drift, who can retire them, and how stale expertise is detected.

### Direct messaging

Direct messaging addresses another persistent agent or one of its conversations. Exact Letta Code `0.32.11` static guidance distinguishes addressing an agent ID to open a thread from addressing a conversation ID to continue one. It also distinguishes a waiting send, whose process normally returns a final message, from a non-waiting Cloud send, which returns an acceptance receipt and requires a later explicit reply or inspection. Sending input does not create a managed task or completion notification.

Use direct messaging for consultation or coordination with an already owned agent when task lifecycle management is unnecessary or supplied elsewhere. Never treat “queued” as “read,” “delivered,” “completed,” “correct,” or “replied.” If acceptance is unknown, inspect the target conversation before resending, because a retry may duplicate the request.

### Controller-mediated delegation

Controller-mediated delegation is the project-owned default for autonomous systems. An application controller creates a work record, selects the worker form, grants a bounded lease, observes receipts, collects terminal evidence, validates the result, and closes or escalates the work unit. The controller may use an SDK, a harness task surface, or another supported client, but its records and policies are application-owned. There is no invented Letta “orchestra API.”

This form is appropriate whenever effects, budgets, retries, audits, fan-out, cancellation, or production supervision matter. The controller remains the source of truth even if a parent agent proposed the delegation. Model text may recommend a child; it does not award a lease.

### Client-side orchestration

Client-side orchestration means application code coordinates multiple agents, conversations, turns, or message streams. It can implement queues, fan-out and join, validation, timeout policy, and persistence without asking one model to supervise every transition. It is the strongest separation of control from adaptive reasoning, but also the most engineering work.

Use it when deterministic lifecycle handling matters more than conversational convenience. Keep product operations version-scoped and keep the orchestration state in an application store. Do not infer distributed transactions, exactly-once delivery, or universal cancellation from client methods or static declarations.

## Inheritance is a matrix, not a promise

Before launch, write an inheritance matrix. For **identity**, record whether the worker is a new disposable agent, the same agent on a forked conversation, or an existing persistent agent. For **memory**, state whether it receives explicit task context, inherits the parent agent through a fork, uses the persistent agent’s existing memory, or requires no durable memory. For **history**, state none, a supplied dossier, a complete inherited conversation trajectory, or a named existing conversation.

For **system prompt and model**, identify the worker configuration and any allowed override. Current docs describe custom prompts, tools, models, and optional skills, while exact `0.32.11` source governs this release. The documented `memoryBlocks` field is excluded by `DISC-SUBAGENT-DOCS-0-32-11-001`; a fork retains the parent system prompt through a separate exact path. For **tools and permissions**, list the effective allowlist and approval owner. A model setting does not imply a toolset, and parent possession of a tool does not grant it to a child.

For **files and working directory**, name the actual execution location, repository snapshot, branch or worktree policy, and write set. Conversation history does not carry files. For **computer**, distinguish agent state location from execution location. Exact `0.32.11` static guidance says Cloud may route work to a selected connected computer, while the local backend has no such computer selector. Moving or selecting a conversation’s execution location does not imply that files or working directories move with it.

If any cell is unknown, the contract must either supply it, prohibit dependence on it, or block delegation. “Inherit everything” is not an acceptable security or consistency specification.

## Receipts, task IDs, conversation IDs, and completion

A receipt proves only the event named by the receipt. A task launch response can establish that local orchestration assigned a task ID and began background handling. A direct-message receipt can establish that a service accepted or queued a message. Neither proves that the worker understood the request, executed tools, produced a final answer, or satisfied acceptance criteria.

A **task ID** belongs to the task-management mechanism. Use it to inspect, join, or cancel that managed execution when the surface supports those operations. A **conversation ID** belongs to a message thread. Use it to continue or inspect that thread. An **agent ID** identifies persistent agent state. A **subagent ID** may identify harness tracking state. A **run or turn ID** can correlate execution events. Store all returned identifiers with explicit types; never place them in one untyped `id` field.

Completion is also layered. Transport completion means the send or stream ended. Harness completion means a task reported success or failure. Contract completion means required artifacts and evidence were returned. Acceptance means the principal or independent validator checked those artifacts against the frozen criteria. Only the last closes the controller work unit successfully.

## Delegation contract workflow

First, freeze the parent work unit: intent, acceptance criteria, prohibited outcomes, evidence expectations, and stop conditions. Second, justify delegation in one sentence. Third, choose the least powerful worker form that can succeed. Fourth, allocate a controller lease containing worker identity, parent work ID, resource scope, allowed tools and effects, maximum descendants, step/time/cost budgets, expiry, cancellation route, and return channel.

Fifth, prepare the task packet. Include a bounded question, necessary context or a versioned dossier pointer, inputs with provenance, the expected output schema, assumptions the worker may make, questions it must escalate, and explicit non-goals. State whether the worker may write, where, and how conflicts are avoided. State that apparent success without required evidence is incomplete.

Sixth, launch once and persist the receipt with typed identifiers. Seventh, observe without confusing silence with failure. For fan-out, launch only independent branches, assign disjoint write sets or read-only access, and record one lease per branch. Eighth, join by waiting for terminal states or declared deadlines, not by waiting for the first plausible prose. On cancellation, revoke controller authority, request supported runtime cancellation, mark uncertain in-flight effects, and reconcile authoritative state. Stopping a local wait does not necessarily cancel accepted remote work.

Ninth, validate each result. Check identity and task correlation, required fields, cited artifact versions, resource changes, test or review evidence, uncertainty statements, and acceptance criteria. Resolve contradictions between children rather than averaging them. If validation fails, narrow and redelegate only when the remaining budget and effect state permit. Finally, close leases, preserve the dossier, record orphaned conversations or artifacts for cleanup, and return one attributed synthesis to the principal.

This workflow is the project-owned orchestra and lease policy. It is deliberately outside model-editable memory. It does not claim that Letta supplies the controller database, fan-out primitive, join barrier, cancellation guarantee, or distributed consistency mechanism.

## Original delegation trace: fan-out, join, and bounded retreat

The following trace is an original project-method scenario, not observed Letta runtime behavior. A principal agent must prepare a release-note dossier from three fixed artifacts: a changelog, a package declaration, and a compatibility record. The deliverable needs one version table, one lifecycle-risk summary, and one contradiction report. The controller first applies the one-agent default. One principal could perform all three readings serially, and that remains preferable if the artifacts are small, share one interpretation, or cannot be partitioned. Here, each artifact is large, read-only, independently identifiable, and produces a bounded output that the principal can validate. Fan-out is justified to reduce context pressure, not to create a hierarchy.

**State 0 — frozen parent contract.** The controller creates parent work `release-dossier-27`, fixes the three artifact hashes, output schema, source-use rules, deadline, cumulative token budget, and acceptance tests. No worker may edit files, contact a runtime, or launch descendants. The controller limits active children to three and sets maximum delegation depth to one. It records that the principal owns interpretation and final synthesis.

**State 1 — worker-form selection.** The changelog and declaration analyses need no prior conversation, so two fresh task subagents receive compact packets. The compatibility analysis depends on a nuanced decision already discussed with the principal. The controller considers a fork but rejects it: the relevant decision fits in a short attributed handoff, and the full conversation contains unrelated material. A third fresh task subagent receives that handoff. A persistent specialist would add identity and memory governance without benefit; direct messaging would provide no managed task completion. The least powerful sufficient form wins.

**State 2 — leases and fan-out.** Child `C1` may read only changelog artifact `H1` and must return version rows with line references. Child `C2` may read only declaration artifact `H2` and must return public-shape differences plus uncertainty. Child `C3` may read compatibility artifact `H3` and the explicit decision handoff, then return contradictions. Each lease has its own task identity, deadline, cost share, output schema, and cancellation route. All write sets are empty. The controller launches each task once and persists its launch receipt, task ID, child tracking identity, and conversation ID when supplied.

A launch receipt moves a child from `prepared` to `launched`; it does not move it to `completed`. It does not poll merely because a child is quiet, and it does not launch a replacement unless evidence and policy justify one.

**State 3 — partial returns.** `C1` reports completion with the required rows and references. Validation confirms the artifact hash, output fields, and allowed scope, so `C1` becomes `accepted`. `C2` reports completion but omits uncertainty and includes a claim not traceable to `H2`. Harness completion is recorded, while contract status becomes `rejected-result`. The controller does not paste the unsupported claim into the dossier. It issues one bounded correction to the same managed thread if continuation is supported and the lease remains valid; otherwise it creates a clearly linked replacement attempt under the same child work item.

`C3` reaches its deadline without a terminal result. The controller marks `child-timeout`, expires its authority, and requests cancellation only through a supported task mechanism. Cancellation requested is not cancellation confirmed. Because `C3` was read-only, uncertain external effects are absent, but late output remains possible. The controller records the timeout and proceeds to the join policy rather than waiting forever.

**State 4 — join barrier.** The join rule requires accepted outputs for the version table and declaration differences; the contradiction report may be produced serially by the principal if its child times out. `C1` is accepted. Corrected `C2` now supplies uncertainty and removes the unsupported claim, so it is accepted. `C3` is not accepted. The principal uses the original `C3` packet and performs that bounded analysis itself. This is a retreat to the one-agent default, not a fourth speculative worker.

A late `C3` notification arrives after the principal’s analysis. The controller correlates it with the expired task, preserves it as late evidence, and validates it without reopening child authority. Its conclusion disagrees with the principal. The join does not vote or average. The principal compares both outputs against `H3`, records the exact disputed interpretation, and chooses only what the source supports. If evidence cannot resolve the conflict, the final dossier marks it unknown.

**State 5 — synthesis and closure.** The principal constructs one attributed deliverable, naming which accepted child supplied each component and which component it completed after timeout. It records rejected and late results, closes child leases, confirms that no resource mutations occurred, and identifies any child conversations or output artifacts requiring cleanup. Parent completion occurs only after the final schema, source identity, contradiction handling, and non-claim checks pass.

## Failure modes and bounded recovery decisions

**Wrong worker form.** A principal forks the entire conversation for a simple lookup, or creates a persistent expert for a disposable review. The worker receives unnecessary history or creates lifecycle debt. Recover by cancelling before effects when supported, recording what may already have been exposed, and reissuing only if the task still justifies delegation. Selection should move from one principal to fresh task, fork, persistent agent, or direct message only when required context or ownership increases.

**Missing handoff.** A child is told “check the compatibility issue” without artifact identity, acceptance criteria, output form, or non-goals. A confident answer cannot be validated. Recover by rejecting the result as contract-incomplete and supplying one versioned packet. Do not ask the child to infer the parent’s unstated objective from role names.

**Inherited-context assumption.** The parent assumes a fresh task sees full history, or assumes a fork shares filesystem isolation and every tool. Recover by consulting the recorded inheritance matrix, withholding action until identity, memory, history, tools, files, and computer are explicit, and choosing a dossier handoff when full history is unnecessary. “Inherited” never means universal authority.

**Receipt mistaken for completion.** A launch response or queued direct-message receipt is displayed as a finished assignment. Recover by reverting the controller state to the strongest evidenced boundary, correlating the task or conversation, and waiting for terminal and validation evidence. If acceptance is unknown, inspect before sending again.

**Duplicate task.** A timeout prompts a second launch while the first child may still run. Recover by freezing both attempts, comparing task and conversation identities, cancelling surplus work when supported, and reconciling all possible effects. A replacement must be linked to the original work item and use disjoint or idempotent effects.

**Unvalidated result.** A child’s polished final report is copied into the parent answer despite missing sources, wrong artifact versions, or forbidden changes. Recover by separating harness success from contract acceptance, checking every required field and resource, and rejecting unsupported portions. Redelegate only the narrow deficiency; never reward verbosity as evidence.

**Cancellation overclaimed.** The principal stops waiting and says the child was cancelled. Recover by distinguishing lease revocation, cancellation request, runtime confirmation, process termination, and effect reconciliation. A child whose authority expired may still produce late output; preserve and label it rather than treating it as current authorization.

**Child timeout.** The parent waits indefinitely or recursively launches substitutes. Recover by applying the child deadline and parent join rule. Use available accepted branches, perform the missing bounded work serially, degrade the deliverable explicitly, or escalate. Timeout is a scheduling result, not proof that the child performed no work.

**Shared-resource conflict.** Two children edit the same file or repository state from different assumptions. Stop both write leases, preserve snapshots and canonical external identities, and determine which mutations actually persisted. Do not merge model prose to resolve state. Prevention is stronger: use read-only fan-out, disjoint write sets, isolated branches or worktrees under project policy, and one authorized merger.

**Accidental fleet growth.** Children launch grandchildren, timeouts create replacements, and persistent agents remain after one-off work. Recover by rejecting descendants beyond the recorded depth, revoking excess leases, inventorying active tasks, agents, conversations, computers, and write scopes, then returning unresolved work to the principal. Prevention requires controller caps on descendants, concurrency, cumulative budget, and durable identities. The one-agent default is the steady state; a fleet requires explicit architecture and ongoing ownership.

Across these failures, recovery is bounded by evidence, effect state, lease, and remaining budget. The controller never interprets another worker as extra authority. These are project-owned safety decisions, not claims that Letta supplies orchestration transactions or fleet governance.

## Delegation and Orchestration dossier

The concrete artifact for this module is a **Delegation and Orchestration dossier**. It is controller-owned audit state, not child memory or a substitute for task and conversation records. It explains why delegation occurred, what each worker could access, how results were joined, and why the parent accepted, rejected, cancelled, or abandoned a branch.

The dossier begins with a parent contract: work-unit ID, immutable intent, input and artifact hashes, acceptance criteria, prohibited outcomes, effect classification, topology, exact package tuple, overall lease, budgets, join rule, validation owner, and one-agent-default analysis. State why one principal was insufficient and what condition returns work to serial execution. “Parallelism is faster” is inadequate without independent inputs, safe resources, and a bounded join.

Next comes a worker-selection ledger. For each proposed branch, record the requested output and chosen form: fresh task subagent, forked conversation, persistent agent, direct message, controller-mediated operation, or client-side flow. Explain why a less powerful form would fail. Store typed task, subagent, agent, conversation, run, message, and receipt identities separately. Record whether the branch is new, resumed, forked, or addressed, and identify the parent work item and attempt it belongs to.

An inheritance matrix then states identity, memory, conversation history, system prompt, model, skills, tools, permissions, files, working directory, repository or worktree, backend, computer, credentials boundary, and descendant authority. Each cell contains an explicit source: configured, inherited under exact static evidence, supplied by dossier, unavailable, or prohibited. Unknown does not become inherited. The matrix should also note sensitive context exposed by a fork and resources that remain shared despite conversational separation.

Each child contract contains the bounded prompt, versioned inputs, expected output schema, assumptions permitted, escalation questions, non-goals, read and write sets, effects, approval owner, deadline, step and cost budget, maximum descendants, return channel, cancellation route, and validation tests. Attach launch receipts without promoting them to completion. Add a timeline of terminal notifications, direct-message receipts, explicit replies, timeouts, cancellation requests and confirmations, and late results.

The fan-out section proves independence. It maps every branch to its artifact set and resource set, identifies shared read-only inputs, and demonstrates that concurrent writes are disjoint or controlled by one merger. The join section names mandatory, optional, and substitutable branches; deadline behavior; treatment of rejected and late results; and contradiction resolution. A join is not a majority vote. Preserve each attributed result, evidence references, validation verdict, and reason for exclusion.

Finally, record closure. Include accepted synthesis, unresolved claims, expired leases, uncertain effects, orphaned conversations or workers, cleanup owner, persistent agents retained and why, cumulative budget, actual fleet width and depth, and any supervisor question. ## Formative transfer questions

1. A task is small but requires one evolving interpretation and writes to one configuration file. Explain why the one-agent default may outperform three specialists even if parallel launch is available.

2. A reviewer needs two sentences from prior discussion. Compare a full fork with a fresh task receiving an attributed handoff. Which exposes less context, and what would justify the fork?

3. A persistent security agent has valuable memory, but its policy version is unknown. What lifecycle and validation checks must precede deployment as a worker?

4. A direct-message send returns `queued`. Name every stronger state that remains unproven and describe how the controller should obtain a usable answer without blind resending.

5. A background task response includes task, agent, and conversation identities. Explain what each identifies and why cancellation, thread continuation, and durable-agent management must not use an untyped `id`.

6. Two children return contradictory dependency claims with confident explanations. Design a join decision based on frozen artifacts and evidence rather than voting, reputation, or answer length.

7. A child times out after receiving write authority. What must be revoked, requested, inspected, and reconciled before a replacement can touch the same resource?

8. A fork has the parent’s history and system prompt. Which facts about tools, filesystem isolation, computer, permissions, and future history still require explicit evidence?

9. Three read-only branches are safe individually, but each can launch descendants. Show how width, depth, and cumulative-budget caps prevent an accidental fleet.

10. A child reports harness success while omitting required uncertainty and using the wrong artifact version. Classify receipt, completion, contract, and acceptance states and propose the narrowest recovery.

11. The principal stops waiting for a remote consultation. Why is this not necessarily cancellation? What should the dossier say about late replies and current authority?

12. Design a resource matrix for two branches that must modify one repository. When should orchestration become serial, and when could isolated project-owned worktrees plus one merger be acceptable?

13. An application proposes creating a permanent specialist to retain one useful report. Explain why storing an attributed dossier artifact may avoid identity, memory, drift, and retirement obligations.

14. Which evidence would justify changing a project-method statement about join or cancellation into an exact runtime claim? State the version, topology, target, operation, and observation limits needed.

## Source, package, and discrepancy evidence boundaries

The documented-current evidence supports persistent-agent and conversation distinctions plus a dated description of specialized subagents, fresh built-ins, fork purpose, custom configuration, and existing-agent deployment. `DISC-SUBAGENT-DOCS-0-32-11-001` excludes the page's blocking-default and `memoryBlocks` statements from the safe subset for exact `0.32.11`. Documentation is not proof that this repository launched a child, every account exposes the same path, or an unobserved runtime matches either source.

The exact package lane is `@letta-ai/letta-agent-sdk@0.8.9`, identified by `SRC-SDK-NPM-0.8.9` and `SRC-SDK-SOURCE-0.8.9`. It declares Letta Code `0.32.11`. The declared-runtime and standalone `0.32.11` interpretations remain separate evidence axes even though the recorded artifact identity matches. Exact source can establish static task, fork, message, identifier, and routing paths. It cannot establish live delivery, ordering, inheritance, cancellation, cleanup, or persistence on an untested target.

`CAP-MULTI-AGENT` is planned, design-depth, and non-claim-bearing. Its registered source is `SRC-CODE-SOURCE-0.32.11`; no child or direct message was launched. `ADJ-SUBAGENTS-MESSAGING` is core selection competence but explicitly defers multi-agent runtime execution. `CAP-CONCURRENCY-CONSISTENCY` supplies project design reasoning about concurrent sessions, controllers, repositories, and leases, not an observed product transaction.

`DISC-CODE-0-32-11-LIFECYCLE-001` blocks runtime claims because versions `0.32.9` through `0.32.11` changed execution-owner recovery, locally recorded resume, subagent completion identity, and related attribution. `DISC-SUBAGENT-DOCS-0-32-11-001` keeps conflicting lifecycle/frontmatter details outside the safe subset. `DISC-RECONNECT-OWNERSHIP-001` prevents one universal recovery or approval-replay guarantee across session, listener, transport, and execution-owner boundaries. `DISC-REPOSITORY-PARTIAL-SUCCESS-001` warns that a shared relationship mutation and recompilation need not be atomic. `DISC-SANDBOX-LIFETIME-001` prevents child or session cleanup from being equated with destruction of execution state.

The one-agent default, delegation contract, orchestra ledger, leases, width and depth caps, fan-out independence proof, join barrier, result validation, cancellation states, shared-resource policy, and dossier are project methods supported by `SRC-DESIGN-SYNTHESIS` and `SRC-PRODUCTION-HEURISTIC`. They are not Letta API names or built-in distributed coordination guarantees.

## Explicit non-claims and handoff to MOD-10

This module makes no universal inheritance claim. A fresh task is not assumed to inherit parent identity, memory, history, prompt, model, skills, tools, permissions, files, directory, environment, credentials, or computer. A fork’s documented history and prompt behavior does not prove filesystem isolation, identical tools in every configuration, shared future messages, or a merge facility. Deploying a persistent agent does not prove its memory is current, correct, authorized, or suitable for the task.

It makes no universal messaging claim. Addressing an agent versus a conversation, waiting versus non-waiting behavior, sender attribution, hidden threads, explicit replies, and computer routing remain surface, backend, version, and topology scoped. A receipt does not prove delivery, reading, execution, reply, correctness, or completion. Stopping a wait does not prove cancellation. No exactly-once send, ordered delivery, durable reply, or automatic task conversion is claimed.

No subagent, fork, persistent worker, direct message, fan-out, join, cancellation, computer route, shared write, or cleanup was executed for this curriculum evidence. No live timing, completion ordering, notification routing, resume, timeout, late-result, resource-isolation, or multi-controller consistency behavior was observed. Hosted runtime behavior and version are unknown-not-tested. Static source cannot populate a runtime claim.

This module makes no account or entitlement claim: no organization, project, agent visibility, model availability, Cloud access, connected computer, sandbox, billing status, quota, or credential boundary was inspected. Reading does not authorize creating agents or conversations, launching workers, messaging agents, routing computers, using tools, spending funds, or mutating shared resources.

It makes no production qualification claim. A dossier and join do not establish incident readiness, capacity, rollback, or safe operation. Production qualification requires separate implementation-specific evidence and supervision.

MOD-10, **Improvement, Evaluation, Promotion, and Rollback**, receives one principal synthesis plus the complete attribution dossier—not a pile of unvalidated child opinions. Delegation can generate candidate observations and proposals, but a proposing principal or child cannot become the sole independent evaluator or promoter of its own change. Carry forward frozen evidence, rejected and late results, contamination limits, and unresolved contradictions. The next module separates productive multi-agent assistance from independent evaluation and ensures that orchestration success never self-awards improvement or promotion.
