import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import { parseYaml } from '../lib/core.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const schema = JSON.parse(await readFile(path.join(root, 'schemas/evaluator-report.schema.json'), 'utf8'));
delete schema['x-target'];
const validate = new Ajv2020({ allErrors: true, strict: true, validateFormats: false }).compile(schema);
const template = parseYaml(await readFile(path.join(root, 'assessments/evaluator-report.template.yml'), 'utf8'), 'evaluator-report.template.yml');
const clone = value => structuredClone(value);

function executedReport() {
  const report = clone(template);
  report.kind = 'evaluator-report';
  report.report_status = 'executed-attested-report';
  report.execution_authorized = true;
  report.admission.decision = 'admitted';
  report.machine_results = {
    status: 'passed',
    exact_package_compilation: { passed: 2, total: 2, percent: 100 },
    schema_validation: { passed: 3, total: 3, percent: 100 },
    critical_fixture_assertions: { passed: 4, total: 4, percent: 100 },
    noncritical_fixture_assertions: { passed: 9, total: 10, percent: 90 },
    deterministic_rerun: { performed: true, equivalent: true, normalization: 'documented normalization' },
    forbidden_effects: { network_requests: 0, credential_access_or_disclosure: 0, writes_outside_workspace: 0, forbidden_processes: 0, instrumentation_limitations: 'none known' },
    artifact_digests: [{ path: 'artifact.json', sha256: 'a'.repeat(64) }],
    eligible_implementation_status: 'offline-conformance-verified'
  };
  report.evaluator.independent_from_subject_attempt = true;
  report.conceptual_scores = {
    status: 'passed', domains: [{ domain_id: 'architecture', percent: 80, notes: 'passed' }],
    overall_percent: 85, critical_judgments: { passed: 2, total: 2, percent: 100 }
  };
  report.transfer_scores = {
    status: 'passed', architecture: { percent: 80, notes: 'passed' }, implementation: { percent: 80, notes: 'passed' },
    recovery: { percent: 80, notes: 'passed' }, evidence: { percent: 80, notes: 'passed' }, defense: { percent: 80, notes: 'passed' },
    overall_percent: 85, critical_judgments: { passed: 2, total: 2, percent: 100 }
  };
  for (const attestation of Object.values(report.attestations)) attestation.attested = true;
  report.decisions = {
    architecture: 'independently-verified', implementation: 'offline-conformance-verified', transfer: 'independently-verified',
    integrity: 'attested', learner_status_awarded: false, rationale: 'All contract gates passed.'
  };
  report.report_attestation = { evaluator_signature_or_attestation: 'externally supplied attestation reference', attested_at: '2026-01-01T00:00:00Z' };
  return report;
}

function expectInvalid(mutator, message) {
  const report = executedReport();
  mutator(report);
  assert.equal(validate(report), false, message);
}

test('checked-in evaluator report remains an unsigned unexecuted template', () => {
  assert.equal(validate(template), true, validate.errors && JSON.stringify(validate.errors));
  assert.equal(template.execution_authorized, false);
  assert.equal(template.report_attestation.evaluator_signature_or_attestation, 'NOT_SIGNED');
  assert.equal(template.decisions.learner_status_awarded, false);
});

test('separately authorized executed and attested report can validate', () => {
  const report = executedReport();
  assert.equal(validate(report), true, validate.errors && JSON.stringify(validate.errors));
});

test('promoted decisions require machine pass and coherent implementation eligibility', () => {
  expectInvalid(r => { r.machine_results.status = 'failed'; }, 'machine failure must block promotion');
  expectInvalid(r => { r.machine_results.noncritical_fixture_assertions.percent = 89; }, 'machine threshold must block promotion');
  expectInvalid(r => { r.machine_results.forbidden_effects.network_requests = 1; }, 'forbidden effects must block promotion');
  expectInvalid(r => { r.machine_results.eligible_implementation_status = 'compile-verified'; }, 'eligibility must match offline conformance decision');
  expectInvalid(r => { r.assessment_identity.access_mode = 'degraded-conceptual'; }, 'degraded mode must block implementation promotion');
});

test('promoted decisions require independent evaluator, attestations, and no critical failures', () => {
  expectInvalid(r => { r.evaluator.independent_from_subject_attempt = false; }, 'evaluator independence must be required');
  expectInvalid(r => { r.attestations.contamination.attested = false; }, 'all required attestations must be affirmative');
  expectInvalid(r => { r.critical_failures.observed_ids = ['CNF-001']; r.critical_failures.details = ['self promotion']; }, 'critical failures must block promotion');
});

test('promoted decisions require passing conceptual and transfer states', () => {
  expectInvalid(r => { r.conceptual_scores.status = 'failed'; }, 'conceptual state must pass');
  expectInvalid(r => { r.conceptual_scores.domains[0].percent = 79; }, 'conceptual domains must pass');
  expectInvalid(r => { r.transfer_scores.status = 'failed'; }, 'transfer state must pass');
  expectInvalid(r => { r.transfer_scores.recovery.percent = 79; }, 'transfer domains must pass');
  expectInvalid(r => { r.transfer_scores.critical_judgments.percent = 99; }, 'critical judgments must pass');
});

test('executed report requires authorization and genuine report attestation while never awarding learner status', () => {
  expectInvalid(r => { r.execution_authorized = false; }, 'executed report must be authorized');
  expectInvalid(r => { r.report_attestation.evaluator_signature_or_attestation = 'NOT_SIGNED'; }, 'executed report must be attested');
  expectInvalid(r => { r.decisions.learner_status_awarded = true; }, 'report cannot award learner status');
  expectInvalid(r => { r.awards_learner_status = true; }, 'contract cannot claim award authority');
});
