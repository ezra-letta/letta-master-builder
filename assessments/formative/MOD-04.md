# MOD-04 Agent Provisioning and Management

## Formative purpose

This read-only self-check awards no status and is not assessment or runtime evidence.

Explain, without performing operations, how a controller provisions and governs one persistent agent while preserving canonical identity, partial-success state, and destructive-action boundaries.

## Must-pass invariants

1. The response treats the string returned by `client.createAgent()` as the canonical agent ID and never substitutes a name, tag, or list position.
2. The response distinguishes `created-unrecorded` from `reconciled-unrecorded`, reconciles before retrying, and never claims tags make creation idempotent.
3. The response requires canonical-ID retrieval, ownership evidence, dependency review, explicit approval, and a tombstone before describing deletion as permitted.

## Strong vs. weak response

**Prompt:** Creation returned `agent-example-42`, retrieval confirmed it, and the controller mapping write failed. What should a later attempt do?

**Strong:** Record `created-unrecorded` with the returned ID, stable request key, exact reconciliation tag, retrieval evidence, and persistence failure. On the later attempt, freeze creation, search and verify exact tag membership, stop on multiple matches, and persist the one confirmed canonical ID. If that write also fails, report `reconciled-unrecorded`; do not create again.

**Weak:** Mark creation failed and rerun `createAgent()` because the database contains no agent.

## Misconception indicators

- Calls `hidden` confidentiality, suspension, archival, or deletion.
- Treats one list page as complete inventory.
- Uses update as wholesale replacement or drops the reconciliation tag.
- Converts missing retrieval or timeout directly into failure, deletion, or safe replacement.

## Self-check

**Continue** only if all three invariants are explicit and the answer preserves unknown outcomes. **Revisit** if any retry depends on absence of a local mapping alone.

## Dossier alignment

Use only these existing fields/subfields: `id`; `status`; `execution_authorized`; `release_scope.curriculum_release`, `release_scope.package_tuple`, `release_scope.evidence_cutoff`; `mission.statement`, `mission.stakeholders`, `mission.acceptance_criteria`, `mission.prohibited_outcomes`; `object_ownership.records`; `controls.records`; `observability.evidence_records`; `failure_recovery.tests`, `failure_recovery.reconciliation_rules`, `failure_recovery.rollback_rules`; `claims.static`, `claims.runtime`, `claims.production`; `open_questions`; `attestations`; `non_claims`. Keep runtime and production claims empty.
