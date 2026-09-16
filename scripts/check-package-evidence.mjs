import fs from 'node:fs/promises';
import YAML from 'yaml';
import { requestUrl, PolicyError, TransientError, EXIT_INVALID, EXIT_TRANSIENT } from './check-external-links.mjs';

const VERSION_LANES = Object.freeze([
  { prefix: 'VER-AGENT-SDK-', name: 'Agent SDK' },
  { prefix: 'VER-SDK-DECLARED-RUNTIME-', name: 'SDK-declared runtime dependency' },
  { prefix: 'VER-STANDALONE-', name: 'Standalone runtime' },
]);
const VERSIONS_URL = new URL('../compatibility/versions.yml', import.meta.url);

function repositorySlug(value) {
  let url;
  try { url = new URL(value); } catch { throw new PolicyError(`invalid source repository URL: ${value}`); }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.search || url.hash || url.username || url.password)
    throw new PolicyError(`source repository must be a plain GitHub HTTPS URL: ${value}`);
  const parts = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_.-]+$/.test(part))) throw new PolicyError(`invalid GitHub repository path: ${value}`);
  return parts.join('/');
}
export function deriveEvidence(document) {
  if (!document || document.kind !== 'versions' || !Array.isArray(document.entries)) throw new PolicyError('compatibility versions must contain a versions entries array');
  return VERSION_LANES.map(({ prefix, name }) => {
    const matches = document.entries.filter((entry) => entry?.id?.startsWith(prefix) && entry.status === 'exact-evidence');
    if (matches.length !== 1) throw new PolicyError(`${prefix}: expected exactly one exact evidence record`);
    const entry = matches[0];
    const id = entry.id;
    const version = String(entry.version ?? '');
    if (!entry.package || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) throw new PolicyError(`${id}: invalid package/version`);
    if (!/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(entry.integrity ?? '')) throw new PolicyError(`${id}: invalid SHA-512 integrity`);
    if (!/^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(entry.source_tag ?? '')) throw new PolicyError(`${id}: invalid source tag`);
    if (!/^[0-9a-f]{40}$/.test(entry.source_commit ?? '')) throw new PolicyError(`${id}: invalid source commit`);
    return Object.freeze({ name, package: entry.package, version, integrity: entry.integrity, repository: repositorySlug(entry.source_repository), tag: entry.source_tag, commit: entry.source_commit });
  });
}
export async function loadEvidence(file = VERSIONS_URL, readFile = fs.readFile) {
  let text;
  try { text = await readFile(file, 'utf8'); } catch (error) { throw new PolicyError(`cannot read compatibility versions: ${error.message}`); }
  let document;
  try {
    const parsed = YAML.parseDocument(text, { uniqueKeys: true, strict: true });
    if (parsed.errors.length) throw parsed.errors[0];
    document = parsed.toJS({ maxAliasCount: 50 });
  } catch (error) { throw new PolicyError(`malformed compatibility versions YAML: ${error.message}`); }
  return Object.freeze(deriveEvidence(document));
}
export const EVIDENCE = await loadEvidence();

const encodePackage = (name) => encodeURIComponent(name);
async function fetchJson(url, options = {}) {
  const response = await requestUrl(url, { ...options, method: 'GET', headers: { accept: 'application/json', ...options.headers } });
  try { return JSON.parse(response.body.toString('utf8')); }
  catch (error) { throw new PolicyError(`invalid JSON from ${url}: ${error.message}`); }
}
export async function checkPackageEvidence(item, options = {}) {
  const npmUrl = `https://registry.npmjs.org/${encodePackage(item.package)}/${item.version}`;
  const metadata = await fetchJson(npmUrl, options);
  if (metadata.version !== item.version) throw new PolicyError(`${item.name}: npm version mismatch`);
  const integrity = metadata.dist?.integrity;
  if (!integrity?.startsWith('sha512-')) throw new PolicyError(`${item.name}: missing SHA-512 npm integrity`);
  if (integrity !== item.integrity) throw new PolicyError(`${item.name}: npm integrity mismatch`);

  const tagUrl = `https://api.github.com/repos/${item.repository}/git/ref/tags/${encodeURIComponent(item.tag)}`;
  const ref = await fetchJson(tagUrl, options);
  let commit = ref.object?.sha;
  if (ref.object?.type === 'tag') {
    const tag = await fetchJson(`https://api.github.com/repos/${item.repository}/git/tags/${commit}`, options);
    commit = tag.object?.sha;
  }
  if (!/^[0-9a-f]{40}$/.test(commit ?? '')) throw new PolicyError(`${item.name}: GitHub tag did not resolve to a commit`);
  if (commit !== item.commit) throw new PolicyError(`${item.name}: GitHub tag commit mismatch`);
  return { ...item, integrity, commit };
}

async function main() {
  let transient = false;
  for (const item of EVIDENCE) {
    try {
      const result = await checkPackageEvidence(item);
      console.log(`ok ${result.name} npm=${result.version} integrity=${result.integrity} tag=${result.tag} commit=${result.commit}`);
    } catch (error) {
      console.error(`${error instanceof TransientError ? 'transient' : 'invalid'}: ${error.message}`);
      if (error instanceof TransientError) transient = true; else process.exitCode = EXIT_INVALID;
    }
  }
  if (!process.exitCode && transient) process.exitCode = EXIT_TRANSIENT;
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch((error) => {
  console.error(`invalid: ${error.message}`); process.exitCode = EXIT_INVALID;
});
