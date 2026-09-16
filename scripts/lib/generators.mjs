import path from 'node:path';
import { atomicWrite, canonicalRoot, hashFile, INTEGRITY_MANIFEST, inventory, readText, readYaml, safeFile, stable, yamlString } from './core.mjs';

export const GENERATOR = Object.freeze({ identity: 'scripts/generate-lock.mjs', version: '1.0.0' });
function byteCompare(left, right) { return Buffer.compare(Buffer.from(left), Buffer.from(right)); }

function declaredPaths(curriculum) {
  const result = [curriculum.entrypoint, curriculum.operating_contract, curriculum.design_spec, curriculum.terminal_contract, ...(curriculum.control_files || [])];
  for (const module of curriculum.mandatory_modules || curriculum.modules || []) result.push(...(module.required_files || []));
  return [...new Set(result.filter(Boolean))].sort(byteCompare);
}
function sourceBy(registry, predicate, description) {
  const matches = (registry.sources || []).filter(predicate);
  if (matches.length !== 1) throw new Error(`expected exactly one ${description} source record`);
  return matches[0];
}
function packageEvidence(registry, versionRecord, surface) {
  const version = versionRecord.version;
  const sourceIds = new Set(versionRecord.source_ids || []);
  const npm = sourceBy(registry, s => sourceIds.has(s.id) && s.type === 'npm-artifact' && s.versions?.includes(version) && s.surfaces?.includes(surface), `${surface} npm`);
  const source = sourceBy(registry, s => sourceIds.has(s.id) && s.type === 'immutable-source' && s.versions?.includes(version) && s.surfaces?.includes(surface), `${surface} immutable`);
  if (npm.revision !== versionRecord.integrity) throw new Error(`${versionRecord.id} integrity disagrees with source registry`);
  if (source.revision !== versionRecord.source_commit) throw new Error(`${versionRecord.id} commit disagrees with source registry`);
  return { package: versionRecord.package, version, integrity: versionRecord.integrity, commit: versionRecord.source_commit };
}
function versionRecord(entries, prefix) {
  const record = entries.find(entry => entry.id?.startsWith(prefix));
  if (!record) throw new Error(`missing compatibility version ${prefix}`);
  if (record.status !== 'exact-evidence' || typeof record.version !== 'string' || typeof record.package !== 'string') throw new Error(`incomplete exact compatibility record ${record.id}`);
  const suffix = record.version.replaceAll('.', '-');
  if (!record.id.endsWith(`-${suffix}`)) throw new Error(`version and ID disagree for ${record.id}`);
  return record;
}

export async function lockDocument(root) {
  root = await canonicalRoot(root);
  const curriculum = await readYaml(root, 'curriculum.yml');
  const versions = await readYaml(root, 'compatibility/versions.yml');
  const registry = await readYaml(root, 'sources/registry.yml');
  const sdkVersion = versionRecord(versions.entries || [], 'VER-AGENT-SDK-');
  const declaredRuntimeVersion = versionRecord(versions.entries || [], 'VER-SDK-DECLARED-RUNTIME-');
  const standaloneVersion = versionRecord(versions.entries || [], 'VER-STANDALONE-');
  const canonicalDocs = (registry.sources || []).filter(source => source.type === 'official-docs-snapshot' && source.status === 'current' && source.url === 'https://docs.letta.com/llms.txt');
  const docs = canonicalDocs.length === 1
    ? canonicalDocs[0]
    : sourceBy(registry, source => source.type === 'official-docs-snapshot' && source.status === 'current', 'current docs index snapshot');
  const requiredFiles = [];
  for (const relative of declaredPaths(curriculum)) {
    if (relative === 'curriculum.lock.yml' || relative === INTEGRITY_MANIFEST) continue;
    const file = await safeFile(root, relative);
    requiredFiles.push({ path: relative, sha256: await hashFile(file) });
  }
  return stable({
    schema_version: '1.0.0',
    lock_state: 'generated-release-candidate',
    curriculum_id: curriculum.curriculum_id,
    curriculum_version: curriculum.curriculum_version,
    design_revision: curriculum.design_revision,
    target_contract: curriculum.target_contract,
    generator: GENERATOR,
    generated_at: `${docs.retrieved_at}T00:00:00Z`,
    generation_baseline: {
      timestamp: `${docs.retrieved_at}T00:00:00Z`,
      semantics: 'Deterministic evidence-baseline timestamp derived from the current docs snapshot retrieval date; not the wall-clock generation time.'
    },
    required_files: requiredFiles.sort((a, b) => byteCompare(a.path, b.path)),
    docs_snapshot: { source_id: docs.id, checked_at: docs.retrieved_at, sha256: String(docs.revision).replace(/^sha256:/, '') },
    agent_sdk: packageEvidence(registry, sdkVersion, 'agent-sdk'),
    sdk_declared_runtime: packageEvidence(registry, declaredRuntimeVersion, 'sdk-declared-runtime'),
    standalone_runtime: packageEvidence(registry, standaloneVersion, 'standalone-runtime'),
    hosted_runtime: { status: 'unknown-not-tested' },
    canary_evidence_ids: [],
    notes: [
      'Generated Revision 0.4 release-candidate lock; required-file hashes are derived from curriculum.yml.',
      'Static package and source evidence does not constitute Runtime Validation.'
    ]
  });
}

export async function integrityText(root) {
  root = await canonicalRoot(root);
  const files = await inventory(root, { exclude: [INTEGRITY_MANIFEST] });
  const lines = [];
  for (const file of files) lines.push(`${await hashFile(file.absolute)}  ${file.path}`);
  return `${lines.join('\n')}\n`;
}

export async function generate(root, kind, check = false) {
  root = await canonicalRoot(root);
  if (!['lock', 'integrity'].includes(kind)) throw new Error('unknown generator kind');
  const target = kind === 'lock' ? 'curriculum.lock.yml' : INTEGRITY_MANIFEST;
  const content = kind === 'lock' ? yamlString(await lockDocument(root)) : await integrityText(root);
  if (check) {
    try { return await readText(root, target) === content; } catch { return false; }
  }
  await atomicWrite(root, target, content);
  return true;
}
