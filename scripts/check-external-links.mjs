import dns from 'node:dns/promises';
import fs from 'node:fs/promises';
import https from 'node:https';
import net from 'node:net';
import path from 'node:path';
import YAML from 'yaml';

export const EXIT_INVALID = 1;
export const EXIT_TRANSIENT = 2;
export const DEFAULT_TIMEOUT_MS = 8_000;
export const DEFAULT_RETRIES = 2;
export const DEFAULT_MAX_REDIRECTS = 5;
export const DEFAULT_MAX_BODY_BYTES = 5 * 1024 * 1024;
export class PolicyError extends Error {}
export class TransientError extends Error {}

function ipv4ToNumber(address) { return address.split('.').reduce((v, o) => (v * 256) + Number(o), 0) >>> 0; }
function ipv4InCidr(address, base, bits) {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipv4ToNumber(address) & mask) === (ipv4ToNumber(base) & mask);
}
function parseIpv6(address) {
  const zone = address.indexOf('%');
  let value = (zone === -1 ? address : address.slice(0, zone)).toLowerCase();
  let ipv4Words = [];
  if (value.includes('.')) {
    const separator = value.lastIndexOf(':');
    const ipv4 = value.slice(separator + 1);
    if (!net.isIPv4(ipv4)) return null;
    const number = ipv4ToNumber(ipv4);
    ipv4Words = [(number >>> 16) & 0xffff, number & 0xffff];
    value = `${value.slice(0, separator)}:v4`;
  }
  const halves = value.split('::');
  if (halves.length > 2) return null;
  const decode = (part) => part ? part.split(':').filter(Boolean).map((word) => word === 'v4' ? ipv4Words : (/^[0-9a-f]{1,4}$/.test(word) ? [Number.parseInt(word, 16)] : null)).flat() : [];
  const left = decode(halves[0]);
  const right = decode(halves[1] ?? '');
  if (!left || !right) return null;
  const omitted = halves.length === 2 ? 8 - left.length - right.length : 0;
  if (omitted < 0 || (halves.length === 1 && left.length !== 8)) return null;
  return [...left, ...Array(omitted).fill(0), ...right];
}
function ipv6InCidr(words, baseWords, bits) {
  const whole = Math.floor(bits / 16);
  const remainder = bits % 16;
  for (let index = 0; index < whole; index += 1) if (words[index] !== baseWords[index]) return false;
  if (!remainder) return true;
  const mask = (0xffff << (16 - remainder)) & 0xffff;
  return (words[whole] & mask) === (baseWords[whole] & mask);
}
const ipv4ForbiddenCidrs = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16],
  ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4]
];
const ipv6ForbiddenCidrs = [
  ['::', 96], ['::ffff:0:0', 96], ['64:ff9b::', 96], ['64:ff9b:1::', 48], ['100::', 64],
  ['2001::', 32], ['2001:2::', 48], ['2001:db8::', 32], ['2001:10::', 28],
  ['2002::', 16], ['fc00::', 7], ['fe80::', 10], ['fec0::', 10], ['ff00::', 8]
].map(([base, bits]) => [parseIpv6(base), bits]);
export function isPrivateAddress(address) {
  if (net.isIPv4(address)) return ipv4ForbiddenCidrs.some(([base, bits]) => ipv4InCidr(address, base, bits));
  if (net.isIPv6(address)) {
    const words = parseIpv6(address);
    if (!words) return true;
    if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
      return true; // IPv4-mapped IPv6 is forbidden even when the embedded IPv4 is public.
    }
    return ipv6ForbiddenCidrs.some(([base, bits]) => ipv6InCidr(words, base, bits));
  }
  return true;
}
export function validateUrl(input) {
  let url;
  try { url = new URL(input); } catch { throw new PolicyError(`invalid URL: ${input}`); }
  if (url.protocol !== 'https:') throw new PolicyError(`HTTPS required: ${input}`);
  if (url.username || url.password) throw new PolicyError(`credentials forbidden: ${input}`);
  if (url.search) throw new PolicyError(`query string forbidden: ${input}`);
  if (url.hash) throw new PolicyError(`fragment forbidden: ${input}`);
  if (url.port && url.port !== '443') throw new PolicyError(`non-default port forbidden: ${input}`);
  const hostname = url.hostname.startsWith('[') && url.hostname.endsWith(']') ? url.hostname.slice(1, -1) : url.hostname;
  if (net.isIP(hostname) && isPrivateAddress(hostname)) throw new PolicyError(`private address forbidden: ${input}`);
  return url;
}
export async function resolvePublic(hostname, resolver = dns.lookup) {
  let records;
  try { records = await resolver(hostname, { all: true, verbatim: true }); }
  catch (error) { throw new TransientError(`DNS failure for ${hostname}: ${error.message}`); }
  if (!records?.length) throw new TransientError(`DNS returned no addresses for ${hostname}`);
  for (const record of records) if (!record || isPrivateAddress(record.address))
    throw new PolicyError(`DNS resolved ${hostname} to forbidden address ${record?.address}`);
  return records;
}
export function createPinnedLookup(record) {
  return (_hostname, options, callback) => {
    const result = { address: record.address, family: record.family };
    if (options?.all) callback(null, [result]); else callback(null, result.address, result.family);
  };
}

