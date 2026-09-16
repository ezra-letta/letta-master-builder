# Source Use Policy

This policy governs source material used by the unpublished Revision 0.4 curriculum release candidate, including chapters, API cards, examples, and assessment material.

## Allowed source-use modes

1. **Independently restated facts** — maintainers may restate a documented fact in original language while preserving its source, exact package or page identity, backend, topology, version, date, and limitations.
2. **Original examples** — all project TypeScript, fixtures, diagrams, scenarios, and recovery walkthroughs are written for this repository rather than copied from Letta documentation or source.
3. **Short quotations** — use only when exact wording is necessary. Keep the excerpt minimal, mark it as a quotation, identify author/publisher, title, canonical URL, version or retrieval date, and preserve any required notice.
4. **Structural API summaries** — hand-authored cards may name public packages, exports, methods, fields, results, errors, and documented restrictions. They are release-pinned summaries, not substitute declarations or authoritative reference documentation.
5. **Mechanical export evidence** — a generated ledger may record public export/member names and declaration kinds from the exact installed package. It must not copy implementation bodies, source comments, or declaration text.

## Prohibited without a separate reviewed license decision

- copying substantial documentation prose, generated declaration files, source modules, official examples, tests, or diagrams;
- vendoring npm tarballs or dependency source into the repository;
- relicensing Apache-2.0 or other upstream material as project MIT content;
- removing copyright, attribution, NOTICE, trademark, or brand restrictions;
- using Letta logos or presentation that implies official endorsement;
- copying brand assets excluded from an upstream software license.

## Package and documentation treatment

- `@letta-ai/letta-agent-sdk` and `@letta-ai/letta-code` are external Apache-2.0 dependencies. Their exact versions, integrity, source tags, and licenses are evidence; they are not project source.
- The compile-only vertical slice installs its exact dependency closure from `vertical-slice/package-lock.json` after explicit maintainer authorization. Dependencies are not vendored and remain governed by their own licenses.
- Official Letta documentation is linked and summarized. The project MIT license covers only original project text and code unless a file carries a different explicit notice.

## Review rule

Every future card or example must declare `source_use: independently-restated` or `source_use: original`. Any other mode blocks publication until an accountable reviewer records the applicable license, notice, attribution, scope, and rationale.

This policy does not authorize network access, package installation, execution, publication, or use of credentials. Those remain separate permissions.
