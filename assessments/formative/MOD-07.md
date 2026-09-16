# MOD-07 Tools MCP Permissions and Effects

## Formative purpose

This read-only self-check awards no status and is not assessment or runtime evidence.

Explain how technical reachability, model permission, business authorization, execution locality, and authoritative effect evidence remain separate without invoking a tool.

## Must-pass invariants

1. Tool eligibility is the intersection of registration, toolset, allowlist, session policy, and controller policy, using stable identity and validated arguments.
2. Durable intent and a correlation key precede dispatch; the postcondition is verified through the effect owner, not result prose, approval, preview, or abort acknowledgment.
3. Timeout or disconnect after possible submission becomes `outcome-uncertain`; the response forbids blind resend, reconciles by canonical identity or stable key, and treats compensation as a separately authorized and reconciled effect.

## Strong vs. weak response

**Prompt:** A client callback timed out after sending invoice request key `INV-42`. What happens next?

**Strong:** Preserve authorized arguments, tenant, lease, dispatch stage, and uncertainty. Do not resend. Query the invoice authority by `INV-42`; accept one canonical record only after tenant, recipient, amount, and status checks. Stop on no verifiable match, multiple matches, stale authority, or lease loss. Any reversal requires its own authority record.

**Weak:** The callback failed, so retry; approval already proves the payment was allowed.

## Misconception indicators

- Treats tool visibility or harness approval as business authorization.
- Assumes client, runtime, server, Node, and portable locality are equivalent.
- Places credential values in model-visible context, memory, diagnostics, or the dossier.
- Claims session close terminates remote MCP services or restores in-flight ownership after reconnect.

## Self-check

**Continue** only if reachability, authority, dispatch, result, and external state have separate records. **Revisit** if any timeout becomes failure, success, rollback, or automatic retry.

## Dossier alignment

Use only these existing fields/subfields: `id`; `status`; `execution_authorized`; `release_scope.curriculum_release`, `release_scope.package_tuple`, `release_scope.evidence_cutoff`; `mission.statement`, `mission.acceptance_criteria`, `mission.prohibited_outcomes`; `autonomy_envelope.allowed_decisions`, `autonomy_envelope.forbidden_effects`, `autonomy_envelope.budgets`, `autonomy_envelope.pause_stop_escalation`; `object_ownership.records`; `topology.execution_host`, `topology.controller_host`, `topology.selected_surface`; `controls.records`; `observability.evidence_records`; `failure_recovery.tests`, `failure_recovery.reconciliation_rules`, `failure_recovery.rollback_rules`; `security_tenancy.credential_owners`, `security_tenancy.trust_boundaries`, `security_tenancy.tenant_isolation`; `claims.static`, `claims.runtime`, `claims.production`; `open_questions`; `attestations`; `non_claims`. Leave claim lists empty.
