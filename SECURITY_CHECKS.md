# Security checks

Ordinary CI is offline after dependency installation: tests, validation, and lock/integrity checks do not perform evidence lookups. Network evidence is isolated in the scheduled/manual `Network evidence` workflow, uses no user-provided or repository secrets, and runs the complete offline control-plane gates before reading registries for network access.

The canonical local offline gate is `npm run release:check`; it sequences tests, schema/reference validation, curriculum/practicum/formative checks, SDK and vertical-slice static checks, drift, lock, integrity, and clean-copy reproduction. The clean-copy gate uses a fresh directory, a clean install with lifecycle scripts disabled, and an allowlisted child environment with empty npm user/global configuration so unrelated caller credentials are not forwarded.

Revision 0.4 also uses `npm run sdk-exports:check`, `npm run vertical-slice:check`, and `npm run drift:check` after a separately authorized `npm run vertical-slice:install`. These maintainer checks are not reader actions and make no network or runtime claim.

## Network policy

`scripts/check-external-links.mjs` accepts only HTTPS URLs without user info, query strings, fragments, or non-443 ports. Native HTTPS requests pin the connection lookup to a policy-approved DNS address while retaining the original hostname for Host, TLS SNI, and certificate verification. Every redirect is independently resolved and repinned; any private, loopback, link-local, reserved, documentation, multicast, IPv4-mapped IPv6, or mixed public/private result fails closed. Redirects, request timeouts, and retries are bounded, and response bodies are capped at 5 MiB (large enough for expected package metadata) before buffering to prevent memory exhaustion. Exit `1` means invalid evidence/policy failure, including malformed registry YAML, unsafe URLs, and stable missing-resource responses such as HTTP 404. Exit `2` means a transient DNS, transport, timeout, bot-blocking/rate-limit response (including HTTP 403 or 429), or server failure.

With explicit arguments, `check-external-links.mjs` checks those URLs with bounded, status-only `HEAD` requests. With no arguments, it safely parses both `sources/registry.yml` and `pointers/registry.yml`, then checks every unique HTTPS source URL and external pointer while skipping only safe repository-relative paths/anchors. `file:` and every other non-HTTPS scheme are rejected. Package evidence separately uses the same protected native path with bounded `GET` requests and no unbound preflight; the scheduled/manual workflow runs both checks.

## Package evidence

The package checker verifies exact npm versions and SHA-512 integrity, then resolves the corresponding GitHub tag (including annotated tags) to an immutable commit for:

- Agent SDK `0.8.9`
- SDK-declared runtime dependency `0.32.11`
- standalone runtime `0.32.11`

Pinned expectations are derived at runtime from the canonical, code-reviewed `compatibility/versions.yml`; the checker has no duplicate version, integrity, or commit table that can silently drift. No API token or repository secret is used.

The root control-plane dependency audit is separate from the nested compile-only vertical-slice audit. At the Revision 0.4 cutoff, the root reports zero known vulnerabilities while the exact SDK closure reports two advisories across four affected package records (`sharp`, `@janhapke/sharp-electron`, `@letta-ai/letta-code`, and `@letta-ai/letta-agent-sdk`). They are not auto-excepted: the empty exception list waives nothing, nested CI intentionally fails on these findings, and `release/manifest.yml` plus `release/dependency-review.yml` block publication pending upstream remediation or an accountable scoped review.

The license inventory covers exactly the 391 non-root package records in `vertical-slice/package-lock.json`. It counts each non-empty lockfile `license` value verbatim, including compound SPDX expressions: 20 standalone `LGPL-3.0-or-later` records and 9 records whose compound expression includes LGPL, with zero missing license fields. This is deterministic metadata inventory only—not legal advice, a compatibility opinion, redistribution approval, or a substitute for accountable legal/license review.

## CI hardening

Workflows have only `contents: read`, pin actions to full commit SHAs, disable persisted checkout credentials, use Node `22.19.x`, and install with `npm ci --ignore-scripts`. Dependency audit JSON is matched against exact, unique, active exceptions requiring advisory, package, affected range, severity, project, lockfile, dependency scope/class, reviewer, reference, creation, and expiration; dependency scope is derived from each reported audit node's package-lock metadata rather than assumed from the package name. An exception for one project, lockfile, or dependency class cannot authorize another; unused, duplicate, expired, mismatched, and unexcepted high/critical findings fail. CI evaluates the root and nested lockfiles independently. Root CI is exact-record checking and currently passes with zero findings; nested vertical-slice CI is intentionally blocking while its two advisories/four affected package records remain unwaived.

The pinned Gitleaks action receives only the read-only built-in GitHub token and explicitly selects scanner release `8.30.1`; comment, artifact-upload, and summary features are disabled through documented environment switches. The vendor documents that organization-owned repositories also require a `GITLEAKS_LICENSE`; this no-user-secret configuration therefore assumes publication under the planned personal GitHub account and must be revisited if ownership changes. The pinned `action.yml` and README contract were verified locally; actual full-history execution against this repository remains unverified until controlled CI publication, so no operational full-history claim is made yet.

Action and scanner tag pins were verified with the public GitHub API tag/commit endpoints on 2026-09-11:

- `actions/checkout` `v7.0.1`: `3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/setup-node` `v7.0.0`: `820762786026740c76f36085b0efc47a31fe5020`
- `gitleaks/gitleaks-action` `v3.0.0`: `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e`
- `gitleaks/gitleaks` scanner `v8.30.1`: `83d9cd684c87d95d656c1458ef04895a7f1cbd8e`
