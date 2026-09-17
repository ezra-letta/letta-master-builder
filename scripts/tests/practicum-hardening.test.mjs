import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePracticumArtifactSemantics as validate } from '../check-practicum-specs.mjs';

const trace = (phases = ['proposal']) => phases.map((phase, index) => ({ sequence: index + 1, phase }));

function scenario1(overrides = {}) {
  return {
    'reconciliation-report.json': {
      lookups: [{ order: 1, candidateIds: ['agent_one'], matchCount: 1, decision: 'exactly-one', retryPermitted: true, prerequisite: 'authoritative identity reconciled' }],
      allowedNextAction: 'retry-failed-sub-effect', stopReason: null,
      ...overrides,
    },
    'controller-trace.jsonl': trace(),
  };
}

function scenario3(overrides = {}) {
  const bundle = {
    'tool-authority.json': { proposalId: 'p1', authorizedInputDigest: 'sha256:x' },
    'effect-ledger.json': { requestKey: 'r1', proposalId: 'p1', authorizedInputDigest: 'sha256:x', effectClass: 'idempotent', dispatchState: 'dispatched', observationState: 'timeout', verificationState: 'zero-matches', reconciliationState: 'uncertain' },
    'reconciliation-report.json': { requestKey: 'r1', lookup: { attempts: 1, maximumAttempts: 2, matches: [] }, ambiguity: 'zero-matches', allowedNextAction: 'bounded-lookup' },
    'controller-trace.jsonl': trace(['proposal', 'authorization', 'dispatch', 'observation', 'verification', 'reconciliation']),
  };
  return Object.assign(bundle, overrides);
}

function scenario4(improvementOverrides = {}, entryOverrides = {}) {
  const improvement = {
    proposal: { proposer_id: 'proposer', baseline_version: 'v1' },
    evaluator: { evaluator_id: 'evaluator' },
    frozen_evaluation: { gates: [{ gate_id: 'g1', passed: true }], all_mandatory_gates_passed: true },
    transitions: [
      { sequence: 0, tick: 1, from: 'proposal', to: 'independent-evaluation' },
      { sequence: 1, tick: 2, from: 'independent-evaluation', to: 'promotion' },
      { sequence: 2, tick: 3, from: 'promotion', to: 'monitoring' },
      { sequence: 3, tick: 4, from: 'monitoring', to: 'retained' },
    ],
    promotion_decision: 'promote', rejection_rationale: [], rollback_target: 'v1',
    monitoring: { threshold: 5, observations: [{ tick: 4, value: 4, certainty: 'certain' }], terminal_decision: 'retained' },
    ...improvementOverrides,
  };
  return {
    'operation-ledger.json': { entries: [{ sequence: 0, tick: 1, controller_id: 'controller-a', work_key: 'w', expected_version: 1, authoritative_version: 1, cas_result: 'won', lease_state: 'active', budget_limit: 2, budget_consumed: 1, budget_remaining: 1, supervisor_authority: 'active', effect_dispatched: true, authoritative_completion: true, ...entryOverrides }] },
    'supervision-report.json': { later_effect_dispatch_blocked: true },
    'improvement-record.json': improvement,
    'controller-trace.jsonl': [{ sequence: 0 }],
  };
}

test('scenario 1 accepts consistent exact-one retry and rejects match ambiguity lies', () => {
  assert.deepEqual(validate('SCN-PROVISIONING', scenario1()), []);
  const bad = scenario1({ lookups: [{ order: 1, candidateIds: ['a', 'b'], matchCount: 1, decision: 'exactly-one', retryPermitted: true, prerequisite: 'claimed' }] });
  assert.match(validate('SCN-PROVISIONING', bad).join('\n'), /matchCount|decision|retryPermitted/);
});

test('semantic validation fails closed for unknown scenario identifiers', () => {
  assert.match(validate('SCN-UNKNOWN', {}).join('\n'), /unsupported scenario identifier/);
});

test('scenario 3 bounds uncertain lookup and forbids irreversible retry or compensation', () => {
  assert.deepEqual(validate('SCN-TOOLS-EFFECTS', scenario3()), []);
  const report = { requestKey: 'r1', lookup: { attempts: 2, maximumAttempts: 2, matches: [] }, ambiguity: 'zero-matches', allowedNextAction: 'separately-authorized-compensation' };
  const bad = scenario3({ 'effect-ledger.json': { ...scenario3()['effect-ledger.json'], effectClass: 'irreversible' }, 'reconciliation-report.json': report });
  assert.match(validate('SCN-TOOLS-EFFECTS', bad).join('\n'), /uncertain|irreversible/);
});

test('scenario 3 rejects lookup continuation at its maximum attempt', () => {
  const bad = scenario3();
  bad['reconciliation-report.json'].lookup.attempts = 2;
  assert.match(validate('SCN-TOOLS-EFFECTS', bad).join('\n'), /attempt limit/);
});

test('scenario 4 accepts a gated promotion with certain non-regressing monitoring', () => {
  assert.deepEqual(validate('SCN-SUPERVISED-IMPROVEMENT', scenario4()), []);
});

test('scenario 4 rejects dispatch without lease authority or budget', () => {
  assert.match(validate('SCN-SUPERVISED-IMPROVEMENT', scenario4({}, { lease_state: 'lost' })).join('\n'), /dispatch requires authority/);
  assert.match(validate('SCN-SUPERVISED-IMPROVEMENT', scenario4({}, { budget_consumed: 2, budget_remaining: 0 })).join('\n'), /dispatch requires authority/);
});

test('scenario 4 enforces evaluator distinction and mandatory gate consistency', () => {
  const bad = scenario4({ evaluator: { evaluator_id: 'proposer' }, frozen_evaluation: { gates: [{ gate_id: 'g1', passed: false }], all_mandatory_gates_passed: true } });
  assert.match(validate('SCN-SUPERVISED-IMPROVEMENT', bad).join('\n'), /differ from proposer_id/);
  assert.match(validate('SCN-SUPERVISED-IMPROVEMENT', bad).join('\n'), /conjunction of mandatory gates/);
});

test('scenario 4 sends regression to rollback and uncertainty to safe-stop', () => {
  const regression = scenario4({ monitoring: { threshold: 5, observations: [{ tick: 4, value: 6, certainty: 'certain' }], terminal_decision: 'retained' } });
  assert.match(validate('SCN-SUPERVISED-IMPROVEMENT', regression).join('\n'), /regression requires rollback/);
  const uncertain = scenario4({ monitoring: { threshold: 5, observations: [{ tick: 4, value: 4, certainty: 'uncertain' }], terminal_decision: 'retained' } });
  assert.match(validate('SCN-SUPERVISED-IMPROVEMENT', uncertain).join('\n'), /uncertainty requires safe-stop/);
});
