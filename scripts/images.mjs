import fs from 'node:fs/promises';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await fs.readFile('img/premium/manifest.json','utf8'));
if(manifest.status==='in_progress')throw new Error('La revisión de las imágenes sigue en curso.');
const mapping={};let total=0;
for(const entry of manifest.images){
 const selected=entry.selected==='original'?'img/'+entry.source:'img/'+entry.output;
 const bytes=await sharp(selected).webp({quality:88,effort:6}).toBuffer();
 const name=entry.source.replace(/\.[^.]+$/,'')+'-'+createHash('sha256').update(bytes).digest('hex').slice(0,8)+'.webp';
 const web='img/premium/'+name;await fs.writeFile(web,bytes);total+=bytes.length;mapping['img/'+entry.source]=web;
 const metadata=await sharp(bytes).metadata();entry.web={path:web,width:metadata.width,height:metadata.height,bytes:bytes.length};
}
await fs.writeFile('img/premium/manifest.json',JSON.stringify(manifest,null,2)+'\n');
for(const file of ['contenido.js','index.html','panel-editorial.css']){
 let source=await fs.readFile(file,'utf8');for(const [from,to]of Object.entries(mapping))source=source.replaceAll(from,to);
 if(file==='index.html')source=source.replace('</head>','<link rel="preload" as="image" href="'+mapping['img/portada.jpg']+'">\n</head>');
 await fs.writeFile(file,source);
}
await fs.mkdir('work',{recursive:true});
const q=v=>"'"+v.replaceAll("'","''")+"'";
const sql=Object.entries(mapping).filter(([from])=>from.includes('bitacora-')).map(([from,to])=>'UPDATE bitacora SET portada='+q(to)+' WHERE portada='+q(from)+';').join('\n');
await fs.writeFile('work/image-paths.sql',sql);
console.log('WebP listos:',Object.keys(mapping).length,'imágenes;',Math.round(total/1024),'KB en total.');
