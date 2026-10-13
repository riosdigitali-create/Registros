import {defaults,validateSite} from './site-model.js';
const enc=new TextEncoder();
const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY'};
function json(value,status=200,more={}){return new Response(JSON.stringify(value),{status,headers:{...security,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...more}});}
function fail(status,message){throw Object.assign(new Error(message),{status});}
async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function passwordHash(password,salt){
 const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function validPassword(value,stored){
 if(typeof value!=='string'||value.length>256)return false;
 const [version,salt,expected]=String(stored).split(':');if(version!=='pbkdf2'||!salt||!expected)return false;
 const actual=await passwordHash(value,salt);let mismatch=actual.length^expected.length;
 for(let i=0;i<actual.length;i++)mismatch|=actual.charCodeAt(i)^(expected.charCodeAt(i)||0);return mismatch===0;
}
function checkOrigin(req){const origin=req.headers.get('Origin');if(origin&&origin!==new URL(req.url).origin)fail(403,'Solicitud no permitida.');if(req.headers.get('Sec-Fetch-Site')==='cross-site')fail(403,'Solicitud no permitida.');}
async function readBytes(req,max){
 const reader=req.body?.getReader();if(!reader)fail(400,'Falta el contenido.');let size=0;const chunks=[];
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail(413,'El contenido es demasiado grande.');}chunks.push(value);}
 const all=new Uint8Array(size);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length;}return all;
}
async function body(req,max=100000){
 if(!req.headers.get('Content-Type')?.startsWith('application/json'))fail(415,'Usa JSON.');
 if(Number(req.headers.get('Content-Length'))>max)fail(413,'El contenido es demasiado grande.');
 const all=await readBytes(req,max);
 try{const data=JSON.parse(new TextDecoder().decode(all));if(!data||typeof data!=='object'||Array.isArray(data))fail(400,'Contenido inválido.');return data;}catch{fail(400,'Contenido inválido.');}
}
function text(value,max,required=false){if(value!=null&&typeof value!=='string')fail(400,'Texto inválido.');const val=(value||'').trim();if(val.length>max)fail(400,'El texto supera el límite.');if(required&&!val)fail(400,'Completa los campos requeridos.');return val;}
function safeURL(value){
 const val=text(value,2000);if(!val)return '';
 if(val.startsWith('/')&&!val.startsWith('//'))return val;
 if(/^img\/[\w./-]+$/.test(val)&&!val.includes('..'))return val;
 try{const u=new URL(val);if(u.protocol==='https:'||(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))return val;}catch{}
 fail(400,'Usa un enlace HTTPS válido.');
}
function decodeRow(row){const r={...row};for(const [key,fallback]of [['respuestas',{}],['fotos',[]]])if(key in r){try{r[key]=JSON.parse(r[key]);}catch{r[key]=fallback;}}for(const k of ['publicado','leido','archivado'])if(k in r)r[k]=!!r[k];return r;}
function messageInput(data){
 const correo=text(data.correo,254,true);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))fail(400,'Revisa tu correo.');
 const origen=text(data.origen,30)||'general';if(!['general','personales','artisticos'].includes(origen))fail(400,'Formulario inválido.');
 const respuestas={};if(data.respuestas&&(Array.isArray(data.respuestas)||typeof data.respuestas!=='object'))fail(400,'Respuestas inválidas.');
 for(const [k,v]of Object.entries(data.respuestas||{})){if(k.length>50||Object.keys(respuestas).length>=20)fail(400,'Demasiadas respuestas.');respuestas[k]=text(v,8000);}
 return {nombre:text(data.nombre,150,true),correo,telefono:text(data.telefono,50),mensaje:text(data.mensaje,12000,true),origen,respuestas:JSON.stringify(respuestas)};
}
function postInput(data){
 const fecha=text(data.fecha,10,true);if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha)||Number.isNaN(Date.parse(fecha)))fail(400,'Fecha inválida.');
 if(data.fotos!=null&&!Array.isArray(data.fotos))fail(400,'Galería inválida.');const fotos=data.fotos||[];if(fotos.length>40)fail(400,'La galería admite hasta 40 imágenes.');
 return {fecha,categoria:text(data.categoria,100)||'Bitácora',titulo:text(data.titulo,250,true),resumen:text(data.resumen,2000),portada:safeURL(data.portada),texto:text(data.texto,70000),fotos:JSON.stringify(fotos.map(f=>typeof f==='string'?safeURL(f):{src:safeURL(f.src),pie:text(f.pie,500)})),video:safeURL(data.video),audio:safeURL(data.audio),mapa:safeURL(data.mapa),lugar:text(data.lugar,250),publicado:data.publicado===true?1:0};
}
async function limit(env,req,scope,maximum,window=600){
 const ip=req.headers.get('CF-Connecting-IP')||'local';const key=scope+':'+await digest(ip);const now=Math.floor(Date.now()/1000);const slot=Math.floor(now/window)*window;
 const r=await env.DB.prepare('INSERT INTO limites(clave,ventana,cantidad) VALUES(?,?,1) ON CONFLICT(clave) DO UPDATE SET cantidad=CASE WHEN ventana=excluded.ventana THEN cantidad+1 ELSE 1 END, ventana=excluded.ventana RETURNING cantidad').bind(key,slot).first();
 if(r.cantidad>maximum)fail(429,'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.');
}
function sessionToken(req){return req.headers.get('Cookie')?.match(/(?:^|;\s*)registro_sesion=([a-f0-9]{64})(?:;|$)/)?.[1]||'';}
async function authenticated(req,env){const token=sessionToken(req);if(!token)return false;return !!await env.DB.prepare('SELECT hash FROM sesiones WHERE hash=? AND vence>?').bind(await digest(token),Math.floor(Date.now()/1000)).first();}
function cookie(req,value,age){const secure=new URL(req.url).protocol==='https:'?'; Secure':'';return `registro_sesion=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure}`;}
export default {async fetch(req,env){
 const url=new URL(req.url),path=url.pathname;
 try{
  if(path.startsWith('/api/')&&!env.DB)return json({error:'El archivo aún no está conectado.'},503);
  if(path.startsWith('/api/')&&!['GET','HEAD'].includes(req.method))checkOrigin(req);
  if(path==='/api/auth/login'&&req.method==='POST'){
   if(!env.ADMIN_PASSWORD_HASH)return json({error:'El acceso al panel está pendiente de configuración.'},503);
   await limit(env,req,'login',10);const data=await body(req,2000);if(!await validPassword(data.password,env.ADMIN_PASSWORD_HASH))fail(401,'La contraseña no es correcta.');
   const token=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
   await env.DB.batch([env.DB.prepare('DELETE FROM sesiones WHERE vence<=?').bind(Math.floor(Date.now()/1000)),env.DB.prepare('INSERT INTO sesiones(hash,vence) VALUES(?,?)').bind(await digest(token),Math.floor(Date.now()/1000)+28800)]);
   return json({authenticated:true},200,{'Set-Cookie':cookie(req,token,28800)});
  }
  if(path==='/api/auth/logout'&&req.method==='POST'){const token=sessionToken(req);if(token)await env.DB.prepare('DELETE FROM sesiones WHERE hash=?').bind(await digest(token)).run();return json({authenticated:false},200,{'Set-Cookie':cookie(req,'',0)});}
  if(path==='/api/auth/session'&&req.method==='GET')return json({authenticated:await authenticated(req,env)});
  if(path==='/api/mensajes'&&req.method==='POST'){
   await limit(env,req,'contacto',5);const data=await body(req,40000);if(data.website)return json({ok:true},201);
   const fila=messageInput(data),columns=Object.keys(fila);await env.DB.prepare(`INSERT INTO mensajes(id,${columns.join(',')}) VALUES(?${',?'.repeat(columns.length)})`).bind(crypto.randomUUID(),...Object.values(fila)).run();return json({ok:true},201);
  }
  if(path==='/api/site'&&req.method==='GET'){
   const row=await env.DB.prepare('SELECT contenido,revision,actualizado FROM sitio WHERE id=1').first();
   return json({data:row?JSON.parse(row.contenido):defaults,revision:row?.revision||0,actualizado:row?.actualizado||null});
  }
  const admin=path.startsWith('/api/')?await authenticated(req,env):false;
  if(path==='/api/site'&&req.method==='PUT'){
   if(!admin)fail(401,'Inicia sesión.');const input=await body(req,400000);
   if(!Number.isSafeInteger(input.revision)||input.revision<0)fail(400,'Versión inválida.');
   const config=validateSite(input.data);let result;
   if(input.revision===0)result=await env.DB.prepare('INSERT INTO sitio(id,contenido,revision) VALUES(1,?,1) ON CONFLICT(id) DO NOTHING').bind(JSON.stringify(config)).run();
   else result=await env.DB.prepare("UPDATE sitio SET contenido=?,revision=revision+1,actualizado=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=1 AND revision=?").bind(JSON.stringify(config),input.revision).run();
   if(!result.meta.changes)fail(409,'La página cambió en otra pestaña. Recarga el editor antes de guardar.');
   return json({ok:true,revision:input.revision+1});
  }
  if(path==='/api/media-library'&&req.method==='GET'){
   if(!admin)fail(401,'Inicia sesión.');const rows=await env.DB.prepare('SELECT * FROM biblioteca ORDER BY creado_en DESC').all();
   const existing=await env.MEDIOS.list({limit:1000});const known=new Set(rows.results.map(r=>r.url));
   const legacy=existing.objects.filter(o=>/^[a-f0-9-]{36}\.(jpg|png|webp|gif|avif)$/.test(o.key)&&!known.has('/media/'+o.key)).map(o=>({url:'/media/'+o.key,nombre:'Fotografía guardada',carpeta:'Subidas anteriores',tipo:'image/'+o.key.split('.').at(-1)}));
   return json([...rows.results,...legacy]);
  }
  if(path==='/api/bitacora'&&req.method==='GET'){
   const published=url.searchParams.get('publicado')==='eq.true';if(!published&&!admin)fail(401,'Inicia sesión para ver los borradores.');
   const rows=await env.DB.prepare(`SELECT * FROM bitacora ${published?'WHERE publicado=1':''} ORDER BY fecha DESC,creado_en DESC`).all();return json(rows.results.map(decodeRow));
  }
  if(path==='/api/mensajes'&&req.method==='GET'){if(!admin)fail(401,'Inicia sesión.');const rows=await env.DB.prepare('SELECT * FROM mensajes ORDER BY creado_en DESC').all();return json(rows.results.map(decodeRow));}
  if(['/api/mensajes','/api/bitacora'].includes(path)&&['PATCH','DELETE','POST'].includes(req.method)){
   if(!admin)fail(401,'Inicia sesión.');const table=path.endsWith('mensajes')?'mensajes':'bitacora';const id=url.searchParams.get('id')?.replace(/^eq\./,'');if(req.method!=='POST'&&(!id||!/^[\w-]{1,100}$/.test(id)))fail(400,'Identificador inválido.');
   if(req.method==='DELETE'){await env.DB.prepare(`DELETE FROM ${table} WHERE id=?`).bind(id).run();return new Response(null,{status:204,headers:{...security,'Cache-Control':'no-store'}});}
   const data=await body(req);let fila;
   if(table==='mensajes'){fila={};for(const k of ['leido','archivado'])if(k in data){if(typeof data[k]!=='boolean')fail(400,'Estado inválido.');fila[k]=data[k]?1:0;}if(!Object.keys(fila).length)fail(400,'Falta el cambio.');}else fila=postInput(data);
   const columns=Object.keys(fila);
   if(req.method==='POST'){const postId=crypto.randomUUID();await env.DB.prepare(`INSERT INTO bitacora(id,${columns.join(',')}) VALUES(?${',?'.repeat(columns.length)})`).bind(postId,...Object.values(fila)).run();return json({id:postId},201);}
   const result=await env.DB.prepare(`UPDATE ${table} SET ${columns.map(k=>k+'=?').join(',')} WHERE id=?`).bind(...Object.values(fila),id).run();if(!result.meta.changes)fail(404,'No se encontró el registro.');return json({ok:true});
  }
  if(path==='/api/uploads'&&req.method==='POST'){
   if(!admin)fail(401,'Inicia sesión.');if(!env.MEDIOS)fail(503,'El almacén no está conectado.');
   const type=(req.headers.get('Content-Type')||'').split(';')[0];const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif','audio/mpeg':'mp3','audio/wav':'wav','audio/x-wav':'wav','audio/ogg':'ogg','audio/mp4':'m4a','video/mp4':'mp4','application/pdf':'pdf'}[type];if(!ext)fail(415,'Formato de archivo no permitido.');
   if(Number(req.headers.get('Content-Length'))>25*1024*1024)fail(413,'El archivo debe pesar menos de 25 MB.');const buffer=await readBytes(req,25*1024*1024);if(!buffer.byteLength)fail(400,'El archivo está vacío.');
   let name='Archivo.'+ext,folder='';try{name=text(decodeURIComponent(req.headers.get('X-File-Name')||name),150)||name;folder=text(decodeURIComponent(req.headers.get('X-File-Folder')||''),150);}catch{fail(400,'Nombre de archivo inválido.');}
   const key=crypto.randomUUID()+'.'+ext;await env.MEDIOS.put(key,buffer,{httpMetadata:{contentType:type}});
   await env.DB.prepare('INSERT INTO biblioteca(url,nombre,carpeta,tipo) VALUES(?,?,?,?)').bind('/media/'+key,name,folder,type).run();
   return json({url:'/media/'+key},201);
  }
  if(path.startsWith('/media/')&&['GET','HEAD'].includes(req.method)){
   const key=path.slice(7);if(!/^[a-f0-9-]{36}\.[a-z0-9]{2,5}$/.test(key))fail(404,'Archivo no encontrado.');
   const object=req.method==='HEAD'?await env.MEDIOS?.head(key):await env.MEDIOS?.get(key,req.headers.has('Range')?{range:req.headers}:undefined);if(!object)fail(404,'Archivo no encontrado.');
   const headers=new Headers({...security,'Cache-Control':'public, max-age=31536000, immutable','Accept-Ranges':'bytes'});object.writeHttpMetadata(headers);headers.set('ETag',object.httpEtag);if(req.headers.get('If-None-Match')===object.httpEtag)return new Response(null,{status:304,headers});
   const range=req.headers.has('Range')?object.range:null;headers.set('Content-Length',String(range?.length??object.size));if(range)headers.set('Content-Range',`bytes ${range.offset}-${range.offset+range.length-1}/${object.size}`);return new Response(req.method==='HEAD'?null:object.body,{status:range?206:200,headers});
  }
  if(path.startsWith('/api/'))return json({error:'Ruta no encontrada.'},404);return env.ASSETS.fetch(req);
 }catch(error){return json({error:error.status?error.message:'No se pudo completar la solicitud.'},error.status||500);}
}};
