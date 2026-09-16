#!/usr/bin/env node
import fs from 'node:fs';

export function evaluateAudit(audit, config, now = new Date()) {
  const errors = [];
  if (!audit || typeof audit !== 'object' || Array.isArray(audit) || !audit.vulnerabilities || typeof audit.vulnerabilities !== 'object' || Array.isArray(audit.vulnerabilities) || audit.error) errors.push('invalid npm audit result');
  if (!config || config.schemaVersion !== 2 || !Array.isArray(config.exceptions)) errors.push('invalid exception configuration');
  const exceptions = config?.exceptions ?? [];
  const required = ['advisory', 'package', 'affected_range', 'severity', 'scope', 'reviewer', 'reference', 'created_at', 'expires_at'];
  const byAdvisory = new Map();
  for (const exception of exceptions) {
    for (const field of required) if (typeof exception[field] !== 'string' || !exception[field]) errors.push(`exception missing ${field}`);
    if (!['high', 'critical'].includes(exception.severity)) errors.push(`invalid exception severity: ${exception.severity}`);
    if (byAdvisory.has(exception.advisory)) errors.push(`duplicate exception: ${exception.advisory}`);
    byAdvisory.set(exception.advisory, exception);
    for (const field of ['created_at', 'expires_at']) {
      const value = exception[field] ?? '';
      const parsed = Date.parse(value);
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) || !Number.isFinite(parsed) || new Date(parsed).toISOString().replace('.000Z', 'Z') !== value) errors.push(`invalid ${field}: ${exception.advisory}`);
    }
    if (!['dev', 'production', 'optional', 'peer', 'all'].includes(exception.scope)) errors.push(`invalid exception scope: ${exception.advisory}`);
    try { const reference = new URL(exception.reference); if (reference.protocol !== 'https:' || reference.username || reference.password) throw new Error(); }
    catch { errors.push(`invalid exception reference: ${exception.advisory}`); }
    if (Date.parse(exception.expires_at) <= now.getTime()) errors.push(`expired exception: ${exception.advisory}`);
    if (Date.parse(exception.created_at) > now.getTime() || Date.parse(exception.created_at) >= Date.parse(exception.expires_at)) errors.push(`invalid exception dates: ${exception.advisory}`);
  }
  const used = new Set();
  for (const [packageName, vulnerability] of Object.entries(audit?.vulnerabilities ?? {})) {
    if (!['high', 'critical'].includes(vulnerability.severity)) continue;
    const vias = Array.isArray(vulnerability.via) ? vulnerability.via.filter((via) => via && typeof via === 'object') : [];
    if (!vias.length) errors.push(`unexcepted ${vulnerability.severity} vulnerability: ${packageName}`);
    for (const via of vias) {
      const advisory = String(via.source ?? via.url ?? '');
      const exception = byAdvisory.get(advisory);
      if (!exception || exception.package !== packageName || exception.affected_range !== String(via.range ?? vulnerability.range ?? '') || exception.severity !== vulnerability.severity)
        errors.push(`unexcepted ${vulnerability.severity} advisory: ${packageName}/${advisory}`);
      else used.add(advisory);
    }
  }
  for (const advisory of byAdvisory.keys()) if (!used.has(advisory)) errors.push(`unused exception: ${advisory}`);
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const config = JSON.parse(fs.readFileSync(new URL('./audit-exceptions.json', import.meta.url), 'utf8'));
    const audit = JSON.parse(fs.readFileSync(0, 'utf8'));
    const errors = evaluateAudit(audit, config);
    for (const error of errors) console.error(error);
    if (errors.length) process.exitCode = 1;
  } catch (error) { console.error(`invalid audit input: ${error.message}`); process.exitCode = 1; }
}
