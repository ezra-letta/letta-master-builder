# MOD-06 Memory Context Skills and Shared Knowledge

| Field | Value |
|---|---|
| Status | ready |
| Design revision | 0.4 |
| Prerequisites | MOD-05 |
| Capability IDs | CAP-MEMFS-CONTEXT; CAP-SKILLS-LOCALITY; CAP-SHARED-REPOSITORIES |
| Evidence IDs | SRC-DESIGN-SYNTHESIS; SRC-DOCS-MEMFS-20260911; SRC-DOCS-MEMORY-20260911; SRC-DOCS-SDK-AGENTS-20260916; SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9 |
| Pointer IDs | PTR-MEMORY-001; PTR-MEMFS-001; PTR-SKILLS-001; PTR-REPOSITORIES-001 |
| Project-method sections | Placement procedure; root-first layout; provenance and conflict controls |

## Learning contract and prerequisites

This module teaches you to design memory and knowledge placement for a persistent autonomous agent without confusing context, history, files, skills, or shared resources. By the end, you should be able to classify information by owner and lifetime, preserve an existing MemFS layout, choose a placement through a repeatable decision procedure, explain skill source locality, plan for partial success during agent creation, and state repository attachment preconditions. You should also distinguish compaction, stateless execution, reflection, and measured improvement.

MOD-05 established the difference between persistent agents and conversations, active SDK sessions, turns, typed events, and recovery. Carry those identities forward. A resumed conversation is not a new agent; a session is not the complete lifetime of memory; and a transcript projection is not automatically durable working knowledge. The exact implementation evidence for this revision is Agent SDK `0.8.9`. Its declared Letta Code dependency is `0.32.11`, but this module does not claim live Local, Cloud, hosted, or repository behavior because no scoped runtime canary has been performed.

## Why memory architecture matters

Persistent agents can accumulate useful knowledge across conversations, but persistence does not make every observation true, relevant, safe, or appropriately shared. If a builder pours entire transcripts, temporary task state, credentials, and copied reference material into one memory file, the result becomes hard to audit and expensive to load. Old assumptions compete with current policy. Private details may cross task or tenant boundaries. A model may treat a failed tool response as durable fact. Concurrent workers may overwrite one another. The agent appears to remember more while becoming less dependable.

Good architecture makes information discoverable at the moment it is needed while preserving provenance, scope, and reviewability. Stable identity should not be buried in volatile notes. A work checkpoint should not masquerade as permanent expertise. Shared organizational knowledge should not silently become one agent’s private memory. Credentials should not enter any of these stores. The controller must know which state can be model-edited, which is authoritative elsewhere, and which requires independent approval before promotion.

## Vocabulary and ownership

**Memory** is curated information intended to shape the persistent agent across work. Current official documentation describes MemFS as a Git-backed memory filesystem and memory workflows that can be initialized, taught, and changed over time. Memory should hold durable identity, preferences, compact project knowledge, and pointers to deeper material. It is not a synonym for every stored message.

**Context** is the information available to the model for a particular inference. It may include system instructions, selected memory files, recent conversation material, tool definitions, and task-specific content. Context is a temporary projection assembled from several owners. Something can persist without being in the current context, and something can appear in context without becoming persistent memory.

**History** is the ordered conversation and tool record associated with a conversation. It is evidence of what was sent or observed, subject to exact surface and recovery limits. History may contain errors, abandoned plans, untrusted inputs, duplicate projections, and superseded conclusions. Curating a fact from history into memory requires attribution and judgment; replaying history is not the same as learning.

A **working file** is task-local material such as a draft, checkpoint, or generated artifact. It belongs in the project workspace when tools and humans must inspect it. Its lifetime follows the work product, not necessarily the agent identity.

A **skill** is a reusable procedure with a trigger-oriented description, instructions, and potentially support files. It tells an agent how to perform a class of work; it is not the current result.

A **shared repository** is a separately owned knowledge resource that can be attached to agents under explicit permissions. It is not the same object as one agent’s MemFS. Sharing requires provenance, access policy, attachment state, conflict handling, and a decision about whether changes are allowed. An attachment is a relationship, not proof that every file was loaded into context or that all agents see identical state.

