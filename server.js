import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const files = new Set(['/index.html', '/styles.css', '/app.js']);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};
const securityHeaders = {
  'Cache-Control': 'no-cache',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:11434; base-uri 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

function requestPath(url) {
  try {
    return decodeURIComponent(new URL(url || '/', 'http://localhost').pathname);
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { ...securityHeaders, Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  const pathname = requestPath(request.url);
  const publicPath = pathname === '/' ? '/index.html' : pathname;
  if (!pathname || !files.has(publicPath)) {
    response.writeHead(404, securityHeaders);
    response.end('Not found');
    return;
  }

  try {
    const file = await readFile(resolve(root, `.${publicPath}`));
    response.writeHead(200, {
      ...securityHeaders,
      'Content-Type': types[extname(publicPath)]
    });
    if (request.method === 'HEAD') response.end();
    else response.end(file);
  } catch {
    response.writeHead(404, securityHeaders);
    response.end('Not found');
  }
});

server.on('error', (error) => {
  console.error(`VIGIL server error: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`VIGIL is watching at http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