const transientStatuses = new Set([403, 408, 425, 429]);
const redirectStatuses = new Set([301, 302, 303, 307, 308]);
export function isTransientStatus(status) { return transientStatuses.has(status) || status >= 500; }
function safeRelativePath(value) {
  if (value.includes('\\') || path.posix.isAbsolute(value)) return false;
  const normalized = path.posix.normalize(value);
  return normalized !== '..' && !normalized.startsWith('../') && normalized !== '.';
}
export function extractRegistryUrls(document) {
  if (!document || typeof document !== 'object' || !Array.isArray(document.sources))
    throw new PolicyError('source registry must contain a sources array');
  const urls = [];
  for (const [index, source] of document.sources.entries()) {
    if (!source || typeof source !== 'object' || typeof source.url !== 'string')
      throw new PolicyError(`source registry entry ${index} must contain a string URL`);
    if (/^[a-z][a-z0-9+.-]*:/i.test(source.url)) urls.push(validateUrl(source.url).href);
    else if (!safeRelativePath(source.url)) throw new PolicyError(`source registry entry ${index} has an unsafe local path`);
  }
  if (!urls.length) throw new PolicyError('source registry contains no HTTPS URLs');
  return urls;
}
export function extractPointerUrls(document) {
  if (!document || typeof document !== 'object' || !Array.isArray(document.pointers))
    throw new PolicyError('pointer registry must contain a pointers array');
  const urls = [];
  for (const [index, pointer] of document.pointers.entries()) {
    if (!pointer || typeof pointer !== 'object' || typeof pointer.target !== 'string')
      throw new PolicyError(`pointer registry entry ${index} must contain a string target`);
    if (/^[a-z][a-z0-9+.-]*:/i.test(pointer.target)) urls.push(validateUrl(pointer.target).href);
    else if (!safeRelativePath(pointer.target.split('#')[0])) throw new PolicyError(`pointer registry entry ${index} has an unsafe local target`);
  }
  return urls;
}
function parseStrictYaml(text, label) {
  try {
    const parsed = YAML.parseDocument(text, { uniqueKeys: true, strict: true });
    if (parsed.errors.length) throw parsed.errors[0];
    return parsed.toJS({ maxAliasCount: 50 });
  } catch (error) { throw new PolicyError(`malformed ${label} YAML: ${error.message}`); }
}
export async function loadRegistryUrls(registryUrl = new URL('../sources/registry.yml', import.meta.url), readFile = fs.readFile) {
  let text;
  try { text = await readFile(registryUrl, 'utf8'); } catch (error) { throw new PolicyError(`cannot read source registry: ${error.message}`); }
  return extractRegistryUrls(parseStrictYaml(text, 'source registry'));
}
export async function loadPointerUrls(registryUrl = new URL('../pointers/registry.yml', import.meta.url), readFile = fs.readFile) {
  let text;
  try { text = await readFile(registryUrl, 'utf8'); } catch (error) { throw new PolicyError(`cannot read pointer registry: ${error.message}`); }
  return extractPointerUrls(parseStrictYaml(text, 'pointer registry'));
}
export async function loadRegisteredUrls() {
  return [...new Set([...(await loadRegistryUrls()), ...(await loadPointerUrls())])];
}

