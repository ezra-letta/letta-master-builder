# MOD-10 Improvement Evaluation Promotion and Rollback

| Field | Value |
|---|---|
| Status | ready |
| Prerequisites | MOD-09 |
| Capability IDs | CAP-MEMFS-CONTEXT; CAP-SKILLS-LOCALITY; CAP-MODELS-CONFIG-SCOPE; CAP-SUPERVISION-PRODUCTION |
| Evidence IDs | SRC-DOCS-MEMFS-20260911; SRC-DOCS-MEMORY-20260911; SRC-SDK-NPM-0.8.9; SRC-SDK-SOURCE-0.8.9; SRC-CODE-NPM-0.32.11; SRC-CODE-SOURCE-0.32.11; SRC-DESIGN-SYNTHESIS; SRC-PRODUCTION-HEURISTIC |
| Project-method sections | Improvement state model; authority separation; frozen evaluation; promotion gate; quarantine and rollback |

## Learning contract and prerequisites

This module teaches how to turn an observed weakness into a controlled, reversible improvement decision without allowing an agent to certify itself. By the end, you should be able to distinguish an observation from a candidate, a proposal from a persisted edit, evaluation from promotion, rejection from quarantine, monitoring from evaluation, and rollback from ordinary correction. You should also be able to classify whether a proposed change belongs in memory, a skill, a procedure, model or conversation configuration, or controller policy.

MOD-09 is required. You should already know that delegation does not transfer unlimited authority, that child output requires validation, and that a proposing worker cannot silently become the final decision maker. MOD-06 supplies memory, MemFS, skill, and shared-knowledge placement. MOD-07 supplies tool, permission, and external-effect governance. MOD-08 separates bounded work, improvement, and supervision loops. The lifecycle and dossier disciplines from MOD-05 and MOD-09 provide the identities, artifacts, and non-claims needed to evaluate a change.

This is a Revision 0.4 project-method lesson. It does not define a Letta improvement API, promotion endpoint, evaluation service, or controller database. Reading it authorizes no memory write, skill installation, configuration update, model turn, evaluation run, canary, deployment, or production mutation. Current documentation and exact package records inform the object boundaries, but no improvement workflow was executed.

## Why self-improvement needs independent judgment

A persistent agent can notice patterns, summarize failures, edit its knowledge, and produce a persuasive explanation of why its change is better. None of those activities proves improvement. The same agent that misunderstood a task can misunderstand the cause. A candidate can overfit the most recent conversation, conceal a regression behind fluent prose, weaken a safety rule to raise task success, or change the evaluation conditions after seeing an unfavorable result.

The danger grows when persistence is confused with correctness. A memory edit can survive. A skill can be reused. A repository commit can preserve an exact version. A model setting can change future behavior. Persistence makes a decision durable; it does not make the decision justified. A commit hash is identity and history, not a quality score. Reflection or dreaming may discover useful opportunities and may update memory according to its configured workflow, but it is not independent evaluation or promotion authority.

The Master Builder method separates three loops. The **work loop** performs a bounded task. The **improvement loop** observes outcomes and produces reversible candidates. The **supervision loop** owns evaluation authority, budgets, promotion, quarantine, rollback, and audit state. A successful work result cannot self-award a system change. A candidate author cannot be the sole evaluator. An evaluator cannot silently deploy what it scored. This separation protects both safety and epistemic quality.

Independent judgment does not mean that every decision requires a different organization or human committee. It means the evaluating identity, prompt, evidence access, and authority are declared and meaningfully separated from the candidate-generating attempt. The evaluator receives frozen cases and a rubric rather than the proposer’s ability to rewrite the test. High-impact controller-policy, credential, permission, or production changes require stronger external authority than a low-risk memory clarification.

## Conceptual model and vocabulary

An **observation** is bounded evidence that current behavior may be deficient or improvable. It names a work unit, expected behavior, actual result, environment, versions, and evidence limits. “The agent seems bad at summaries” is not yet an observation. “On frozen case E4, the answer omitted two mandatory source IDs” is closer.

A **candidate** is a concrete, versioned alternative that could address one or more observations. It may be a memory patch, revised skill, procedure change, model setting, configuration change, or controller-policy patch. A candidate is inert until an authorized process applies it in an isolated evaluation context.