## MemFS ownership and root-first design

Treat MemFS as agent-owned adaptive knowledge. The agent may read and, under policy, revise it. The controller owns whether such work is authorized and how changes are reviewed; Git history supports inspection but does not turn every commit into approved truth. A local checkout edit, a commit, and synchronization are different states. This repository has not observed their exact runtime behavior, so do not promise that an edit is durable or synchronized merely because the source model is Git-backed.

Use a **root-first** approach whenever entering an existing memory filesystem. Start from the declared memory root and inspect its top-level orientation before opening individual files. Determine the existing directory vocabulary, index or navigation conventions, ownership notes, and links. Follow explicit pointers rather than recursively ingesting everything. Root-first traversal limits accidental exposure, respects the author’s information architecture, and makes missing or contradictory roots visible early.

Preserve an **existing layout** unless a separately reviewed migration justifies change. Do not rename directories, flatten linked notes, generate a second index, or reorganize files solely because a different structure seems cleaner. Existing paths may be referenced by memory links, skills, scripts, or human procedures. Add the smallest compatible artifact, and record why it belongs there. If the root is missing, ambiguous, outside the expected agent scope, or appears to belong to another tenant or agent, stop rather than searching the host for a plausible replacement.

The root-first rule is project-owned safety guidance, not a statement that every Letta topology exposes the same filesystem path. Exact SDK `0.8.9` types include Local session environment and memory-confinement options, but their presence does not prove a selected kernel sandbox, root derivation, synchronization behavior, or Cloud equivalence.

## Placement decision procedure

For each candidate piece of information, apply this procedure before writing it anywhere.

First, identify the **authoritative source**. Is the value owned by a user, external service, source repository, controller database, conversation, or agent judgment? Store a pointer and provenance when the authority lives elsewhere. Do not copy changing account state into memory and then treat the copy as canonical.

Second, classify **lifetime and reuse**. One-turn instructions stay in the task input or session context. Work-unit checkpoints belong in controller state or working files. Knowledge likely to help the same agent across future conversations may belong in MemFS. A reusable procedure belongs in a skill. Knowledge intentionally shared among agents belongs in a shared repository, not duplicated private memory.

Third, classify **sensitivity and audience**. Credentials never belong in memory, history summaries, skills, repositories, or examples. Personal or tenant data should be minimized and placed only where the authorized audience and retention policy allow. If the reader set cannot be stated, do not promote the information into a shared store.

Fourth, choose **granularity**. Keep frequently needed identity and policy compact. Put detailed reference material in focused files and link to it. Preserve large artifacts in their native workspace. Avoid full transcript dumps; extract a concise claim with date, source, confidence, and conditions.

Fifth, decide **mutation ownership**. Can the agent edit the material directly, propose a patch, or only read it? Shared resources and stable policies often need review, conflict detection, or a controller-mediated update. A write permission is not evidence that the content should be changed.

Sixth, define **freshness and invalidation**. Record when volatile information must be rechecked and what event supersedes it. If a fact has no reliable refresh path, label uncertainty rather than presenting it as timeless memory.

Finally, define **verification**. Check the target root, inspect the resulting diff or relationship state, and retain provenance. For a shared attachment, verify the canonical relationship through the owning API or controller record. For memory, distinguish local edit, committed state, and any separately observed synchronization. Stop on conflicting matches or uncertain ownership.

This procedure is a project method. Letta product surfaces provide memory, skill, and repository capabilities, but they do not replace application decisions about truth, privacy, tenancy, or promotion.

## Skills and source locality

A skill should be narrow enough to trigger predictably and complete enough to guide action without embedding live secrets or tenant-specific authority. Separate instructions from support files. Record the skill source, version or revision, intended agent audience, tool assumptions, and whether supporting material is available in the selected runtime.

Exact SDK `0.8.9` source supports skill items whose instructions may be provided inline and Node-specific handling for local directory sources and support files. Portable entry points and remote topologies do not necessarily have the same path or filesystem abilities. Therefore a path that works in a Node Local controller must not be presented as a universal skill source. Source locality is part of the architecture: controller filesystem, agent MemFS, shared repository, runtime workspace, and Cloud resource are separate locations until exact evidence establishes a bridge.

