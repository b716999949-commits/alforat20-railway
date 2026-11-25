import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createReadStream, existsSync, mkdirSync, statSync, realpathSync } from 'node:fs';
import { dirname, resolve, join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import worker from './worker.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const publicDir = realpathSync(join(root,'public'));
const railway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const volume = process.env.RAILWAY_VOLUME_MOUNT_PATH || (railway ? '/data' : join(root,'local-data'));
const dbPath = resolve(process.env.FURAT_DB_PATH || join(volume,'alfurat-v3.sqlite3'));
if (railway && (!existsSync(volume) || !dbPath.startsWith(resolve(volume)+sep))) throw Error('Mount persistent Railway volume at /data; keep FURAT_DB_PATH on this volume.');
if (railway && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 20)) throw Error('Set ADMIN_PASSWORD to at least 20 characters in Railway Variables.');
mkdirSync(dirname(dbPath),{recursive:true,mode:0o700});
const sqlite = new DatabaseSync(dbPath);
sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
const normalize = value => value instanceof ArrayBuffer ? new Uint8Array(value) : typeof value==='boolean' ? Number(value) : value;
class Statement {
  constructor(sql,args=[]) { this.sql=sql; this.args=args; }
  bind(...args) { return new Statement(this.sql,args); }
  first() { return sqlite.prepare(this.sql).get(...this.args.map(normalize)) ?? null; }
  all() { return {results:sqlite.prepare(this.sql).all(...this.args.map(normalize)),success:true}; }
  run() { const result=sqlite.prepare(this.sql).run(...this.args.map(normalize)); return {success:true,meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}}; }
}
const DB={prepare:sql=>new Statement(sql),batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const results=statements.map(statement=>statement.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
// Initialize once before accepting traffic. SQLite executes the original worker seed transaction.
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp4':'video/mp4','.webmanifest':'application/manifest+json; charset=utf-8','.ico':'image/x-icon'};
const pages={'/':'index.html','/admin':'admin.html','/account':'account.html','/access':'access.html'};
const ASSETS={async fetch(req){
  if (!['GET','HEAD'].includes(req.method)) return new Response('Method not allowed',{status:405});
  let urlPath;try{urlPath=decodeURIComponent(new URL(req.url).pathname);}catch{return new Response('Bad request',{status:400});}
  if(urlPath.includes('\0')||urlPath.includes('\\')||urlPath.split('/').some(p=>p==='..'||p.startsWith('.'))) return new Response('Not found',{status:404});
  const relative=pages[urlPath] ?? urlPath.replace(/^\/+/, '');
  const file=resolve(publicDir,relative);
  if(!file.startsWith(publicDir+sep)||!existsSync(file)||!statSync(file).isFile()||!realpathSync(file).startsWith(publicDir+sep)) return new Response('Not found',{status:404});
  const size=statSync(file).size;
  const headers=new Headers({'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':String(size),'X-Content-Type-Options':'nosniff','Cache-Control':/\.(html|js|css|webmanifest)$/.test(file)?'no-cache':'public, max-age=86400','Accept-Ranges':'bytes'});
  let start=0,end=size-1,status=200;
  const range=req.headers.get('range');
  if(range && size>0){const m=range.match(/^bytes=(\d*)-(\d*)$/);if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});if(!m[1]){const suffix=Number(m[2]);start=Math.max(0,size-suffix);}else{start=Number(m[1]);if(m[2])end=Math.min(size-1,Number(m[2]));}if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});status=206;headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));}
  return new Response(req.method==='HEAD'||size===0?null:Readable.toWeb(createReadStream(file,{start,end})),{status,headers});
}};
const env={DB,ASSETS,ADMIN_PASSWORD:process.env.ADMIN_PASSWORD};
const boot=await worker.fetch(new Request('http://localhost/api/catalog'),env);
if(!boot.ok)throw Error('Database initialization failed');
const hostFromEnv=process.env.RAILWAY_PUBLIC_DOMAIN;
const server=http.createServer(async (incoming,outgoing)=>{
  try {
    const host=incoming.headers.host||'localhost';
    if(!/^[A-Za-z0-9.\-]+(?::\d{1,5})?$/.test(host)) {outgoing.writeHead(400);outgoing.end('Bad request');return;}
    const scheme=railway?'https':'http';
    const url=new URL(incoming.url||'/',`${scheme}://${host}`);
    if(url.host!==host || url.protocol!==scheme+':'){outgoing.writeHead(400);outgoing.end('Bad request');return;}
    if(url.pathname==='/health'){sqlite.prepare('SELECT 1').get();outgoing.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});outgoing.end('{"status":"ok"}');return;}
    const headers=new Headers();
    for(const [k,v] of Object.entries(incoming.headers))if(v!==undefined&&!['connection','transfer-encoding','upgrade','expect','cf-connecting-ip','oai-authenticated-user-id','oai-authenticated-user-email'].includes(k))headers.set(k,Array.isArray(v)?v.join(', '):v);
    // Railway edge supplies the forwarding chain; use its rightmost entry, not client-controlled leftmost values.
    const forwarded=String(incoming.headers['x-forwarded-for']||'').split(',').map(s=>s.trim()).filter(Boolean);
    headers.set('CF-Connecting-IP',railway&&forwarded.length?forwarded.at(-1):incoming.socket.remoteAddress||'local');
    const method=incoming.method||'GET';
    let body;
    if(!['GET','HEAD'].includes(method)){
      const MAX=6_200_000;let length=0;const chunks=[];
      if(Number(incoming.headers['content-length'])>MAX){outgoing.writeHead(413);outgoing.end('Payload too large');return;}
      for await (const chunk of incoming){length+=chunk.length;if(length>MAX){outgoing.writeHead(413);outgoing.end('Payload too large');return;}chunks.push(chunk);}body=Buffer.concat(chunks);
    }
    const response=await worker.fetch(new Request(url,{method,headers,body}),env);
    const resultHeaders=Object.fromEntries(response.headers);resultHeaders['x-content-type-options']='nosniff';
    if(response.headers.getSetCookie().length)resultHeaders['set-cookie']=response.headers.getSetCookie();
    if(url.pathname.startsWith('/api/')) resultHeaders['cache-control']='no-store';
    outgoing.writeHead(response.status,resultHeaders);
    if(!response.body||method==='HEAD'){outgoing.end();return;}
    Readable.fromWeb(response.body).on('error',()=>outgoing.destroy()).pipe(outgoing);
  }catch(error){console.error('Request error:',error.message);if(!outgoing.headersSent)outgoing.writeHead(500,{'Content-Type':'application/json','Cache-Control':'no-store'});outgoing.end(JSON.stringify({detail:'تعذر إكمال الطلب'}));}
});
server.requestTimeout=30000;
server.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log('Alfurat store is ready'));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>{sqlite.close();process.exit(0);}));
