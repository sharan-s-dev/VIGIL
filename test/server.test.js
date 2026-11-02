import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { test, before, after } from 'node:test';

const port = 4175;
const base = `http://127.0.0.1:${port}`;
let server;

before(async () => {
  server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let childError = '';
  server.stderr.on('data', (chunk) => { childError += chunk.toString(); });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${base}/`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error(`test server did not start${childError ? `: ${childError.trim()}` : ''}`);
});

after(() => { if (server && !server.killed) server.kill(); });

test('serves the application with hardening headers', async () => {
  const response = await fetch(`${base}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.match(await response.text(), /VIGIL/);
});

test('only exposes the public application surface', async () => {
  for (const path of ['/.git/config', '/package.json', '/.github/workflows/pages.yml', '/README.md', '/does-not-exist']) {
    assert.equal((await fetch(`${base}${path}`)).status, 404, path);
  }
});

test('rejects mutation methods', async () => {
  const response = await fetch(`${base}/`, { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
});

test('supports HEAD without returning a body', async () => {
  const response = await fetch(`${base}/app.js`, { method: 'HEAD' });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});
