import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';
import { inventory } from '../lib/core.mjs';
import { validateRepository } from '../lib/validate-repository.mjs';
import { copyRepository } from '../check-clean-copy.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const readYaml = async (relative) => YAML.parse(await readFile(path.join(ROOT, relative), 'utf8'));

test('Revision 0.4 freezes fourteen ready modules and independent unassessed status axes', async () => {
  const curriculum = await readYaml('curriculum.yml');
  const terminal = await readYaml('terminal-contract.yml');
  assert.equal(curriculum.design_revision, '0.4');
  assert.equal(curriculum.curriculum_version, '0.4.0');
  assert.equal(curriculum.repository_stage, 'release-candidate');
  assert.deepEqual(curriculum.mandatory_modules.map((module) => module.id), Array.from({ length: 14 }, (_, index) => `MOD-${String(index).padStart(2, '0')}`));
  assert.equal(curriculum.mandatory_modules.every((module) => module.status === 'ready' && module.required_files.length === 1), true);
  assert.deepEqual(terminal.allowed_states.map((entry) => entry.state), ['ASSESSMENT_REQUIRED']);
  assert.equal(Object.values(terminal.security_invariants).every((value) => value === false), true);
  assert.equal(terminal.status_axes.runtime, 'not-tested');
  assert.equal(terminal.status_axes.production, 'not-qualified');
});

test('Revision 0.4 maps exact package evidence through capability and release ledgers', async () => {
  const capabilities = await readYaml('capabilities/core.yml');
  const adjacent = await readYaml('capabilities/adjacent.yml');
  const exports = await readYaml('capabilities/sdk-exports.yml');
  const release = await readYaml('release/manifest.yml');
  assert.equal(capabilities.capabilities.length, 26);
  assert.equal(adjacent.entries.length, 18);
  assert.deepEqual(exports.generated_from, ['.', './client']);
  assert.equal(exports.version, '0.8.9');
  assert.equal(exports.entries.some((entry) => entry.entrypoint === '.' && entry.symbol === 'LettaAgentClient' && entry.disposition === 'claim-bearing'), true);
  assert.equal(exports.entries.some((entry) => entry.entrypoint === './client' && entry.symbol === 'LettaAgentClient' && entry.disposition === 'claim-bearing'), true);
  const provisioning = capabilities.capabilities.find((item) => item.id === 'CAP-AGENT-MANAGEMENT');
  assert.equal(provisioning.claim_bearing, true);
  assert.deepEqual(provisioning.practicum_ids, ['FIX-PROVISIONING-PARTIAL-SUCCESS', 'SCN-PROVISIONING']);
  assert.deepEqual(release.package_tuple, {
    agent_sdk: 'VER-AGENT-SDK-0-8-9',
    sdk_declared_runtime: 'VER-SDK-DECLARED-RUNTIME-0-32-11',
    standalone_runtime: 'VER-STANDALONE-0-32-11',
  });
  assert.equal(release.runtime_validation, 'not-performed');
  assert.equal(release.curriculum_version, '0.4.0');
});

test('release candidate state is cross-validated against the curriculum', async () => {
  const { temporary, repository } = await mutableCopy();
  try {
    const file = path.join(repository, 'release', 'manifest.yml');
    const original = await readFile(file, 'utf8');
    await writeFile(file, original.replace('curriculum_version: 0.4.0', 'curriculum_version: 9.9.9'));
    const errors = await validateRepository(repository);
    assert.equal(errors.some((error) => error.code === 'RELEASE_STATE'), true);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('JSON schema metadata rejects duplicate keys', async () => {
  const { temporary, repository } = await mutableCopy();
  try {
    const file = path.join(repository, 'schemas', 'misconceptions.schema.json');
    const original = await readFile(file, 'utf8');
    await writeFile(file, original.replace('"x-target": "assessments/misconceptions.yml",', '"x-target": "assessments/misconceptions.yml",\n  "x-target": "assessments/misconceptions.yml",'));
    const errors = await validateRepository(repository);
    assert.equal(errors.some((error) => error.code === 'SCHEMA' && error.file === 'schemas/misconceptions.schema.json'), true);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

async function mutableCopy() {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'lmb-revision04-'));
  const repository = path.join(temporary, 'repository');
  await copyRepository(ROOT, repository);
  return { temporary, repository };
}

test('mixed package tuple state fails closed', async () => {
  const { temporary, repository } = await mutableCopy();
  try {
    const file = path.join(repository, 'release', 'manifest.yml');
    const original = await readFile(file, 'utf8');
    await writeFile(file, original.replace('VER-AGENT-SDK-0-8-9', 'VER-AGENT-SDK-0-8-8'));
    const errors = await validateRepository(repository);
    assert.equal(errors.some((error) => error.code === 'RELEASE_TUPLE'), true);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('runtime status cannot advance while runtime claim registry is empty', async () => {
  const { temporary, repository } = await mutableCopy();
  try {
    const file = path.join(repository, 'terminal-contract.yml');
    const original = await readFile(file, 'utf8');
    await writeFile(file, original.replace('runtime: not-tested', 'runtime: observed'));
    const errors = await validateRepository(repository);
    assert.equal(errors.some((error) => error.code === 'RUNTIME_CLAIM'), true);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('unassessed release-candidate learner and production axes cannot advance independently', async () => {
  const { temporary, repository } = await mutableCopy();
  try {
    const file = path.join(repository, 'terminal-contract.yml');
    let text = await readFile(file, 'utf8');
    text = text
      .replace('learning: not-started', 'learning: passed')
      .replace('architecture: not-assessed', 'architecture: passed')
      .replace('implementation: not-assessed', 'implementation: passed')
      .replace('transfer: not-assessed', 'transfer: passed')
      .replace('assessment_integrity: unverified', 'assessment_integrity: verified')
      .replace('production: not-qualified', 'production: qualified')
      .replace('production_qualified: false', 'production_qualified: true');
    await writeFile(file, text);
    const errors = await validateRepository(repository);
    assert.equal(errors.some((error) => error.code === 'STATUS_AXIS'), true);
    assert.equal(errors.some((error) => error.code === 'TERMINAL'), true);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('inventory ignores nested dependency trees without weakening other symlink rejection', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'lmb-nested-deps-'));
  try {
    await mkdir(path.join(root, 'slice', 'node_modules', '.bin'), { recursive: true });
    await writeFile(path.join(root, 'kept.txt'), 'kept');
    await symlink('../tool/index.js', path.join(root, 'slice', 'node_modules', '.bin', 'tool'));
    assert.deepEqual((await inventory(root)).map((file) => file.path), ['kept.txt']);
  } finally { await rm(root, { recursive: true, force: true }); }
});
