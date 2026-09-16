import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { inventory, parseYaml } from '../lib/core.mjs';
import { generate } from '../lib/generators.mjs';
import { validateRepository } from '../lib/validate-repository.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'lmb-offline-'));
  await mkdir(path.join(root, 'compatibility'));
  await mkdir(path.join(root, 'sources'));
  await writeFile(path.join(root, 'curriculum.yml'), 'curriculum_id: test\ncurriculum_version: 0.1.0\nrepository_stage: scaffold\ncompletion:\n  enabled: false\nmodules: []\n');
  await writeFile(path.join(root, 'terminal-contract.yml'), 'allowed_states:\n  - CURRICULUM_UNAVAILABLE\nforbidden_automatic_actions: [inspect-environment, install-dependencies, run-commands-or-tests, use-credentials, make-network-calls, call-letta-api-or-model, create-or-modify-agents, execute-canaries, deploy, write-progress-ledger]\n');
  await writeFile(path.join(root, 'compatibility/versions.yml'), 'entries:\n  - {id: VER-AGENT-SDK-0-8-3, status: exact-evidence, package: "@letta-ai/letta-agent-sdk", version: 0.8.3, integrity: sha512-sdk, source_commit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, source_ids: [SRC-SDK-NPM, SRC-SDK-SOURCE]}\n  - {id: VER-SDK-DECLARED-RUNTIME-0-31-7, status: exact-evidence, package: "@letta-ai/letta-code", version: 0.31.7, integrity: sha512-b, source_commit: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb, source_ids: [SRC-B-NPM, SRC-B-SOURCE]}\n  - {id: VER-STANDALONE-0-32-2, status: exact-evidence, package: "@letta-ai/letta-code", version: 0.32.2, integrity: sha512-s, source_commit: cccccccccccccccccccccccccccccccccccccccc, source_ids: [SRC-S-NPM, SRC-S-SOURCE]}\n');
  await writeFile(path.join(root, 'sources/registry.yml'), 'sources:\n  - {id: SRC-DOCS-X, type: official-docs-snapshot, status: current, retrieved_at: 2026-09-11, revision: sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa}\n  - {id: SRC-SDK-NPM, type: npm-artifact, url: https://registry.npmjs.org/letta-agent-sdk, revision: sha512-sdk, versions: [0.8.3], surfaces: [agent-sdk]}\n  - {id: SRC-SDK-SOURCE, type: immutable-source, revision: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, versions: [0.8.3], surfaces: [agent-sdk]}\n  - {id: SRC-B-NPM, type: npm-artifact, url: https://registry.npmjs.org/letta-code, revision: sha512-b, versions: [0.31.7], surfaces: [sdk-declared-runtime]}\n  - {id: SRC-B-SOURCE, type: immutable-source, revision: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb, versions: [0.31.7], surfaces: [sdk-declared-runtime]}\n  - {id: SRC-S-NPM, type: npm-artifact, url: https://registry.npmjs.org/letta-code, revision: sha512-s, versions: [0.32.2], surfaces: [standalone-runtime]}\n  - {id: SRC-S-SOURCE, type: immutable-source, revision: cccccccccccccccccccccccccccccccccccccccc, versions: [0.32.2], surfaces: [standalone-runtime]}\n');
  return root;
}

test('YAML duplicate keys are rejected without exposing values', () => {
  assert.throws(() => parseYaml('safe: one\nsafe: two\n', 'fixture.yml'), /invalid YAML/);
});

test('inventory rejects symbolic links fail-closed', async () => {
  const root = await fixture();
  await symlink('curriculum.yml', path.join(root, 'alias.yml'));
  await assert.rejects(inventory(root), /unsupported filesystem entry/);
});

