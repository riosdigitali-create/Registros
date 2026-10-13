/* Load published page settings before rendering the archive. */
window.SITE_READY=(async()=>{
 try{
  const response=await fetch('/api/site',{signal:AbortSignal.timeout(6000)});
  if(!response.ok)return;const config=await response.json();
  window.SITE_CONFIG=config.data;
  Object.assign(CONTENIDO,config.data.contenido);
  const before=document.querySelector('footer');
  for(const id of config.data.orden){const section=document.getElementById(id);if(section)before.before(section);}
 }catch{/* The original archive remains available if the API is offline. */}
})();
window.applySiteHeadings=()=>{
 const config=window.SITE_CONFIG;if(!config)return;
 for(const section of config.secciones){
  const root=document.getElementById(section.id);if(!root||section.id==='inicio')continue;
  const title=root.querySelector(section.id==='frase'?'.em':'.section-title');
  if(title&&section.titulo){
   title.replaceChildren();const lines=section.titulo.split('\n');
   lines.forEach((line,i)=>{if(i)title.append(document.createElement('br'));const item=document.createElement(i?'em':'span');item.textContent=line;title.append(item);});
   if(section.id==='portafolio'){const count=document.createElement('span');count.className='section-count';count.textContent='('+String(CONTENIDO.portafolio.length).padStart(2,'0')+')';title.append(count);}
   if(section.id==='contacto'){const arrow=document.createElement('span');arrow.className='contact-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';title.append(arrow);}
   if(section.id==='laboratorio'){
    title.replaceChildren(document.createTextNode('DAS'));const words=document.createElement('span');words.className='das-definition';words.style.whiteSpace='pre-line';words.textContent=section.titulo.replace(/^DAS/,'').trim();title.append(words);
   }
  }
  const leads=root.querySelectorAll(section.id==='frase'?'.quote-sub':'.lead');
  if(leads[0])leads[0].textContent=section.intro;
  if(leads[1])leads[1].textContent=section.intro2;
 }
 const menu=document.querySelector('#menu');
 for(const id of config.orden){const link=menu.querySelector('a[href="#'+id+'"]');if(link)menu.append(link.parentElement);}
};
