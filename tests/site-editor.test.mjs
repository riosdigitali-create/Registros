import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {defaults,validateSite} from '../worker/site-model.js';
const base='http://127.0.0.1:8787';
test('page settings reject executable content and structural changes',()=>{
 assert.deepEqual(validateSite(structuredClone(defaults)),defaults);
 for(const modify of [d=>d.orden.push('inicio'),d=>d.contenido.sobreMi.parrafos[0]='<script>alert(1)</script>',d=>d.contenido.sobreMi.foto='javascript:alert(1)',d=>d.contenido.portada.extra='not allowed',d=>d.contenido.portada.fotogramas=[]]){
  const data=structuredClone(defaults);modify(data);assert.throws(()=>validateSite(data),error=>error.status===400);
 }
});
test('page publication, revision conflicts and named image library on local Cloudflare',async()=>{
 const saved=await (await fetch(base+'/api/site')).json();
 const data=structuredClone(saved.data);data.orden.reverse();data.contenido.portada.subtitulo='Historia de prueba del editor';
 const options={method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,revision:saved.revision})};
 assert.equal((await fetch(base+'/api/site',options)).status,401);
 const {password}=JSON.parse(fs.readFileSync('.wrangler/test-secrets.json','utf8'));
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie').split(';')[0];options.headers.Cookie=cookie;
 try{
  assert.equal((await fetch(base+'/api/site',{...options,headers:{...options.headers,Origin:'https://foreign.example'}})).status,403);
  const publish=await fetch(base+'/api/site',options);assert.equal(publish.status,200);
  const revision=(await publish.json()).revision;
  const actual=await (await fetch(base+'/api/site')).json();assert.equal(actual.data.contenido.portada.subtitulo,data.contenido.portada.subtitulo);assert.deepEqual(actual.data.orden,data.orden);
  assert.equal((await fetch(base+'/api/site',options)).status,409);
  const invalid=structuredClone(data);invalid.contenido.sobreMi.foto='data:image/svg+xml,<svg/>';
  assert.equal((await fetch(base+'/api/site',{...options,body:JSON.stringify({data:invalid,revision})})).status,400);
  const upload=await fetch(base+'/api/uploads',{method:'POST',headers:{Cookie:cookie,'Content-Type':'image/jpeg','X-File-Name':encodeURIComponent('Mi foto.jpg'),'X-File-Folder':'Recuerdos'},body:fs.readFileSync('img/portada.jpg')});assert.equal(upload.status,201);
  const media=(await upload.json()).url;assert.equal((await fetch(base+'/api/media-library')).status,401);
  const files=await (await fetch(base+'/api/media-library',{headers:{Cookie:cookie}})).json();const item=files.find(x=>x.url===media);assert.equal(item.nombre,'Mi foto.jpg');assert.equal(item.carpeta,'Recuerdos');
  assert.equal((await fetch(base+'/api/site',{...options,body:JSON.stringify({data:saved.data,revision})})).status,200);
 }finally{await fetch(base+'/api/auth/logout',{method:'POST',headers:{Cookie:cookie}});}
});
