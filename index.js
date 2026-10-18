const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const apiHandler = require('./api/index.js');

const projectRoot = __dirname;
const maxRequestBytes = 64 * 1024;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  if (request.body !== undefined) return request.body;
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxRequestBytes) {
      const error = new Error('Request body is too large.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function handleRequest(request, response) {
  let url;
  try {
    url = new URL(request.url, 'http://localhost');
  } catch {
    sendJson(response, 400, { error: 'Invalid request URL.' });
    return;
  }

  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      try {
        request.body = await readRequestBody(request);
      } catch (error) {
        sendJson(response, error.status || 400, { error: error.message || 'Could not read request body.' });
        return;
      }
    }
    await apiHandler(request, response);
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Method not allowed.');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }

  if (pathname === '/') pathname = '/birthday/index.html';
  else if (pathname === '/birthday' || pathname === '/birthday/') pathname = '/birthday/index.html';
  else if (pathname === '/admin' || pathname === '/admin/') pathname = '/admin/index.html';

  if (!pathname.startsWith('/birthday/') && !pathname.startsWith('/admin/')) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found.');
    return;
  }

  const filePath = path.resolve(projectRoot, `.${pathname}`);
  const staticRoot = path.resolve(projectRoot, pathname.startsWith('/birthday/') ? 'birthday' : 'admin');
  const relativePath = path.relative(staticRoot, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    response.writeHead(404);
    response.end();
    return;
  }

  let file;
  try {
    if (!fs.statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end();
      return;
    }
    file = fs.readFileSync(filePath);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      response.writeHead(404);
      response.end();
      return;
    }
    throw error;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(request.method === 'HEAD' ? undefined : file);
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error('Application request failed:', error.message);
    if (!response.headersSent && !response.destroyed) {
      sendJson(response, 500, { error: 'The server could not complete the request.' });
    }
  });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Birthday Wishes is listening on port ${port}`);
  });
}

module.exports = server;
