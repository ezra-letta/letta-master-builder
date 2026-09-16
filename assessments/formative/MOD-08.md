# MOD-08 Bounded Work Loops and Triggers

This read-only self-check awards no status and is not assessment or runtime evidence.

This read-only reflection checks whether you can reason about bounded autonomous work without performing it. Consider a scheduled work unit whose duplicate occurrence arrives after restart, while a prior delivery remains uncertain and the selected computer is offline. Describe the controller’s next safe decision using the module’s intake → plan → lease → act → observe → reconcile → checkpoint progression. Identify durable identities, authority, budgets, route and conversation bindings, fallback policy, and the evidence needed before retry, pause, escalation, or completion.

## Must-pass invariants

1. Treat every trigger as an intake proposal, never as authority; the project controller owns immutable intent, lease, budgets, effect scope, checkpoints, and terminal disposition.
2. Distinguish queue acceptance, assistant text, runtime status, external effect, acceptance, and delivery; reconcile uncertain effects by stable identity before any retry.
3. Recover from durable checkpoint and authoritative observations, enforce fencing, deadlines, and remaining budgets, and pause or escalate when bindings or evidence remain ambiguous.

## Strong vs. weak response

**Strong:** Correlates schedule identity and intended occurrence, checks the idempotency key, acquires a new fenced lease only after expiry, preserves the exact agent/conversation/route, applies the recorded computer fallback rule, inspects delivery by stable request identity, and checkpoints unresolved facts before pausing or escalating.

**Weak:** “Restart the agent on any available computer, resend the reply, and mark done when text appears.”

## Misconception indicators

- A heartbeat proves correctness or completion.
- A timeout proves no effect occurred.
- Agent memory may refill budgets or select a new route.
- Transcript position is a restart checkpoint.

## Self-check

**Continue** if all three invariants appear explicitly and your answer stops on uncertainty. **Revisit** if you infer authority from delivery, retry an uncertain effect, or omit durable identity and fencing.

## Dossier fields

`mission.statement`; `mission.acceptance_criteria`; `autonomy_envelope.allowed_decisions`; `autonomy_envelope.forbidden_effects`; `autonomy_envelope.budgets`; `autonomy_envelope.pause_stop_escalation`; `object_ownership.records`; `topology.execution_host`; `topology.controller_host`; `controls.records`; `observability.evidence_records`; `failure_recovery.reconciliation_rules`; `claims.static`; `claims.runtime`; `claims.production`; `open_questions`; `attestations`; `non_claims`.