Agent creation with a skill can produce **partial success**. The exact source indicates that core skill instructions can travel with creation while Cloud-only support-file pushing occurs afterward. The agent may therefore exist even if a later file transfer fails. Never blindly retry creation. Persist the canonical agent identity, inspect which skill components arrived, and retry or compensate only the failed stage. This is the registered `DISC-SKILL-PARTIAL-SUCCESS-001` safe-subset boundary; no live push has been observed here.

## Shared repositories and attachment preconditions

Before attaching a repository, verify the authenticated tenant, canonical agent ID, canonical repository ID, repository provenance, requested permission, expected current attachment state, and whether the relationship should be session-scoped or persistent. Confirm that content classification allows the intended agent audience. Define the conflict policy before granting write access, including how concurrent edits, rejected updates, and rollback are handled.

Exact SDK `0.8.9` exposes repository management and agent-repository relationships, including read or read-write permission concepts and session resources. Export presence is static evidence, not proof of Cloud availability for an account. Current capability records make shared repositories a Cloud-oriented product area and preserve Local or hosted behavior as untested unless separately evidenced.

Attachment may also be a multi-stage operation. The registered discrepancy states that a repository relationship can persist before default-conversation recompilation fails. Treat “relationship changed, recompile failed” as partial success, not atomic failure. Re-read authoritative attachment state before retrying, retain the canonical relationship, and use only a documented safe retry for the failed recompile stage. Do not issue a compensating detach automatically unless policy explicitly prefers removal over temporary inconsistency.

## Compaction, stateless sessions, reflection, and improvement

**Compaction** reduces or restructures conversation material so work can continue within context limits. It is a context-management operation, not guaranteed deletion, privacy erasure, memory promotion, or proof that all salient facts survived. Preserve authoritative checkpoints outside a lossy summary and test exact behavior only under separate runtime authority.

A **stateless session** in the current Agent SDK documentation changes the session's memory, agent-skill, agent-mod, transcript, and reflection behavior. The agent and conversation themselves remain persistent. Stateless therefore does not mean anonymous, history-free, side-effect-free, or automatically private. It is useful when a bounded turn should not load or change the agent's ordinary long-term-memory path, but the builder must also account for the documented skill, mod, transcript, and reflection differences. Controller effects and persistent conversation identity still require normal governance.

**Reflection** or dreaming reviews experience and may propose or apply memory changes according to the selected workflow. It is not an independent evaluator. Reflection can discover a useful pattern, but the same agent is influenced by its prior output and may reinforce an error or malicious instruction. Capture a proposed memory diff, provenance, and reason; apply review appropriate to impact.

**Improvement** requires more than changed memory. MOD-10’s gates still apply: preserve a baseline, freeze evaluation cases, run an independent evaluator, control contamination, promote only on declared criteria, and retain rollback evidence. A memory commit, successful compaction, or confident reflection is evidence of a change—not evidence that the agent became better.

## Worked case: the Atlas support agent

Consider Atlas, a persistent agent that helps an equipment company prepare support replies. The product controller owns customer identity, ticket state, authorization, and delivery. Atlas owns curated working knowledge about tone and recurring diagnostic patterns. A shared repository contains approved manuals. The execution workspace contains ticket-specific attachments and drafts. A skill describes the procedure for diagnosing a power fault. The conversation history records what the user and agent said. This separation is the intended architecture; none of the following trace represents a live system.

At first, the builder gives Atlas one enormous system prompt containing the company handbook, three manuals, examples from old tickets, escalation policy, and a changing list of open incidents. The agent answers adequately for a week, then begins missing recent instructions and quoting obsolete incidents. This is **prompt bloat**: durable identity, reusable procedure, reference content, and dynamic operational state compete in every inference. The recovery is not to make the prompt still larger. Preserve only compact identity and invariant policy in always-present context. Move the diagnostic procedure into a focused skill, approved manuals into the shared repository, and live incident state behind an authoritative controller query. Measure the reduced projection before deleting any source material.

