import fs from 'node:fs/promises';
const cssResponse=await fetch('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&display=swap');
if(!cssResponse.ok)throw new Error('No se pudo obtener la tipografía');
const css=await cssResponse.text();let local=css;
for(const match of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)){
 const response=await fetch(match[1]);if(!response.ok)throw new Error('No se pudo obtener el archivo');
 const name='bricolage-700.'+match[1].split('.').at(-1);await fs.writeFile('fonts/'+name,new Uint8Array(await response.arrayBuffer()));local=local.replaceAll(match[1],'fonts/'+name);
}
const existing=await fs.readFile('fonts.css','utf8');if(!existing.includes("'Bricolage Grotesque'"))await fs.appendFile('fonts.css','\n'+local);
const license=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/OFL.txt');if(!license.ok)throw new Error('No se pudo obtener la licencia');await fs.writeFile('fonts/bricolage-OFL.txt',await license.text());
console.log('Tipografía de la nueva identidad preparada localmente.');
