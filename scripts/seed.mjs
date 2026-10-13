import fs from 'node:fs';
import vm from 'node:vm';
const C=vm.runInNewContext(fs.readFileSync('contenido.js','utf8')+'\nCONTENIDO');
const quote=value=>"'"+String(value??'').replaceAll("'","''")+"'";
const sql=C.bitacora.map((p,i)=>{
 const row={id:'archivo-original-'+i,fecha:p.fecha,categoria:p.categoria,titulo:p.titulo,resumen:p.resumen,portada:p.portada,texto:(p.texto||[]).join('\n\n'),fotos:JSON.stringify(p.fotos||[]),video:p.video,audio:p.audio,mapa:p.mapa,lugar:p.lugar,publicado:1};
 return 'INSERT OR IGNORE INTO bitacora('+Object.keys(row).join(',')+') VALUES('+Object.values(row).map(quote).join(',')+');';
}).join('\n');
fs.mkdirSync('work',{recursive:true});fs.writeFileSync('work/seed.sql',sql);console.log('Original journal prepared for D1:',C.bitacora.length,'entries.');
