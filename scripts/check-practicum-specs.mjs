#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { parseYaml } from './lib/core.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sameSet = (left, right) => left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);

const semanticError = (scenarioId, path, message) => `${scenarioId} ${path}: ${message}`;
const ordered = (items, key) => items.every((item, index) => item?.[key] === index + (items[0]?.[key] === 0 ? 0 : 1));
const phaseRank = new Map(['proposal', 'authorization', 'dispatch', 'observation', 'verification', 'reconciliation'].map((value, index) => [value, index]));

export function validatePracticumArtifactSemantics(scenarioId, bundle) {
  if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) return [semanticError(scenarioId, '$', 'artifact bundle must be an object')];
  const errors = [];
  if (scenarioId === 'SCN-PROVISIONING') {
    const report = bundle['reconciliation-report.json'];
    const trace = bundle['controller-trace.jsonl'];
    if (!report || !Array.isArray(report.lookups)) errors.push(semanticError(scenarioId, 'reconciliation-report.json.lookups', 'must be present'));
    else {
      if (!ordered(report.lookups, 'order')) errors.push(semanticError(scenarioId, 'reconciliation-report.json.lookups', 'orders must be contiguous and ascending'));
      for (const [index, lookup] of report.lookups.entries()) {
        const path = `reconciliation-report.json.lookups[${index}]`;
        const count = Array.isArray(lookup.candidateIds) ? lookup.candidateIds.length : -1;
        if (lookup.matchCount !== count) errors.push(semanticError(scenarioId, `${path}.matchCount`, 'must equal candidateIds length'));
        const expected = count === 1 ? 'exactly-one' : count === 0 ? 'none' : 'ambiguous';
        if (lookup.decision !== expected) errors.push(semanticError(scenarioId, `${path}.decision`, `must be ${expected} for ${count} matches`));
        if (count !== 1 && lookup.retryPermitted !== false) errors.push(semanticError(scenarioId, `${path}.retryPermitted`, 'must be false unless exactly one authoritative match exists'));
        if (lookup.retryPermitted && (typeof lookup.prerequisite !== 'string' || !lookup.prerequisite.trim())) errors.push(semanticError(scenarioId, `${path}.prerequisite`, 'must explicitly identify the satisfied retry prerequisite'));
      }
      if (report.lookups.some(item => item.matchCount !== 1)) {
        if (report.allowedNextAction !== 'operator-disposition' && report.allowedNextAction !== 'stop') errors.push(semanticError(scenarioId, 'reconciliation-report.json.allowedNextAction', 'ambiguity or no match requires stop or operator disposition'));
        if (typeof report.stopReason !== 'string' || !report.stopReason.trim()) errors.push(semanticError(scenarioId, 'reconciliation-report.json.stopReason', 'is required for ambiguity or no match'));
      }
    }
    if (!Array.isArray(trace) || !ordered(trace, 'sequence')) errors.push(semanticError(scenarioId, 'controller-trace.jsonl', 'sequence must be contiguous and ascending'));
  } else if (scenarioId === 'SCN-STREAM-RECOVERY') {
    // Scenario 2's cross-field constraints are fully represented in its closed artifact schema.
  } else if (scenarioId === 'SCN-TOOLS-EFFECTS') {
    const authority = bundle['tool-authority.json'];
    const ledger = bundle['effect-ledger.json'];
    const report = bundle['reconciliation-report.json'];
    const trace = bundle['controller-trace.jsonl'];
    if (![authority, ledger, report].every(Boolean)) errors.push(semanticError(scenarioId, '$', 'authority, ledger, and reconciliation artifacts are required'));
    else {
      for (const [field, values] of Object.entries({ requestKey: [ledger.requestKey, report.requestKey], proposalId: [authority.proposalId, ledger.proposalId], authorizedInputDigest: [authority.authorizedInputDigest, ledger.authorizedInputDigest] })) if (new Set(values).size !== 1) errors.push(semanticError(scenarioId, field, 'must agree across artifacts'));
      const matches = Array.isArray(report.lookup?.matches) ? report.lookup.matches : [];
      if (report.lookup?.attempts > report.lookup?.maximumAttempts) errors.push(semanticError(scenarioId, 'reconciliation-report.json.lookup.attempts', 'must not exceed maximumAttempts'));
      const ambiguity = matches.length === 0 ? 'zero-matches' : matches.length === 1 ? 'none' : 'multiple-matches';
      if (report.ambiguity !== ambiguity) errors.push(semanticError(scenarioId, 'reconciliation-report.json.ambiguity', `must be ${ambiguity} for ${matches.length} matches`));
      const uncertain = ledger.dispatchState === 'dispatched' && ['timeout', 'aborted'].includes(ledger.observationState) && ledger.verificationState !== 'one-match';
      if (uncertain && !['bounded-lookup', 'operator-review'].includes(report.allowedNextAction)) errors.push(semanticError(scenarioId, 'reconciliation-report.json.allowedNextAction', 'uncertain dispatched effects require bounded lookup or operator review'));
      if (report.lookup?.attempts >= report.lookup?.maximumAttempts && report.allowedNextAction === 'bounded-lookup') errors.push(semanticError(scenarioId, 'reconciliation-report.json.allowedNextAction', 'cannot continue lookup after the attempt limit'));
      if (ledger.effectClass === 'irreversible' && ['separately-authorized-retry', 'separately-authorized-compensation'].includes(report.allowedNextAction)) errors.push(semanticError(scenarioId, 'reconciliation-report.json.allowedNextAction', 'irreversible effects cannot be retried or compensated'));
      if (report.allowedNextAction === 'separately-authorized-compensation' && ledger.effectClass !== 'compensatable') errors.push(semanticError(scenarioId, 'reconciliation-report.json.allowedNextAction', 'compensation requires a compensatable effect'));
      if (report.allowedNextAction === 'separately-authorized-retry' && (!['read-only', 'idempotent'].includes(ledger.effectClass) || ledger.reconciliationState === 'uncertain')) errors.push(semanticError(scenarioId, 'reconciliation-report.json.allowedNextAction', 'retry requires resolved read-only or idempotent effect state'));
    }
    if (!Array.isArray(trace) || !ordered(trace, 'sequence') || trace.some((item, index) => index && phaseRank.get(item.phase) < phaseRank.get(trace[index - 1].phase))) errors.push(semanticError(scenarioId, 'controller-trace.jsonl', 'sequence must be contiguous and phases nondecreasing'));
  } else if (scenarioId === 'SCN-SUPERVISED-IMPROVEMENT') {
    const ledger = bundle['operation-ledger.json'];
    const supervision = bundle['supervision-report.json'];
    const improvement = bundle['improvement-record.json'];
    const trace = bundle['controller-trace.jsonl'];
    if (![ledger, supervision, improvement].every(Boolean)) errors.push(semanticError(scenarioId, '$', 'ledger, supervision, and improvement artifacts are required'));
    else {
      const entries = ledger.entries ?? [];
      if (!ordered(entries, 'sequence')) errors.push(semanticError(scenarioId, 'operation-ledger.json.entries', 'sequence must be contiguous and ascending'));
      const completed = new Set();
      for (const [index, entry] of entries.entries()) {
        if (entry.budget_remaining !== entry.budget_limit - entry.budget_consumed || entry.budget_remaining < 0) errors.push(semanticError(scenarioId, `operation-ledger.json.entries[${index}]`, 'budget fields must balance without underflow'));
        const authorized = entry.lease_state === 'active' && entry.supervisor_authority === 'active' && entry.budget_remaining > 0 && entry.expected_version === entry.authoritative_version && entry.cas_result === 'won';
        if (entry.effect_dispatched && !authorized) errors.push(semanticError(scenarioId, `operation-ledger.json.entries[${index}].effect_dispatched`, 'dispatch requires authority, active lease, positive budget, matching version, and won CAS'));
        if (entry.authoritative_completion && (!authorized || !entry.effect_dispatched)) errors.push(semanticError(scenarioId, `operation-ledger.json.entries[${index}].authoritative_completion`, 'completion requires an authorized dispatched winning claim'));
        const key = `${entry.work_key}:${entry.authoritative_version}`;
        if (entry.authoritative_completion && completed.has(key)) errors.push(semanticError(scenarioId, `operation-ledger.json.entries[${index}]`, 'duplicate authoritative completion for work/version'));
        if (entry.authoritative_completion) completed.add(key);
        const priorLoss = entries.slice(0, index).some(prior => prior.controller_id === entry.controller_id && prior.tick <= entry.tick && (prior.lease_state !== 'active' || prior.supervisor_authority !== 'active' || prior.budget_remaining === 0));
        if (priorLoss && entry.effect_dispatched) errors.push(semanticError(scenarioId, `operation-ledger.json.entries[${index}].effect_dispatched`, 'later dispatch is forbidden after authority, lease, or budget loss'));
      }
      if (supervision.later_effect_dispatch_blocked !== true) errors.push(semanticError(scenarioId, 'supervision-report.json.later_effect_dispatch_blocked', 'must attest the fail-closed dispatch block'));
      if (improvement.evaluator?.evaluator_id === improvement.proposal?.proposer_id) errors.push(semanticError(scenarioId, 'improvement-record.json.evaluator.evaluator_id', 'must differ from proposer_id'));
      const gates = improvement.frozen_evaluation?.gates ?? [];
      const allPassed = gates.length > 0 && gates.every(gate => gate.passed === true);
      if (improvement.frozen_evaluation?.all_mandatory_gates_passed !== allPassed) errors.push(semanticError(scenarioId, 'improvement-record.json.frozen_evaluation.all_mandatory_gates_passed', 'must equal the conjunction of mandatory gates'));
      const transitions = improvement.transitions ?? [];
      if (!ordered(transitions, 'sequence')) errors.push(semanticError(scenarioId, 'improvement-record.json.transitions', 'sequence must be contiguous and ascending'));
      for (let index = 1; index < transitions.length; index++) if (transitions[index - 1].to !== transitions[index].from || transitions[index - 1].tick > transitions[index].tick) errors.push(semanticError(scenarioId, `improvement-record.json.transitions[${index}]`, 'must continue the prior state in nondecreasing tick order'));
      const edges = new Set(transitions.map(item => `${item.from}->${item.to}`));
      if (improvement.promotion_decision === 'promote') {
        if (!allPassed || !edges.has('independent-evaluation->promotion') || !edges.has('promotion->monitoring') || !improvement.rollback_target?.trim()) errors.push(semanticError(scenarioId, 'improvement-record.json.promotion_decision', 'promotion requires all gates, promotion and monitoring transitions, and rollback readiness'));
      } else if (!edges.has('independent-evaluation->rejection') || !(improvement.rejection_rationale?.length > 0)) errors.push(semanticError(scenarioId, 'improvement-record.json.promotion_decision', 'rejection requires its transition and rationale'));
      const observations = improvement.monitoring?.observations ?? [];
      const uncertain = observations.some(item => item.certainty === 'uncertain');
      const regression = observations.some(item => item.certainty === 'certain' && item.value > improvement.monitoring.threshold);
      const terminal = improvement.monitoring?.terminal_decision;
      if (uncertain && terminal !== 'safe-stop') errors.push(semanticError(scenarioId, 'improvement-record.json.monitoring.terminal_decision', 'uncertainty requires safe-stop'));
      else if (regression && terminal !== 'rollback') errors.push(semanticError(scenarioId, 'improvement-record.json.monitoring.terminal_decision', 'regression requires rollback'));
      else if (!uncertain && !regression && terminal !== 'retained') errors.push(semanticError(scenarioId, 'improvement-record.json.monitoring.terminal_decision', 'retention requires certain non-regressing observations'));
      if (!edges.has(`monitoring->${terminal}`) && improvement.promotion_decision === 'promote') errors.push(semanticError(scenarioId, 'improvement-record.json.transitions', 'must record the monitoring terminal transition'));
    }
    if (!Array.isArray(trace) || !ordered(trace, 'sequence')) errors.push(semanticError(scenarioId, 'controller-trace.jsonl', 'sequence must be contiguous and ascending'));
  } else errors.push(semanticError(scenarioId, '$', 'unsupported scenario identifier'));
  return errors;
}

