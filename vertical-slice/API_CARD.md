# API Card: Reconciled Agent Provisioning

## Identity and scope

- Capability: `CAP-AGENT-MANAGEMENT`
- Exact package: `@letta-ai/letta-agent-sdk@0.8.9`
- Declared runtime: `@letta-ai/letta-code@0.32.11`
- Primary topology: Node controller using the Agent SDK Local backend
- Contrast topology: Node controller using the Agent SDK Cloud backend
- Source use: independently restated API facts plus original project code
- Evidence cutoff: 2026-09-16

## Public symbols used

- Root package: `LettaAgentClient`, `CreateAgentOptions`, `LettaAgent`
- Client member: `createAgent(options)` returns the canonical agent ID
- Management member: `client.agents.list({ tags })`
- Management member: `client.agents.retrieve(agentId)`

The exact package also exports broader creation and management options. This card deliberately uses the safe common subset `name`, `description`, `memfs`, and `tags`; see `DISC-CREATE-OPTIONS-001` before widening it.

## Inputs and outputs

The controller supplies a stable request key, display name, description, optional tags, SDK client, and durable controller store. It returns one of five explicit states:

- `already-recorded` — controller mapping existed and the SDK retrieved that ID;
- `reconciled` — no controller mapping existed, but exactly one tagged agent was found and recorded;
- `created` — creation, retrieval, and controller persistence all completed;
- `created-unrecorded` — the SDK returned and retrieved an agent ID, but controller persistence failed.
- `reconciled-unrecorded` — an existing tagged agent was found, but controller persistence failed again; this invocation did not create it.

## Side effects and authority

Calling this function against a real client can list, retrieve, or create a persistent agent and can write controller state. The repository pointer does not authorize any of those effects. Revision 0.4 only type-checks this source.

## Idempotency and reconciliation

The stable request tag provides a lookup key before a retry creates another agent. It is not a server-side uniqueness constraint. Zero matches allow creation; one match allows reconciliation; multiple matches stop as ambiguous and require operator review. The controller must retry with the same request key after `created-unrecorded`.

## Partial success

Agent creation and controller persistence are separate effects. An agent may exist even when saving its ID fails. The returned canonical ID is evidence of that effect during the same process, while the tag supports a later lookup. A crash between creation and receiving or recording the ID remains an uncertain-effect window; the retry must search before creating. A persistence failure after finding an older tagged agent is reported separately as `reconciled-unrecorded`, so the current invocation never claims creation it did not perform.

## Errors and recovery

- Invalid request key: reject before any SDK effect.
- Stored ID cannot be retrieved: stop; do not silently create a replacement.
- More than one tagged agent: stop as ambiguous.
- List or create failure: propagate; do not claim creation.
- Retrieve failure after returned ID: treat the effect as uncertain and investigate by ID and tag.
- Store failure after verified creation: return `created-unrecorded`; retry with the same key.
- Store failure after finding an existing tagged agent: return `reconciled-unrecorded`; retry with the same key.

## Evidence and non-claims

Evidence: exact npm integrity and source tags in `compatibility/versions.yml`, current official Agent SDK agents/reference pages in `sources/registry.yml`, declaration ledger in `capabilities/sdk-exports.yml`, and TypeScript compilation under `vertical-slice/package-lock.json`.

This card does not prove backend acceptance, tag consistency, transport retry, authorization, billing, hosted runtime version, production safety, or concurrency correctness. Those require separately scoped runtime and production evidence.
