# Maintainer Release-Candidate Workflow

This is a maintainer-only ordering contract. A bare repository pointer does not authorize any command below. Publication, live Letta work, learner assessment, evaluator execution, runtime canaries, dependency waivers, commits, and pushes remain separate approvals.

Run the release-candidate sequence serially from a quiescent working tree. Do not generate the lock and integrity manifest concurrently: integrity includes the completed lock and all other final regular files while excluding itself.

1. If exact package evidence changed, regenerate and check the SDK export ledger.
2. Run module, schema, reference, test, vertical-slice, drift, cold-reader, security, package, and clean-copy checks against source artifacts.
3. Resolve every finding; repeat step 2 until only expected stale generated-artifact findings remain.
4. Generate `curriculum.lock.yml`.
5. Generate `INTEGRITY.SHA256` last.
6. Run checks only: SDK export ledger, lock, integrity, repository validation, and the complete clean-copy suite.
7. Record independent final review and remaining external blockers without promoting learner, runtime, publication, or production status.

Canonical local commands are declared in `package.json`. Generation is never a substitute for review, and a passing gate does not waive `release/dependency-review.yml`.
