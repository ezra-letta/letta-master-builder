# MOD-05 Conversations Sessions Turns and Recovery

## Formative purpose

This read-only self-check awards no status and is not assessment or runtime evidence.

Explain how a controller separates persistent identity, connection lifetime, turn state, stream observations, transcript projection, and application acceptance.

## Must-pass invariants

1. The response distinguishes agent, conversation, session, turn, run, message, and stream event, and never stores `default` as a backend-issued concrete conversation ID.
2. The response requires readiness before submission and a trustworthy terminal result before runtime classification; application completion additionally requires frozen acceptance criteria.
3. After timeout, disconnect, or a missing terminal record, the response freezes resend, reconciles the original attempt by stable identities and bounded history/status evidence, and permits `unknown` as an outcome.

## Strong vs. weak response

**Prompt:** A UI displayed a complete assistant paragraph, then the stream closed without a terminal result. What may be reported?

**Strong:** The paragraph is provisional stream evidence, not completion. Preserve request, agent, resolved conversation, run/message identities, content hashes, page bounds, and the missing terminal condition. Mark the attempt uncertain, recover supported status or history, deduplicate by strongest identity, and validate any recovered terminal result against application criteria before reporting completion.

**Weak:** The answer looked complete, so mark success; reconnect and resend if the user complains.

## Misconception indicators

- Equates session close with turn cancellation, sandbox destruction, conversation deletion, or agent deletion.
- Treats enqueue acceptance or queued input as consumed or complete.
- Blindly appends replayed deltas or orders records by client receipt time.
- Automatically approves a recovered request under the prior process’s policy.

## Self-check

**Continue** only if every lifecycle layer has a distinct evidentiary gate. **Revisit** if transport loss becomes automatic failure or retry.

## Dossier alignment

Use only these existing fields/subfields: `id`; `status`; `execution_authorized`; `release_scope.curriculum_release`, `release_scope.package_tuple`, `release_scope.evidence_cutoff`; `mission.statement`, `mission.stakeholders`, `mission.acceptance_criteria`, `mission.prohibited_outcomes`; `autonomy_envelope.allowed_decisions`, `autonomy_envelope.forbidden_effects`, `autonomy_envelope.budgets`, `autonomy_envelope.pause_stop_escalation`; `object_ownership.records`; `topology.state_host`, `topology.execution_host`, `topology.controller_host`, `topology.selected_surface`, `topology.alternatives_rejected`; `observability.evidence_records`; `failure_recovery.tests`, `failure_recovery.reconciliation_rules`, `failure_recovery.rollback_rules`; `claims.static`, `claims.runtime`, `claims.production`; `open_questions`; `non_claims`. Keep runtime and production claims empty.
