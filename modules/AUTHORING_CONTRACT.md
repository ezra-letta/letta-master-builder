# Mandatory Module Authoring Contract

This file records the authoring contract satisfied by the Design Revision 0.4 module set. It is maintainer infrastructure, not learner evidence, runtime evidence, publication authority, or a new design revision.

## File and size contract

- One mandatory lesson file per module: `modules/MOD-XX.md`.
- Target 4,900–5,150 prose words per module; code, tables, metadata, and source lists do not count toward the 70,000–74,000-word mandatory prose target.
- English is the canonical curriculum language.
- Each file begins with the exact module ID/title and a compact metadata table listing status, prerequisites, capability IDs, evidence IDs, and project-method sections.
- Each file ends with a handoff to the next module and explicit product/runtime/production non-claims.

## Required pedagogical sections

Every module must contain, in a coherent order:

1. learning contract and prerequisites;
2. why the module matters to an autonomous-agent builder;
3. precise conceptual model and vocabulary;
4. implementation/design workflow;
5. at least one original worked example or state-machine trace;
6. failure modes, unsafe shortcuts, and recovery decisions;
7. a concrete dossier artifact the learner can produce later under separate execution authority;
8. formative questions or review prompts that test transfer rather than word recall;
9. source/evidence boundaries and what remains unknown;
10. next-module handoff.

## Claim discipline

- Label Letta product facts, exact-package facts, project-owned methods, and unknown runtime behavior distinctly.
- Use only source IDs and pointer IDs already registered, or open a discrepancy before introducing a new claim.
- Do not infer live behavior from docs, declarations, fixtures, compilation, or source comments.
- Do not claim hosted/account availability, production readiness, security compliance, provider entitlement, or live ordering without scoped evidence.
- Preserve the primary lane: Agent SDK + Node + Local implementation, with Cloud as a contrast topology. Direct App Server, Remote Client, REST, ACP, and other adjacent surfaces remain selection literacy unless explicitly promoted.

## Source-use and safety

- Follow `SOURCE_USE_POLICY.md`: independently restate facts and write examples from scratch.
- Never copy substantial upstream prose, declarations, source, tests, or examples.
- Examples use placeholders only; no credentials, private URLs, live IDs, or executable secrets.
- Reading the finished curriculum never authorizes installation, commands, code execution, evaluators, API/model calls, agent creation, canaries, deployment, publication, or mutation.

## Status rule

A module becomes `ready` only after its mandatory structure, word budget, registered evidence, and manifest identity pass local checks. The repository becomes a release candidate only after every mandatory module and required practicum/assessment contract is ready and the terminal contract is atomically migrated. `ready` describes content availability; it does not award a learner result or authorize publication, execution, evaluation, runtime claims, or production use.
