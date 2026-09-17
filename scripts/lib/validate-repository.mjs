import path from 'node:path';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import { bytes, collectObjects, decodeUtf8, inventory, parseYaml, pick, posix, safePath, strings, validDate } from './core.mjs';
import { integrityText, lockDocument } from './generators.mjs';

const ID_PATTERN = /^(?:LMB|MOD|SRC|CLM|CLAIM|PTR|DISC|CAN|VAL|COMP|TERM|STATUS|AUTH|FEAT|SURF|VER|LEG|CAP|ADJ|EXP|REL|ASM|FIX|RTC|DOS|SCN|MIS|CNF|S01|S02|S03|S04)-[A-Z0-9][A-Z0-9._-]*$/;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\b(?:sk|pk)-(?:live|test|proj)-[A-Za-z0-9_-]{12,}\b/,
  /\bgh[opsu]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  /(?:api[_-]?key|secret|token|password|authorization)\s*[:=]\s*["']?(?!unknown\b|redacted\b|example\b|placeholder\b|none\b|not-set\b|\$\{|<)[A-Za-z0-9_+/.=-]{12,}/i,
];
function issue(errors, code, file, message) { errors.push({ code, file, message }); }
function schemaTarget(schema, file) {
  const explicit = schema['x-target'] ?? schema['x-file'] ?? schema.fileMatch ?? schema.$comment?.match(/(?:target|file):\s*([^\s]+)/i)?.[1];
  if (explicit) return typeof explicit === 'string' ? explicit === file : false;
  const base = path.basename(file).replace(/\.ya?ml$/, '');
  const schemaBase = path.basename(schema.__path || '').replace(/\.schema\.(?:json|ya?ml)$/, '');
  if (schemaBase === 'registry') return file.startsWith('sources/') && /(?:registry|claims|discrepancies)\.ya?ml$/.test(file);
  if (schemaBase === 'pointers') return file === 'pointers/registry.yml';
  if (schemaBase === 'compatibility') return file.startsWith('compatibility/');
  if (schemaBase === 'legacy-denylist') return file === 'legacy-boundary/denylist.yml';
  if (schemaBase === 'canary-registry') return file === 'canaries/registry.yml';
  if (schemaBase === 'lock') return file === 'curriculum.lock.yml';
  return base === schemaBase || file.endsWith(`/${schemaBase}.yml`) || file.endsWith(`/${schemaBase}.yaml`);
}
function objectId(obj) { return obj?.id; }
function extractRecords(doc) {
  if (Array.isArray(doc)) return doc.filter(x => x && typeof x === 'object');
  if (!doc || typeof doc !== 'object') return [];
  const arrays = Object.values(doc).filter(Array.isArray);
  return arrays.flat().filter(x => x && typeof x === 'object');
}
function refs(obj, keys) { return keys.flatMap(k => strings(obj[k])); }
function completionEnabled(c) { return c === true || c?.enabled === true || /^(?:CURRICULUM_COMPLETE|KNOWLEDGE_READY(?:_CANDIDATE|_VERIFIED)?|COMPLETE|READY|VERIFIED)$/i.test(String(c?.status ?? c ?? '')); }
function terminalStates(terminal) {
  if (!Array.isArray(terminal?.allowed_states)) return [];
  return terminal.allowed_states.map(entry => typeof entry === 'string' ? { state: entry } : entry).filter(entry => entry && typeof entry === 'object');
}
function terminalAwardsCompletion(entry) {
  return entry.curriculum_complete === true || entry.knowledge_ready === true || entry.master_builder_ready === true || entry.verified === true || entry.completion_awarded === true || entry.readiness_awarded === true || entry.runtime_validated === true || entry.production_qualified === true || completionEnabled(entry.completion);
}
function markdownAnchors(text) {
  const anchors = new Set();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^#{1,6}\s+(.+?)\s*#*$/);
    if (!match) continue;
    const base = match[1].toLowerCase().replace(/[`*_~]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
    let anchor = base;
    let suffix = 1;
    while (anchors.has(anchor)) anchor = `${base}-${suffix++}`;
    anchors.add(anchor);
  }
  return anchors;
}
function resolveLocalTarget(sourceFile, raw) {
  let decoded;
  try { decoded = decodeURIComponent(raw.replace(/\\([() ])/g, '$1')); }
  catch { return { error: 'malformed URL encoding' }; }
  const hash = decoded.indexOf('#');
  const targetPart = hash === -1 ? decoded : decoded.slice(0, hash);
  const fragment = hash === -1 ? '' : decoded.slice(hash + 1);
  const target = targetPart || sourceFile;
  return { resolved: posix(path.normalize(path.join(path.dirname(sourceFile), target))), fragment };
}

export async function validateRepository(root) {
  root = path.resolve(root);
  const errors = [];
  let files;
  try { files = await inventory(root); } catch (error) { return [{ code: 'INVENTORY', file: '.', message: error.message }]; }
  const fileSet = new Set(files.map(f => f.path));
  const docs = new Map();
  const texts = new Map();

  for (const file of files) {
    let text;
    try { text = decodeUtf8(await bytes(file.absolute), file.path); } catch (e) { issue(errors, 'UTF8', file.path, e.message); continue; }
    texts.set(file.path, text);
    if (/\.ya?ml$/i.test(file.path)) try { docs.set(file.path, parseYaml(text, file.path)); } catch (e) { issue(errors, 'YAML', file.path, e.message); }
  }

  const schemaEntries = [];
  for (const file of files.filter(f => f.path.startsWith('schemas/') && /\.schema\.json$/i.test(f.path))) {
    try {
      const text = decodeUtf8(await bytes(file.absolute), file.path);
      const schema = JSON.parse(text);
      parseYaml(text, file.path);
      schemaEntries.push([file.path, schema]);
    }
    catch (error) { issue(errors, 'SCHEMA', file.path, `invalid JSON schema: ${error.message}`); }
  }
  schemaEntries.push(...[...docs].filter(([f]) => f.endsWith('.schema.yml') || f.endsWith('.schema.yaml')));
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: false, validateFormats: false, validateSchema: true });
  for (const [schemaFile, schemaValue] of schemaEntries) {
    if (!schemaValue || typeof schemaValue !== 'object') continue;
    const schema = { ...schemaValue };
    delete schema['x-target']; delete schema['x-file']; delete schema.fileMatch;
    let validate;
    try { validate = ajv.compile(schema); } catch (e) { issue(errors, 'SCHEMA', schemaFile, `schema compilation failed: ${e.message}`); continue; }
    for (const [file, value] of docs) {
      if (file === schemaFile || file.startsWith('schemas/')) continue;
      const tagged = { ...schemaValue, __path: schemaFile };
      if (!schemaTarget(tagged, file)) continue;
      if (!validate(value)) issue(errors, 'SCHEMA', file, `does not satisfy ${schemaFile}: ${ajv.errorsText(validate.errors, { separator: '; ' })}`);
    }
  }

  const ids = new Map();
  for (const [file, doc] of docs) for (const obj of collectObjects(doc)) {
    const id = objectId(obj);
    if (id === undefined) continue;
    if (typeof id !== 'string' || !ID_PATTERN.test(id)) issue(errors, 'ID', file, 'malformed global ID');
    else if (ids.has(id)) issue(errors, 'ID', file, `duplicate global ID ${id} (first in ${ids.get(id)})`);
    else ids.set(id, file);
  }

  const curriculum = docs.get('curriculum.yml');
  if (!curriculum) issue(errors, 'REQUIRED', 'curriculum.yml', 'missing or invalid authoritative curriculum');
  else {
    const stage = pick(curriculum, 'repository_stage', 'stage');
    if (stage === 'pre-content') {
      if (completionEnabled(curriculum.target_contract?.completion)) issue(errors, 'COMPLETION', 'curriculum.yml', 'pre-content completion must be disabled');
      const modules = extractRecords(curriculum.mandatory_modules);
      for (const module of modules) if (module.status && module.status !== 'planned') issue(errors, 'STAGE', 'curriculum.yml', 'pre-content modules must remain planned');
    }
    const modules = extractRecords(curriculum.mandatory_modules ?? curriculum.modules);
    if (curriculum.curriculum_id === 'letta-master-builder') {
      const expectedSlugs = [
        '00-contract-evidence-release', '01-mission-autonomy-acceptance', '02-objects-ownership-locality', '03-capabilities-topology-models',
        '04-agent-provisioning-management', '05-conversations-sessions-recovery', '06-memory-context-skills-knowledge', '07-tools-mcp-permissions-effects',
        '08-bounded-work-loops-triggers', '09-multi-agent-orchestration', '10-improvement-evaluation-rollback', '11-supervision-security-observability',
        '12-deployment-reliability-upgrades', '13-transfer-offline-practicum'
      ];
      if (modules.length !== expectedSlugs.length || modules.some((module, index) => module.slug !== expectedSlugs[index])) issue(errors, 'TARGET_GRAPH', 'curriculum.yml', 'module graph does not match autonomous-agent Master Builder Revision 0.4');
      if (JSON.stringify(curriculum.elective_tracks) !== '[]') issue(errors, 'TARGET_GRAPH', 'curriculum.yml', 'Revision 0.4 pre-content contract has no implemented elective tracks');
      const target = curriculum.target_contract;
      if (!target || target.mandatory_path !== 'agent-sdk' || target.teaching_mode !== 'read-only' || target.agent_foundry !== 'conceptual-only' || target.primary_runtime_lane !== 'agent-sdk-node-local' || target.contrast_runtime_lane !== 'agent-sdk-node-cloud') issue(errors, 'TARGET_CONTRACT', 'curriculum.yml', 'target contract does not match autonomous-agent Master Builder Revision 0.4');
    }
    const moduleIds = new Set(modules.map(objectId).filter(Boolean));
    modules.forEach((module, index) => {
      const suffix = String(module.id || '').match(/^MOD-(\d{2})$/)?.[1];
      if (module.order !== index || suffix !== String(index).padStart(2, '0') || !String(module.slug || '').startsWith(`${suffix}-`)) issue(errors, 'MODULE_ORDER', 'curriculum.yml', `module at position ${index} has inconsistent ID/order/slug`);
    });
    const edges = new Map();
    for (const module of modules) {
      const id = objectId(module); if (!id) continue;
      const prerequisites = refs(module, ['prerequisites', 'requires', 'depends_on']);
      edges.set(id, prerequisites);
      for (const dep of prerequisites) {
        if (!moduleIds.has(dep)) issue(errors, 'DAG', 'curriculum.yml', `${id} has unknown prerequisite ${dep}`);
        else if (modules.findIndex(candidate => objectId(candidate) === dep) >= modules.findIndex(candidate => objectId(candidate) === id)) issue(errors, 'DAG', 'curriculum.yml', `${id} prerequisite ${dep} is not earlier`);
      }
    }
    const visiting = new Set(), visited = new Set();
    function visit(id) { if (visiting.has(id)) { issue(errors, 'DAG', 'curriculum.yml', `cycle includes ${id}`); return; } if (visited.has(id)) return; visiting.add(id); for (const dep of edges.get(id) || []) visit(dep); visiting.delete(id); visited.add(id); }
    for (const id of moduleIds) visit(id);
    const declared = new Set([curriculum.entrypoint, curriculum.operating_contract, curriculum.design_spec, curriculum.terminal_contract, ...(curriculum.control_files || []), ...modules.flatMap(module => module.required_files || [])].filter(Boolean));
    for (const ref of declared) if (!safePath(ref) || !fileSet.has(ref)) issue(errors, 'CURRICULUM_PATH', 'curriculum.yml', `required path is missing or unsafe: ${ref}`);
    if (Array.isArray(curriculum.reader_sequence)) {
      const seen = new Set();
      curriculum.reader_sequence.forEach((ref, index) => { if (seen.has(ref)) issue(errors, 'READER_SEQUENCE', 'curriculum.yml', `duplicate reader sequence entry ${ref}`); seen.add(ref); if (!declared.has(ref) || !fileSet.has(ref)) issue(errors, 'READER_SEQUENCE', 'curriculum.yml', `undeclared or missing reader sequence entry ${ref}`); if (index === 0 && ref !== curriculum.entrypoint) issue(errors, 'READER_SEQUENCE', 'curriculum.yml', 'reader sequence must begin with entrypoint'); });
    }
    const start = texts.get(curriculum.entrypoint);
    if (start) for (const match of start.matchAll(/^\s*\d+\.\s+`([^`]+)`/gm)) if (!declared.has(match[1])) issue(errors, 'READER_SEQUENCE', curriculum.entrypoint, `directly instructed file is not manifest-declared: ${match[1]}`);
  }

  const targetContractFiles = [
    'DESIGN_SPEC.md', 'README.md', 'START_HERE.md', 'AGENTS.md', 'ATTRIBUTION.md', 'CONTRIBUTING.md',
    'SECURITY.md', 'curriculum.yml', 'sources/registry.yml', 'sources/claims.yml', 'compatibility/features.yml',
    'compatibility/surfaces.yml', 'pointers/registry.yml'
  ];
  const obsoleteTargetPatterns = [/Project Desk/i, /ProductStore/i, /reference-app\.ya?ml/i, /building new applications/i, /mandatory teaching specimen/i];
  for (const file of targetContractFiles) {
    const text = texts.get(file);
    if (text && obsoleteTargetPatterns.some(pattern => pattern.test(text))) issue(errors, 'TARGET_DRIFT', file, 'obsolete general-application target detected; Revision 0.4 is autonomous-agent-only');
  }

  const terminal = docs.get('terminal-contract.yml');
  if (!terminal) issue(errors, 'REQUIRED', 'terminal-contract.yml', 'missing or invalid terminal contract');
  else if (curriculum && (pick(curriculum, 'repository_stage', 'stage') === 'pre-content' || !completionEnabled(curriculum.target_contract?.completion ?? curriculum.completion))) {
    const states = terminalStates(terminal);
    const requiredDeny = ['inspect-environment', 'install-dependencies', 'run-commands-or-tests', 'use-credentials', 'make-network-calls', 'call-letta-api-or-model', 'create-or-modify-agents', 'execute-canaries', 'deploy', 'write-progress-ledger'];
    const denied = new Set(strings(terminal.forbidden_actions ?? terminal.forbidden_automatic_actions));
    for (const action of requiredDeny) if (!denied.has(action)) issue(errors, 'TERMINAL', 'terminal-contract.yml', `missing required forbidden action ${action}`);
    if (states.length !== 1 || states[0].state !== 'CURRICULUM_UNAVAILABLE') issue(errors, 'TERMINAL', 'terminal-contract.yml', 'incomplete repository must allow only CURRICULUM_UNAVAILABLE');
    if (states.some(terminalAwardsCompletion)) issue(errors, 'TERMINAL', 'terminal-contract.yml', 'incomplete repository cannot award completion or readiness');
    if (pick(curriculum, 'repository_stage', 'stage') === 'pre-content') {
      const expectedAxes = {
        content: 'unavailable', learning: 'not-started', architecture: 'not-assessed', implementation: 'not-assessed',
        transfer: 'not-assessed', assessment_integrity: 'unverified', runtime: 'not-tested', production: 'not-qualified'
      };
      for (const [axis, expected] of Object.entries(expectedAxes)) if (terminal.status_axes?.[axis] !== expected) issue(errors, 'STATUS_AXIS', 'terminal-contract.yml', `pre-content ${axis} must remain ${expected}`);
    }
  } else if (curriculum) {
    const states = terminalStates(terminal);
    const requiredDeny = ['inspect-environment', 'install-dependencies', 'run-commands-or-tests', 'use-credentials', 'make-network-calls', 'call-letta-api-or-model', 'create-or-modify-agents', 'execute-canaries', 'deploy', 'write-progress-ledger'];
    const denied = new Set(strings(terminal.forbidden_actions ?? terminal.forbidden_automatic_actions));
    for (const action of requiredDeny) if (!denied.has(action)) issue(errors, 'TERMINAL', 'terminal-contract.yml', `missing required forbidden action ${action}`);
    if (states.length !== 1 || states[0].state !== 'ASSESSMENT_REQUIRED') issue(errors, 'TERMINAL', 'terminal-contract.yml', 'complete unassessed repository must allow only ASSESSMENT_REQUIRED');
    if (states.some(terminalAwardsCompletion)) issue(errors, 'TERMINAL', 'terminal-contract.yml', 'reading cannot award completion readiness runtime or production status');
    const expectedAxes = {
      content: 'complete', learning: 'not-started', architecture: 'not-assessed', implementation: 'not-assessed',
      transfer: 'not-assessed', assessment_integrity: 'unverified', runtime: 'not-tested', production: 'not-qualified'
    };
    for (const [axis, expected] of Object.entries(expectedAxes)) if (terminal.status_axes?.[axis] !== expected) issue(errors, 'STATUS_AXIS', 'terminal-contract.yml', `unassessed release-candidate ${axis} must remain ${expected}`);
  }

  const recordsByFile = new Map([...docs].map(([f, d]) => [f, extractRecords(d)]));
  const registryFiles = ['sources/registry.yml', 'sources/claims.yml', 'sources/discrepancies.yml', 'pointers/registry.yml', 'compatibility/versions.yml', 'compatibility/features.yml', 'compatibility/surfaces.yml', 'capabilities/core.yml', 'capabilities/adjacent.yml', 'capabilities/sdk-exports.yml', 'assessments/contract.yml', 'practicum/registry.yml', 'runtime-claims/registry.yml', 'release/manifest.yml', 'maintenance/drift-rehearsal.yml'].filter(f => docs.has(f));
  const known = new Set(ids.keys());
  for (const file of registryFiles) for (const record of recordsByFile.get(file) || []) {
    for (const ref of refs(record, ['claim_ids', 'claims', 'supported_claim_ids', 'source_ids', 'evidence_ids', 'sources', 'discrepancy_ids', 'discrepancies', 'pointer_ids', 'pointers', 'feature_ids', 'surface_ids', 'version_ids', 'prerequisites'])) {
      if (!ID_PATTERN.test(ref)) issue(errors, 'REFERENCE', file, `malformed ID reference ${ref}`);
      else if (!known.has(ref)) issue(errors, 'REFERENCE', file, `unresolved ID reference ${ref}`);
    }
    for (const ref of refs(record, ['path', 'local_path', 'target_path', 'chapter', 'owner', 'canonical_chapter'])) if (/\//.test(ref) || /\.[a-z0-9]+$/i.test(ref)) {
      const clean = ref.split('#')[0].replace(/^\.\//, '');
      if (clean && (!safePath(clean) || !fileSet.has(clean))) issue(errors, 'POINTER', file, `broken local pointer ${ref}`);
    }
    if ((record.status === 'live' || record.freshness === 'live' || record.freshness_class === 'live') && /current|supported|available/i.test(String(record.claim ?? record.statement ?? record.summary ?? '')) && !record.observed_at && !record.last_verified && !record.last_verification) issue(errors, 'LIVE_CLAIM', file, 'live claim presented as current without dated observation');
  }
  const pointerRecords = recordsByFile.get('pointers/registry.yml') || [];
  if (docs.get('pointers/registry.yml')?.execution_allowed !== false) issue(errors, 'POINTER', 'pointers/registry.yml', 'pointer registry must explicitly prohibit execution');
  for (const pointer of pointerRecords) {
    for (const prerequisite of strings(pointer.prerequisites)) {
      if (!ID_PATTERN.test(prerequisite)) issue(errors, 'POINTER_PREREQUISITE', 'pointers/registry.yml', `malformed prerequisite ID ${prerequisite}`);
      else if (!known.has(prerequisite)) issue(errors, 'POINTER_PREREQUISITE', 'pointers/registry.yml', `unresolved prerequisite ID ${prerequisite}`);
    }
    const target = pointer.target;
    if (typeof target !== 'string' || target.length === 0) continue;
    if (/^https:\/\//.test(target)) {
      try { const url = new URL(target); if (url.protocol !== 'https:' || url.username || url.password) throw new Error(); }
      catch { issue(errors, 'POINTER', 'pointers/registry.yml', 'external pointer is not policy-valid HTTPS'); }
      if (!['official-docs', 'sdk-reference'].includes(pointer.target_type)) issue(errors, 'POINTER', 'pointers/registry.yml', `${pointer.target_type} may not target an external URL`);
      continue;
    }
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target) || target.startsWith('//')) { issue(errors, 'POINTER', 'pointers/registry.yml', 'external pointer must use HTTPS'); continue; }
    const local = resolveLocalTarget('pointers/registry.yml', target.startsWith('../') ? target : `../${target}`);
    if (local.error) { issue(errors, 'POINTER', 'pointers/registry.yml', `${local.error} in target`); continue; }
    if (!safePath(local.resolved) || !fileSet.has(local.resolved)) { issue(errors, 'POINTER', 'pointers/registry.yml', `broken local pointer ${target}`); continue; }
    if (['official-docs', 'sdk-reference'].includes(pointer.target_type)) issue(errors, 'POINTER', 'pointers/registry.yml', `${pointer.target_type} must target HTTPS`);
    const executable = /(?:^|\/)(?:scripts|\.github)\//.test(local.resolved) || /\.(?:mjs|cjs|js|ts|tsx|jsx|sh|bash|zsh|py|rb|exe|bin)$/i.test(local.resolved) || /(?:^|\/)package(?:-lock)?\.json$/i.test(local.resolved);
    if (executable) issue(errors, 'POINTER', 'pointers/registry.yml', `pointer target may not be executable or execution-oriented: ${target}`);
    if (pointer.target_type === 'advanced-track' && local.resolved !== 'DESIGN_SPEC.md') issue(errors, 'POINTER', 'pointers/registry.yml', 'advanced-track must target a DESIGN_SPEC.md anchor');
    if (pointer.target_type === 'runtime-canary' && local.resolved !== 'canaries/registry.yml') issue(errors, 'POINTER', 'pointers/registry.yml', 'runtime-canary may target only the non-executing canary registry');
    if (pointer.target_type === 'legacy-boundary' && !/^legacy-boundary\/.+\.(?:md|ya?ml)$/i.test(local.resolved)) issue(errors, 'POINTER', 'pointers/registry.yml', 'legacy-boundary must target declarative legacy material');
    if (pointer.target_type === 'mandatory-module' && !/^modules\/.+\.(?:md|ya?ml)$/i.test(local.resolved)) issue(errors, 'POINTER', 'pointers/registry.yml', 'mandatory-module must target a declarative module file');
    if (local.fragment) {
      const targetText = texts.get(local.resolved);
      if (!/\.md$/i.test(local.resolved) || targetText === undefined || !markdownAnchors(targetText).has(local.fragment.toLowerCase())) issue(errors, 'ANCHOR', 'pointers/registry.yml', `missing local anchor ${target}`);
    }
  }

  const sourceRecords = recordsByFile.get('sources/registry.yml') || [];
  const sourceIds = new Set(sourceRecords.map(objectId));
  const claimRecords = recordsByFile.get('sources/claims.yml') || [];
  if (!sourceRecords.length) issue(errors, 'REGISTRY', 'sources/registry.yml', 'source registry must be nonempty');
  if (!claimRecords.length) issue(errors, 'REGISTRY', 'sources/claims.yml', 'claim registry must be nonempty');
  const baseline = docs.get('curriculum.lock.yml')?.generated_at || '2026-09-11T00:00:00Z';
  const baselineMs = validDate(baseline, true) ? Date.parse(baseline) : Date.parse('2026-09-11T00:00:00Z');
  for (const record of [...sourceRecords, ...claimRecords]) {
    const date = record.retrieved_at ?? record.verified_at;
    if (!validDate(date)) issue(errors, 'DATE', ids.get(objectId(record)) || 'registry', 'invalid ISO date');
    else { const max = { fast: 45, medium: 120, stable: 365 }[record.freshness]; if (max && (baselineMs - Date.parse(`${date}T00:00:00Z`)) / 86400000 > max) issue(errors, 'FRESHNESS', ids.get(objectId(record)) || 'registry', `${record.freshness} evidence is stale`); }
  }
  for (const discrepancy of recordsByFile.get('sources/discrepancies.yml') || []) if (discrepancy.resolved_at !== null && !validDate(discrepancy.resolved_at)) issue(errors, 'DATE', 'sources/discrepancies.yml', `invalid resolution date for ${objectId(discrepancy) || 'discrepancy'}`);
  for (const claim of claimRecords) for (const ref of refs(claim, ['source_ids', 'evidence_ids', 'sources'])) if (!sourceIds.has(ref)) issue(errors, 'BIDIRECTIONAL', 'sources/claims.yml', `claim references absent source ${ref}`);
  for (const source of sourceRecords) for (const claimId of refs(source, ['claim_ids', 'claims', 'supported_claim_ids'])) {
    const claim = claimRecords.find(c => objectId(c) === claimId);
    if (!claim || !refs(claim, ['source_ids', 'evidence_ids', 'sources']).includes(objectId(source))) issue(errors, 'BIDIRECTIONAL', 'sources/registry.yml', `source/claim mapping is not reciprocal for ${claimId}`);
  }
  for (const claim of claimRecords) {
    const owner = claim.owner;
    if (typeof owner !== 'string' || !owner.includes('/')) issue(errors, 'OWNER', 'sources/claims.yml', `claim ${objectId(claim)} owner must be a concrete local path`);
    else { const local = resolveLocalTarget('sources/claims.yml', owner.startsWith('../') ? owner : `../${owner}`); if (local.error || !safePath(local.resolved) || !fileSet.has(local.resolved)) issue(errors, 'OWNER', 'sources/claims.yml', `claim ${objectId(claim)} owner is missing or unsafe`); else if (local.fragment && !markdownAnchors(texts.get(local.resolved) || '').has(local.fragment.toLowerCase())) issue(errors, 'OWNER', 'sources/claims.yml', `claim ${objectId(claim)} owner anchor is missing`); }
  }
  const claimById = new Map(claimRecords.map(record => [objectId(record), record]));
  for (const pointer of pointerRecords) {
    const pointerSources = new Set(strings(pointer.source_ids));
    for (const claimId of strings(pointer.claim_ids)) {
      const claim = claimById.get(claimId);
      if (claim && !strings(claim.evidence_ids).some(sourceId => pointerSources.has(sourceId))) issue(errors, 'POINTER', 'pointers/registry.yml', `${objectId(pointer)} claim ${claimId} has no matching pointer source`);
    }
  }
  for (const file of ['compatibility/features.yml', 'compatibility/surfaces.yml']) for (const record of recordsByFile.get(file) || []) {
    const compatibilitySources = new Set(strings(record.source_ids));
    for (const claimId of strings(record.claim_ids)) {
      const claim = claimById.get(claimId);
      if (claim && !strings(claim.evidence_ids).some(sourceId => compatibilitySources.has(sourceId))) issue(errors, 'COMPATIBILITY', file, `${objectId(record)} claim ${claimId} has no matching evidence source on the compatibility record`);
    }
  }
  const referencedDiscrepancies = new Set([...recordsByFile.values()].flatMap(records => records.flatMap(record => strings(record.discrepancy_ids))));
  for (const discrepancy of recordsByFile.get('sources/discrepancies.yml') || []) if (objectId(discrepancy) && !referencedDiscrepancies.has(objectId(discrepancy))) issue(errors, 'BIDIRECTIONAL', 'sources/discrepancies.yml', `orphan discrepancy ${objectId(discrepancy)} is not referenced by a claim`);

  const versionRecords = recordsByFile.get('compatibility/versions.yml') || [];
  const versionsById = new Map(versionRecords.map(record => [objectId(record), record]));
  const expectedExactLanes = new Map([
    ['agent-sdk', 'VER-AGENT-SDK-'],
    ['sdk-declared-runtime', 'VER-SDK-DECLARED-RUNTIME-'],
    ['standalone-runtime', 'VER-STANDALONE-'],
  ]);
  for (const [surface, prefix] of expectedExactLanes) {
    const matches = versionRecords.filter(record => record.id?.startsWith(prefix) && record.status === 'exact-evidence');
    if (matches.length !== 1) { issue(errors, 'COMPATIBILITY', 'compatibility/versions.yml', `expected exactly one current exact lane ${prefix}`); continue; }
    const record = matches[0];
    if (!strings(record.source_ids).some(sourceId => strings(sourceRecords.find(source => objectId(source) === sourceId)?.surfaces).includes(surface))) issue(errors, 'COMPATIBILITY', 'compatibility/versions.yml', `${record.id} does not cite its ${surface} source lane`);
  }
  for (const record of versionRecords) {
    const id = objectId(record) || 'unknown';
    for (const relation of strings(record.relations)) {
      const relatedIds = relation.match(/VER-[A-Z0-9-]+/g) || [];
      for (const relatedId of relatedIds) if (!versionsById.has(relatedId)) issue(errors, 'COMPATIBILITY', 'compatibility/versions.yml', `${id} relation does not resolve: ${relatedId}`);
    }
    if (record.status !== 'exact-evidence') continue;
    const cited = strings(record.source_ids).map(sourceId => sourceRecords.find(source => objectId(source) === sourceId));
    if (!strings(record.source_ids).length || cited.some(source => !source)) { issue(errors, 'COMPATIBILITY', 'compatibility/versions.yml', `${id} has missing source IDs`); continue; }
    const npmSources = cited.filter(source => source.type === 'npm-artifact');
    const commitSources = cited.filter(source => source.type === 'immutable-source');
    if (npmSources.length !== 1 || commitSources.length !== 1) issue(errors, 'COMPATIBILITY', 'compatibility/versions.yml', `${id} must cite exactly one npm artifact and one immutable source`);
    const version = String(record.version);
    const packagePath = String(record.package).replace(/^@/, '').replace('/', '%2F');
    for (const source of npmSources) {
      if (!strings(source.versions).map(String).includes(version) || source.revision !== record.integrity || !String(source.url || '').includes(packagePath) || !String(source.url || '').endsWith(`/${version}`)) issue(errors, 'COMPATIBILITY', 'compatibility/versions.yml', `${id} disagrees with npm source ${objectId(source)}`);
    }
    for (const source of commitSources) {
      if (!strings(source.versions).map(String).includes(version) || source.revision !== record.source_commit) issue(errors, 'COMPATIBILITY', 'compatibility/versions.yml', `${id} disagrees with source commit ${objectId(source)}`);
    }
  }
  const agentSdk = versionRecords.find(record => record.id?.startsWith('VER-AGENT-SDK-') && record.status === 'exact-evidence');
  const declaredRuntime = versionRecords.find(record => record.id?.startsWith('VER-SDK-DECLARED-RUNTIME-') && record.status === 'exact-evidence');
  if (agentSdk && declaredRuntime && !strings(agentSdk.relations).some(relation => relation === `declares ${declaredRuntime.id}`)) issue(errors, 'COMPATIBILITY', 'compatibility/versions.yml', 'Agent SDK relation must point exactly to the declared runtime lane');

  const standaloneRuntime = versionRecords.find(record => record.id?.startsWith('VER-STANDALONE-') && record.status === 'exact-evidence');
  const release = docs.get('release/manifest.yml');
  if (release && agentSdk && declaredRuntime && standaloneRuntime) {
    const expectedTuple = { agent_sdk: agentSdk.id, sdk_declared_runtime: declaredRuntime.id, standalone_runtime: standaloneRuntime.id };
    for (const [key, value] of Object.entries(expectedTuple)) if (release.package_tuple?.[key] !== value) issue(errors, 'RELEASE_TUPLE', 'release/manifest.yml', `${key} disagrees with current exact compatibility lane`);
    if (curriculum && release.curriculum_version !== curriculum.curriculum_version) issue(errors, 'RELEASE_STATE', 'release/manifest.yml', 'curriculum version disagrees with curriculum.yml');
    if (curriculum?.repository_stage === 'release-candidate' && (release.status !== 'release-candidate-publication-blocked' || release.artifacts?.curriculum_available !== true)) issue(errors, 'RELEASE_STATE', 'release/manifest.yml', 'release-candidate stage requires available curriculum and publication-blocked candidate status');
    if (curriculum?.publication_status === 'blocked' && release.dependency_audit?.publication_blocked !== true) issue(errors, 'RELEASE_STATE', 'release/manifest.yml', 'publication block disagrees with curriculum.yml');
    if (terminal?.repository_stage !== curriculum?.repository_stage) issue(errors, 'RELEASE_STATE', 'terminal-contract.yml', 'terminal stage disagrees with curriculum.yml');
  }
  const capabilityRegistry = docs.get('capabilities/core.yml');
  const capabilities = Array.isArray(capabilityRegistry?.capabilities) ? capabilityRegistry.capabilities : [];
  const capabilityIds = new Set(capabilities.map(objectId));
  const driftRehearsal = docs.get('maintenance/drift-rehearsal.yml');
  for (const capabilityId of strings(driftRehearsal?.affected_capability_ids)) if (!capabilityIds.has(capabilityId)) issue(errors, 'DRIFT_REHEARSAL', 'maintenance/drift-rehearsal.yml', `references absent capability ${capabilityId}`);
  const discrepancyIds = new Set((recordsByFile.get('sources/discrepancies.yml') || []).map(objectId));
  const practicum = docs.get('practicum/registry.yml');
  const fixtures = Array.isArray(practicum?.fixtures) ? practicum.fixtures : [];
  const scenarios = Array.isArray(practicum?.scenarios) ? practicum.scenarios : [];
  const practicumIds = new Set([...fixtures, ...scenarios].map(objectId));
  const exportLedger = docs.get('capabilities/sdk-exports.yml');
  const exportEntries = Array.isArray(exportLedger?.entries) ? exportLedger.entries : [];
  const exportedSymbols = new Set(exportEntries.map(entry => entry.symbol));
  capabilities.forEach((capability, index) => {
    const id = objectId(capability) || `index-${index}`;
    if (capability.order !== index + 1) issue(errors, 'CAPABILITY_ORDER', 'capabilities/core.yml', `${id} has inconsistent order`);
    for (const sourceId of strings(capability.source_ids)) if (!sourceIds.has(sourceId)) issue(errors, 'CAPABILITY_REFERENCE', 'capabilities/core.yml', `${id} references absent source ${sourceId}`);
    for (const discrepancyId of strings(capability.discrepancy_ids)) if (!discrepancyIds.has(discrepancyId)) issue(errors, 'CAPABILITY_REFERENCE', 'capabilities/core.yml', `${id} references absent discrepancy ${discrepancyId}`);
    for (const practicumId of strings(capability.practicum_ids)) if (!practicumIds.has(practicumId)) issue(errors, 'CAPABILITY_REFERENCE', 'capabilities/core.yml', `${id} references absent practicum entry ${practicumId}`);
    for (const symbol of strings(capability.export_symbols)) if (!exportedSymbols.has(symbol)) issue(errors, 'CAPABILITY_REFERENCE', 'capabilities/core.yml', `${id} references absent SDK export ${symbol}`);
    if (capability.claim_bearing === true && (!strings(capability.source_ids).length || !strings(capability.export_symbols).length || !strings(capability.non_claims).length)) issue(errors, 'CAPABILITY_CLAIM', 'capabilities/core.yml', `${id} claim-bearing capability lacks evidence exports or non-claims`);
  });
  if (exportLedger && agentSdk) {
    if (exportLedger.version !== agentSdk.version || exportLedger.integrity !== agentSdk.integrity) issue(errors, 'SDK_LEDGER', 'capabilities/sdk-exports.yml', 'ledger package identity disagrees with Agent SDK exact lane');
    for (const entry of exportEntries) for (const capabilityId of strings(entry.capability_ids)) if (!capabilityIds.has(capabilityId)) issue(errors, 'SDK_LEDGER', 'capabilities/sdk-exports.yml', `${entry.id} references absent capability ${capabilityId}`);
  }
  for (const fixture of fixtures) {
    if (!safePath(fixture.path) || !fileSet.has(fixture.path)) issue(errors, 'PRACTICUM', 'practicum/registry.yml', `${fixture.id} fixture path is missing or unsafe`);
    for (const capabilityId of strings(fixture.capability_ids)) if (!capabilityIds.has(capabilityId)) issue(errors, 'PRACTICUM', 'practicum/registry.yml', `${fixture.id} references absent capability ${capabilityId}`);
  }
  for (const scenario of scenarios) {
    if (!safePath(scenario.brief_path) || !fileSet.has(scenario.brief_path)) issue(errors, 'PRACTICUM', 'practicum/registry.yml', `${scenario.id} brief path is missing or unsafe`);
    for (const specificationFile of strings(scenario.specification_files)) if (!safePath(specificationFile) || !fileSet.has(specificationFile)) issue(errors, 'PRACTICUM', 'practicum/registry.yml', `${scenario.id} specification path is missing or unsafe: ${specificationFile}`);
    for (const capabilityId of strings(scenario.capability_ids)) {
      const capability = capabilities.find(candidate => candidate.id === capabilityId);
      if (!capability) issue(errors, 'PRACTICUM', 'practicum/registry.yml', `${scenario.id} references absent capability ${capabilityId}`);
      else if (!strings(capability.practicum_ids).includes(scenario.id)) issue(errors, 'PRACTICUM', 'practicum/registry.yml', `${scenario.id} capability mapping is not reciprocal for ${capabilityId}`);
    }
  }
  const runtimeClaims = docs.get('runtime-claims/registry.yml');
  if (runtimeClaims && terminal && runtimeClaims.aggregate === 'none' && Array.isArray(runtimeClaims.claims) && runtimeClaims.claims.length === 0 && terminal.status_axes?.runtime !== 'not-tested') issue(errors, 'RUNTIME_CLAIM', 'terminal-contract.yml', 'empty runtime registry requires runtime status not-tested');

  for (const [file, text] of texts) if (/\.md$/i.test(file)) {
    const links = [...text.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)].map(match => match[1]);
    for (const raw of links) {
      if (/^(?:[a-z]+:|\/\/)/i.test(raw) || raw.startsWith('mailto:')) continue;
      const local = resolveLocalTarget(file, raw);
      if (local.error) { issue(errors, 'LINK', file, `${local.error} in local link`); continue; }
      if (!safePath(local.resolved) || !fileSet.has(local.resolved)) { issue(errors, 'LINK', file, `broken local link ${raw}`); continue; }
      if (local.fragment) {
        const targetText = texts.get(local.resolved);
        if (targetText === undefined) { issue(errors, 'ANCHOR', file, `anchor target is not text: ${raw}`); continue; }
        if (!markdownAnchors(targetText).has(local.fragment.toLowerCase())) issue(errors, 'ANCHOR', file, `missing local anchor ${raw}`);
      }
    }
  }

  const deny = docs.get('legacy-boundary/denylist.yml');
  const denyRules = Array.isArray(deny?.rules) ? deny.rules : [];
  const exceptionObjects = Array.isArray(deny?.reviewed_exceptions) ? deny.reviewed_exceptions : [];
  const usedExceptions = new Set();
  if (!deny) issue(errors, 'LEGACY_POLICY', 'legacy-boundary/denylist.yml', 'denylist must be present and valid');
  if (!denyRules.length) issue(errors, 'LEGACY_POLICY', 'legacy-boundary/denylist.yml', 'denylist rules must be nonempty');
  for (const [index, rule] of denyRules.entries()) {
    if (!strings(rule.include).length || strings(rule.include).some(candidate => candidate !== '**/*' && !safePath(candidate))) issue(errors, 'LEGACY_POLICY', 'legacy-boundary/denylist.yml', `invalid include path at rule index ${index}`);
    if (strings(rule.exclude).some(candidate => !safePath(candidate) || /[*?{}[\]]/.test(candidate))) issue(errors, 'LEGACY_POLICY', 'legacy-boundary/denylist.yml', `invalid exclude path at rule index ${index}`);
  }
  for (const [index, exception] of exceptionObjects.entries()) {
    const createdMs = Date.parse(`${exception.created_at}T00:00:00Z`);
    const expiresMs = exception.expires_at === undefined ? undefined : Date.parse(`${exception.expires_at}T00:00:00Z`);
    if (!safePath(exception.path) || /[*?{}[\]]/.test(exception.path) || !exception.rule_id || typeof exception.reviewer !== 'string' || !exception.reviewer.trim() || typeof exception.rationale !== 'string' || !exception.rationale.trim() || !validDate(exception.created_at) || (exception.expires_at !== undefined && !validDate(exception.expires_at)) || createdMs > baselineMs || (expiresMs !== undefined && (expiresMs <= baselineMs || expiresMs <= createdMs))) issue(errors, 'LEGACY_POLICY', 'legacy-boundary/denylist.yml', `invalid reviewed exception at index ${index} (malformed or inactive)`);
    if (!denyRules.some(rule => rule.id === exception.rule_id)) issue(errors, 'LEGACY_POLICY', 'legacy-boundary/denylist.yml', `reviewed exception references unknown rule ${exception.rule_id}`);
  }
  for (const [file, text] of texts) {
    for (const rule of denyRules) {
      const includes = strings(rule.include);
      const included = !includes.length || includes.some(candidate => candidate === '**/*' || candidate === file);
      const excluded = strings(rule.exclude).includes(file);
      if (!included || excluded) continue;
      let pattern;
      try { pattern = new RegExp(String(rule.pattern), rule.flags || 'i'); } catch { issue(errors, 'LEGACY_POLICY', 'legacy-boundary/denylist.yml', `invalid denylist rule ${rule.id || 'unknown'}`); continue; }
      if (!pattern.test(text)) continue;
      const exceptionIndex = exceptionObjects.findIndex(exception => exception.path === file && exception.rule_id === rule.id && safePath(exception.path) && validDate(exception.created_at) && (exception.expires_at === undefined || validDate(exception.expires_at)) && typeof exception.reviewer === 'string' && exception.reviewer.trim() && typeof exception.rationale === 'string' && exception.rationale.trim());
      if (exceptionIndex >= 0) usedExceptions.add(exceptionIndex);
      else issue(errors, 'LEGACY', file, `unreviewed prohibited legacy construct (${rule.id || 'rule'})`);
    }
  }
  exceptionObjects.forEach((exception, index) => { if (!usedExceptions.has(index)) issue(errors, 'LEGACY_POLICY', 'legacy-boundary/denylist.yml', `unused reviewed exception ${exception.rule_id || 'unknown'} for ${exception.path || 'unknown'}`); });

  for (const [file, text] of texts) if (secretPatterns.some(pattern => pattern.test(text))) issue(errors, 'SECRET', file, 'possible secret detected (value redacted)');

  if (fileSet.has('curriculum.lock.yml') && curriculum) {
    try { const expected = await lockDocument(root); const actual = docs.get('curriculum.lock.yml'); if (JSON.stringify(expected) !== JSON.stringify(actual)) issue(errors, 'LOCK', 'curriculum.lock.yml', 'lock is stale or non-deterministic'); } catch (e) { issue(errors, 'LOCK', 'curriculum.lock.yml', e.message); }
  }
  if (fileSet.has('INTEGRITY.SHA256')) {
    try { const actual = texts.get('INTEGRITY.SHA256'); const expected = await integrityText(root); if (actual !== expected) issue(errors, 'INTEGRITY', 'INTEGRITY.SHA256', 'root integrity manifest is stale'); } catch (e) { issue(errors, 'INTEGRITY', 'INTEGRITY.SHA256', e.message); }
  }
  return errors;
}