test('integrity includes completed lock, excludes itself, and is deterministic', async () => {
  const root = await fixture();
  await generate(root, 'lock');
  await generate(root, 'integrity');
  const first = await import('node:fs/promises').then(fs => fs.readFile(path.join(root, 'INTEGRITY.SHA256'), 'utf8'));
  await generate(root, 'integrity');
  const second = await import('node:fs/promises').then(fs => fs.readFile(path.join(root, 'INTEGRITY.SHA256'), 'utf8'));
  assert.equal(first, second);
  assert.match(first, /  curriculum\.lock\.yml$/m);
  assert.doesNotMatch(first, /  INTEGRITY\.SHA256$/m);
  assert.equal(await generate(root, 'integrity', true), true);
});

test('lock generation is deterministic and excludes itself', async () => {
  const root = await fixture();
  await generate(root, 'lock');
  const fs = await import('node:fs/promises');
  const first = await fs.readFile(path.join(root, 'curriculum.lock.yml'), 'utf8');
  await generate(root, 'lock');
  assert.equal(first, await fs.readFile(path.join(root, 'curriculum.lock.yml'), 'utf8'));
  assert.doesNotMatch(first, /path: curriculum\.lock\.yml/);
});

test('false terminal completion fields are allowed for unavailable scaffold', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'terminal-contract.yml'), 'allowed_states:\n  - state: CURRICULUM_UNAVAILABLE\n    curriculum_complete: false\n    knowledge_ready: false\nforbidden_automatic_actions: [inspect-environment, install-dependencies, run-commands-or-tests, use-credentials, make-network-calls, call-letta-api-or-model, create-or-modify-agents, execute-canaries, deploy, write-progress-ledger]\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'TERMINAL'), false);
});

test('true terminal completion fields fail for unavailable scaffold', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'terminal-contract.yml'), 'allowed_states:\n  - state: CURRICULUM_UNAVAILABLE\n    curriculum_complete: true\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'TERMINAL'), true);
});

test('actual completion states fail for incomplete curriculum', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'terminal-contract.yml'), 'allowed_states:\n  - state: CURRICULUM_UNAVAILABLE\n  - state: CURRICULUM_COMPLETE\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'TERMINAL'), true);
});

test('LEG namespace IDs are accepted while malformed casing and separators fail closed', async () => {
  const root = await fixture();
  await mkdir(path.join(root, 'legacy-boundary'));
  await writeFile(path.join(root, 'legacy-boundary/denylist.yml'), "rules:\n  - id: LEG-001\n    pattern: forbidden-v1-token\n");
  let errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'ID'), false);
  await writeFile(path.join(root, 'legacy-boundary/denylist.yml'), "rules:\n  - id: leg_001\n    pattern: forbidden-v1-token\n");
  errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'ID'), true);
});

test('denylist scans scripts and rejects an exact configured prohibited pattern', async () => {
  const root = await fixture();
  await mkdir(path.join(root, 'legacy-boundary'));
  await mkdir(path.join(root, 'scripts'));
  await writeFile(path.join(root, 'legacy-boundary/denylist.yml'), "rules:\n  - id: LEG-001\n    pattern: '@letta-ai/letta-client'\n");
  await writeFile(path.join(root, 'scripts/example.mjs'), "import '@letta-ai/letta-client';\n");
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'LEGACY' && error.file === 'scripts/example.mjs'), true);
});

test('unmatched current Agent SDK package evidence script is accepted', async () => {
  const root = await fixture();
  await mkdir(path.join(root, 'legacy-boundary'));
  await mkdir(path.join(root, 'scripts'));
  await writeFile(path.join(root, 'legacy-boundary/denylist.yml'), "rules:\n  - id: LEG-001\n    pattern: '@letta-ai/letta-client'\n    include: ['**/*']\n    exclude: [legacy-boundary/denylist.yml]\nreviewed_exceptions: []\n");
  await writeFile(path.join(root, 'scripts/check-package-evidence.mjs'), "const item = { name: 'Agent SDK', package: '@letta-ai/letta-agent-sdk' };\n");
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'LEGACY'), false);
});

test('all regular files are UTF-8 scanned regardless of extension', async () => {
  for (const name of ['.env', 'extensionless', 'sample.weird', 'fixture.data']) {
    const root = await fixture();
    const secret = ['github', '_pat_', 'A'.repeat(24)].join('');
    await writeFile(path.join(root, name), secret);
    const errors = await validateRepository(root);
    assert.equal(errors.some(error => error.code === 'SECRET' && error.file === name), true);
    assert.equal(JSON.stringify(errors).includes(secret), false);
  }
});