A **proposal** is the decision artifact connecting observations to a candidate. It states causal hypothesis, scope, predicted benefit, known risk, affected resources, migration needs, rollback target, and evaluation plan. The proposal is what reviewers approve for evaluation. It is not permission to promote.

An **evaluation** is a controlled comparison against frozen cases and a declared rubric. It records baseline and candidate identities, evaluator identity, environment, allowed assistance, contamination limits, results, uncertainty, and machine or human judgments. Evaluation answers whether evidence supports a decision within its scope; it does not automatically change the active system.

**Promotion** is the separately authorized transition that makes a candidate active for a defined scope. Promotion can target a test environment, limited canary, one agent, one conversation class, or a broader release. Its record includes approver, target, effective version, blast radius, monitoring conditions, and rollback trigger.

**Rejection** is a terminal decision for the evaluated candidate version. It means the evidence did not satisfy the gate, the risk was unacceptable, or the hypothesis was unsupported. Rejection does not erase observations. A revised candidate needs a new identity and an explanation of what changed.

**Quarantine** isolates a candidate, artifact, or result whose safety, provenance, contamination status, or effects are uncertain. Quarantine is neither acceptance nor final rejection. The object cannot be promoted or reused as trusted evidence until the named uncertainty is resolved.

**Monitoring** observes an already promoted or canaried candidate against declared indicators and stop conditions. Monitoring is not a substitute for pre-promotion evaluation. It detects drift, regressions, cost changes, incidents, or unanticipated effects within the monitored scope.

**Rollback** restores or selects a known prior state after a promotion or canary violates a trigger. Rollback needs a target identity, authority, effect plan, verification, and incident record. It is not merely editing forward until behavior looks acceptable. Some external effects cannot be undone; rollback then limits future authority and invokes compensation or reconciliation.

These states belong in controller audit storage. An agent may recommend a transition, but text in memory cannot promote itself from candidate to active policy.

## Classifying the change surface

A **memory change** updates agent-owned adaptive knowledge: stable user facts, domain context, compact working principles, or focused MemFS content. Use it when the defect is missing or incorrect knowledge that should persist for this agent. Do not use memory to encode controller leases, evaluation scores, promotion authority, hidden tests, credentials, or mutable operational state.

A **skill change** updates a reusable procedure packaged for discovery and execution. Use it when the improvement is a repeatable method with clear activation conditions, inputs, steps, and outputs. A skill can influence tool use, so evaluate both task quality and permission/effect consequences. Installing or committing a skill does not prove that agents will select or execute it correctly.

A **procedure change** updates application-owned workflow outside agent memory: handoff schema, checklist, queue policy, dossier format, or human review step. It may not require changing the agent at all. Prefer procedure when deterministic structure can prevent the failure more reliably than another prompt instruction.

A **model or configuration change** alters model selection, reasoning settings, toolset, permissions, context limits, system behavior, or conversation-scoped configuration. These changes may affect many tasks and costs at once. Availability and accepted options remain provider, account, backend, topology, and exact-version scoped. Static exports do not prove that a target accepts a configuration.

A **controller-policy change** alters leases, budgets, allowed effects, approval ownership, retry rules, fan-out limits, validation gates, promotion, or rollback. This is the highest-authority class in this taxonomy. It must remain outside model-editable memory and requires explicit supervisor ownership. An agent may draft such a patch but cannot authorize or activate it.

Some proposals span surfaces. Split them where possible. If a memory edit and controller retry change are bundled, evaluation cannot reveal which caused a result and rollback becomes ambiguous. Give each candidate a canonical identity, dependency list, and prior-state target.

## Reflection, dreaming, and commits

Reflection is a reasoning activity that reviews experience and proposes lessons. Dreaming is described in current documentation as background reflection that can review conversations and update memory. Either may produce observations, hypotheses, or candidate edits. Because the subject agent’s own history and interpretation drive the process, neither is an independent evaluator of the resulting change.

A memory update produced by reflection may be **persisted candidate state**. The controller should capture its diff, provenance, triggering conversations, author identity, timestamp, and parent version. It should not silently become the promoted baseline merely because synchronization or a commit succeeded. If a configured workflow applies such updates immediately, the supervision policy must classify that as an active mutation with rollback and evaluation obligations, not as proof of benefit.

