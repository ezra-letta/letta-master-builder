# MOD-02 Objects Ownership and Locality

## Read-only formative check
Use this reflection to inspect architecture reasoning only. It awards nothing, authorizes nothing, and makes no assessment or runtime claim.

## Must-pass invariants
1. Model agent, conversation, virtual default, session, turn or run, message, SDK client, controller record, runtime, computer, MemFS, working files, repositories, credentials, tools, routes, channels, and deployment as distinct objects.
2. For every object, record persistence, locality, authority, and recovery ownership; never infer that coincident hosts, an identifier, visible tool, or available capability establishes identity or permission.
3. Reconcile partial success and lost observation through canonical identities and authoritative state; session loss is not work failure, assistant text is not effect proof, and uncertain effects must not be retried blindly.

## Worked response: strong versus weak
**Prompt:** A controller stores only `default` and loses its session after submission.

**Strong:** “Treat `default` as virtual addressing, retain the agent namespace, resolve the canonical conversation ID through the authoritative product surface, and search using the original correlation identity. Session loss means observation was lost, not that work failed. Stop if multiple matches remain.”

**Weak:** “Open a new session and resend to conversation `default`.”

The strong response preserves identity and uncertainty. The weak response can misroute or duplicate work.

## Misconception indicators
- Using an agent ID as authentication.
- Assuming files, credentials, or checkouts follow agent identity between computers.
- Calling an unsynchronized MemFS edit durable memory.
- Treating repository attachment and projection as one atomic state.
- Assuming session close deletes persistent objects or every runtime resource.

## Continue or revisit
**Continue** if a new operator could answer what persists, where it lives, who may mutate it, and who reconciles it. **Revisit** if your diagram has one undifferentiated “agent” box or lacks canonical recovery queries.

## Dossier/template fields to inspect
`id`; `status`; `execution_authorized`; `object_ownership.records`; `topology.state_host`; `topology.execution_host`; `topology.controller_host`; `controls.records`; `observability.evidence_records`; `failure_recovery.tests`; `failure_recovery.reconciliation_rules`; `security_tenancy.credential_owners`; `security_tenancy.trust_boundaries`; `security_tenancy.tenant_isolation`; `open_questions`; `non_claims`.
