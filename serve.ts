import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./app/', import.meta.url));
const portIndex = process.argv.indexOf('--port');
const port = portIndex < 0 ? 8080 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Use --port followed by a port from 1 to 65535.');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };
createServer(async (request, response) => {
  if (!['GET','HEAD'].includes(request.method ?? '')) { response.writeHead(405, { Allow:'GET, HEAD' }); response.end('Read-only server'); return; }
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(resolve(root) + sep)) { response.writeHead(403); response.end('Forbidden'); return; }
    const actual = await realpath(file);
    if (!actual.startsWith(resolve(root) + sep)) { response.writeHead(403); response.end('Forbidden'); return; }
    const info = await stat(actual);
    if (!info.isFile()) throw new Error('Not a file');
    const data = await readFile(actual);
    response.writeHead(200, {'Content-Type':types[extname(file)] ?? 'application/octet-stream','Content-Length':data.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); response.end('Page not found'); }
}).listen(port, '0.0.0.0', () => console.log(`make.fun client: http://localhost:${port}`));