A commit adds valuable identity: exact content, parentage, author metadata, and a comparison target. It supports reproducibility and rollback planning. It does not establish factual accuracy, absence of secrets, safety, evaluation independence, runtime behavior, or production readiness. Signed or reviewed persistence is still distinct from measured improvement.

## Authority separation

At minimum, record five roles. The **subject** is the agent or system being improved. The **observer** assembles bounded evidence. The **proposer** creates the candidate and causal hypothesis. The **evaluator** applies the frozen rubric without modifying the candidate or cases. The **promoter** authorizes activation for a target. A **supervisor** may own quarantine, monitoring, rollback, and incident decisions.

Role conflicts must be disclosed, and the evaluator must remain distinct from the subject attempt for claim-bearing assessment. The proposing agent cannot be the sole evaluator or promoter. Evaluation output is advisory until the promotion gate checks provenance, mandatory results, risk, rollback readiness, and authority.

Give them candidate identity, baseline, frozen cases, rubric, allowed tools, environment, and output schema. Record any assistance or prior exposure. If evaluator exposure compromises independence, quarantine the result rather than averaging it with clean evidence.

## Frozen evidence and evaluation workflow

First, open an observation record before editing the system. Preserve the failed or improvable work artifact, expected outcome, actual outcome, exact versions, topology, tool and model context, costs, and uncertainty. Determine whether the issue belongs to the agent, controller, environment, evaluator, or source data. Do not force every failure into memory.

Second, capture the baseline. Identify active memory or repository commit, skill versions, procedure version, model and configuration, controller-policy version, and relevant external state. Preserve a rollback target before creating the candidate. If the baseline cannot be reconstructed, narrow the claim or quarantine the proposal.

Third, freeze evaluation cases and rubric before candidate execution. Include representative success cases, the observed failure, nearby variants, regression cases, safety constraints, resource budgets, and mandatory machine gates. Hash or version the cases. Separate hidden evaluation material from model-editable memory. State what counts as pass, fail, abstention, and invalid result.

Fourth, create one reversible candidate. Record the diff, proposal hypothesis, affected surface, dependencies, migration, risk, and predicted measurements. Scan for secret exposure and unexpected scope. A candidate that changes cases, rubric, evaluator prompt, and target behavior together is not independently measurable.

Fifth, execute baseline and candidate evaluations under matched declared conditions when separate authority later permits execution. Preserve raw outputs and correlate every score to case, candidate, evaluator, and environment. Do not treat compilation, commit success, or a model’s self-critique as a passing evaluation. Stop on evaluator contamination, version drift, missing cases, budget exhaustion, or uncertain external effects.

Sixth, compare against the complete gate. Require mandatory safety and correctness constraints, then consider quality, latency, and cost. Report regressions, not just averages. A candidate that improves common cases while violating one critical prohibition fails.

Seventh, issue a decision: reject, quarantine, approve for a narrower evaluation, or recommend promotion. Promotion remains separate and names target scope, approver, effective candidate, canary limits, monitoring indicators, and rollback triggers. No result is promoted by the evaluator merely returning “pass.”

Finally, monitor any authorized promotion and retain the decision record. On a trigger, freeze expansion, revoke affected authority, roll back to the recorded target when safe, reconcile external effects, and document residual harm. Feed the incident back as a new observation rather than rewriting prior evaluation history.

## Original trace: source-citation memory candidate

This original project-method trace follows a bounded improvement from observation to decision. It is not a live Letta execution record. A research agent completed a release comparison but omitted mandatory source identifiers on case `R7`. The first question is not “what should the agent remember?” but “what evidence identifies the failure and which surface should change?”

**State 0 — observation.** The controller opens observation `OBS-17` and preserves the original input, expected schema, actual answer, agent and conversation identities, package tuple, model and configuration record, tool availability, and evaluator notes. The omission is real on this case, but its cause is unknown. The controller does not let the subject agent rewrite the transcript or summarize away the missing identifiers.

**State 1 — diagnosis and scope.** Inspection shows that the existing memory states a general evidence policy but lacks a concise instruction to include registered source IDs in claim-bearing release comparisons. The procedure and controller already require validation, and tools operated correctly. The proposer recommends a narrow memory candidate rather than a model switch, skill rewrite, or weaker acceptance gate. Candidate `MEM-C17` adds one focused rule and changes no controller policy.

