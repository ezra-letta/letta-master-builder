#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml } from './lib/core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const curriculum = parseYaml(await readFile(path.join(root, 'curriculum.yml'), 'utf8'), 'curriculum.yml');
const index = await readFile(path.join(root, 'assessments/FORMATIVE_CHECKPOINTS.md'), 'utf8');
const errors = [];
const countWords = text => text.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu)?.length ?? 0;

for (const module of curriculum.mandatory_modules ?? []) {
  const relative = `assessments/formative/${module.id}.md`;
  let text;
  try { text = await readFile(path.join(root, relative), 'utf8'); }
  catch { errors.push(`${relative}: missing`); continue; }
  if (!index.includes(relative)) errors.push(`${relative}: absent from formative index`);
  if (!text.startsWith(`# ${module.id} ${module.title}\n`)) errors.push(`${relative}: first heading must use exact module ID and title`);
  for (const pattern of [/^## Must-pass invariants/im, /^## .*strong.*weak/im, /^## Misconception indicators/im, /^## (?:Continue or revisit|Self-check)/im]) if (!pattern.test(text)) errors.push(`${relative}: missing required formative section`);
  const invariantBody = text.split(/^## Must-pass invariants\s*$/m)[1]?.split(/^## /m)[0] ?? '';
  const numbered = invariantBody.match(/^\d+\.\s+/gm) ?? [];
  if (numbered.length !== 3) errors.push(`${relative}: must contain exactly three numbered invariants`);
  const dossierRoots = ['release_scope', 'mission', 'autonomy_envelope', 'object_ownership', 'topology', 'controls', 'observability', 'failure_recovery', 'improvement', 'security_tenancy', 'deployment', 'claims', 'open_questions', 'attestations', 'non_claims'];
  if (dossierRoots.filter(field => new RegExp(`\\b${field}(?:\\.|\\b)`).test(text)).length < 2) errors.push(`${relative}: must identify exact dossier fields`);
  if (!/read-only/i.test(text) || !/(?:non-award|awards? (?:no|nothing)|does not award)/i.test(text)) errors.push(`${relative}: must preserve read-only non-awarding boundary`);
  const words = countWords(text);
  if (words < 200 || words > 350) errors.push(`${relative}: word count ${words} outside 200..350`);
}

if (errors.length) {
  for (const error of errors) console.error(`FORMATIVE: ${error}`);
  process.exitCode = 1;
} else console.log('formative checkpoint check passed (14 modules)');
