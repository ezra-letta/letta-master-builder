# Security Policy

## Scope

This policy covers the repository's documentation, manifests and validators, source registry, assessment artifacts, and future read-only Agent Foundry case study. The project is currently an unpublished, local-first scaffold and makes no claim of live validation or production qualification.

## Reporting a vulnerability

Report suspected vulnerabilities privately to the maintainers through a private contact channel they have explicitly published for this project. If no private channel is published, provide only a minimal, non-sensitive notice to the maintainer and request a secure reporting path. Do not place secrets, credentials, personal data, exploit payloads, private URLs, tenant identifiers, full logs, or unredacted screenshots in public issues, discussions, commits, or chat.

Include, when safe:

- affected file, revision, or release;
- concise impact and preconditions;
- minimal reproduction steps using synthetic data;
- expected versus observed behavior;
- suggested mitigation;
- whether any secret may have been exposed.

Replace sensitive values with stable redaction labels. Do not test against accounts, agents, runtimes, networks, or production systems without explicit authorization. Do not retain or redistribute exposed data.

## If a secret is found

Stop processing and avoid printing or copying it. Report only its location and type through the private channel. The secret owner—not this repository—must rotate or revoke it. Removing a value from the current tree does not remove it from history, caches, artifacts, or logs.

## Authorization

Opening a bare URL is read-only. It does not authorize scanning unrelated local files, recursive ingestion, dependency installation, validator or exploit execution, credential use, API/model calls, agent creation, mutation, deployment, or cleanup.

Assessment, evaluator use, runtime validation, and production security review are separate activities requiring separate authorization. A documentation finding or successful assessment is not runtime evidence. Runtime evidence is valid only for its named version, backend, topology, environment, date, actions, and scope.

## Disclosure and correction

Maintainers should acknowledge and triage reports without promising an SLA. Critical unsafe instructions, false security/API claims, secret exposure, malicious dependencies, or license issues require a visible notice and corrective release when publication exists. Reports must be sanitized before public disclosure.