**State 2 — baseline freeze.** Before editing, the controller records baseline memory commit `M40`, active skill versions, procedure `P6`, model/configuration fingerprint `LC3`, and controller policy `CP8`. Evaluation cases `R1` through `R10` are selected and hashed. They include `R7`, nearby comparison tasks, non-release questions where source IDs are unnecessary, and safety cases that reject invented identifiers. The rubric requires schema compliance, factual support, no fabricated IDs, no irrelevant citation clutter, and bounded cost.

**State 3 — candidate persistence.** The proposed memory patch is committed as `M41-candidate` with parent `M40`, diff, author, causal hypothesis, and rollback target. Commit success proves only that exact candidate content was persisted. The subject agent’s explanation that the rule “will definitely solve citations” is proposal rhetoric, not evaluation evidence. `M41-candidate` remains isolated from the active baseline.

**State 4 — independent evaluation.** An evaluator distinct from the subject attempt receives frozen cases, baseline and candidate identities, rubric, matched environment requirements, and an output schema. It does not receive permission to edit memory, cases, or thresholds. Baseline `M40` and candidate `M41-candidate` are compared under model/configuration `LC3`. Every result is correlated to case, candidate, evaluator, and environment. A successful turn means only that the turn reached its terminal success state; each answer still receives rubric judgments.

The candidate fixes `R7` and two related cases. It also adds source IDs to one conversational brainstorming case where they were not required, increasing clutter but not violating a mandatory constraint. One safety case correctly abstains rather than inventing an ID. The evaluator reports the complete matrix, regression, and uncertainty. It recommends a limited candidate revision instead of declaring global improvement.

**State 5 — revised proposal.** The proposer creates `M42-candidate`, narrowing the rule to claim-bearing factual reports with registered evidence. Because content changed after results were seen, `M42` receives a new identity. The cases and rubric remain frozen. A clean evaluator runs the complete suite again; the controller does not score only previously weak cases. All mandatory gates pass, cost remains within budget, and the prior clutter regression disappears.

**State 6 — promotion decision.** Evaluation success does not activate `M42`. The promoter reviews provenance, evaluator independence, secret scan, full results, target scope, rollback readiness, and monitoring plan. It authorizes a limited canary for one research agent and preserves `M40` as the rollback target. The promotion record names candidate `M42`, approver, effective scope, start time, stop conditions, and indicators for missing, fabricated, or excessive citations.

**State 7 — monitoring and rollback.** During monitoring, ordinary release comparisons improve, but a novel incident report receives a fabricated source identifier. The controller freezes expansion, quarantines affected outputs, and determines whether the candidate contributed. Because a critical prohibition fired, average quality does not save the canary. The supervisor rolls memory back to `M40`, verifies the active identity, records residual outputs requiring review, and opens a new observation. Prior evaluation history remains immutable; it was valid for its frozen cases but did not prove universal safety.

The trace demonstrates that observation, persistence, evaluation, promotion, monitoring, and rollback are separate transitions. No model statement, successful turn, commit, or aggregate score may skip them.

## Failure modes and bounded recovery decisions

**Self-judging candidate.** The subject proposes a patch, reruns its favorite example, and declares itself improved. The judgment shares the failure’s perspective and may optimize its own explanation. Recover by preserving the proposal, appointing a declared evaluator distinct from the subject attempt, supplying frozen cases and rubric, and treating self-critique only as diagnostic input. If independent evaluation is unavailable, retain candidate status without an improvement claim.

**Mutable evaluation cases.** A proposer edits prompts, expected answers, or thresholds after seeing candidate failures. The comparison no longer tests the same target. Quarantine affected results, restore the hashed case set, record the contamination, and rerun baseline and candidate under matched conditions. If restoration is impossible, design a new evaluation version and make no comparison to the invalid run.

**Contaminated baseline.** The active memory changed before baseline capture, or the baseline agent saw hidden answers later used for evaluation. The measured difference cannot be attributed safely. Recover by reconstructing an exact prior identity from controlled history when possible. Otherwise narrow the claim, create uncontaminated novel cases, or quarantine the proposal. Never label the current state “baseline” merely because it is available.

