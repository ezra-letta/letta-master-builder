# Maintainer Release-Candidate Workflow

This is a maintainer-only ordering contract. A bare repository pointer does not authorize any command below. Publication, live Letta work, learner assessment, evaluator execution, runtime canaries, dependency waivers, commits, and pushes remain separate approvals.

Run the release-candidate sequence serially from a quiescent working tree. Do not generate the lock and integrity manifest concurrently: integrity includes the completed lock and all other final regular files while excluding itself.

1. If exact package evidence changed, regenerate and check the SDK export ledger.
2. Run `npm run release:check` for the canonical check-only sequence: repository and security-policy tests, SDK ledger, vertical slice, drift, schema/reference validation, modules, practicum, formative material, cold reader, lock, integrity, and a credential-sanitized clean copy. This command never generates artifacts.
3. Resolve every finding; repeat step 2 until only expected stale generated-artifact findings remain.
4. Generate `curriculum.lock.yml`.
5. Generate `INTEGRITY.SHA256` last.
6. Run `npm run release:check` again after generation. Its clean-copy pass invokes `release:inner`, which contains the same check-only gate inventory without recursively creating another copy.
7. Record independent final review and remaining external blockers without promoting learner, runtime, publication, or production status.

Canonical local commands are declared in `package.json` and sequenced by `scripts/check-release-candidate.mjs`. Network source/package checks and the intentionally blocking nested dependency audit remain separate maintainer/CI actions because they are not deterministic offline gates. Generation is never a substitute for review, and a passing gate does not waive `release/dependency-review.yml`.
