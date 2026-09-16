#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectObjects, inventory, parseYaml } from './lib/core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const curriculum = parseYaml(await readFile(path.join(root, 'curriculum.yml'), 'utf8'), 'curriculum.yml');
const modules = curriculum.mandatory_modules ?? [];
const errors = [];
const knownIds = new Set();
for (const file of await inventory(root)) {
  if (!/\.ya?ml$/i.test(file.path)) continue;
  const document = parseYaml(await readFile(file.absolute, 'utf8'), file.path);
  for (const object of collectObjects(document)) if (typeof object.id === 'string') knownIds.add(object.id);
}

function proseOnly(markdown) {
  const lines = [];
  let fenced = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    if (/^\s*<!--/.test(line) || /^\s*-->/.test(line)) continue;
    if (/^\s*\|/.test(line)) continue;
    if (/^\s*[-:| ]{3,}\s*$/.test(line)) continue;
    lines.push(line.replace(/`[^`]*`/g, ''));
  }
  return lines.join('\n');
}

function countWords(text) {
  return text.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

const required = [
  ['learning contract', /learning contract/i],
  ['conceptual model', /conceptual model|object model|mental model|vocabulary|tool classes|topology model/i],
  ['workflow', /workflow|design procedure|implementation procedure/i],
  ['worked example or trace', /worked example|worked case|worked trace|state-machine trace|walkthrough|original[^\n]*trace|topology[^\n]*trace/i],
  ['failure modes', /failure modes|failures? and recovery|unsafe shortcuts|unsafe substitutions/i],
  ['dossier artifact', /dossier artifact|dossier contribution|artifact[^\n]*dossier|lifecycle dossier/i],
  ['formative questions', /formative[^\n]*(?:questions|review|readiness|transfer)|readiness questions/i],
  ['evidence boundary', /evidence[^\n]*boundar|source[^\n]*boundar|discrepancy[^\n]*boundar|claim boundar/i],
  ['non-claims', /non-claims|what this module does not prove/i],
  ['handoff', /handoff/i],
];

if (modules.length !== 14) errors.push(`expected 14 mandatory modules, found ${modules.length}`);
let total = 0;
for (const module of modules) {
  const file = `modules/${module.id}.md`;
  let text;
  try { text = await readFile(path.join(root, file), 'utf8'); }
  catch { errors.push(`${file}: missing`); continue; }
  const exactHeading = new RegExp(`^# ${module.id}(?:\\s+[—:-])?\\s+${module.title.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\r?\\n`);
  if (!exactHeading.test(text)) errors.push(`${file}: first heading must contain exact ID and title`);
  for (const [name, pattern] of required) if (!pattern.test(text)) errors.push(`${file}: missing ${name} section`);
  for (const label of ['Status', 'Prerequisites', 'Capability', 'Evidence', 'Project-method']) if (!new RegExp(`\\|\\s*${label}`, 'i').test(text)) errors.push(`${file}: metadata table missing ${label}`);
  const declaredStatus = text.match(/^\|\s*Status\s*\|\s*([^|]+?)\s*\|\s*$/im)?.[1]?.trim();
  if (declaredStatus !== module.status) errors.push(`${file}: metadata status ${declaredStatus ?? 'missing'} disagrees with curriculum status ${module.status}`);
  const words = countWords(proseOnly(text));
  total += words;
  if (words < 4900 || words > 5150) errors.push(`${file}: prose word count ${words} outside 4900..5150`);
  const mentionedIds = new Set((text.match(/(?:LMB|MOD|SRC|PTR|DISC|VER|CAP|ADJ|EXP|REL|ASM|FIX|RTC|DOS|SCN|MIS|CNF)-[A-Z0-9][A-Z0-9._-]*/g) ?? []).map(id => id.replace(/[._-]+$/, '')));
  for (const id of mentionedIds) if (!knownIds.has(id)) errors.push(`${file}: references unknown registered ID ${id}`);
}

if (total < 70000 || total > 74000) errors.push(`mandatory module prose total ${total} outside 70000..74000`);
const budget = curriculum.target_contract?.word_budget;
if (budget?.current_prose !== total) errors.push(`target_contract current_prose ${budget?.current_prose ?? 'missing'} disagrees with measured ${total}`);
if (curriculum.repository_stage === 'release-candidate' && (budget?.complete !== true || curriculum.target_contract?.completion !== true)) errors.push('release-candidate module content must declare complete word budget and completion');
if (errors.length) {
  for (const error of errors) console.error(`MODULE: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`module check passed (${modules.length} modules, ${total} prose words)`);
}