**Wrong change scope.** A tool outage causes a failed task, but the proposer adds memory; or a memory gap prompts a broad controller-policy relaxation. Recover by reclassifying the causal layer: data, environment, memory, skill, procedure, model/configuration, or controller. Split bundled candidates and select the least authoritative surface that addresses the evidence. Reject changes that improve a symptom by weakening acceptance or effect controls.

**Commit or turn success treated as proof.** A commit confirms persistence and a successful turn confirms a runtime terminal state. Neither proves factual quality, regressions, safety, or transfer. Recover by returning the object to persisted-candidate or unevaluated-result status, then apply the frozen rubric across baseline, target, regression, and safety cases.

**Absent rollback.** Promotion is proposed without a known prior version, migration reversal, effect plan, or verification step. Block promotion. Capture the current baseline, determine whether the candidate has irreversible effects, create a rollback rehearsal or compensation plan, and name stop conditions. If safe reversal cannot be designed, reduce scope or reject the candidate.

**Silent promotion.** A reflection workflow, memory synchronization, configuration edit, or merged skill makes candidate content active without a promotion record. Freeze further spread, identify affected agents and conversations, preserve the actual active version, and compare it with the authorized baseline. Treat outputs produced meanwhile as possibly affected. Restore the baseline when safe, then require a new explicit decision rather than retroactively calling the mutation approved.

**Regression discovered during monitoring.** Do not rewrite the evaluation report to pretend the case was known. Stop expansion, apply the declared trigger, quarantine affected artifacts, roll back or disable authority, and reconcile external effects. Open a new observation linking monitoring evidence to the promoted candidate. Evaluation established bounded evidence, not timeless correctness.

**Model or configuration confounder.** Baseline and candidate use different models, reasoning settings, tools, permissions, context limits, or providers. A score difference cannot be attributed to the intended patch. Quarantine the comparison and rerun under matched declared conditions. If the model/configuration change is itself the candidate, identify it explicitly and hold memory, skills, procedure, and controller policy constant.

**Evaluator conflict.** The evaluator authored the candidate, designed cases around known outputs, saw hidden answers, or holds promotion authority with an undisclosed incentive. Record the conflict and quarantine its claim-bearing verdict. Obtain a clean evaluator or narrow the result to non-independent formative feedback. Multiple conflicted scores do not become independent through averaging.

Every recovery is bounded by provenance, authority, budget, and effect state. When uncertainty cannot be resolved, rejection or quarantine is safer than promotion. These decisions are project governance, not Letta runtime guarantees.

## Improvement Evaluation dossier

The concrete artifact for this module is an **Improvement Evaluation dossier**. A learner may design it now and populate it later only under separate execution authority. It is controller-owned decision evidence, not model-editable memory, a reflection journal, or a replacement for raw evaluation artifacts. Its purpose is to let a reviewer reconstruct why a change was proposed, whether the comparison was valid, who held each authority, and what can be rolled back.

Begin with the observation record: observation ID, originating work unit, expected and actual outcomes, agent and conversation identities, exact versions, topology, active model and configuration, tools, permissions, costs, timestamps, source artifacts, and evidence limitations. Separate direct observations from causal hypotheses. Preserve the original failure rather than relying on a proposer’s summary.

The baseline manifest identifies memory or repository commit, skill revisions, application procedure, model and conversation configuration, controller-policy version, external dependencies, and any mutable data. It records how each identity was captured and whether reconstruction is complete. If baseline provenance is incomplete, the dossier states the resulting claim limit or quarantine decision.

The candidate manifest contains candidate ID, parent baseline, exact diff or controlled artifact reference, change-surface classification, author, creation time, causal hypothesis, expected benefit, risks, dependencies, migration, secret review, and rollback target. Bundled changes are listed explicitly. A persisted commit is recorded as candidate identity, never as a passing score.

The evaluation contract lists frozen case-set version and hashes, rubric version, mandatory gates, quality metrics, safety constraints, resource budgets, pass/fail/abstention rules, allowed assistance, hidden-material handling, matched-environment requirements, and stop conditions. Cases should cover the observed failure, nearby transfer, existing successes, regressions, and critical prohibitions. Preserve the contract before candidate execution.