The next mistake is **dynamic data pinned as memory**. Atlas records “replacement units are unavailable” after one ticket and treats it as a standing fact months later. Inventory belongs to the inventory service, not persistent memory. The builder replaces the sentence with a pointer: availability must be queried for the ticket’s region at decision time. Any retained observation receives source, scope, timestamp, and expiration. Recovery includes finding decisions influenced by the stale statement; merely correcting the file does not repair prior replies.

A new maintainer then encounters unfamiliar directories and creates `memory/new/important.md`, duplicating policy already indexed elsewhere. Atlas loads both versions and follows the newer-looking but unapproved copy. This is **layout confusion**. Work stops. The maintainer returns to the declared root, reads its navigation and ownership notes, identifies the canonical policy file, and prepares a minimal merge. References to the duplicate are inspected before removal. If no authoritative root can be established, the safe result is unresolved placement, not a guessed reorganization.

The team next creates a `power-fault-triage` skill. Agent creation succeeds with the skill instructions, but uploading its support checklist fails. Reporting “creation failed” would invite a duplicate-agent retry; reporting “skill installed” would hide missing material. The controller records **partial success**: canonical agent exists, instructions are present or expected from the accepted stage, support-file state is unknown or failed. It retrieves the agent, verifies the exact skill components, and retries only the supported file stage when authorized. Until verification, Atlas must not claim to follow the complete checklist.

The manuals repository presents a similar boundary. Its relationship is attached with read permission, but recompiling the default conversation fails afterward. This is **attach/recompile partial success**, not an atomic rollback. The controller reads the authoritative relationship and finds the repository still attached. It does not attach again blindly and does not detach merely to make a simple status field look tidy. It records the changed relationship, blocks work that depends on refreshed context, and retries the documented recompile stage. If the selected runtime cannot report either state authoritatively, the attachment remains uncertain and the job escalates.

Later, two workers receive write access to the same troubleshooting note. One updates voltage ranges while the other changes formatting from an older revision. The second write erases the first. This is a **conflicting-writers** failure caused by treating shared knowledge like private scratch space. Recovery preserves both candidate revisions and their provenance, restores the last agreed base, and asks an authorized reviewer to merge semantic changes. Prevention uses a single writer lease, expected-version precondition, or proposal branches with review. “Last write wins” is not a conflict policy unless the loss has been consciously accepted.

Atlas then edits its MemFS and creates a local commit. A dashboard labels the new guidance “durable everywhere,” although no synchronization evidence exists. Another session sees the older state. This is the **unsynced commit** error. Local edit, commit, push or synchronization, remote acceptance, and later checkout visibility are separate evidence states. The controller changes status to “locally committed; synchronization unknown,” preserves the commit identity, and avoids another edit based on the assumption that peers received it. Recovery uses only an exact supported synchronization procedure under separate execution authority and verifies the destination afterward.

A long ticket conversation is compacted. The summary omits that a proposed voltage test was rejected by the customer’s site policy. Atlas later recommends the test as though no objection existed. This is a **stale compaction assumption**: the builder treated a lossy context aid as canonical history. The safe design keeps critical constraints and work checkpoints in an authoritative controller record, links them to their source event, and treats the compacted summary as a projection. On discovery, Atlas stops action, reconciles against available history and ticket state, corrects the checkpoint, and marks any decisions made from the incomplete summary for review. Compaction success does not prove semantic completeness.

Trying to avoid memory pollution, the builder runs a **stateless** session for a sensitive ticket and assumes nothing persists. The session changes memory, agent-skill, agent-mod, transcript, and reflection behavior, but the agent and conversation remain persistent and controller effects can still exist. A draft may still be written and a tool may still call a service. Recovery classifies every actual object and effect rather than relying on the word stateless, then applies ordinary data minimization, authorization, and cleanup policy. Stateless is not a privacy mode or side-effect sandbox.

Finally, Atlas reflects on its recent tickets, edits its troubleshooting guidance, evaluates its own replies against the new guidance, and announces a successful improvement. This is **reflection self-approval**. The proposer changed both the candidate and the standard used to judge it. The controller preserves the proposed diff but withholds promotion. An independent evaluator uses frozen cases and the prior baseline, checks for contamination, and decides whether to promote or reject the change. If the reflection already altered active memory, recovery restores the approved revision while retaining the candidate and audit trail. Reflection can generate hypotheses; it cannot award authority or prove improvement.

