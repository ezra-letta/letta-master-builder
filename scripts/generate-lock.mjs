#!/usr/bin/env node
import path from 'node:path';
import { generate } from './lib/generators.mjs';

const args = process.argv.slice(2); const check = args.includes('--check'); const rest = args.filter(a => a !== '--check');
if (rest.length > 1 || args.some(a => a.startsWith('-') && a !== '--check')) { console.error('usage: node scripts/generate-lock.mjs [--check] [repository-root]'); process.exitCode = 2; }
else try { const root = path.resolve(rest[0] || new URL('..', import.meta.url).pathname); const ok = await generate(root, 'lock', check); if (!ok) { console.error('curriculum.lock.yml is stale or missing'); process.exitCode = 1; } else console.log(check ? 'curriculum lock is current' : 'generated curriculum.lock.yml'); } catch (e) { console.error(`lock generation error: ${e.message}`); process.exitCode = 2; }
