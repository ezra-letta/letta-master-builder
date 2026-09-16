# Start Here

This is the sole normal entrypoint for Letta Master Builder Revision 0.4. The repository is an unpublished release candidate for a complete read-only autonomous-agent curriculum. It is not official Letta documentation, runnable Agent Foundry, automatic executor, learner credential, certification, runtime validation, or production qualification.

## Current outcome

The only valid reader terminal state is:

`ASSESSMENT_REQUIRED`

This means the curriculum content is available, but no assessment has run and no learner has earned Master Builder readiness. Do not claim assessment success, runtime validation, production qualification, certification, or mastery from reading alone.

## Authority

A bare repository pointer authorizes reading only. Do not recursively ingest or index the tree; inspect the environment; install dependencies; execute commands, validators, examples, tests, evaluators, or canaries; use credentials; call APIs or models; create or mutate agents; deploy; publish; or write progress state.

`curriculum.yml` is the root machine contract. Its `reader_sequence` controls normal traversal, and its larger `control_files` list is an audit inventory rather than an instruction to read everything. Machine data outranks prose for stage, availability, order, and terminal state. Stop on a conflict, loop, missing file, or undeclared target.

## Reader sequence

You are already at `START_HERE.md`; do not reopen it. Continue once through:

2. `curriculum.yml` — stage, exact target, fourteen-module graph, registries, and authoritative machine order.
3. `SOURCE_USE_POLICY.md` and `DESIGN_SPEC.md` — source, claim, architecture, and assessment boundaries.
4. `dossier/README.md`, `dossier/template.yml`, `traceability/*`, and `assessments/FORMATIVE_CHECKPOINTS.md` — the canonical cumulative learner record, module-to-field map, and non-awarding continue/revisit checks.
5. `modules/MOD-00.md` through `modules/MOD-13.md` — the cumulative mandatory curriculum; apply the matching formative checkpoint after each module.
6. `practicum/registry.yml` and the four `practicum/scenarios/*.md` files — original read-only practice specifications.
7. `assessments/contract.yml`, `PUBLIC_RUBRIC.md`, evaluator-report template, and misconception registry — public governance; reading them does not authorize an assessment.
8. `terminal-contract.yml` — required terminal state and forbidden status promotion.
9. `INTEGRITY.SHA256` — final identity manifest; reading it does not authorize verification commands.

The machine-generated SDK export ledger, source registries, vertical slice, schemas, and maintainer scripts are audit artifacts outside normal reader traversal.

Reading, assessment participation, evaluator execution, runtime validation, and production qualification are separate authorization domains. Permission for one never grants another.

After the declared sequence, stop with `ASSESSMENT_REQUIRED`. An assessment, implementation attempt, evaluator run, runtime canary, or production review requires a new explicit authorization and its own contract.
