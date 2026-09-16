import { mkdir, mkdtemp, open, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { bytes, canonicalRoot, inside, inventory } from './lib/core.mjs';

const SAFE_ENV_KEYS = new Set([
  'PATH', 'HOME', 'TMPDIR', 'TMP', 'TEMP', 'CI', 'LANG', 'LC_ALL', 'NO_COLOR', 'FORCE_COLOR',
  'SystemRoot', 'ComSpec', 'PATHEXT', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA'
]);

export function cleanEnvironment(source = process.env, npmConfigs = {}) {
  const environment = {};
  for (const [key, value] of Object.entries(source)) if (SAFE_ENV_KEYS.has(key) && typeof value === 'string') environment[key] = value;
  environment.npm_config_update_notifier = 'false';
  if (npmConfigs.user) environment.NPM_CONFIG_USERCONFIG = npmConfigs.user;
  if (npmConfigs.global) environment.NPM_CONFIG_GLOBALCONFIG = npmConfigs.global;
  return environment;
}

export async function copyRepository(source, destination) {
  source = await canonicalRoot(source);
  destination = path.resolve(destination);
  const destinationParent = await realpath(path.dirname(destination));
  destination = path.join(destinationParent, path.basename(destination));
  if (inside(source, destination)) throw new Error('clean-copy destination must be outside the source repository');
  await mkdir(destination, { recursive: false });
  for (const file of await inventory(source)) {
    const output = path.join(destination, file.path);
    await mkdir(path.dirname(output), { recursive: true });
    const writer = await open(output, 'wx', file.mode & 0o777);
    try { await writer.writeFile(await bytes(file.absolute)); }
    finally { await writer.close(); }
  }
}

export function runCommand(command, args, cwd, environment = cleanEnvironment()) {
  return new Promise((resolve, reject) => {
    console.log(`clean-copy: running ${command} ${args.join(' ')}`);
    const child = spawn(command, args, { cwd, stdio: 'inherit', env: environment });
    child.on('error', error => reject(new Error(`${command} could not start: ${error.message}`)));
    child.on('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}`)));
  });
}

export async function checkCleanCopy(source) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'lmb-clean-copy-'));
  const copy = path.join(temporary, 'repository');
  const npmConfigs = { user: path.join(temporary, 'empty-user.npmrc'), global: path.join(temporary, 'empty-global.npmrc') };
  try {
    await Promise.all(Object.values(npmConfigs).map(file => writeFile(file, '', { mode: 0o600 })));
    const environment = cleanEnvironment(process.env, npmConfigs);
    await copyRepository(source, copy);
    await runCommand('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], copy, environment);
    await runCommand('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--prefix', 'vertical-slice'], copy, environment);
    await runCommand('npm', ['test'], copy, environment);
    await runCommand('npm', ['run', 'sdk-exports:check'], copy, environment);
    await runCommand('npm', ['run', 'vertical-slice:check'], copy, environment);
    await runCommand('npm', ['run', 'drift:check'], copy, environment);
    await runCommand(process.execPath, ['--test', '.security/audit-exceptions.test.mjs'], copy, environment);
    await runCommand('npm', ['run', 'validate'], copy, environment);
    await runCommand('npm', ['run', 'modules:check'], copy, environment);
    await runCommand('npm', ['run', 'practicum:check'], copy, environment);
    await runCommand('npm', ['run', 'practicum:types'], copy, environment);
    await runCommand('npm', ['run', 'formative:check'], copy, environment);
    await runCommand('npm', ['run', 'cold-reader:check'], copy, environment);
    await runCommand('npm', ['run', 'lock:check'], copy, environment);
    await runCommand('npm', ['run', 'integrity:check'], copy, environment);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

export async function main(args = process.argv.slice(2)) {
  if (args.length > 1 || args.some(arg => arg.startsWith('-'))) {
    console.error('usage: node scripts/check-clean-copy.mjs [repository-root]');
    return 2;
  }
  try {
    const source = path.resolve(args[0] || new URL('..', import.meta.url).pathname);
    await checkCleanCopy(source);
    console.log('clean-copy check passed');
    return 0;
  } catch (error) {
    console.error(`clean-copy check failed: ${error.message}`);
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) process.exitCode = await main();
