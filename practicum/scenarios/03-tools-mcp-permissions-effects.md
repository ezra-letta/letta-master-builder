# Scenario 3 — Tools, MCP, permissions, and effect reconciliation

## Status and authority

This is an original ready read-only Design Revision 0.4 practice brief. Learner execution and scoring are unauthorized. It does not start an MCP server, expose a tool to a model, answer an approval, or perform an external effect.

## Mission

Build an offline controller for a proposed tool action whose execution locality, permission decision, deadline, and external outcome must be reconciled. The scenario combines client-tool selection, a synthetic MCP lifecycle, approval edits, timeout/abort, and an uncertain side effect without presenting any project record as a real Letta event or endpoint.

The fixture describes:

1. a tool proposal with requested arguments and an effect classification;
2. a permission response that may approve unchanged, approve edited arguments, deny, or remain pending;
3. a synthetic MCP transport becoming unavailable before or after dispatch;
4. a timeout or abort signal racing with an external receipt;
5. an authoritative lookup fixture returning zero, one, or multiple candidate effects.

## Read-only specification bundle

The complete public specification is fixed at `practicum/specs/03/`:

- `input.json` — exact synthetic base input for the proposal, edited permission, MCP transport state, post-dispatch timeout/abort, non-authoritative receipt, authoritative lookup, deterministic digest contract, and protected perturbation custody metadata;
- `contracts.d.ts` — the expected project contracts and the exact `exact-static` type-only root imports from `@letta-ai/letta-agent-sdk`;
- `artifact-bundle.schema.json` — JSON Schema Draft 2020-12 validation for exactly the four required artifact filenames; `controller-trace.jsonl` is represented for schema validation as an ordered array in physical line order.

A future authorized submission root would be `submission/SCN-TOOLS-EFFECTS`, with the only implementation entry at `src/controller.ts`. That directory is not created by this read-only release. Protected perturbations identify insertion points and evaluator custody only; their values are withheld. All assertions listed below and in the base input are public. The supplied digests use the declared canonical UTF-8 JSON representation: recursively sorted object keys, preserved array order, no insignificant whitespace, lowercase SHA-256 hexadecimal prefixed by `sha256:`. Artifact digest reporting follows the filename order declared in `input.json`.

## Expected imports

Learner TypeScript may use only these exact package imports, all as type-only imports from the root entrypoint `@letta-ai/letta-agent-sdk`, as labeled `exact-static` in `contracts.d.ts`: `AgentTool`, `CanUseToolContext`, `CanUseToolResponse`, `CanUseToolResponseAllow`, `CanUseToolResponseDeny`, `McpServerConfig`, `McpServers`, `McpStdioServerConfig`, and `PermissionMode`. No runtime, subpath, wildcard, deep, or additional SDK import is specified.

## Learner task

When execution is separately authorized, implement deterministic TypeScript that:

- selects execution locality from declared tool policy rather than from model text;
- keeps host-only credentials absent from model-visible inputs and all artifacts;
- treats approved edits as the authorized arguments, preserving both proposed and authorized digests;
- refuses execution while approval is absent, denied, expired, or ambiguous;
- gives each possible external effect a stable controller request key before dispatch;
- classifies the effect as read-only, idempotent, compensatable, or irreversible;
- treats timeout or abort after dispatch as uncertain unless authoritative evidence resolves it;
- reconciles by lookup before any repeat attempt and stops on multiple matches;
- records compensation as a separately authorized proposal, never an assumed rollback;
- closes synthetic MCP resources in the fixture model without claiming real lifecycle behavior.

## Synthetic fixture contract

Only project namespaces identify events:

- `lmb.practicum.v1.tool.proposed`
- `lmb.practicum.v1.permission.decision`
- `lmb.practicum.v1.mcp.transport_state`
- `lmb.practicum.v1.effect.dispatch_observation`
- `lmb.practicum.v1.effect.authoritative_lookup`
- `lmb.practicum.v1.effect.reconciliation_decision`

Some data fields may be labeled `package-derived-public-shape` or `documented-behavior-fixture` in the registry. The operation ledger, effect classes, lookup policy, and compensation states are `project-method-only`. No project record is an SDK callback, MCP protocol message, or server event name.

## Critical assertions

1. No tool dispatch occurs without valid permission for the exact authorized argument digest.
2. No credential value appears in source fixtures, logs, reports, or model-visible material.
3. Timeout or abort does not become proof that an already-dispatched effect failed.
4. An uncertain effect is looked up before retry; multiple matches halt for operator review.
5. Irreversible effects are not automatically retried or compensated.
6. Loss of authority, permission expiry, or lease expiry blocks continued execution.
7. The result distinguishes proposal, authorization, dispatch, observation, verification, and reconciliation.
8. No output claims a real MCP lifecycle, approval mechanism, tool execution, or external effect.

## Noncritical assertions

At least 90 percent of registered noncritical checks must pass. They cover deterministic digests, clear locality rationale, useful redaction metadata, resource-close reporting, bounded lookup attempts, and a concise incident summary.

## Required artifacts

- `tool-authority.json` — proposal, authorized edits, digests, locality, and expiry;
- `effect-ledger.json` — request key, classification, dispatch state, canonical receipt if any, and reconciliation state;
- `reconciliation-report.json` — lookup evidence, ambiguity handling, and allowed next action;
- `controller-trace.jsonl` — deterministic redacted `lmb.practicum.v1` records.

## Forbidden effects

Network access, credential access, live MCP startup or contact, real tool registration or execution, live approval interaction, external writes, writes outside the workspace, undeclared subprocesses, and automatic compensation are forbidden.

## Evaluation boundary

This release is specification-only and ready read-only. Learner execution, evaluator execution, scoring, answer implementation, scripts, network access, and research are unauthorized. Compilation and project-fixture conformance are independent statuses. Passing them would not prove actual tool locality, MCP transport behavior, credential isolation, permission ownership, timeout semantics, external idempotency, compensation safety, authorization, or production security. No runtime or production qualification is available from this scenario.
