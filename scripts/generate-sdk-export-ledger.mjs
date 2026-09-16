import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SLICE = path.join(ROOT, 'vertical-slice');
const OUTPUT = path.join(ROOT, 'capabilities', 'sdk-exports.yml');
const SDK_ROOT = path.join(SLICE, 'node_modules', '@letta-ai', 'letta-agent-sdk');
const TYPE_SCRIPT = path.join(SLICE, 'node_modules', 'typescript', 'lib', 'typescript.js');
const DECLARATIONS = Object.freeze({
  '.': path.join(SDK_ROOT, 'dist', 'index.d.ts'),
  './client': path.join(SDK_ROOT, 'dist', 'client-entry.d.ts'),
});
const OVERRIDES = new Map([
  ['LettaAgentClient', { disposition: 'claim-bearing', capability_ids: ['CAP-AGENT-MANAGEMENT'], rationale: 'Used by the Revision 0.4 provisioning vertical slice.' }],
  ['CreateAgentOptions', { disposition: 'claim-bearing', capability_ids: ['CAP-AGENT-MANAGEMENT'], rationale: 'Used by the Revision 0.4 provisioning vertical slice with a backend-safe subset.' }],
  ['AgentsClient', { disposition: 'claim-bearing', capability_ids: ['CAP-AGENT-MANAGEMENT'], rationale: 'Management methods list and retrieve are used for reconciliation.' }],
  ['createAgent', { disposition: 'claim-bearing', capability_ids: ['CAP-AGENT-MANAGEMENT'], rationale: 'Top-level creation helper is part of the operation inventory even though the slice uses the client method.' }],
  ['LettaAgent', { disposition: 'bundled-supporting', capability_ids: ['CAP-AGENT-MANAGEMENT'], rationale: 'Typed agent state supports reconciliation without expanding the taught operation.' }],
  ['ListAgentsOptions', { disposition: 'bundled-supporting', capability_ids: ['CAP-AGENT-MANAGEMENT'], rationale: 'Typed list filters support request-tag reconciliation.' }],
]);

function unix(relative) { return relative.split(path.sep).join('/'); }

async function readJson(file) { return JSON.parse(await fs.readFile(file, 'utf8')); }

function declarationSummary(ts, checker, exported) {
  const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const declarations = target.getDeclarations() ?? exported.getDeclarations() ?? [];
  const kinds = [...new Set(declarations.map((item) => ts.SyntaxKind[item.kind]))].sort();
  let members = [];
  const hasPublicMembers = declarations.some((item) => ts.isClassDeclaration(item) || ts.isInterfaceDeclaration(item));
  if (hasPublicMembers) {
    try {
      const type = checker.getDeclaredTypeOfSymbol(target);
      members = [...new Set(checker.getPropertiesOfType(type).map((item) => item.getName()))].sort();
    } catch {
      members = [];
    }
  }
  return {
    runtime_value: Boolean(target.flags & ts.SymbolFlags.Value),
    declaration_kinds: kinds.length ? kinds : ['Unknown'],
    members,
  };
}

async function buildLedger() {
  const versions = YAML.parse(await fs.readFile(path.join(ROOT, 'compatibility', 'versions.yml'), 'utf8'));
  const versionEvidence = versions.entries.find((entry) => entry.id === 'VER-AGENT-SDK-0-8-9');
  if (!versionEvidence) throw new Error('missing VER-AGENT-SDK-0-8-9 evidence');
  const sdkPackage = await readJson(path.join(SDK_ROOT, 'package.json'));
  if (sdkPackage.version !== versionEvidence.version) throw new Error(`installed SDK ${sdkPackage.version} disagrees with compatibility evidence ${versionEvidence.version}`);
  const ts = await import(pathToFileURL(TYPE_SCRIPT).href);
  const rootNames = Object.values(DECLARATIONS);
  const program = ts.createProgram({
    rootNames,
    options: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      skipLibCheck: true,
    },
  });
  const checker = program.getTypeChecker();
  const entries = [];
  for (const [entrypoint, declaration] of Object.entries(DECLARATIONS)) {
    const source = program.getSourceFile(declaration);
    if (!source?.symbol) throw new Error(`cannot resolve declaration module ${unix(path.relative(ROOT, declaration))}`);
    const exports = checker.getExportsOfModule(source.symbol).sort((a, b) => a.getName().localeCompare(b.getName()));
    const lane = entrypoint === '.' ? 'ROOT' : 'CLIENT';
    for (const [index, symbol] of exports.entries()) {
      const name = symbol.getName();
      const override = OVERRIDES.get(name) ?? {
        disposition: 'review-pending',
        capability_ids: [],
        rationale: 'Mechanically inventoried; release maintainer has not promoted this symbol into a claim-bearing curriculum capability.',
      };
      entries.push({
        id: `EXP-${lane}-${String(index + 1).padStart(4, '0')}`,
        entrypoint,
        symbol: name,
        ...declarationSummary(ts, checker, symbol),
        ...override,
      });
    }
  }
  return {
    schema_version: '1.0.0',
    kind: 'sdk-export-ledger',
    package: '@letta-ai/letta-agent-sdk',
    version: versionEvidence.version,
    integrity: versionEvidence.integrity,
    generated_from: ['.', './client'],
    generator: 'scripts/generate-sdk-export-ledger.mjs',
    entries,
  };
}

const content = YAML.stringify(await buildLedger(), { lineWidth: 0 });
const check = process.argv.includes('--check');
if (check) {
  let actual = '';
  try { actual = await fs.readFile(OUTPUT, 'utf8'); } catch {}
  if (actual !== content) {
    console.error('capabilities/sdk-exports.yml is stale or missing');
    process.exitCode = 1;
  } else {
    console.log('checked capabilities/sdk-exports.yml');
  }
} else {
  const temporary = `${OUTPUT}.tmp-${process.pid}`;
  await fs.writeFile(temporary, content, { encoding: 'utf8', mode: 0o644 });
  await fs.rename(temporary, OUTPUT);
  console.log('wrote capabilities/sdk-exports.yml');
}