export function nativeRequest(url, options = {}) {
  const requestImpl = options.requestImpl ?? https.request;
  const record = options.record;
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  if (!Number.isSafeInteger(maxBodyBytes) || maxBodyBytes < 0) throw new PolicyError('maxBodyBytes must be a non-negative safe integer');
  const method = options.method ?? 'GET';
  if (!['GET', 'HEAD'].includes(method)) throw new PolicyError('network evidence checks permit only GET or HEAD');
  return new Promise((resolve, reject) => {
    let settled = false;
    const request = requestImpl(url, {
      method, headers: options.headers,
      lookup: createPinnedLookup(record), servername: url.hostname,
      rejectUnauthorized: true, timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    }, (response) => {
      const chunks = [];
      let bytes = 0;
      const fail = (error) => {
        if (settled) return;
        settled = true;
        response.destroy?.();
        request.destroy?.();
        reject(error);
      };
      const length = Number(response.headers?.['content-length']);
      if (method !== 'HEAD' && Number.isFinite(length) && length > maxBodyBytes) return fail(new PolicyError(`response body exceeds ${maxBodyBytes} bytes`));
      response.on('data', (chunk) => {
        if (settled) return;
        if (method === 'HEAD') return;
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += buffer.length;
        if (bytes > maxBodyBytes) return fail(new PolicyError(`response body exceeds ${maxBodyBytes} bytes`));
        chunks.push(buffer);
      });
      response.on('error', fail);
      response.on('end', () => {
        if (settled) return;
        settled = true;
        resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks, bytes), ok: response.statusCode >= 200 && response.statusCode < 300 });
      });
    });
    request.on('timeout', () => request.destroy(new Error('request timeout')));
    request.on('error', (error) => { if (!settled) { settled = true; reject(error); } });
    request.end();
  });
}
export async function requestUrl(input, options = {}) {
  const resolver = options.resolver ?? options.lookup ?? dns.lookup;
  const requestImpl = options.requestImpl;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new PolicyError('timeoutMs must be a positive safe integer');
  if (!Number.isSafeInteger(retries) || retries < 0) throw new PolicyError('retries must be a non-negative safe integer');
  if (!Number.isSafeInteger(maxRedirects) || maxRedirects < 0) throw new PolicyError('maxRedirects must be a non-negative safe integer');
  const method = options.method ?? 'GET';
  const headers = { 'user-agent': 'letta-master-builder-evidence-check/1', ...options.headers };
  let current = validateUrl(input);
  let redirects = 0;
  while (true) {
    const records = await resolvePublic(current.hostname, resolver);
    const record = records[0];
    let response;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try { response = await nativeRequest(current, { requestImpl, record, timeoutMs, maxBodyBytes, method, headers }); }
      catch (error) {
        if (error instanceof PolicyError) throw error;
        if (attempt === retries) throw new TransientError(`request failure for ${current}: ${error.message}`);
        continue;
      }
      if (!isTransientStatus(response.status) || attempt === retries) break;
    }
    if (isTransientStatus(response.status)) throw new TransientError(`transient HTTP ${response.status}: ${current}`);
    if (redirectStatuses.has(response.status)) {
      if (++redirects > maxRedirects) throw new PolicyError(`too many redirects: ${input}`);
      const location = response.headers.location;
      if (typeof location !== 'string') throw new PolicyError(`redirect without Location: ${current}`);
      current = validateUrl(new URL(location, current).href);
      continue;
    }
    if (!response.ok) throw new PolicyError(`HTTP ${response.status}: ${current}`);
    return { requested: input, final: current.href, ...response };
  }
}
export const checkUrl = requestUrl;

async function main(args) {
  const inputs = args.length ? args : await loadRegisteredUrls();
  let transient = false;
  for (const input of inputs) try {
    const result = await checkUrl(input, { method: 'HEAD', maxBodyBytes: 0 }); console.log(`ok ${result.status} ${result.final}`);
  } catch (error) {
    console.error(`${error instanceof TransientError ? 'transient' : 'invalid'}: ${error.message}`);
    if (error instanceof TransientError) transient = true; else process.exitCode = EXIT_INVALID;
  }
  if (!process.exitCode && transient) process.exitCode = EXIT_TRANSIENT;
}
if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2)).catch((error) => {
  console.error(`invalid: ${error.message}`); process.exitCode = EXIT_INVALID;
});
