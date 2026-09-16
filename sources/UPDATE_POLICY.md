# Source Update Policy

## Authority model

Official Letta documentation and released artifacts are authoritative for Letta product facts. Repository policies, curriculum structure, architecture decisions, maintainer synthesis, and production heuristics are project facts. A source record must not blur these classes.

Machine-readable source, claim, pointer, version, and discrepancy registries—when present—outrank prose for identifiers, traversal, status, and declared evidence relationships. A conflict must fail closed and be reviewed; prose must not silently override a manifest.

## Freshness classes

- **Fast-changing claims:** review weekly for signals and after relevant upstream releases.
- **Medium-changing claims:** review monthly.
- **Stable claims:** review quarterly.
- **Live or account-specific claims:** never represent them as universally current.

A detected signal is not verification. Update a verification date only after reopening the source, checking its identity and scope, and reviewing dependent claims. Preserve immutable package, tag, commit, integrity, backend, topology, and retrieval-date axes where applicable. Hosted behavior remains unknown unless evidenced for the selected target.

## Update workflow

1. Review the registered source through a read-only method.
2. Record redirects, removals, version changes, contradictions, and known unknowns.
3. Reclassify every affected claim; do not infer parity across packages, runtimes, backends, or topologies.
4. Update dependent prose and machine records together.
5. Preserve discrepancies until resolved with evidence.
6. Run only separately authorized static checks. Reading or updating sources does not authorize validators, dependency installation, evaluators, API/model calls, canaries, or other live actions.

No recursive ingestion is required or authorized by a bare URL. Follow declared pointers only.

## Corrections

Critical false security/API claims, unsafe authorization instructions, secret exposure, malicious dependencies, or license issues require a visible erratum or banner and a corrective release once publishing exists. Published tags and release assets must not be rewritten. Sanitize reports and never include secrets in registries, diagnostics, issues, or history.

## Pre-content constraint

During Revision 0.4 the repository remains local-first and unpublished; fourteen modules are available as a release candidate, and the only bare-reader terminal state is `ASSESSMENT_REQUIRED`. Source maintenance cannot confer Master Builder Ready, Runtime Validated, or Production Qualified. Assessment, evaluator, implementation, and Runtime Validation authorizations remain separate.

The release-response target for a high-impact upstream change is seven calendar days. The support-horizon goal is current plus one prior minor line, and the maintenance ceiling is eight maintainer hours per monthly refresh. These are project service goals, not Letta product guarantees or a response SLA to external users. If measured maintenance exceeds the ceiling, reduce claim-bearing breadth before weakening evidence quality.

No response-time SLA or central assessment service is promised.
