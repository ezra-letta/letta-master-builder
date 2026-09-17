#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const INNER_GATES = Object.freeze([
  [npm, ['test']],
  [process.execPath, ['--test', '.security/audit-exceptions.test.mjs']],
  [npm, ['run', 'sdk-exports:check']],
  [npm, ['run', 'vertical-slice:check']],
  [npm, ['run', 'drift:check']],
  [npm, ['run', 'validate']],
  [npm, ['run', 'modules:check']],
  [npm, ['run', 'practicum:check']],
  [npm, ['run', 'practicum:types']],
  [npm, ['run', 'formative:check']],
  [npm, ['run', 'cold-reader:check']],
  [npm, ['run', 'lock:check']],
  [npm, ['run', 'integrity:check']],
]);

function run(command, args) {
  console.log(`release-check: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', env: process.env });
  if (result.error) throw new Error(`${command} could not start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed${result.signal ? ` with signal ${result.signal}` : ` with exit code ${result.status}`}`);
}

export function checkReleaseCandidate({ includeCleanCopy = true } = {}) {
  for (const [command, args] of INNER_GATES) run(command, args);
  if (includeCleanCopy) run(npm, ['run', 'clean-copy:check']);
}

export function main(args = process.argv.slice(2)) {
  if (args.length > 1 || args.some(arg => arg !== '--inner')) {
    console.error('usage: node scripts/check-release-candidate.mjs [--inner]');
    return 2;
  }
  try {
    checkReleaseCandidate({ includeCleanCopy: !args.includes('--inner') });
    console.log(`release-candidate check passed${args.includes('--inner') ? ' (inner gates)' : ''}`);
    return 0;
  } catch (error) {
    console.error(`release-candidate check failed: ${error.message}`);
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) process.exitCode = main();