test('invalid UTF-8 and NUL fail for uncommon files', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'blob.bin'), Buffer.from([0xff]));
  await writeFile(path.join(root, 'nul.custom'), Buffer.from([65, 0, 66]));
  const errors = await validateRepository(root);
  assert.equal(errors.filter(error => error.code === 'UTF8').length, 2);
});

test('generator rejects output symlinks', async () => {
  const root = await fixture();
  await symlink('curriculum.yml', path.join(root, 'INTEGRITY.SHA256'));
  await assert.rejects(generate(root, 'integrity'), /unsupported filesystem entry|unsafe output target/);
});

test('date validation rejects impossible registry dates', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'sources/registry.yml'), 'sources:\n  - id: SRC-X\n    retrieved_at: 2026-02-30\n    freshness: stable\n');
  await writeFile(path.join(root, 'sources/claims.yml'), 'claims: []\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'DATE'), true);
});

test('denylist is mandatory and nonempty', async () => {
  const root = await fixture();
  let errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'LEGACY_POLICY' && /present/.test(error.message)), true);
  await mkdir(path.join(root, 'legacy-boundary'));
  await writeFile(path.join(root, 'legacy-boundary/denylist.yml'), 'rules: []\nreviewed_exceptions: []\n');
  errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'LEGACY_POLICY' && /nonempty/.test(error.message)), true);
});

test('denylist scans test fixtures unless an exact reviewed exception is used', async () => {
  const root = await fixture();
  await mkdir(path.join(root, 'legacy-boundary'));
  await mkdir(path.join(root, 'scripts/tests'), { recursive: true });
  await writeFile(path.join(root, 'legacy-boundary/denylist.yml'), "rules:\n  - {id: LEG-001, pattern: '@letta-ai/letta-client', include: ['**/*'], exclude: [legacy-boundary/denylist.yml]}\nreviewed_exceptions: []\n");
  await writeFile(path.join(root, 'scripts/tests/adversarial.fixture'), "@letta-ai/letta-client\n");
  let errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'LEGACY' && error.file === 'scripts/tests/adversarial.fixture'), true);
  await writeFile(path.join(root, 'legacy-boundary/denylist.yml'), "rules:\n  - {id: LEG-001, pattern: '@letta-ai/letta-client', include: ['**/*'], exclude: [legacy-boundary/denylist.yml]}\nreviewed_exceptions:\n  - {rule_id: LEG-001, path: scripts/tests/adversarial.fixture, reviewer: Security, rationale: Exact adversarial fixture., created_at: 2026-09-11}\n");
  errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'LEGACY' && error.file === 'scripts/tests/adversarial.fixture'), false);
});

test('reviewed exceptions reject wildcards, invalid metadata, and unused entries', async () => {
  const root = await fixture();
  await mkdir(path.join(root, 'legacy-boundary'));
  await writeFile(path.join(root, 'legacy-boundary/denylist.yml'), "rules:\n  - {id: LEG-001, pattern: forbidden-v1-token, include: ['**/*'], exclude: [legacy-boundary/denylist.yml]}\nreviewed_exceptions:\n  - {rule_id: LEG-001, path: 'scripts/tests/**', reviewer: '', rationale: '', created_at: 2026-02-30}\n");
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'LEGACY_POLICY' && /invalid reviewed exception/.test(error.message)), true);
  assert.equal(errors.some(error => error.code === 'LEGACY_POLICY' && /unused reviewed exception/.test(error.message)), true);
});

test('exact compatibility evidence must agree with source records', async () => {
  const root = await fixture();
  const file = path.join(root, 'sources/registry.yml');
  const original = await readFile(file, 'utf8');
  await writeFile(file, original.replace('revision: sha512-sdk', 'revision: sha512-tampered'));
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'COMPATIBILITY' && /disagrees with npm source/.test(error.message)), true);
});

