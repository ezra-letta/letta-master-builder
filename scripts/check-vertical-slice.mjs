import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SLICE = path.join(ROOT, 'vertical-slice');
const packageJson = JSON.parse(await fs.readFile(path.join(SLICE, 'package.json'), 'utf8'));
const lock = JSON.parse(await fs.readFile(path.join(SLICE, 'package-lock.json'), 'utf8'));
const fixture = JSON.parse(await fs.readFile(path.join(SLICE, 'fixtures', 'provisioning-partial-success.json'), 'utf8'));

function assert(condition, message) { if (!condition) throw new Error(message); }
assert(packageJson.devDependencies['@letta-ai/letta-agent-sdk'] === '0.8.9', 'vertical slice must pin Agent SDK 0.8.9 exactly');
assert(packageJson.devDependencies.typescript === '5.9.3', 'vertical slice must pin TypeScript 5.9.3 exactly');
assert(packageJson.devDependencies['@types/node'] === '22.20.3', 'vertical slice must pin Node declarations exactly');
assert(lock.packages['node_modules/@letta-ai/letta-agent-sdk']?.version === '0.8.9', 'lockfile Agent SDK version mismatch');
assert(lock.packages['node_modules/@letta-ai/letta-code']?.version === '0.32.11', 'lockfile SDK-declared runtime version mismatch');
assert(lock.packages['node_modules/typescript']?.version === '5.9.3', 'lockfile TypeScript version mismatch');
assert(lock.packages['node_modules/@types/node']?.version === '22.20.3', 'lockfile Node declaration version mismatch');

const tsc = path.join(SLICE, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
try { await fs.access(tsc); } catch { throw new Error('vertical-slice dependencies are absent; explicit maintainer setup is npm run vertical-slice:install'); }
const compile = spawnSync(tsc, ['-p', path.join(SLICE, 'tsconfig.json'), '--noEmit'], { cwd: SLICE, encoding: 'utf8' });
if (compile.status !== 0) throw new Error(`vertical-slice TypeScript compilation failed\n${compile.stdout}\n${compile.stderr}`);

assert(fixture.fixture_id === 'FIX-PROVISIONING-PARTIAL-SUCCESS', 'fixture ID mismatch');
assert(fixture.provenance === 'project-method-only' && fixture.runtime_claim === false, 'fixture must deny runtime provenance');
assert(fixture.steps.some((step) => step.operation === 'createAgent' && step.result_agent_id === fixture.expected_result.agentId), 'fixture must preserve canonical created ID');
assert(fixture.steps.some((step) => step.operation === 'store.saveAgentId' && typeof step.error === 'string'), 'fixture must contain controller persistence failure');
assert(fixture.expected_result.state === 'created-unrecorded' && fixture.expected_result.retryWithSameRequestKey === true, 'fixture must require same-key reconciliation');
const creationRetrieval = fixture.creation_retrieval_failure;
assert(creationRetrieval.steps.some((step) => step.operation === 'createAgent' && step.result_agent_id === creationRetrieval.expected_result.agentId), 'retrieval-failure fixture must preserve the canonical ID returned by creation');
assert(creationRetrieval.steps.some((step) => step.operation === 'agents.retrieve' && step.agent_id === creationRetrieval.expected_result.agentId && typeof step.error === 'string'), 'retrieval-failure fixture must fail verification of that canonical ID');
assert(creationRetrieval.expected_result.state === 'verification-pending' && creationRetrieval.expected_result.source === 'created', 'creation retrieval failure must be typed verification-pending');
assert(creationRetrieval.expected_result.retryWithSameRequestKey === true && creationRetrieval.expected_result.prohibitBlindRecreation === true, 'creation retrieval failure must require same-key recovery and prohibit blind recreation');
assert(creationRetrieval.store_save_attempted === false, 'unverified created ID must not be persisted as verified');
const recordedRetrieval = fixture.already_recorded_retrieval_failure;
assert(recordedRetrieval.expected_result.state === 'verification-pending' && recordedRetrieval.expected_result.source === 'already-recorded', 'recorded retrieval failure must be typed verification-pending');
assert(recordedRetrieval.expected_result.agentId === recordedRetrieval.store_mapping, 'recorded retrieval failure must preserve the stored canonical ID');
assert(recordedRetrieval.expected_result.retryWithSameRequestKey === true && recordedRetrieval.expected_result.prohibitBlindRecreation === true && recordedRetrieval.create_attempted === false, 'recorded retrieval failure must prohibit replacement creation');
assert(fixture.next_retry.tag_match_ids.length === 1 && fixture.next_retry.expected_state_after_save === 'reconciled', 'fixture must demonstrate unambiguous retry recovery');
assert(fixture.alternate_retry_persistence_failure.expected_state === 'reconciled-unrecorded' && fixture.alternate_retry_persistence_failure.creation_claim === false, 'fixture must not mislabel failed reconciliation persistence as a new creation');

console.log('ok vertical slice: exact lock, TypeScript compile, partial-success fixture');
