import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {
  checkUrl, createPinnedLookup, DEFAULT_MAX_BODY_BYTES, extractPointerUrls, extractRegistryUrls, isPrivateAddress,
  isTransientStatus, loadPointerUrls, loadRegistryUrls, PolicyError, TransientError, validateUrl
} from '../check-external-links.mjs';
import { deriveEvidence, EVIDENCE } from '../check-package-evidence.mjs';

const publicLookup = async () => [{ address: '93.184.216.34', family: 4 }];
function requestResponse(status, location, body = '', headers = {}) {
  return (_url, options, callback) => {
    const request = new EventEmitter();
    request.end = () => {
      options.lookup('example.com', {}, (_error, address, family) => { request.connected = { address, family, options }; });
      const response = new EventEmitter();
      response.statusCode = status;
      response.headers = { ...headers, ...(location ? { location } : {}) };
      response.destroy = () => { response.destroyed = true; };
      callback(response);
      response.emit('data', Buffer.from(body));
      response.emit('end');
    };
    request.destroy = (error) => { if (error) request.emit('error', error); };
    return request;
  };
}

test('derives exact package evidence from canonical compatibility versions', () => {
  assert.equal(EVIDENCE.length, 3);
  assert.deepEqual(EVIDENCE.map(({ version, integrity, commit }) => ({ version, integrity, commit })), [
    { version: '0.8.9', integrity: 'sha512-duWxq92PMTtPnxmMSP3y1J0ytm9Cmyc7nqD1mGYsI3A79rD9bJr664Vxkq9c0vr/QbA4b/1QW6YW1K26tIQWzQ==', commit: 'c8afbaa7bd38f2831631f4ae175a37969300ef4d' },
    { version: '0.32.11', integrity: 'sha512-8EMj0zt3U/kvQ+L05w4wPRAY/PWNIinmf4ESo4CfFIBbCtWuTBvau381P79xFdoBtzJwx/ChEFHl0YvbQWmoOA==', commit: 'aa41b19438c18f1341ea044deedde7ec8ce8afce' },
    { version: '0.32.11', integrity: 'sha512-8EMj0zt3U/kvQ+L05w4wPRAY/PWNIinmf4ESo4CfFIBbCtWuTBvau381P79xFdoBtzJwx/ChEFHl0YvbQWmoOA==', commit: 'aa41b19438c18f1341ea044deedde7ec8ce8afce' }
  ]);
  assert.throws(() => deriveEvidence({ kind: 'versions', entries: [] }), PolicyError);
});
test('loads HTTPS registry URLs and permits only repository-relative local paths', async () => {
  const yaml = `sources:\n  - url: https://example.com/one\n  - url: ./docs/file.md\n`;
  assert.deepEqual(await loadRegistryUrls('unused', async () => yaml), ['https://example.com/one']);
  for (const url of ['../secret', '/etc/passwd', 'file:///tmp/x', 'http://example.com', 'C:\\secret'])
    assert.throws(() => extractRegistryUrls({ sources: [{ url }, { url: 'https://example.com' }] }), PolicyError);
});
test('loads HTTPS pointer targets while preserving safe local anchors', async () => {
  const yaml = `pointers:\n  - {target: https://example.com/docs}\n  - {target: DESIGN_SPEC.md#section}\n`;
  assert.deepEqual(await loadPointerUrls('unused', async () => yaml), ['https://example.com/docs']);
  assert.deepEqual(extractPointerUrls({ pointers: [{ target: 'local/file.md#anchor' }] }), []);
  for (const target of ['../escape.md', 'file:///tmp/x', 'http://example.com']) assert.throws(() => extractPointerUrls({ pointers: [{ target }] }), PolicyError);
});
test('rejects unsafe URL components and special-use IP literals', () => {
  for (const url of ['http://example.com', 'file:///x', 'https://user@example.com', 'https://example.com/?x=1', 'https://example.com/#x', 'https://example.com:8443', 'https://255.255.255.255']) assert.throws(() => validateUrl(url), PolicyError);
  for (const address of [
    '::', '::1', '::192.168.1.1', '::ffff:127.0.0.1', '::ffff:93.184.216.34', '64:ff9b::c0a8:101', '64:ff9b:1::1', '100::1',
    '2001::1', '2001:2::1', '2001:db8::1', '2001:10::1', '2002:c0a8:0101::1', 'fc00::1', 'fe80::1', 'fec0::1', 'ff02::1'
  ]) assert.equal(isPrivateAddress(address), true, address);
  assert.equal(isPrivateAddress('2606:4700:4700::1111'), false);
  assert.throws(() => validateUrl('https://[::ffff:127.0.0.1]/'), PolicyError);
});
test('network evidence requests reject state-changing methods', async () => {
  await assert.rejects(checkUrl('https://example.com', { method: 'POST', resolver: publicLookup, requestImpl: requestResponse(200) }), PolicyError);
});
test('HEAD link checks do not download or reject the represented GET body', async () => {
  const result = await checkUrl('https://example.com', { method: 'HEAD', maxBodyBytes: 0, resolver: publicLookup, requestImpl: requestResponse(200, undefined, 'ignored', { 'content-length': '9999999' }) });
  assert.equal(result.status, 200);
  assert.equal(result.body.length, 0);
});
test('fails closed when DNS returns mapped or mixed forbidden addresses', async () => {
  for (const records of [
    [{ address: '::ffff:127.0.0.1', family: 6 }],
    [{ address: '93.184.216.34', family: 4 }, { address: 'fe80::1', family: 6 }]
  ]) await assert.rejects(checkUrl('https://example.com', { resolver: async () => records, requestImpl: requestResponse(200) }), PolicyError);
});
test('pins DNS while retaining TLS hostname verification', async () => {
  let connected;
  const requestImpl = (_url, options, callback) => {
    const request = new EventEmitter();
    request.end = () => options.lookup('example.com', {}, (_error, address, family) => {
      connected = { address, family, servername: options.servername, rejectUnauthorized: options.rejectUnauthorized };
      const response = new EventEmitter(); response.statusCode = 200; response.headers = {}; callback(response); response.emit('end');
    });
    request.destroy = (error) => { if (error) request.emit('error', error); }; return request;
  };
  await checkUrl('https://example.com/path', { resolver: publicLookup, requestImpl });
  assert.deepEqual(connected, { address: '93.184.216.34', family: 4, servername: 'example.com', rejectUnauthorized: true });
});
test('rejects oversized response bodies without retrying policy failures', async () => {
  let attempts = 0;
  const oversized = (...args) => { attempts += 1; return requestResponse(200, undefined, '12345')(...args); };
  await assert.rejects(checkUrl('https://example.com', { resolver: publicLookup, retries: 4, maxBodyBytes: 4, requestImpl: oversized }), PolicyError);
  assert.equal(attempts, 1);
  await assert.rejects(checkUrl('https://example.com', { resolver: publicLookup, maxBodyBytes: DEFAULT_MAX_BODY_BYTES, requestImpl: requestResponse(200, undefined, '', { 'content-length': String(DEFAULT_MAX_BODY_BYTES + 1) }) }), PolicyError);
  const result = await checkUrl('https://example.com', { resolver: publicLookup, maxBodyBytes: 5, requestImpl: requestResponse(200, undefined, '12345') });
  assert.equal(result.body.toString(), '12345');
});
test('revalidates redirects and bounds redirects, retries, and their option values', async () => {
  const hosts = [];
  let calls = 0;
  await checkUrl('https://example.com', { resolver: async (host) => { hosts.push(host); return publicLookup(); }, requestImpl: (...args) => requestResponse(++calls === 1 ? 302 : 200, calls === 1 ? 'https://example.org/next' : undefined)(...args) });
  assert.deepEqual(hosts, ['example.com', 'example.org']);
  await assert.rejects(checkUrl('https://example.com', { resolver: publicLookup, maxRedirects: 1, requestImpl: requestResponse(302, '/again') }), PolicyError);
  let attempts = 0;
  const failing = () => { const request = new EventEmitter(); request.end = () => { attempts += 1; request.emit('error', new Error('reset')); }; request.destroy = (error) => request.emit('error', error); return request; };
  await assert.rejects(checkUrl('https://example.com', { resolver: publicLookup, retries: 2, requestImpl: failing }), TransientError);
  assert.equal(attempts, 3);
  await assert.rejects(checkUrl('https://example.com', { retries: Infinity }), PolicyError);
  await assert.rejects(checkUrl('https://example.com', { maxRedirects: -1 }), PolicyError);
  await assert.rejects(checkUrl('https://example.com', { timeoutMs: 0 }), PolicyError);
});
test('network YAML loaders reject duplicate keys', async () => {
  await assert.rejects(loadRegistryUrls('unused', async () => 'sources: []\nsources: []\n'), PolicyError);
  await assert.rejects(loadPointerUrls('unused', async () => 'pointers: []\npointers: []\n'), PolicyError);
});
test('classifies transient statuses and stable 404', async () => {
  for (const status of [403, 408, 425, 429, 500, 503]) {
    assert.equal(isTransientStatus(status), true);
    await assert.rejects(checkUrl('https://example.com', { resolver: publicLookup, retries: 0, requestImpl: requestResponse(status) }), TransientError);
  }
  await assert.rejects(checkUrl('https://example.com', { resolver: publicLookup, retries: 0, requestImpl: requestResponse(404) }), PolicyError);
});
test('pinned lookup supports Node all mode', () => {
  createPinnedLookup({ address: '93.184.216.34', family: 4 })('ignored', { all: true }, (_error, records) => assert.deepEqual(records, [{ address: '93.184.216.34', family: 4 }]));
});