test('compatibility relations resolve and SDK declares the expected runtime lane', async () => {
  const root = await fixture();
  const file = path.join(root, 'compatibility/versions.yml');
  const original = await readFile(file, 'utf8');
  await writeFile(file, original.replace('status: exact-evidence, package: "@letta-ai/letta-agent-sdk", version: 0.8.3, integrity: sha512-sdk, source_commit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, source_ids:', 'status: exact-evidence, package: "@letta-ai/letta-agent-sdk", version: 0.8.3, integrity: sha512-sdk, source_commit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, relations: [declares VER-MISSING-RUNTIME], source_ids:'));
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'COMPATIBILITY' && /does not resolve/.test(error.message)), true);
  assert.equal(errors.some(error => error.code === 'COMPATIBILITY' && /must point exactly/.test(error.message)), true);
});

test('expected exact compatibility lanes are mandatory', async () => {
  const root = await fixture();
  const file = path.join(root, 'compatibility/versions.yml');
  const original = await readFile(file, 'utf8');
  await writeFile(file, original.replace('VER-STANDALONE-0-32-2', 'VER-REMOVED-STANDALONE'));
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'COMPATIBILITY' && /expected exactly one current exact lane VER-STANDALONE-/.test(error.message)), true);
});

test('cross-file reference IDs fail closed when malformed', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'sources/claims.yml'), 'claims:\n  - {id: CLM-X, evidence_ids: [not-an-id], source_ids: []}\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'REFERENCE' && /malformed ID reference not-an-id/.test(error.message)), true);
});

test('compatibility claims must cite a matching evidence source', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'sources/claims.yml'), 'claims:\n  - {id: LMB-MISMATCH-001, owner: sources/claims.yml, evidence_ids: [SRC-B-NPM], discrepancy_ids: [], verified_at: 2026-09-11, freshness: fast}\n');
  await writeFile(path.join(root, 'compatibility/features.yml'), 'entries:\n  - {id: FEAT-MISMATCH, source_ids: [SRC-SDK-NPM], claim_ids: [LMB-MISMATCH-001], surface_ids: [], version_ids: []}\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'COMPATIBILITY' && /no matching evidence source/.test(error.message)), true);
});

test('authoritative contracts reject obsolete application-target drift', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'README.md'), 'The mandatory teaching specimen is Project Desk.\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'TARGET_DRIFT' && error.file === 'README.md'), true);
});

test('autonomous-agent target contract rejects structural redesign drift', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'curriculum.yml'), 'curriculum_id: letta-master-builder\ncurriculum_version: 0.2.0\ntarget_contract:\n  outcome: general-application-builder\nrepository_stage: scaffold\ncompletion:\n  enabled: false\nmodules: []\nelective_tracks: []\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'TARGET_CONTRACT'), true);
});

test('pointer target types cannot redirect a reader into executable material', async () => {
  const root = await fixture();
  await mkdir(path.join(root, 'pointers'));
  await mkdir(path.join(root, 'scripts'));
  await writeFile(path.join(root, 'scripts/validate.mjs'), 'console.log("not reader material");\n');
  await writeFile(path.join(root, 'pointers/registry.yml'), 'execution_allowed: false\npointers:\n  - {id: PTR-BAD-001, target_type: control-contract, target: scripts/validate.mjs, prerequisites: []}\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'POINTER' && /execution-oriented/.test(error.message)), true);
});

test('master_builder_ready cannot be awarded by an unavailable scaffold', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'terminal-contract.yml'), 'allowed_states:\n  - state: CURRICULUM_UNAVAILABLE\n    curriculum_complete: false\n    master_builder_ready: true\nforbidden_automatic_actions: [inspect-environment, install-dependencies, run-commands-or-tests, use-credentials, make-network-calls, call-letta-api-or-model, create-or-modify-agents, execute-canaries, deploy, write-progress-ledger]\n');
  const errors = await validateRepository(root);
  assert.equal(errors.some(error => error.code === 'TERMINAL'), true);
});
