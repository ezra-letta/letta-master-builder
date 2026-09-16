# MOD-11 Supervision Security and Observability

## Formative check

This read-only self-check awards no status and is not assessment or runtime evidence.

Explain how a controller should supervise a bounded autonomous worker when a listener remains healthy, progress is stale, and one external effect is unresolved. Your response should identify the authority owner, separate health, progress, and effect evidence, and choose an intervention whose confirmation is independently observable. Then sketch the relevant dossier entries using these exact existing fields/subfields:

- `autonomy_envelope.allowed_decisions`, `autonomy_envelope.forbidden_effects`, `autonomy_envelope.budgets`, `autonomy_envelope.pause_stop_escalation`
- `observability.evidence_records`
- `security_tenancy.credential_owners`, `security_tenancy.trust_boundaries`, `security_tenancy.tenant_isolation`
- `claims.static`, `claims.runtime`, `claims.production`
- `open_questions`, `attestations`, `non_claims`

## Must-pass invariants

1. Controller-owned authority, leases, budgets, tenant scope, and incident closure cannot be enlarged or self-approved by the worker.
2. Health, work progress, tool evidence, and authoritative external-effect evidence remain separate; uncertainty never permits blind resend.
3. Pause, abort, kill, credential revocation, and network isolation are distinguished by target, authority, expected evidence, and reconciliation.

## Strong vs. weak response

**Strong:** “Keep process health healthy but mark progress stale and the effect uncertain. Stop new authority, preserve correlations, reconcile against the destination’s canonical identity, and escalate to the named human owner if ambiguity persists.”

**Weak:** “The server is healthy, so retry the action; if it hangs, kill everything.”

## Misconception indicators

Watch for TLS treated as user authorization, permission mode treated as tenant entitlement, model memory treated as an enforcement boundary, tool success treated as business completion, or deletion proposed without canonical identity and authority.

## Self-check

**Continue** if all three invariants are explicit and each decision names its owner and evidence. **Revisit** if any status is inferred from assistant prose, stale observation, transport loss, or infrastructure vocabulary.
