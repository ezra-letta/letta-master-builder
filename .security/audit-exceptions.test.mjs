import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAudit } from './check-audit-exceptions.mjs';

const now = new Date('2026-01-15T00:00:00Z');
const context = { project: 'vertical-slice', lockfile: 'vertical-slice/package-lock.json' };
const finding = { vulnerabilities: { dep: { severity: 'high', range: '<2', isDev: true, via: [{ source: 123, range: '<2' }] } } };
const exception = { advisory: '123', package: 'dep', affected_range: '<2', severity: 'high', project: 'vertical-slice', lockfile: 'vertical-slice/package-lock.json', scope: 'dev', reviewer: 'security@example.test', reference: 'https://example.test/issues/1', created_at: '2026-01-01T00:00:00Z', expires_at: '2026-02-01T00:00:00Z' };
test('accepts an exact active exception', () => assert.deepEqual(evaluateAudit(finding, { schemaVersion: 2, exceptions: [exception] }, context, now), []));
test('rejects unexcepted findings', () => assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [] }, context, now).join('\n'), /unexcepted/));
test('does not authorize another project lockfile or dependency class', () => {
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, project: 'root', lockfile: 'package-lock.json' }] }, context, now).join('\n'), /unexcepted/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, lockfile: 'other/package-lock.json' }] }, context, now).join('\n'), /unexcepted/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, scope: 'production' }] }, context, now).join('\n'), /unexcepted/);
});
test('derives dependency scope from audited lockfile nodes', () => {
  const nodeFinding = { vulnerabilities: { dep: { severity: 'high', range: '<2', nodes: ['node_modules/dep'], via: [{ source: 123, range: '<2' }] } } };
  assert.deepEqual(evaluateAudit(nodeFinding, { schemaVersion: 2, exceptions: [exception] }, { ...context, nodeScopes: { 'node_modules/dep': ['dev'] } }, now), []);
  assert.match(evaluateAudit(nodeFinding, { schemaVersion: 2, exceptions: [exception] }, { ...context, nodeScopes: { 'node_modules/dep': ['production'] } }, now).join('\n'), /unexcepted/);
});
test('covers string-via parent vulnerabilities only through covered leaf advisories', () => {
  const transitive = { vulnerabilities: {
    dep: finding.vulnerabilities.dep,
    wrapper: { severity: 'high', range: '*', isDev: true, via: ['dep'] },
  } };
  assert.deepEqual(evaluateAudit(transitive, { schemaVersion: 2, exceptions: [exception] }, context, now), []);
  const errors = evaluateAudit(transitive, { schemaVersion: 2, exceptions: [] }, context, now).join('\n');
  assert.match(errors, /dep\/123/);
  assert.match(errors, /vulnerability: wrapper/);
});
test('rejects invalid audit context', () => assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [exception] }, { project: 'other', lockfile: 'package-lock.json' }, now).join('\n'), /invalid audit context/));
test('rejects unused duplicate expired and mismatched exceptions', () => {
  assert.match(evaluateAudit({ vulnerabilities: {} }, { schemaVersion: 2, exceptions: [exception] }, context, now).join('\n'), /unused/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [exception, exception] }, context, now).join('\n'), /duplicate/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, expires_at: '2026-01-01T00:00:00Z' }] }, context, now).join('\n'), /expired/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, package: 'other' }] }, context, now).join('\n'), /unexcepted/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, created_at: '2026-02-30T00:00:00Z' }] }, context, now).join('\n'), /invalid created_at/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, reference: 'http://example.test' }] }, context, now).join('\n'), /invalid exception reference/);
});
test('rejects malformed npm audit results', () => assert.match(evaluateAudit({ error: { summary: 'offline' } }, { schemaVersion: 2, exceptions: [] }, context, now).join('\n'), /invalid npm audit result/));
