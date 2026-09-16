# Security checks

Ordinary CI is offline after dependency installation: tests, validation, and lock/integrity checks do not perform evidence lookups. Network evidence is isolated in the scheduled/manual `Network evidence` workflow, uses no user-provided or repository secrets, and runs the complete offline control-plane gates before reading registries for network access.

Local Phase 1 gates are `npm test`, `npm run validate`, `npm run cold-reader:check`, `npm run lock:check`, `npm run integrity:check`, and `npm run clean-copy:check`. The clean-copy gate uses a fresh directory, a clean install with lifecycle scripts disabled, and an allowlisted child environment with empty npm user/global configuration so unrelated caller credentials are not forwarded.

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

The root control-plane dependency audit is separate from the nested compile-only vertical-slice audit. At the Revision 0.4 cutoff, the root reports zero known vulnerabilities while the exact SDK closure reports four high-severity findings propagated through `sharp`, `@janhapke/sharp-electron`, and Letta Code. They are not auto-excepted; `release/manifest.yml` blocks publication pending upstream remediation or an accountable scoped review.

## CI hardening

Workflows have only `contents: read`, pin actions to full commit SHAs, disable persisted checkout credentials, use Node `22.19.x`, and install with `npm ci --ignore-scripts`. Dependency audit JSON is matched against exact, unique, active exceptions requiring advisory, package, affected range, severity, scope, reviewer, reference, creation, and expiration; unused, duplicate, expired, mismatched, and unexcepted high/critical findings fail.

The pinned Gitleaks action receives only the read-only built-in GitHub token and explicitly selects scanner release `8.30.1`; comment, artifact-upload, and summary features are disabled through documented environment switches. The vendor documents that organization-owned repositories also require a `GITLEAKS_LICENSE`; this no-user-secret configuration therefore assumes publication under the planned personal GitHub account and must be revisited if ownership changes. The pinned `action.yml` and README contract were verified locally; actual full-history execution against this repository remains unverified until controlled CI publication, so no operational full-history claim is made yet.

Action and scanner tag pins were verified with the public GitHub API tag/commit endpoints on 2026-09-11:

- `actions/checkout` `v7.0.1`: `3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/setup-node` `v7.0.0`: `820762786026740c76f36085b0efc47a31fe5020`
- `gitleaks/gitleaks-action` `v3.0.0`: `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e`
- `gitleaks/gitleaks` scanner `v8.30.1`: `83d9cd684c87d95d656c1458ef04895a7f1cbd8e`
