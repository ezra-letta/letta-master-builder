import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {
  checkUrl, createPinnedLookup, extractRegistryUrls, isPrivateAddress, isTransientStatus, loadRegistryUrls,
  PolicyError, TransientError, validateUrl
} from '../check-external-links.mjs';
import { EVIDENCE } from '../check-package-evidence.mjs';

const publicLookup = async () => [{ address: '93.184.216.34', family: 4 }];
function requestResponse(status, location, body = '') {
  return (_url, options, callback) => {
    const request = new EventEmitter();
    request.end = () => {
      options.lookup('example.com', {}, (_error, address, family) => { request.connected = { address, family, options }; });
      const response = new EventEmitter();
      response.statusCode = status;
      response.headers = location ? { location } : {};
      callback(response);
      response.emit('data', Buffer.from(body));
      response.emit('end');
    };
    request.destroy = (error) => request.emit('error', error);
    return request;
  };
}

test('pins exact package evidence and repository tag targets', () => {
  assert.deepEqual(EVIDENCE, [
    { name: 'Agent SDK', package: '@letta-ai/letta-agent-sdk', version: '0.8.9', integrity: 'sha512-duWxq92PMTtPnxmMSP3y1J0ytm9Cmyc7nqD1mGYsI3A79rD9bJr664Vxkq9c0vr/QbA4b/1QW6YW1K26tIQWzQ==', repository: 'letta-ai/letta-agent-sdk', tag: 'v0.8.9', commit: 'c8afbaa7bd38f2831631f4ae175a37969300ef4d' },
    { name: 'SDK-declared runtime dependency', package: '@letta-ai/letta-code', version: '0.32.11', integrity: 'sha512-8EMj0zt3U/kvQ+L05w4wPRAY/PWNIinmf4ESo4CfFIBbCtWuTBvau381P79xFdoBtzJwx/ChEFHl0YvbQWmoOA==', repository: 'letta-ai/letta-code', tag: 'v0.32.11', commit: 'aa41b19438c18f1341ea044deedde7ec8ce8afce' },
    { name: 'Standalone runtime', package: '@letta-ai/letta-code', version: '0.32.11', integrity: 'sha512-8EMj0zt3U/kvQ+L05w4wPRAY/PWNIinmf4ESo4CfFIBbCtWuTBvau381P79xFdoBtzJwx/ChEFHl0YvbQWmoOA==', repository: 'letta-ai/letta-code', tag: 'v0.32.11', commit: 'aa41b19438c18f1341ea044deedde7ec8ce8afce' }
  ]);
});
test('loads HTTPS registry URLs and permits only repository-relative local paths', async () => {
  const yaml = `sources:\n  - url: https://example.com/one\n  - url: ./docs/file.md\n`;
  assert.deepEqual(await loadRegistryUrls('unused', async () => yaml), ['https://example.com/one']);
  for (const url of ['../secret', '/etc/passwd', 'file:///tmp/x', 'http://example.com', 'C:\\secret'])
    assert.throws(() => extractRegistryUrls({ sources: [{ url }, { url: 'https://example.com' }] }), PolicyError);
});
test('fails closed for malformed registry YAML and invalid shapes', async () => {
  await assert.rejects(loadRegistryUrls('unused', async () => 'sources: [broken'), PolicyError);
  assert.throws(() => extractRegistryUrls({ sources: {} }), PolicyError);
  assert.throws(() => extractRegistryUrls({ sources: [{ nope: 'x' }] }), PolicyError);
});
test('rejects non-HTTPS, credentials, queries, fragments, and unsafe ports', () => {
  for (const url of ['http://example.com', 'file:///x', 'https://user@example.com', 'https://example.com/?x=1', 'https://example.com/#x', 'https://example.com:8443']) assert.throws(() => validateUrl(url), PolicyError);
});
test('classifies private and reserved addresses', () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '169.254.1.1', '192.168.1.1', '::1', 'fd00::1']) assert.equal(isPrivateAddress(ip), true);
  assert.equal(isPrivateAddress('93.184.216.34'), false);
});
test('pinned lookup returns approved address regardless of later resolver changes', async () => {
  let resolutions = 0;
  const resolver = async () => (++resolutions === 1 ? [{ address: '93.184.216.34', family: 4 }] : [{ address: '127.0.0.1', family: 4 }]);
  let connected;
  const requestImpl = (_url, options, callback) => {
    const request = new EventEmitter();
    request.end = () => options.lookup('example.com', {}, (_error, address, family) => {
      connected = { address, family, servername: options.servername, rejectUnauthorized: options.rejectUnauthorized };
      const response = new EventEmitter(); response.statusCode = 200; response.headers = {}; callback(response); response.emit('end');
    });
    request.destroy = (error) => request.emit('error', error); return request;
  };
  await checkUrl('https://example.com/path', { resolver, requestImpl });
  await resolver();
  assert.deepEqual(connected, { address: '93.184.216.34', family: 4, servername: 'example.com', rejectUnauthorized: true });
});
test('fails closed when DNS returns any private address', async () => {
  await assert.rejects(checkUrl('https://example.com', { resolver: async () => [{ address: '93.184.216.34', family: 4 }, { address: '127.0.0.1', family: 4 }], requestImpl: requestResponse(200) }), PolicyError);
});
test('revalidates and repins redirects', async () => {
  const hosts = [];
  const resolver = async (host) => { hosts.push(host); return publicLookup(); };
  let calls = 0;
  await checkUrl('https://example.com', { resolver, requestImpl: (...args) => requestResponse(++calls === 1 ? 302 : 200, calls === 1 ? 'https://example.org/next' : undefined)(...args) });
  assert.deepEqual(hosts, ['example.com', 'example.org']);
});
test('bounds redirects and retries', async () => {
  await assert.rejects(checkUrl('https://example.com', { resolver: publicLookup, maxRedirects: 1, requestImpl: requestResponse(302, '/again') }), PolicyError);
  let attempts = 0;
  const failing = () => { const r = new EventEmitter(); r.end = () => { attempts++; r.emit('error', new Error('reset')); }; r.destroy = (e) => r.emit('error', e); return r; };
  await assert.rejects(checkUrl('https://example.com', { resolver: publicLookup, retries: 2, requestImpl: failing }), TransientError);
  assert.equal(attempts, 3);
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
