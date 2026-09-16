import { createHash, randomBytes } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { lstat, open, readdir, readFile, realpath, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import YAML, { LineCounter } from 'yaml';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
export const INTEGRITY_MANIFEST = 'INTEGRITY.SHA256';
export const IGNORED_TOP = new Set(['.git', 'node_modules']);

export function posix(relative) { return relative.split(path.sep).join('/'); }
export function inside(root, candidate) {
  const rel = path.relative(root, candidate);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
}
export function safePath(value) {
  return typeof value === 'string' && value.length > 0 && !/[\0-\x1f\x7f]/.test(value) && !value.includes('\\') && !path.posix.isAbsolute(value) && !value.split('/').some(segment => segment === '' || segment === '.' || segment === '..');
}
export async function canonicalRoot(root) {
  const requested = path.resolve(root);
  const stat = await lstat(requested);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('repository root must be a real directory');
  return realpath(requested);
}

export async function inventory(root, { exclude = [] } = {}) {
  const excluded = new Set(exclude);
  root = await canonicalRoot(root);
  const files = [];
  async function walk(dir, relative = '') {
    const entries = await readdir(dir, { withFileTypes: true });
    entries.sort((a, b) => Buffer.from(a.name).compare(Buffer.from(b.name)));
    for (const entry of entries) {
      if (/^[.]\.?$/.test(entry.name) || /[\0-\x1f\x7f]/.test(entry.name)) throw new Error('unsupported filesystem entry name');
      const rel = posix(path.join(relative, entry.name));
      if (entry.name === 'node_modules') continue;
      if (!relative && IGNORED_TOP.has(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      const stat = await lstat(absolute);
      if (stat.isSymbolicLink()) throw new Error(`unsupported filesystem entry: ${rel}`);
      if (stat.isDirectory()) { await walk(absolute, rel); continue; }
      if (!stat.isFile()) throw new Error(`unsupported filesystem entry: ${rel}`);
      if (excluded.has(rel)) continue;
      files.push({ path: rel, absolute, size: stat.size, mode: stat.mode });
    }
  }
  await walk(root);
  return files;
}

export async function safeFile(root, relative, { mustExist = true } = {}) {
  root = await canonicalRoot(root);
  if (!safePath(relative)) throw new Error(`unsafe path: ${String(relative)}`);
  const file = path.resolve(root, relative);
  if (!inside(root, file)) throw new Error(`path escapes repository: ${relative}`);
  if (mustExist) {
    let component = root;
    const segments = relative.split('/');
    for (const [index, segment] of segments.entries()) {
      component = path.join(component, segment);
      const stat = await lstat(component);
      if (stat.isSymbolicLink()) throw new Error(`symbolic link path component is forbidden: ${relative}`);
      if (index < segments.length - 1 && !stat.isDirectory()) throw new Error(`non-directory path component: ${relative}`);
      if (index === segments.length - 1 && !stat.isFile()) throw new Error(`not a regular file: ${relative}`);
    }
  }
  return file;
}
export async function bytes(file) {
  const flags = fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW || 0);
  const handle = await open(file, flags);
  try { const stat = await handle.stat(); if (!stat.isFile()) throw new Error('not a regular file'); return await handle.readFile(); }
  finally { await handle.close(); }
}
export function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
export async function hashFile(file) { return sha256(await bytes(file)); }

export function decodeUtf8(buffer, label = 'file') {
  if (buffer.includes(0)) throw new Error(`${label}: NUL byte is forbidden`);
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buffer); }
  catch { throw new Error(`${label}: invalid UTF-8`); }
}
export function parseYaml(text, label) {
  const lineCounter = new LineCounter();
  const doc = YAML.parseDocument(text, { uniqueKeys: true, strict: true, lineCounter, prettyErrors: false });
  if (doc.errors.length) throw new Error(`${label}: invalid YAML (${doc.errors[0].code || 'parse error'})`);
  const value = doc.toJS({ maxAliasCount: 50, mapAsMap: false });
  if (value === undefined) throw new Error(`${label}: empty YAML document`);
  return value;
}
export async function readYaml(root, relative) { return parseYaml(decodeUtf8(await bytes(await safeFile(root, relative)), relative), relative); }
export async function readText(root, relative) { return decodeUtf8(await bytes(await safeFile(root, relative)), relative); }

export async function atomicWrite(root, relative, content) {
  root = await canonicalRoot(root);
  if (!safePath(relative) || relative.includes('/')) throw new Error(`unsafe output path: ${relative}`);
  const target = path.join(root, relative);
  try { const stat = await lstat(target); if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`unsafe output target: ${relative}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temporary = path.join(root, `.${relative}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`);
  const handle = await open(temporary, 'wx', 0o644);
  try { await handle.writeFile(content, 'utf8'); await handle.sync(); } catch (error) { await handle.close(); await rm(temporary, { force: true }); throw error; }
  await handle.close();
  try { await rename(temporary, target); } catch (error) { await rm(temporary, { force: true }); throw error; }
  const directory = await open(root, 'r');
  try { await directory.sync(); } finally { await directory.close(); }
}

export function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
export function yamlString(value) { return YAML.stringify(stable(value), { lineWidth: 0, sortMapEntries: true }); }
export function collectObjects(value, out = [], seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return out;
  seen.add(value); if (!Array.isArray(value)) out.push(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) collectObjects(child, out, seen);
  return out;
}
export function pick(obj, ...names) { for (const name of names) if (obj && Object.hasOwn(obj, name)) return obj[name]; }
export function asList(value) { return value === undefined || value === null ? [] : Array.isArray(value) ? value : [value]; }
export function strings(value) { return asList(value).filter(item => typeof item === 'string'); }
export function validDate(value, dateTime = false) {
  if (typeof value !== 'string') return false;
  const pattern = dateTime ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/ : /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = value.match(pattern); if (!match) return false;
  const [, y, mo, d, h = '00', mi = '00', s = '00'] = match;
  const date = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  return date.getUTCFullYear() === +y && date.getUTCMonth() === +mo - 1 && date.getUTCDate() === +d && date.getUTCHours() === +h && date.getUTCMinutes() === +mi && date.getUTCSeconds() === +s;
}
