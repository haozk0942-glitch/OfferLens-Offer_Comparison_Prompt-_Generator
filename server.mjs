import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('./', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const allowed = new Set(['index.html', 'styles.css', 'app.js', 'engine.js', 'model.js', 'ui.js', 'views.js', 'cities.js', 'prompt.js', 'schema.js', 'mobility.js', 'careers.js', 'career-view.js', 'exploration.js']);
const port = Number(process.env.PORT || 5173);
http.createServer(async (req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!allowed.has(name) && name !== 'logo.svg') { res.writeHead(404); res.end('Not found'); return; }
  try { const body = await readFile(path.join(root, name)); res.writeHead(200, { 'Content-Type': mime[path.extname(name)], 'Cache-Control': 'no-store' }); res.end(body); }
  catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`OfferLens 已启动：http://localhost:${port}`));
