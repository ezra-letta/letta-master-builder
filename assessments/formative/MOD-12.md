# MOD-12 Deployment Reliability and Upgrades

## Formative check

This read-only self-check awards no status and is not assessment or runtime evidence.

Design a deployment decision for a persistent agent workload that may use a Local SDK-owned runtime or a separately operated App Server. Explain startup ownership, readiness, long-lived controller placement, graceful drain, state and file ownership, backup restoration, immutable version coupling, migration omissions, and coherent rollback. Populate only these exact existing dossier fields/subfields:

- `release_scope.curriculum_release`, `release_scope.package_tuple`, `release_scope.evidence_cutoff`
- `topology.state_host`, `topology.execution_host`, `topology.controller_host`, `topology.selected_surface`, `topology.alternatives_rejected`
- `deployment.process_owners`, `deployment.backups`, `deployment.upgrade_and_rollback`
- `failure_recovery.tests`, `failure_recovery.reconciliation_rules`, `failure_recovery.rollback_rules`
- `claims.static`, `claims.runtime`, `claims.production`
- `open_questions`, `attestations`, `non_claims`

## Must-pass invariants

1. Exactly one runtime startup model is selected—SDK-owned or external—and controller, runtime, state, computer, and process-supervisor lifetimes retain named owners.
2. Backup confidence requires an isolated restore design covering controller records, agent/conversation state, files, credentials, leases, and historical effects; archive creation alone is insufficient.
3. Upgrade and rollback operate on a coherent immutable release unit, with every queue, approval, route, schedule, file, lease, and effect identity assigned an explicit migration disposition.

## Strong vs. weak response

**Strong:** “Choose external runtime ownership because operations require independent lifecycle supervision. Gate admission on controller-store access, exact version pairing, authenticated runtime connectivity, and authorized computer identity; drain before replacement and retain a rollback-compatible release and state plan.”

**Weak:** “Deploy latest to the cloud, check that the process is up, and downgrade the SDK if anything breaks.”

## Misconception indicators

Look for “managed” used as durability evidence, PID liveness equated with readiness, serverless requests owning indefinite sessions, file sync called a backup, secrets copied during migration, or package downgrade assumed to reverse state and external effects.

## Self-check

**Continue** if each lifetime, state store, gate, omission, and reversal has an owner and bounded disposition. **Revisit** if topology labels substitute for exact identities, restore reasoning, or shutdown reconciliation.
