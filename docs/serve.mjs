import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = { '/': ['architecture.html','text/html; charset=utf-8'], '/ARCHITECTURE.md': ['ARCHITECTURE.md','text/markdown; charset=utf-8'] };
http.createServer(async (req,res) => {
  const item=files[new URL(req.url,'http://localhost').pathname];
  if(!item){res.writeHead(404);res.end('Not found');return;}
  try{const data=await readFile(new URL(item[0],import.meta.url));res.writeHead(200,{'Content-Type':item[1],'Cache-Control':'no-store'});res.end(data);}
  catch{res.writeHead(500);res.end('Please run node docs/build-architecture.mjs first.');}
}).listen(5174,'127.0.0.1',()=>console.log('架构审阅图：http://localhost:5174'));
