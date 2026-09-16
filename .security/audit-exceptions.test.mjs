import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAudit } from './check-audit-exceptions.mjs';

const now = new Date('2026-01-15T00:00:00Z');
const finding = { vulnerabilities: { dep: { severity: 'high', range: '<2', via: [{ source: 123, range: '<2' }] } } };
const exception = { advisory: '123', package: 'dep', affected_range: '<2', severity: 'high', scope: 'dev', reviewer: 'security@example.test', reference: 'https://example.test/issues/1', created_at: '2026-01-01T00:00:00Z', expires_at: '2026-02-01T00:00:00Z' };
test('accepts an exact active exception', () => assert.deepEqual(evaluateAudit(finding, { schemaVersion: 2, exceptions: [exception] }, now), []));
test('rejects unexcepted findings', () => assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [] }, now).join('\n'), /unexcepted/));
test('rejects unused duplicate expired and mismatched exceptions', () => {
  assert.match(evaluateAudit({ vulnerabilities: {} }, { schemaVersion: 2, exceptions: [exception] }, now).join('\n'), /unused/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [exception, exception] }, now).join('\n'), /duplicate/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, expires_at: '2026-01-01T00:00:00Z' }] }, now).join('\n'), /expired/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, package: 'other' }] }, now).join('\n'), /unexcepted/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, created_at: '2026-02-30T00:00:00Z' }] }, now).join('\n'), /invalid created_at/);
  assert.match(evaluateAudit(finding, { schemaVersion: 2, exceptions: [{ ...exception, reference: 'http://example.test' }] }, now).join('\n'), /invalid exception reference/);
});
test('rejects malformed npm audit results', () => assert.match(evaluateAudit({ error: { summary: 'offline' } }, { schemaVersion: 2, exceptions: [] }, now).join('\n'), /invalid npm audit result/));
