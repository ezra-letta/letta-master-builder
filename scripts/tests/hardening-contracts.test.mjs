import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { copyRepository } from '../check-clean-copy.mjs';
import { validateRepository } from '../lib/validate-repository.mjs';
import { INNER_GATES } from '../check-release-candidate.mjs';
import { checkColdReader } from '../check-cold-reader.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

async function mutableCopy() {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'lmb-hardening-'));
  const repository = path.join(temporary, 'repository');
  await copyRepository(ROOT, repository);
  return { temporary, repository };
}

async function mutate(relative, replacement) {
  const copy = await mutableCopy();
  const file = path.join(copy.repository, relative);
  await writeFile(file, replacement(await readFile(file, 'utf8')));
  return copy;
}

async function expectSchemaFailure(relative, replacement) {
  const { temporary, repository } = await mutate(relative, replacement);
  try {
    const errors = await validateRepository(repository);
    assert.equal(errors.some((error) => error.code === 'SCHEMA' && error.file === relative), true, JSON.stringify(errors));
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

test('drift rehearsal version tuples reject missing, extra, and non-semver fields', async (t) => {
  await t.test('missing exact tuple field', () => expectSchemaFailure(
    'maintenance/drift-rehearsal.yml',
    (text) => text.replace('from: {agent_sdk: 0.8.6, sdk_declared_runtime: 0.32.8, standalone_runtime: 0.32.8}', 'from: {agent_sdk: 0.8.6, sdk_declared_runtime: 0.32.8}'),
  ));
  await t.test('extra tuple field', () => expectSchemaFailure(
    'maintenance/drift-rehearsal.yml',
    (text) => text.replace('to: {agent_sdk: 0.8.9, sdk_declared_runtime: 0.32.11, standalone_runtime: 0.32.11}', 'to: {agent_sdk: 0.8.9, sdk_declared_runtime: 0.32.11, standalone_runtime: 0.32.11, hosted_runtime: 0.32.11}'),
  ));
  await t.test('non-semver tuple value', () => expectSchemaFailure(
    'maintenance/drift-rehearsal.yml',
    (text) => text.replace('agent_sdk: 0.8.6', 'agent_sdk: v0.8.6'),
  ));
});

test('drift rehearsal affected capabilities must resolve', async () => {
  const { temporary, repository } = await mutate(
    'maintenance/drift-rehearsal.yml',
    (text) => text.replace('CAP-QUEUES-ENQUEUE', 'CAP-NOT-IN-REGISTRY'),
  );
  try {
    const errors = await validateRepository(repository);
    assert.equal(errors.some((error) => error.code === 'DRIFT_REHEARSAL' && /CAP-NOT-IN-REGISTRY/.test(error.message)), true, JSON.stringify(errors));
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('lock target contract rejects undeclared properties', async () => {
  await expectSchemaFailure(
    'curriculum.lock.yml',
    (text) => text.replace('  teaching_mode: read-only', '  teaching_mode: read-only\n  undeclared_mode: forbidden'),
  );
});

test('offline CI and clean-copy use one canonical release gate inventory', async () => {
  const packageJson = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const ci = await readFile(path.join(ROOT, '.github/workflows/ci.yml'), 'utf8');
  const cleanCopy = await readFile(path.join(ROOT, 'scripts/check-clean-copy.mjs'), 'utf8');
  assert.equal(packageJson.scripts['release:check'], 'node scripts/check-release-candidate.mjs');
  assert.equal(packageJson.scripts['release:inner'], 'node scripts/check-release-candidate.mjs --inner');
  assert.match(ci, /npm run release:check/);
  assert.match(cleanCopy, /\['run', 'release:inner'\]/);
  const rendered = INNER_GATES.map(([, args]) => args.join(' '));
  for (const expected of ['test', '--test .security/audit-exceptions.test.mjs', 'run validate', 'run practicum:check', 'run formative:check', 'run lock:check', 'run integrity:check']) {
    assert.equal(rendered.includes(expected), true, `missing canonical gate: ${expected}`);
  }
});

test('cold reader rejects separated formative and practicum bundles', async () => {
  for (const [left, right, expected] of [
    ['  - modules/MOD-00.md\n  - assessments/formative/MOD-00.md', '  - assessments/formative/MOD-00.md\n  - modules/MOD-00.md', /MOD-00 required files must be contiguous/],
    ['  - practicum/specs/01/input.json\n  - practicum/specs/01/contracts.d.ts', '  - practicum/specs/01/contracts.d.ts\n  - practicum/specs/01/input.json', /SCN-PROVISIONING reader bundle/],
  ]) {
    const { temporary, repository } = await mutate('curriculum.yml', (text) => {
      const index = text.lastIndexOf(left);
      assert.notEqual(index, -1);
      return `${text.slice(0, index)}${right}${text.slice(index + left.length)}`;
    });
    try {
      const result = await checkColdReader(repository);
      assert.equal(result.ok, false);
      assert.match(result.errors.join('\n'), expected);
    } finally { await rm(temporary, { recursive: true, force: true }); }
  }
});

test('observed upstream drift evidence is pinned to its reviewed package tuple', async () => {
  for (const [from, to] of [
    ['version: 0.8.11', 'version: 0.8.12'],
    ['reviewed_at: 2026-09-17', 'reviewed_at: 2026-09-18'],
    ['source_commit: 69254ef0a20975a2d7d68464285c752ac55614c3', 'source_commit: 0000000000000000000000000000000000000000'],
  ]) {
    const { temporary, repository } = await mutate('maintenance/upstream-drift-review.yml', text => text.replace(from, to));
    try {
      const errors = await validateRepository(repository);
      assert.equal(errors.some(error => error.code === 'SCHEMA' && error.file === 'maintenance/upstream-drift-review.yml'), true, JSON.stringify(errors));
    } finally { await rm(temporary, { recursive: true, force: true }); }
  }
});
