#!/usr/bin/env node
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const VALID_PROJECTS = new Set(['root', 'vertical-slice']);
const VALID_SCOPES = new Set(['dev', 'production', 'optional', 'peer', 'all']);

function dependencyScopes(vulnerability, context) {
  const scopes = new Set();
  for (const node of vulnerability?.nodes ?? []) for (const scope of context?.nodeScopes?.[node] ?? []) scopes.add(scope);
  if (vulnerability?.isDev) scopes.add('dev');
  if (vulnerability?.isOptional) scopes.add('optional');
  if (vulnerability?.isPeer) scopes.add('peer');
  if (!scopes.size) scopes.add('production');
  return scopes;
}

export function evaluateAudit(audit, config, context, now = new Date()) {
  const errors = [];
  if (!audit || typeof audit !== 'object' || Array.isArray(audit) || !audit.vulnerabilities || typeof audit.vulnerabilities !== 'object' || Array.isArray(audit.vulnerabilities) || audit.error) errors.push('invalid npm audit result');
  if (!config || config.schemaVersion !== 2 || !Array.isArray(config.exceptions)) errors.push('invalid exception configuration');
  if (!context || !VALID_PROJECTS.has(context.project) || typeof context.lockfile !== 'string' || !context.lockfile) errors.push('invalid audit context');
  const exceptions = config?.exceptions ?? [];
  const required = ['advisory', 'package', 'affected_range', 'severity', 'project', 'lockfile', 'scope', 'reviewer', 'reference', 'created_at', 'expires_at'];
  const byKey = new Map();
  for (const exception of exceptions) {
    for (const field of required) if (typeof exception[field] !== 'string' || !exception[field]) errors.push(`exception missing ${field}`);
    if (!['high', 'critical'].includes(exception.severity)) errors.push(`invalid exception severity: ${exception.severity}`);
    if (!VALID_PROJECTS.has(exception.project)) errors.push(`invalid exception project: ${exception.project}`);
    if (!VALID_SCOPES.has(exception.scope)) errors.push(`invalid exception scope: ${exception.scope}`);
    const key = `${exception.project}\0${exception.lockfile}\0${exception.advisory}\0${exception.package}`;
    if (byKey.has(key)) errors.push(`duplicate exception: ${exception.advisory}`);
    byKey.set(key, exception);
    for (const field of ['created_at', 'expires_at']) {
      const value = exception[field] ?? '';
      const parsed = Date.parse(value);
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) || !Number.isFinite(parsed) || new Date(parsed).toISOString().replace('.000Z', 'Z') !== value) errors.push(`invalid ${field}: ${exception.advisory}`);
    }
    try { const reference = new URL(exception.reference); if (reference.protocol !== 'https:' || reference.username || reference.password) throw new Error(); }
    catch { errors.push(`invalid exception reference: ${exception.advisory}`); }
    if (Date.parse(exception.expires_at) <= now.getTime()) errors.push(`expired exception: ${exception.advisory}`);
    if (Date.parse(exception.created_at) > now.getTime() || Date.parse(exception.created_at) >= Date.parse(exception.expires_at)) errors.push(`invalid exception dates: ${exception.advisory}`);
  }
  const used = new Set();
  const directCoverage = new Map();
  const packagesWithDirectErrors = new Set();
  for (const [packageName, vulnerability] of Object.entries(audit?.vulnerabilities ?? {})) {
    if (!['high', 'critical'].includes(vulnerability.severity)) continue;
    const vias = Array.isArray(vulnerability.via) ? vulnerability.via : [];
    for (const [index, via] of vias.entries()) {
      if (!via || typeof via !== 'object') continue;
      const advisory = String(via.source ?? via.url ?? '');
      const key = `${context?.project}\0${context?.lockfile}\0${advisory}\0${packageName}`;
      const exception = byKey.get(key);
      const scopes = dependencyScopes(vulnerability, context);
      const scopeMatches = exception?.scope === 'all' || scopes.has(exception?.scope);
      const covered = Boolean(exception && exception.affected_range === String(via.range ?? vulnerability.range ?? '') && exception.severity === vulnerability.severity && scopeMatches);
      directCoverage.set(`${packageName}\0${index}`, covered);
      if (!covered) {
        packagesWithDirectErrors.add(packageName);
        errors.push(`unexcepted ${vulnerability.severity} advisory: ${packageName}/${advisory}`);
      } else used.add(key);
    }
  }
  const coverageMemo = new Map();
  function vulnerabilityCovered(packageName, visiting = new Set()) {
    if (coverageMemo.has(packageName)) return coverageMemo.get(packageName);
    if (visiting.has(packageName)) return false;
    const vulnerability = audit?.vulnerabilities?.[packageName];
    if (!vulnerability || !['high', 'critical'].includes(vulnerability.severity) || !Array.isArray(vulnerability.via) || !vulnerability.via.length) return false;
    const next = new Set(visiting).add(packageName);
    const covered = vulnerability.via.every((via, index) => via && typeof via === 'object'
      ? directCoverage.get(`${packageName}\0${index}`) === true
      : typeof via === 'string' && vulnerabilityCovered(via, next));
    coverageMemo.set(packageName, covered);
    return covered;
  }
  for (const [packageName, vulnerability] of Object.entries(audit?.vulnerabilities ?? {})) {
    if (!['high', 'critical'].includes(vulnerability.severity)) continue;
    if (!packagesWithDirectErrors.has(packageName) && !vulnerabilityCovered(packageName)) errors.push(`unexcepted ${vulnerability.severity} vulnerability: ${packageName}`);
  }
  for (const [key, exception] of byKey) if (exception.project === context?.project && exception.lockfile === context?.lockfile && !used.has(key)) errors.push(`unused exception: ${exception.advisory}`);
  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  try {
    const [project, lockfile] = process.argv.slice(2);
    const config = JSON.parse(fs.readFileSync(new URL('./audit-exceptions.json', import.meta.url), 'utf8'));
    const audit = JSON.parse(fs.readFileSync(0, 'utf8'));
    const lock = JSON.parse(fs.readFileSync(lockfile, 'utf8'));
    const nodeScopes = {};
    for (const [node, metadata] of Object.entries(lock.packages ?? {})) {
      if (!node || !metadata || typeof metadata !== 'object') continue;
      const scopes = [];
      if (metadata.dev === true || metadata.devOptional === true) scopes.push('dev');
      if (metadata.optional === true || metadata.devOptional === true) scopes.push('optional');
      if (metadata.peer === true) scopes.push('peer');
      if (!scopes.length) scopes.push('production');
      nodeScopes[node] = scopes;
    }
    const errors = evaluateAudit(audit, config, { project, lockfile, nodeScopes });
    for (const error of errors) console.error(error);
    if (errors.length) process.exitCode = 1;
  } catch (error) { console.error(`invalid audit input: ${error.message}`); process.exitCode = 1; }
}