The authority matrix names subject, observer, proposer, evaluator, promoter, monitor, rollback owner, and supervisor. Record role overlaps, organizational or technical independence, prior case exposure, candidate authorship, and conflicts. The evaluator attests that it did not modify candidate, cases, thresholds, or baseline during scoring. A conflicted evaluator’s output is labeled formative or quarantined rather than quietly treated as independent.

The result ledger correlates every baseline and candidate output with case, artifact identity, evaluator, environment fingerprint, terminal status, rubric judgments, cost, latency if legitimately measured, and raw-evidence location. Include all regressions and invalid runs, not only favorable scores. The decision section records reject, quarantine, revise, recommend promotion, or approve limited promotion, with reasons tied to the frozen gate.

A promotion record, when separately authorized, names active candidate, approver, target agents or environments, blast radius, activation time, canary limits, monitoring indicators, thresholds, stop conditions, and rollback procedure. Monitoring rows preserve observations without rewriting the prior evaluation. A rollback record identifies trigger, authority, restored version, verification, external-effect reconciliation, affected outputs, incident link, and residual uncertainty.

Conclude with four verdicts: what was observed, what was measured, what was authorized, and what remains unknown. This structure prevents a compelling narrative from collapsing proposal, evaluation, promotion, and production qualification into one claim. Add a decision chronology listing every state transition, actor, timestamp, evidence reference, and superseded candidate. It must show that cases were frozen before execution and that promotion occurred after evaluation. Include transfer notes for the supervisor: where active artifacts reside, which monitor owns each indicator, when the next review is due, and which unresolved uncertainty would force quarantine. This summary must point to controlled evidence rather than copying sensitive cases or model reasoning into the dossier. A reviewer should be able to reproduce the decision path without receiving authority to repeat the evaluation or activate the candidate.

## Formative transfer questions

1. An agent edits its memory after reflecting on one failed conversation and immediately succeeds when asked the same question. Classify the edit, second turn, and strongest justified improvement claim.

2. A candidate skill passes eight cases, but its author removed two difficult cases after seeing failures. Which evidence is invalid, what must be quarantined, and how can a clean comparison be restored?

3. The baseline memory commit is known, but its model and permission mode were not recorded. Can a candidate result be attributed to memory? State how to narrow or redesign the evaluation.

4. A timeout caused by an unavailable external service leads to a proposal for more persistent agent memory. Identify the scope error and list evidence needed before selecting the true change surface.

5. A candidate commit was created successfully and static checks pass. Distinguish persistence, structural validity, behavioral evaluation, promotion, runtime observation, and production qualification.

6. The evaluator is independent of the subject agent but helped write the candidate. What conflict exists, how should its output be labeled, and what additional evaluator would support a claim-bearing decision?

7. A candidate changes memory and switches models simultaneously. It scores higher. Design a sequence that identifies which change caused the difference and preserves rollback clarity.

8. A reflection process silently synchronizes an edit into active memory before the evaluation. What should be frozen, inventoried, restored, and quarantined?

9. A controller-policy candidate raises retry limits and improves completion rate while doubling uncertain external effects. Which gates should dominate the average improvement and who may authorize any narrower experiment?

10. A promoted candidate regresses only on a novel case absent from the frozen suite. Does that invalidate the historical evaluation? Explain monitoring, rollback, incident evidence, and the next observation.

11. The candidate has no reversible migration for prior memory content. What conditions block promotion, and when might compensation or limited scope be acceptable instead of rollback?

12. A proposer sees hidden evaluation answers through a shared repository. Explain contamination risk for candidate and evaluator and propose an uncontaminated transfer test.

13. A model self-critique accurately predicts all evaluator findings. Why does that remain proposal or diagnostic evidence rather than independent judgment?

14. An evaluation passes offline, and a promoter wants immediate global activation. Name the missing target, authority, canary, monitoring, rollback, and production evidence.

15. Design the smallest dossier needed for a punctuation-only skill clarification. Which controls remain mandatory despite low risk, and which promotion scope could be proportionate?

Strong answers preserve object identity, classify the change surface, separate roles, freeze evidence before execution, and state the remaining non-claim.

## Source evidence and project-method boundaries

`SRC-DOCS-MEMFS-20260911` and `SRC-DOCS-MEMORY-20260911` are documented-current evidence for the recorded cutoff. They support the product-level descriptions of MemFS as git-backed agent memory and dreaming as background reflection that reviews conversations and can update memory. They do not say that every reflection is correct, that a memory update improves measured behavior, or that persistence authorizes promotion.

