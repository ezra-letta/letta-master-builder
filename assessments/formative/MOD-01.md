# MOD-01 Mission Autonomy and Acceptance

## Read-only formative check
Use this reflection to inspect design reasoning only. It awards nothing, authorizes nothing, and makes no assessment or runtime claim.

## Must-pass invariants
1. Define a stable, stakeholder-owned mission with observable acceptance criteria, authoritative evidence sources, and prohibited outcomes; never substitute a prompt, plan, polished output, or assistant confidence for acceptance.
2. Keep autonomy inside an explicit envelope: the agent may adapt plans only within allowed decisions, while authority, approvals, budgets, leases, acceptance, promotion, and audit truth remain externally owned.
3. Stop, pause, escalate, or enter uncertain state on lost authority, exhausted mandatory limits, absent approval, passed deadline, ambiguous target, prohibited data, or unresolved consequential effect; remaining budget never overrides these conditions.

## Worked response: strong versus weak
**Prompt:** A publication request times out, but retries remain. What should the specification require?

**Strong:** “Classify the publication effect as uncertain, block new publication attempts, preserve the original correlation identity, and have the named controller or effect owner reconcile the canonical external record. Resume only after authoritative state establishes whether compensation, completion, or a separately approved attempt is appropriate.”

**Weak:** “Retry twice because the failure budget allows it.”

The strong response separates timeout from cancellation and budget from permission. The weak response risks duplicate external effects.

## Misconception indicators
- Writing “be helpful” or “make support excellent” as a testable mission.
- Letting the model refill budgets or broaden scope.
- Treating queue intake, draft creation, approval, publication, and stakeholder outcome as one status.
- Modeling credential disclosure as an ordinary tolerated failure.

## Continue or revisit
**Continue** if you can name acceptance and authority owners and distinguish stop, pause, escalation, and uncertainty. **Revisit** if your specification lacks prohibited outcomes, evidence sources, or a safe holding state.

## Dossier/template fields to inspect
`id`; `status`; `execution_authorized`; `mission.statement`; `mission.stakeholders`; `mission.acceptance_criteria`; `mission.prohibited_outcomes`; `autonomy_envelope.allowed_decisions`; `autonomy_envelope.forbidden_effects`; `autonomy_envelope.budgets`; `autonomy_envelope.pause_stop_escalation`; `open_questions`; `attestations`; `non_claims`.