## Failure and recovery decisions

The case suggests a compact decision discipline. When context is crowded, classify and relocate rather than indiscriminately summarize. When volatile facts are pinned, replace them with authoritative queries and review affected decisions. When layout ownership is unclear, return to the root and stop on ambiguity. When a multi-stage create or attach operation fails, retrieve canonical state before retry or compensation. When writers conflict, preserve variants and merge from an agreed base. When a commit lacks synchronization evidence, report the narrow local state. When compaction loses a constraint, reconcile history and authoritative checkpoints. When stateless is mistaken for ephemeral, inventory persistent objects and effects. When reflection promotes itself, separate proposal, evaluation, and promotion.

Across all cases, avoid two unsafe shortcuts. The first is **status compression**, reducing a multi-stage state to success or failure. Use stage-specific records such as agent-created, support-files-failed, relationship-attached, recompile-failed, locally-committed, or synchronization-unknown. The second is **blind compensation**. Deleting an agent, detaching a repository, or overwriting a branch may destroy valid partial work and compound the incident. Compensate only when policy defines the desired final state and the authoritative current state is known.

Recovery also requires evidence proportional to the claim. A readable file proves only that the current reader obtained that content. A local commit proves a recorded local revision. A relationship response may prove attachment while saying nothing about recompilation or context availability. A reflection diff proves a proposal. Keep each claim on its own rung, preserve uncertainty, and assign a human owner when state cannot be reconciled safely.

## Dossier artifact: Memory and Knowledge Architecture

The learner’s concrete output is a **Memory and Knowledge Architecture dossier** for one bounded agent. Produce it as a reviewable design artifact before any live operation. Its purpose is to let another builder determine where knowledge belongs, who may change it, how partial success is reconciled, and which claims remain unsupported. It is not a memory dump, an installation record, or proof that a runtime accepted the design.

Begin with an **identity and scope sheet**. Name the application-owned work unit, intended users, tenant boundary, persistent agent identity if already known, conversation purpose, selected SDK and runtime lane, and explicit exclusions. State whether the dossier concerns a planned agent or an existing one. Use placeholders rather than credentials or private identifiers in a curriculum submission. Record which controller owns authorization, retention, and audit evidence.

Add an **information inventory**. For each class of information, record a short name, example, authoritative source, sensitivity, audience, freshness, expected lifetime, mutation owner, conflict strategy, and proposed location. Locations should use the vocabulary from this module: immediate context, conversation history, controller state, MemFS, working file, skill instructions, skill support file, or shared repository. Include at least one item deliberately excluded from agent-accessible stores, such as a credential, tenant mapping, or immutable promotion decision. Explain every placement rather than merely naming a destination.

Create a **MemFS root and layout map**. Identify the declared root, the evidence that establishes it, top-level paths relevant to the task, existing navigation files, ownership notes, and links that must remain stable. Describe a root-first reading sequence and stop conditions for a missing, ambiguous, unexpected, or cross-agent root. If the agent is new and no layout exists, propose the smallest layout that supports the inventory. If it already exists, show how additions preserve its conventions. Do not claim to have inspected a runtime filesystem unless that inspection was separately authorized and recorded.

Include a **context projection plan**. Distinguish compact always-present identity from task-specific input, selected memory files, retrieved repository references, tool definitions, and history windows. Set a qualitative or quantitative budget for each category and define what is dropped, summarized, or fetched on demand when pressure rises. Name critical facts that must remain in controller checkpoints rather than depend on compaction. Describe how stale dynamic data is invalidated and refreshed from its authority.

Next, write a **skill manifest** for every required procedure. Record skill name, trigger purpose, instruction source, support-file list, required tool assumptions, intended runtime locality, revision, and whether the selected package surface can resolve that source. Add a create-time state model with separate fields for agent creation, instruction acceptance, support-file transfer, verification, and remediation. The dossier must make “agent exists, support files failed” representable without collapsing it into either complete success or total failure.