export async function checkPracticumSpecifications(root = ROOT) {
  const read = relative => readFile(path.join(root, relative), 'utf8');
  const registry = parseYaml(await read('practicum/registry.yml'), 'practicum/registry.yml');
  const ledger = parseYaml(await read('capabilities/sdk-exports.yml'), 'capabilities/sdk-exports.yml');
  const rootExports = new Set((ledger.entries ?? []).filter(entry => entry.entrypoint === '.').map(entry => entry.symbol));
  const errors = [];
  for (const scenario of registry.scenarios ?? []) {
  const files = scenario.specification_files ?? [];
  const inputPath = files.find(file => file.endsWith('/input.json'));
  const contractPath = files.find(file => file.endsWith('/contracts.d.ts'));
  const schemaPath = files.find(file => file.endsWith('/artifact-bundle.schema.json'));
  if (files.length !== 3 || !inputPath || !contractPath || !schemaPath) {
    errors.push(`${scenario.id}: specification_files must name input, contracts, and artifact schema exactly once`);
    continue;
  }

  let input, schema, contract, brief;
  try { const text = await read(inputPath); input = JSON.parse(text); parseYaml(text, inputPath); } catch (error) { errors.push(`${scenario.id}: invalid input JSON (${error.message})`); continue; }
  try { const text = await read(schemaPath); schema = JSON.parse(text); parseYaml(text, schemaPath); } catch (error) { errors.push(`${scenario.id}: invalid artifact schema JSON (${error.message})`); continue; }
  try { contract = await read(contractPath); brief = await read(scenario.brief_path); } catch (error) { errors.push(`${scenario.id}: unreadable specification file (${error.message})`); continue; }

  const expectedDirectory = `submission/${scenario.id}`;
  if (input.scenarioId !== scenario.id) errors.push(`${scenario.id}: input scenarioId mismatch`);
  if (input.namespace !== scenario.synthetic_namespace) errors.push(`${scenario.id}: input namespace mismatch`);
  if (input.submissionDirectory !== expectedDirectory) errors.push(`${scenario.id}: input submissionDirectory mismatch`);
  if (input.executionAuthorized !== false || input.scoringAuthorized !== false) errors.push(`${scenario.id}: input must deny execution and scoring`);
  const perturbationText = JSON.stringify(input.protectedPerturbations ?? {});
  if (!input.protectedPerturbations || (!/false/.test(perturbationText) && !/withheld/.test(perturbationText))) errors.push(`${scenario.id}: input must expose protected perturbation custody without values`);
  for (const file of files) if (!brief.includes(path.basename(file))) errors.push(`${scenario.id}: brief does not reference ${path.basename(file)}`);
  if (scenario.implementation_entry !== 'src/controller.ts' || !brief.includes('src/controller.ts')) errors.push(`${scenario.id}: brief and registry must declare src/controller.ts implementation entry`);

  const expectedArtifacts = (scenario.artifacts ?? []).map(artifact => artifact.path);
  const required = schema.required ?? [];
  const properties = Object.keys(schema.properties ?? {});
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema' || schema.type !== 'object' || schema.additionalProperties !== false) errors.push(`${scenario.id}: artifact schema must be a closed Draft 2020-12 object`);
  if (!sameSet(required, expectedArtifacts) || !sameSet(properties, expectedArtifacts)) errors.push(`${scenario.id}: artifact schema root must contain exactly the registered artifact filenames`);
  try { new Ajv2020({ strict: true, validateFormats: false }).compile(schema); } catch (error) { errors.push(`${scenario.id}: artifact schema does not compile (${error.message})`); }

  const imports = [...contract.matchAll(/import\s+type\s*{([\s\S]*?)}\s+from\s+["']@letta-ai\/letta-agent-sdk["'];/g)]
    .flatMap(match => match[1].split(',').map(value => value.trim()).filter(Boolean));
  if (!imports.length) errors.push(`${scenario.id}: contracts must identify exact-static SDK root types`);
  for (const imported of imports) if (!rootExports.has(imported)) errors.push(`${scenario.id}: contracts import absent root SDK export ${imported}`);
  if (/\bfrom\s+["']@letta-ai\/letta-agent-sdk\//.test(contract) || /import\s+(?!type\b)/.test(contract)) errors.push(`${scenario.id}: contracts may use type-only SDK root imports only`);
  for (const literal of [scenario.id, scenario.synthetic_namespace, 'submissionDirectory', 'executionAuthorized', 'scoringAuthorized', 'protectedPerturbations']) if (!contract.includes(literal)) errors.push(`${scenario.id}: contracts omit ${literal}`);
  }
  return { ok: errors.length === 0, errors, scenarioCount: registry.scenarios?.length ?? 0 };
}

export async function main(args = process.argv.slice(2)) {
  if (args.length > 1 || args.some(arg => arg.startsWith('-'))) {
    console.error('usage: node scripts/check-practicum-specs.mjs [repository-root]');
    return 2;
  }
  try {
    const result = await checkPracticumSpecifications(path.resolve(args[0] || ROOT));
    if (!result.ok) {
      for (const error of result.errors) console.error(`PRACTICUM_SPEC: ${error}`);
      return 1;
    }
    console.log(`practicum specification check passed (${result.scenarioCount} scenarios)`);
    return 0;
  } catch (error) {
    console.error(`practicum specification check failed: ${error.message}`);
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) process.exitCode = await main();
