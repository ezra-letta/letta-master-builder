# MOD-09 Multi-Agent Orchestration

This read-only self-check awards no status and is not assessment or runtime evidence.

This formative, read-only reflection checks whether you can justify an agent boundary without launching workers. A principal must analyze three versioned artifacts; two analyses are independent and read-only, while the third would modify one shared repository file. Explain whether to retain one agent or use a fresh task subagent, forked conversation, persistent agent, direct message, controller-mediated delegation, or client-side orchestration. Specify inheritance, typed identities, leases, resource scopes, fan-out, join, validation, cancellation, late-result handling, and return to serial work.

## Must-pass invariants

1. Apply the one-agent default unless the output is independently specifiable, inputs are frozen, resources are conflict-free, validation is bounded, and abandonment is safe.
2. Record identity, memory, history, prompt, model, skills, tools, permissions, files, working directory, backend, computer, credentials, and descendant authority explicitly; never substitute “inherits everything.”
3. Keep controller authority over leases, budgets, effects, join, validation, and closure; receipts or polished child output do not establish acceptance.

## Strong vs. weak response

**Strong:** Uses read-only branches only where artifacts and resource sets are independent, keeps the shared-file change serial or isolated under one authorized merger, stores task, subagent, agent, conversation, run, message, and receipt identities by type, freezes acceptance criteria, validates attributed outputs, and treats cancellation request, lease expiry, terminal confirmation, and effect reconciliation as separate facts.

**Weak:** “Fork three agents with full access, merge the majority answer, and assume timed-out children stopped.”

## Misconception indicators

- A conversation fork guarantees filesystem isolation.
- `queued` means completed or replied.
- More workers inherently improve quality.
- Stopping a wait proves cancellation.

## Self-check

**Continue** if all three invariants are explicit and shared writes have one controlled owner. **Revisit** if worker form is chosen by convenience, IDs are untyped, or join means voting.

## Dossier fields

`mission.statement`; `mission.acceptance_criteria`; `mission.prohibited_outcomes`; `autonomy_envelope.budgets`; `autonomy_envelope.pause_stop_escalation`; `object_ownership.records`; `topology.state_host`; `topology.execution_host`; `topology.controller_host`; `topology.selected_surface`; `topology.alternatives_rejected`; `controls.records`; `observability.evidence_records`; `failure_recovery.reconciliation_rules`; `claims.static`; `claims.runtime`; `claims.production`; `open_questions`; `attestations`; `non_claims`.
