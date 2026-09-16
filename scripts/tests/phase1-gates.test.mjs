import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkColdReader } from '../check-cold-reader.mjs';
import { cleanEnvironment, copyRepository } from '../check-clean-copy.mjs';

async function fixture(overrides = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'lmb-phase1-'));
  const files = {
    'curriculum.yml': `entrypoint: START.md\noperating_contract: AGENTS.md\nterminal_contract: terminal.yml\nreader_sequence: [START.md, AGENTS.md]\ncontrol_files: [START.md, AGENTS.md, terminal.yml]\nrepository_stage: scaffold\ncompletion: {enabled: false}\nmodules:\n  - {id: MOD-00, status: planned, required_files: []}\nterminal_transition: CURRICULUM_UNAVAILABLE\n`,
    'START.md': 'start',
    'AGENTS.md': 'agents',
    'terminal.yml': `repository_stage: scaffold\nallowed_states:\n  - {state: CURRICULUM_UNAVAILABLE, curriculum_complete: false, knowledge_ready: false, runtime_validated: false, production_qualified: false}\n`,
    ...overrides
  };
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  return root;
}

test('cold reader deterministically follows only reader_sequence from entrypoint', async () => {
  const root = await fixture({ 'UNDECLARED_SECRET.md': 'must not be read' });
  const result = await checkColdReader(root);
  assert.equal(result.ok, true);
  assert.deepEqual(result.traversed, ['START.md', 'AGENTS.md']);
});

test('cold reader rejects wrong entrypoint, duplicates, undeclared, missing, and unsafe items', async () => {
  for (const sequence of ['[AGENTS.md]', '[START.md, START.md]', '[START.md, hidden.md]', '[START.md, missing.md]', '[START.md, ../escape]']) {
    const root = await fixture({ 'curriculum.yml': `entrypoint: START.md\noperating_contract: AGENTS.md\nterminal_contract: terminal.yml\nreader_sequence: ${sequence}\ncontrol_files: [START.md, AGENTS.md, missing.md, terminal.yml]\nrepository_stage: scaffold\ncompletion: {enabled: false}\nmodules: []\nterminal_transition: CURRICULUM_UNAVAILABLE\n`, 'hidden.md': 'declared' });
    assert.equal((await checkColdReader(root)).ok, false, sequence);
  }
});

test('cold reader rejects symlinked sequence files without following them', async () => {
  const root = await fixture();
  await symlink('START.md', path.join(root, 'LINK.md'));
  const manifest = await readFile(path.join(root, 'curriculum.yml'), 'utf8');
  await writeFile(path.join(root, 'curriculum.yml'), manifest.replace('[START.md, AGENTS.md]', '[START.md, LINK.md]').replace('[START.md, AGENTS.md, terminal.yml]', '[START.md, AGENTS.md, LINK.md, terminal.yml]'));
  assert.equal((await checkColdReader(root)).ok, false);
});

test('cold reader rejects completion, non-planned modules, and terminal awards/states', async () => {
  const cases = [
    { 'curriculum.yml': `entrypoint: START.md\nterminal_contract: terminal.yml\nreader_sequence: [START.md]\ncontrol_files: [START.md, terminal.yml]\nrepository_stage: scaffold\ncompletion: {enabled: true}\nmodules: []\nterminal_transition: CURRICULUM_UNAVAILABLE\n` },
    { 'curriculum.yml': `entrypoint: START.md\nterminal_contract: terminal.yml\nreader_sequence: [START.md]\ncontrol_files: [START.md, terminal.yml]\nrepository_stage: scaffold\ncompletion: {enabled: false}\nmodules: [{id: MOD-00, status: complete, required_files: [START.md]}]\nterminal_transition: CURRICULUM_UNAVAILABLE\n` },
    { 'terminal.yml': 'repository_stage: scaffold\nallowed_states: [{state: CURRICULUM_UNAVAILABLE, runtime_validated: true}]\n' },
    { 'terminal.yml': 'repository_stage: scaffold\nallowed_states: [CURRICULUM_UNAVAILABLE, CURRICULUM_COMPLETE]\n' }
  ];
  for (const mutation of cases) assert.equal((await checkColdReader(await fixture(mutation))).ok, false);
});

test('clean-copy copier excludes top-level recursion sources and refuses symlinks', async () => {
  const root = await fixture();
  await mkdir(path.join(root, '.git'));
  await mkdir(path.join(root, 'node_modules'));
  await writeFile(path.join(root, '.git/ignored'), 'x');
  await writeFile(path.join(root, 'node_modules/ignored'), 'x');
  const destinationBase = await mkdtemp(path.join(os.tmpdir(), 'lmb-phase1-copy-'));
  const destination = path.join(destinationBase, 'repository');
  await copyRepository(root, destination);
  await assert.rejects(readFile(path.join(destination, '.git/ignored')));
  await assert.rejects(readFile(path.join(destination, 'node_modules/ignored')));
  await symlink('START.md', path.join(root, 'alias'));
  await assert.rejects(copyRepository(root, path.join(destination, 'second')), /symbolic link|unsupported filesystem entry/);
});

test('clean-copy copier rejects source-root symlinks and in-tree destinations', async () => {
  const root = await fixture();
  const parent = await mkdtemp(path.join(os.tmpdir(), 'lmb-phase1-root-link-'));
  const linkedRoot = path.join(parent, 'linked-root');
  await symlink(root, linkedRoot);
  await assert.rejects(copyRepository(linkedRoot, path.join(parent, 'copy')), /repository root must be a real directory/);
  await assert.rejects(copyRepository(root, path.join(root, 'nested-copy')), /destination must be outside/);
});

test('clean-copy child environment strips credentials and provider configuration', () => {
  const environment = cleanEnvironment({ PATH: '/bin', HOME: '/tmp/home', LETTA_API_KEY: 'secret', NPM_TOKEN: 'secret', HTTPS_PROXY: 'http://user:pass@example.test' }, { user: '/tmp/empty-user.npmrc', global: '/tmp/empty-global.npmrc' });
  assert.deepEqual(environment, {
    PATH: '/bin', HOME: '/tmp/home', npm_config_update_notifier: 'false',
    NPM_CONFIG_USERCONFIG: '/tmp/empty-user.npmrc', NPM_CONFIG_GLOBALCONFIG: '/tmp/empty-global.npmrc'
  });
});
