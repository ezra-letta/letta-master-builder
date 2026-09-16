# MOD-06 Memory Context Skills and Shared Knowledge

## Formative purpose

This read-only self-check awards no status and is not assessment or runtime evidence.

Explain how information is placed among context, history, controller state, MemFS, working files, skills, and shared repositories.

## Must-pass invariants

1. The response identifies source, lifetime, audience, sensitivity, mutation owner, freshness, and verification before choosing a location; credentials are excluded from agent-accessible stores.
2. The response enters MemFS root-first, preserves its layout and links, and stops on missing, ambiguous, unexpected, or cross-agent ownership rather than seeking substitutes.
3. The response represents skill transfer and repository attachment as staged operations, preserves canonical agent or relationship state after partial success, and reconciles before retry or compensation.

## Strong vs. weak response

**Prompt:** Agent creation returned an ID, then skill support-file transfer timed out. What is the design state?

**Strong:** Preserve the canonical agent ID and record stages separately: agent creation confirmed, instruction acceptance only as evidenced, support-file transfer uncertain, destination verification pending. Inspect the authoritative destination or relationship before retrying only the failed stage. Do not create another agent, claim the files arrived, or delete the confirmed agent as automatic compensation.

**Weak:** Creation failed because the skill is incomplete; retry everything until it works.

## Misconception indicators

- Treats every transcript statement as curated memory.
- Claims a local edit or commit is synchronized everywhere.
- Assumes a controller path is available to remote or portable execution.
- Calls compaction deletion, stateless privacy, or reflection independent evaluation.

## Self-check

**Continue** only if each proposed store has an owner, audience, invalidation rule, and evidence rung. **Revisit** if the answer says only “put it in memory” or “retry.”

## Dossier alignment

Use only these existing fields/subfields: `id`; `status`; `execution_authorized`; `release_scope.curriculum_release`, `release_scope.package_tuple`, `release_scope.evidence_cutoff`; `mission.statement`, `mission.stakeholders`, `mission.acceptance_criteria`, `mission.prohibited_outcomes`; `object_ownership.records`; `topology.state_host`, `topology.execution_host`, `topology.controller_host`, `topology.selected_surface`, `topology.alternatives_rejected`; `controls.records`; `observability.evidence_records`; `failure_recovery.tests`, `failure_recovery.reconciliation_rules`, `failure_recovery.rollback_rules`; `improvement.proposal_authority`, `improvement.evaluation_authority`, `improvement.promotion_authority`, `improvement.monitoring_rules`; `security_tenancy.credential_owners`, `security_tenancy.trust_boundaries`, `security_tenancy.tenant_isolation`; `claims.static`, `claims.runtime`, `claims.production`; `open_questions`; `non_claims`. Leave claim lists empty.