`SRC-SDK-NPM-0.8.9` and `SRC-SDK-SOURCE-0.8.9` identify the exact Agent SDK package and immutable source used by Revision 0.4. `SRC-CODE-NPM-0.32.11` and `SRC-CODE-SOURCE-0.32.11` identify the declared and standalone Letta Code artifact lanes. Exact artifacts can establish exported configuration shapes and static implementation paths. They do not establish target account acceptance, model availability, live memory synchronization, evaluator independence, or successful rollback.

`DISC-MEMORY-TRANSITION-001` limits greenfield memory claims because compatibility memory options remain present while project guidance prefers MemFS and focused files. Export presence does not make every option an equal improvement target. `DISC-SKILL-PARTIAL-SUCCESS-001` warns that agent creation and later skill support-file transfer need not form one atomic success. `DISC-REPOSITORY-PARTIAL-SUCCESS-001` likewise prevents relationship mutation and recompilation from being treated as one transaction. Candidate manifests and rollback plans must preserve those partial-success boundaries.

`SRC-DESIGN-SYNTHESIS` and `SRC-PRODUCTION-HEURISTIC` support the Master Builder method: separate work, improvement, and supervision loops; keep controller authority outside model-editable memory; freeze cases; use an independent evaluator; promote only through declared gates; and retain rollback decisions. Observation, candidate, proposal, evaluation, rejection, quarantine, promotion, monitoring, and rollback are project lifecycle states, not Letta API resources or endpoints.

The module does not claim that the exact SDK provides an evaluation harness, hidden-case store, promotion service, canary controller, contamination detector, or rollback transaction. Implementations must build or select those controls under separate authority and evidence. Frozen artifacts let later reviewers reproduce decisions without trusting anyone's memory.

Reviewability is itself a control: it exposes hidden confounders, preserves dissent, and prevents a polished narrative from replacing measured evidence.

## Explicit non-claims

Reflection, dreaming, self-critique, conversation review, memory edits, skill edits, repository commits, compilation, tests, successful turns, and fluent explanations do not independently prove improvement. A proposing agent is not assumed to diagnose itself correctly, choose the right scope, evaluate without bias, or hold promotion authority. A commit proves persistence and identity only within its repository evidence.

This module performed no model turn, reflection, dreaming run, memory synchronization, skill resolution, repository mutation, configuration update, baseline execution, candidate execution, evaluator run, canary, monitor, promotion, quarantine action, or rollback. It makes no live claim about ordering, durability, synchronization, selection, compaction, evaluation reproducibility, model determinism, effect reversal, or runtime recovery.

It makes no account or availability claim. No provider entitlement, model catalog, organization, agent, Cloud environment, computer, sandbox, billing state, quota, credential, or hosted runtime version was inspected. Exact package evidence does not prove that a backend accepts a model or configuration option.

Passing an evaluation does not establish universal generalization, safety, security, privacy, compliance, reliability, deployment fitness, or production readiness. Monitoring one scope does not qualify another. Curriculum completion, a complete dossier, or a successful canary cannot substitute for implementation-specific production qualification covering credentials, tenancy, incidents, observability, capacity, cost, backups, recovery, and rollback.

Reading this module grants no authority to inspect private conversations, expose hidden cases, install dependencies, mutate memory, create commits, invoke agents or models, change configurations, run evaluators, spend funds, promote candidates, or touch production.

## Handoff to MOD-11

MOD-11, **Supervision, Security, and Observability**, receives the improvement dossier, active-version manifest, authority matrix, monitoring indicators, rollback triggers, quarantined artifacts, and unresolved uncertainty. It asks how supervisors observe bounded agents and controllers over time, protect credentials and tenant boundaries, preserve audit trails, detect incidents, and intervene without relying on model self-report.

Carry forward the distinction between evidence and authority. An evaluator’s pass is evidence for a scoped decision, not permission to deploy. A promoter’s decision authorizes a target, not universal safety. A monitor’s alert is an observation, not automatic diagnosis. A rollback restores a chosen state, not all external consequences. MOD-11 turns these distinctions into supervision and incident controls while preserving the explicit boundary between curriculum competence and production qualification.
