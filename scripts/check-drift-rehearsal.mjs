import fs from 'node:fs/promises';
import YAML from 'yaml';

const rehearsal = YAML.parse(await fs.readFile(new URL('../maintenance/drift-rehearsal.yml', import.meta.url), 'utf8'));
const versions = YAML.parse(await fs.readFile(new URL('../compatibility/versions.yml', import.meta.url), 'utf8'));
const byId = new Map(versions.entries.map((entry) => [entry.id, entry.version]));
if (rehearsal.to.agent_sdk !== byId.get('VER-AGENT-SDK-0-8-9')) throw new Error('drift target SDK disagrees with version evidence');
if (rehearsal.to.sdk_declared_runtime !== byId.get('VER-SDK-DECLARED-RUNTIME-0-32-11')) throw new Error('drift target declared runtime disagrees with version evidence');
if (rehearsal.to.standalone_runtime !== byId.get('VER-STANDALONE-0-32-11')) throw new Error('drift target standalone runtime disagrees with version evidence');
if (rehearsal.runtime_claim !== false) throw new Error('static drift rehearsal cannot assert runtime behavior');
if (!Array.isArray(rehearsal.affected_capability_ids) || rehearsal.affected_capability_ids.length === 0) throw new Error('drift rehearsal needs affected capabilities');
console.log(`ok drift rehearsal ${rehearsal.id} status=${rehearsal.status} result=${rehearsal.maintenance_result}`);
