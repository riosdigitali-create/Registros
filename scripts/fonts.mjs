import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const response=await fetch('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap',{headers:{'User-Agent':'Mozilla/5.0'}});
if(!response.ok)throw new Error('No se pudieron obtener las tipografías.');
let css=await response.text();await fs.mkdir('fonts',{recursive:true});
for(const match of [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)]){
 const url=match[1],name=createHash('sha256').update(url).digest('hex').slice(0,12)+'.'+url.split('.').at(-1);
 const font=await fetch(url);if(!font.ok)throw new Error('No se pudo descargar una tipografía.');
 await fs.writeFile('fonts/'+name,new Uint8Array(await font.arrayBuffer()));css=css.replaceAll(url,'fonts/'+name);
}
await fs.writeFile('fonts.css',css);
for(const file of ['index.html','panel.html']){
 let html=await fs.readFile(file,'utf8');html=html.replace(/<link rel="preconnect" href="https:\/\/fonts[^\n]+\n/g,'').replace(/<link href="https:\/\/fonts\.googleapis[^\n]+\n/,'<link rel="stylesheet" href="fonts.css">\n');
 html=html.replace('%230F4C5C','%2330382d');await fs.writeFile(file,html);
}
console.log('Tipografías listas para servirse desde Cloudflare.');