Add a **shared-repository relationship plan**. Record repository owner, tenant, canonical identifier strategy, provenance, content classification, read or read-write permission, session-scoped or persistent lifetime, expected current attachment state, and version or concurrency precondition. Define how an attachment is verified and how the design behaves when relationship mutation succeeds but conversation recompilation fails. Identify who may merge conflicting writers and what evidence is retained before retry, compensation, or detachment.

Provide a **state and evidence ledger**. Suggested rows include local-edit-observed, local-commit-recorded, synchronization-requested, destination-verified, skill-instructions-present, support-files-verified, repository-relationship-attached, recompile-complete, compaction-produced, reflection-proposed, independently-evaluated, and promoted. Each row should carry status, timestamp if observed, evidence source, actor, uncertainty, and next allowed transition. Planned rows have no fabricated timestamps. This ledger prevents one narrow fact from silently proving a stronger state.

Finish the dossier with **failure decisions and non-claims**. For prompt bloat, stale dynamic data, root ambiguity, partial skill transfer, partial repository attachment, conflicting writes, unsynced commits, compaction loss, stateless misuse, and self-approved reflection, name detection evidence, immediate stop, authoritative reconciliation source, retry precondition, compensation rule, and human escalation owner. Then list everything the dossier does not establish. A reviewer should be able to reject the design if any store lacks ownership, any dynamic fact lacks invalidation, any write lacks conflict control, or any recovery step relies on a guessed state.

A strong dossier is deliberately boring about certainty. It distinguishes proposed, statically supported, documented, locally observed, remotely verified, and unknown. It can be reviewed offline because no step depends on trusting a worker’s assertion. When later execution is authorized, operators may fill evidence rows; they must not rewrite the original plan to make outcomes look expected.

## Formative transfer questions

Use these prompts to test design transfer rather than vocabulary recall. Answers should identify owners, evidence, and stop conditions.

1. A user asks an agent to remember today’s exchange rate permanently. Where should the value and the refresh rule live? Explain why storing the number alone is unsafe and how a later worker obtains an authoritative value.
2. An existing MemFS contains unfamiliar links and two apparent project indexes. What evidence would let you choose a root? What do you do if both look plausible but name different owners?
3. A long system prompt contains identity, a policy manual, ticket status, examples, and credentials. Classify each item and propose a context projection that reduces bloat without discarding authority.
4. Agent creation returns an ID, then skill support-file upload times out. Which state is certain, which is uncertain, and why is creating another agent an unsafe first recovery?
5. A repository attachment call reports an error, but retrieval shows the relationship exists. What additional stage may have failed, what work must pause, and what can be retried without duplicating the relationship?
6. Two agents need to contribute to shared guidance. Compare direct read-write access with proposal branches or a controller-owned writer lease. Which conflict evidence must survive either design?
7. A worker shows a local Git commit and says every device now has the update. What is the strongest defensible claim? What destination evidence would justify a synchronization claim?
8. A compacted conversation omits a safety restriction. Which information should have lived outside the summary, and how do you identify downstream decisions requiring review?
9. A stateless session writes a customer draft through a tool. Which objects or effects may still persist, and why does stateless not settle retention or privacy questions?
10. Reflection proposes a cleaner diagnostic procedure and reports better results on cases it selected afterward. Design an independent evaluation and identify the approved baseline used for rollback.
11. A Cloud-oriented repository type appears in the exact SDK declarations. What can you say about API shape, and what can you not say about account entitlement, backend acceptance, visibility, or latency?
12. A support file exists on the controller machine, while execution occurs elsewhere. What locality bridge is required, and what should status say until transfer and destination visibility are verified?

A satisfactory response never answers only “put it in memory” or “retry.” It states the authoritative owner, chosen location, current evidence rung, uncertainty, and the policy permitting the next transition. When a prompt lacks tenant, root, revision, or runtime facts, recognizing the missing precondition is part of the answer.

## Exact evidence, package, and discrepancy boundaries

The release-pinned package lane is `@letta-ai/letta-agent-sdk@0.8.9`, source tag `v0.8.9`, commit `c8afbaa7bd38f2831631f4ae175a37969300ef4d`, with the registered npm integrity in the compatibility records. Its declared Letta Code runtime is `0.32.11`; standalone Code `0.32.11` remains a separate evidence lane even though artifact identity matches. No package was executed for this lesson. Exported types and source branches establish static shapes and implementation distinctions only.

