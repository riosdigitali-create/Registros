import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();const dist=path.join(root,'dist');
if(path.dirname(dist)!==root)throw new Error('Invalid build directory');
fs.mkdirSync(dist,{recursive:true});
const files=['index.html','panel.html','contenido.js','nube.js','app.js','panel.js','index-base.css','panel-base.css','editorial.css','direction.css','panel-editorial.css','panel-direction.css','fonts.css','_headers','robots.txt','sitemap.xml'];
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(dist,file));
for(const file of ['site-defaults.json','site-public.js','site-editor.js','site-editor.css'])fs.copyFileSync(path.join(root,file),path.join(dist,file));
const library=[];
for(const [folder,label] of [['img','Originales'],['img/premium','Archivo optimizado']])for(const name of fs.readdirSync(path.join(root,folder))){if(/\.(jpg|jpeg|webp|gif|avif)$/i.test(name))library.push({url:folder+'/'+name,nombre:name,carpeta:label,tipo:'image/'+name.split('.').at(-1)});}
fs.writeFileSync(path.join(dist,'site-library.json'),JSON.stringify(library));
fs.cpSync(path.join(root,'img'),path.join(dist,'img'),{recursive:true});
fs.cpSync(path.join(root,'fonts'),path.join(dist,'fonts'),{recursive:true});
console.log('Build complete: website, panel and image assets.');
