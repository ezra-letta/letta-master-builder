import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { canonicalRoot, readText, readYaml, safeFile, safePath } from './lib/core.mjs';

const AWARD_FIELDS = ['curriculum_complete', 'knowledge_ready', 'master_builder_ready', 'runtime_validated', 'production_qualified', 'completion_awarded', 'readiness_awarded', 'completion', 'readiness'];

function enabled(value) {
  if (value === true) return true;
  if (value && typeof value === 'object') return value.enabled === true || enabled(value.status);
  return /^(?:CURRICULUM_COMPLETE|KNOWLEDGE_READY(?:_CANDIDATE|_VERIFIED)?|RUNTIME_VALIDATED|PRODUCTION_QUALIFIED|COMPLETE|READY|VALIDATED|QUALIFIED)$/i.test(String(value ?? ''));
}

function stateName(item) { return typeof item === 'string' ? item : item?.state; }

export async function checkColdReader(root) {
  root = await canonicalRoot(root);
  const errors = [];
  const fail = message => errors.push(message);
  let curriculum;
  try { curriculum = await readYaml(root, 'curriculum.yml'); }
  catch (error) { return { ok: false, errors: [error.message], traversed: [] }; }

  const modules = Array.isArray(curriculum.mandatory_modules) ? curriculum.mandatory_modules : curriculum.modules;
  const declared = new Set([
    curriculum.entrypoint,
    curriculum.operating_contract,
    curriculum.design_spec,
    curriculum.terminal_contract,
    ...(Array.isArray(curriculum.control_files) ? curriculum.control_files : []),
    ...(Array.isArray(modules) ? modules.flatMap(module => Array.isArray(module?.required_files) ? module.required_files : []) : [])
  ].filter(value => typeof value === 'string'));
  const sequence = curriculum.reader_sequence;
  const traversed = [];

  if (!safePath(curriculum.entrypoint)) fail('curriculum.yml entrypoint must be a safe repository-relative file');
  if (!Array.isArray(sequence) || sequence.length === 0) fail('curriculum.yml reader_sequence must be a nonempty array');
  else {
    if (sequence[0] !== curriculum.entrypoint) fail('reader_sequence must begin with curriculum.yml entrypoint');
    const seen = new Set();
    for (const [index, item] of sequence.entries()) {
      if (!safePath(item)) { fail(`reader_sequence[${index}] must be a safe repository-relative file`); continue; }
      if (seen.has(item)) fail(`reader_sequence contains duplicate item: ${item}`);
      seen.add(item);
      if (!declared.has(item)) fail(`reader_sequence item is not manifest-declared: ${item}`);
      try { await safeFile(root, item); await readText(root, item); traversed.push(item); }
      catch (error) { fail(`reader_sequence item is unavailable: ${item} (${error.message})`); }
    }
  }

  const preContent = ['pre-content', 'scaffold'].includes(curriculum.repository_stage);
  const releasableContent = ['release-candidate', 'published'].includes(curriculum.repository_stage);
  if (!preContent && !releasableContent) fail('repository_stage must be pre-content, release-candidate, or published');
  if (preContent && enabled(curriculum.target_contract?.completion ?? curriculum.completion)) fail('pre-content completion must remain disabled');
  if (releasableContent && !enabled(curriculum.target_contract?.completion ?? curriculum.completion)) fail('release-candidate or published content must declare completion');
  if (!Array.isArray(modules)) fail('curriculum mandatory modules must be an array');
  else for (const module of modules) {
    if (preContent && module?.status !== 'planned') fail(`pre-content module must remain planned: ${module?.id ?? 'unknown'}`);
    if (preContent && (!Array.isArray(module?.required_files) || module.required_files.length !== 0)) fail(`pre-content module must not expose required files: ${module?.id ?? 'unknown'}`);
    if (releasableContent && module?.status !== 'ready') fail(`release-candidate module must be ready: ${module?.id ?? 'unknown'}`);
    if (releasableContent && (!Array.isArray(module?.required_files) || module.required_files.length < 1)) fail(`release-candidate module must expose required files: ${module?.id ?? 'unknown'}`);
  }

  if (!safePath(curriculum.terminal_contract)) fail('terminal_contract must be a safe repository-relative file');
  else try {
    const terminal = await readYaml(root, curriculum.terminal_contract);
    if (terminal.repository_stage !== curriculum.repository_stage) fail('terminal contract repository_stage must match curriculum stage');
    const states = terminal.allowed_states;
    const expectedState = preContent ? 'CURRICULUM_UNAVAILABLE' : 'ASSESSMENT_REQUIRED';
    if (!Array.isArray(states) || states.length !== 1 || stateName(states[0]) !== expectedState) fail(`terminal contract must allow only ${expectedState}`);
    for (const state of Array.isArray(states) ? states : []) {
      if (state && typeof state === 'object') for (const field of AWARD_FIELDS) if (enabled(state[field])) fail(`terminal contract must not award ${field}`);
    }
    if (curriculum.repository_stage === 'pre-content') {
      const expectedAxes = { content: 'unavailable', learning: 'not-started', architecture: 'not-assessed', implementation: 'not-assessed', transfer: 'not-assessed', assessment_integrity: 'unverified', runtime: 'not-tested', production: 'not-qualified' };
      for (const [axis, expected] of Object.entries(expectedAxes)) if (terminal.status_axes?.[axis] !== expected) fail(`terminal pre-content axis ${axis} must remain ${expected}`);
    }
    if (releasableContent) {
      const expectedAxes = { content: 'complete', learning: 'not-started', architecture: 'not-assessed', implementation: 'not-assessed', transfer: 'not-assessed', assessment_integrity: 'unverified', runtime: 'not-tested', production: 'not-qualified' };
      for (const [axis, expected] of Object.entries(expectedAxes)) if (terminal.status_axes?.[axis] !== expected) fail(`terminal release-candidate axis ${axis} must remain ${expected}`);
    }
  } catch (error) { fail(`terminal contract is unavailable (${error.message})`); }

  return { ok: errors.length === 0, errors, traversed };
}

export async function main(args = process.argv.slice(2)) {
  if (args.length > 1 || args.some(arg => arg.startsWith('-'))) {
    console.error('usage: node scripts/check-cold-reader.mjs [repository-root]');
    return 2;
  }
  try {
    const root = path.resolve(args[0] || new URL('..', import.meta.url).pathname);
    const result = await checkColdReader(root);
    if (!result.ok) {
      for (const error of result.errors) console.error(`cold-reader violation: ${error}`);
      return 1;
    }
    const curriculum = await readYaml(await canonicalRoot(root), 'curriculum.yml');
    const terminalState = ['pre-content', 'scaffold'].includes(curriculum.repository_stage) ? 'CURRICULUM_UNAVAILABLE' : 'ASSESSMENT_REQUIRED';
    console.log(`cold-reader check passed (${result.traversed.length} reader_sequence files, terminal ${terminalState})`);
    return 0;
  } catch (error) {
    console.error(`cold-reader check failed: ${error.message}`);
    return 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) process.exitCode = await main();
