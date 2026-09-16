#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { parseYaml } from './lib/core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFile(path.join(root, relative), 'utf8');
const registry = parseYaml(await read('practicum/registry.yml'), 'practicum/registry.yml');
const ledger = parseYaml(await read('capabilities/sdk-exports.yml'), 'capabilities/sdk-exports.yml');
const rootExports = new Set((ledger.entries ?? []).filter(entry => entry.entrypoint === '.').map(entry => entry.symbol));
const errors = [];
const sameSet = (left, right) => left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);

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

if (errors.length) {
  for (const error of errors) console.error(`PRACTICUM_SPEC: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`practicum specification check passed (${registry.scenarios.length} scenarios)`);
}
