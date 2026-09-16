#!/usr/bin/env node
import path from 'node:path';
import { generate } from './lib/generators.mjs';

const args = process.argv.slice(2); const check = args.includes('--check'); const rest = args.filter(a => a !== '--check');
if (rest.length > 1 || args.some(a => a.startsWith('-') && a !== '--check')) { console.error('usage: node scripts/generate-integrity.mjs [--check] [repository-root]'); process.exitCode = 2; }
else try { const root = path.resolve(rest[0] || new URL('..', import.meta.url).pathname); const ok = await generate(root, 'integrity', check); if (!ok) { console.error('INTEGRITY.SHA256 is stale or missing'); process.exitCode = 1; } else console.log(check ? 'root integrity is current' : 'generated INTEGRITY.SHA256'); } catch (e) { console.error(`integrity generation error: ${e.message}`); process.exitCode = 2; }