`SRC-DOCS-MEMFS-20260911` supports the dated documented description of MemFS as Git-backed agent memory. `SRC-DOCS-MEMORY-20260911` and `SRC-DOCS-SDK-MEMORY-20260916` support current documented memory, stateless-session, and dreaming concepts at their snapshots. `SRC-DOCS-SDK-AGENTS-20260916` supports dated Agent SDK agent-creation guidance. `SRC-DOCS-SDK-REPOSITORIES-20260916` supports the Cloud repository and attachment distinctions. `SRC-SDK-NPM-0.8.9` and `SRC-SDK-SOURCE-0.8.9` support the exact package and source claims used for skill locality, session options, and repository surfaces. `SRC-DESIGN-SYNTHESIS` supports project-owned placement, ownership, and evidence methods. Documentation freshness and exact-package identity are independent; neither proves a live target.

Four registered discrepancies constrain the lesson. `DISC-MEMORY-TRANSITION-001` means compatibility memory, persona, and human options exposed by types must not be taught as equal greenfield defaults; the treatment remains awareness only. `DISC-SKILL-PARTIAL-SUCCESS-001` requires stage-specific reconciliation because support files may follow creation and fail separately. `DISC-REPOSITORY-PARTIAL-SUCCESS-001` requires preserving an attachment relationship that may persist before recompilation fails. `DISC-PORTABLE-ENTRY-001` prevents treating Node and portable entry points as equivalent for path loading and related capabilities. These discrepancies narrow claims; convenient examples cannot resolve them.

The root-first layout rule, placement procedure, dossier schema, conflict controls, controller checkpoints, evidence ledger, and independent-promotion requirement are project methods. They are not SDK calls or guarantees that Letta enforces these records. Conversely, a public SDK symbol is a product artifact fact, not proof that the method is appropriate for every backend, account, tenant, or topology.

## Explicit non-claims and handoff to MOD-07

No synchronization claim is made. This module does not establish that an uncommitted edit becomes a commit, a commit is pushed, a remote accepts it, another device fetches it, or an agent later reads it. Git-backed does not mean instantly synchronized, globally visible, conflict-free, backed up, or retained for a particular period.

No runtime claim is made. No Local, Cloud, hosted, portable, or standalone session was opened; no memory file was read or changed; no context projection, compaction, stateless turn, reflection, skill resolution, support-file push, repository operation, recompile, conflict, or recovery was observed. Event ordering, durability, sandbox or process locality, memory confinement, and post-disconnect behavior remain exact-target questions.

No account or commercial claim is made. The presence of Cloud-oriented repository and secret-related surfaces does not prove an organization, plan, entitlement, quota, provider, connected computer, storage allocation, or permission is available to a learner. Team sharing, tenant isolation, and repository access require separately verified account and application authorization.

No privacy, security, compliance, or deletion claim is made. Placement guidance does not prove encryption, access control, geographic residency, retention, erasure, audit completeness, or regulatory conformity. Stateless operation and compaction are not privacy controls. Removing a file from one projection does not prove deletion from history, Git objects, backups, logs, caches, or external systems.

No production claim is made. A completed dossier, compiled example, successful attachment, synchronized commit, or evaluated reflection would still not qualify a deployment. Production qualification additionally requires implementation-specific supervision, tenancy, credentials, recovery, observability, backup, rollback, capacity, cost, privacy, incident response, and exact runtime evidence.

MOD-07 introduces tools, MCP servers, permission modes, approvals, and external effects. Carry the dossier’s locality and ownership into that module. Skill instructions describe how to request a capability but do not grant it. Memory and repositories can supply data but cannot authorize an effect. A path visible to a tool is not necessarily permitted, and permission to invoke a tool does not prove the business action is allowed. Preserve source provenance in tool inputs, keep credentials outside model-editable knowledge, and reconcile every effect through the authority that owns the resulting state.

The handoff question is therefore: given this agent’s knowledge map, which minimum tools must be exposed, where do they execute, what data may cross into them, who approves their effects, and what evidence proves the external result? MOD-07 answers that question without weakening any memory boundary established here.
