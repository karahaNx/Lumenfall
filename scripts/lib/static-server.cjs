'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { inside } = require('./cli.cjs');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.png': 'image/png', '.ico': 'image/x-icon' };

async function serve(directory, port = 0) {
  const server = http.createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = inside(directory, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!fs.statSync(file).isFile()) throw Error('Not a file');
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      if (request.method === 'HEAD') response.end();
      else fs.createReadStream(file).on('error', () => response.destroy()).pipe(response);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}
module.exports = { serve };
