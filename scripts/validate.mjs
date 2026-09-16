#!/usr/bin/env node
import path from 'node:path';
import { validateRepository } from './lib/validate-repository.mjs';

function usage() { console.error('usage: node scripts/validate.mjs [repository-root]'); }
const args = process.argv.slice(2);
if (args.length > 1 || args[0] === '--help' || args[0] === '-h') { usage(); process.exitCode = args.length === 1 ? 0 : 2; }
else {
  try {
    const root = path.resolve(args[0] || new URL('..', import.meta.url).pathname);
    const errors = await validateRepository(root);
    if (errors.length) {
      for (const error of errors) console.error(`${error.code}: ${error.file}: ${error.message}`);
      console.error(`validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
      process.exitCode = 1;
    } else console.log('validation passed');
  } catch (error) {
    console.error(`internal validation error: ${error?.message || 'unknown error'}`);
    process.exitCode = 2;
  }
}
