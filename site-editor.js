/* Page editor: draft in memory, explicit publication to D1, photographs in R2. */
(()=>{
 let draft=null,revision=0,dirty=false,selected='inicio',library=[],originals=[],loading=false,uploading=false;
 const byId=id=>document.getElementById(id);
 const labels={titulo:'Título',subtitulo:'Texto de portada',firma:'Firma',boton:'Texto del botón',imagen:'Fotografía',foto:'Fotografía',src:'Fotografía',pie:'Pie de foto',fotos:'Fotografías del proyecto',fotogramas:'Fotografías de portada',descripcion:'Descripción',resumen:'Resumen',proceso:'Proceso',lista:'Servicios incluidos',formTitulo:'Título del formulario',formIntro:'Introducción del formulario',categoria:'Categoría',video:'Enlace de vídeo',items:'Actividades',texto:'Texto',proyectoLargo:'Proyecto a largo plazo',materiales:'Materiales',archivo:'Archivo',etiqueta:'Texto del enlace',parrafos:'Tu historia',whatsapp:'WhatsApp',whatsappMensaje:'Mensaje inicial de WhatsApp',correo:'Correo',instagram:'Instagram',instagramDAS:'Instagram DAS',youtube:'YouTube',newsletter:'Newsletter',intro:'Introducción',intro2:'Segundo párrafo'};
 const omit=new Set(['id','nombre','estilo','campo','tipo','preguntas','imagen']);
 const imageKey=k=>['imagen','foto','src'].includes(k);
 const access=path=>path.reduce((value,key)=>value[key],draft);
 const assign=(path,value)=>{access(path.slice(0,-1))[path.at(-1)]=value;markDirty();};
 const pathAttr=path=>esc(JSON.stringify(path));
 function markDirty(){dirty=true;byId('cmsEstado').textContent='Cambios sin publicar';}
 function notice(text,bad=false){byId('cmsAviso').innerHTML='<div class="aviso '+(bad?'mal':'ok')+'">'+esc(text)+'</div>';}
 window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
 window.cargarEditorPagina=async(force=false)=>{
  if(loading||(draft&&!force))return;loading=true;byId('cmsEstado').textContent='Cargando…';
  try{const data=await api('/site');draft=data.data;revision=data.revision;dirty=false;render();byId('cmsEstado').textContent='Página guardada';}
  catch(error){notice(error.message,true);}finally{loading=false;}
 };
 function render(){
  byId('cmsOrden').innerHTML=draft.orden.map((id,i)=>{const section=draft.secciones.find(s=>s.id===id);return '<div class="cms-section '+(id===selected?'active':'')+'"><button class="cms-select" data-section="'+id+'">'+String(i+1).padStart(2,'0')+' / '+esc(section.nombre)+'</button><div class="cms-arrows"><button data-order="'+i+'" data-step="-1" aria-label="Subir '+esc(section.nombre)+'" '+(!i?'disabled':'')+'>↑</button><button data-order="'+i+'" data-step="1" aria-label="Bajar '+esc(section.nombre)+'" '+(i===draft.orden.length-1?'disabled':'')+'>↓</button></div></div>';}).join('');
  const index=draft.secciones.findIndex(s=>s.id===selected),section=draft.secciones[index];
  let html='<div class="cms-editor"><h3>'+esc(section.nombre)+'</h3>';
  if(selected!=='inicio'){
   html+=field(['secciones',index,'titulo'],section.titulo,'Título de la sección (una línea por renglón)');
   if(section.intro)html+=field(['secciones',index,'intro'],section.intro,'Introducción');
   if(section.intro2)html+=field(['secciones',index,'intro2'],section.intro2,'Segundo párrafo');
  }
  const groups={inicio:'portada',portafolio:'portafolio',servicios:'caminos',laboratorio:'laboratorio','sobre-mi':'sobreMi',contacto:'contacto'};
  const key=groups[selected];if(key)html+=renderValue(draft.contenido[key],['contenido',key],section.nombre);
  if(selected==='bitacora')html+='<p class="ayuda">Las entradas y sus fotografías se editan en la pestaña Bitácora.</p>';
  html+='</div>';byId('cmsCampos').innerHTML=html;
 }
 let fieldIndex=0;
 function field(path,value,label){
  const key=path.at(-1),id='cmsCampo'+(++fieldIndex);
  if(imageKey(key))return '<div class="cms-photo-field"><label>'+esc(label)+'</label>'+(value?'<img src="'+esc(value)+'" alt="Fotografía seleccionada" loading="lazy">':'')+'<button class="btn fantasma" data-photo="'+pathAttr(path)+'">Elegir fotografía</button></div>';
  const long=/titulo|intro|texto|descripcion|resumen|proceso|parrafos|subtitulo/.test(path.join('.'))||value.length>90;
  return '<div class="campo"><label for="'+id+'">'+esc(label)+'</label>'+(long?'<textarea id="'+id+'" data-path="'+pathAttr(path)+'" rows="'+(value.length>200?5:2)+'">'+esc(value)+'</textarea>':'<input id="'+id+'" data-path="'+pathAttr(path)+'" value="'+esc(value)+'">')+'</div>';
 }
 function renderValue(value,path,label){
  const key=path.at(-1);
  if(typeof value==='string')return field(path,value,label);
  if(Array.isArray(value)){
   const movable=!['caminos','materiales','preguntas'].includes(key);
   const removable=['fotos','fotogramas','items','parrafos','lista'].includes(key);
   let out='<div class="cms-list"><h4>'+esc(label)+'</h4>';
   value.forEach((item,i)=>{
    out+='<details class="cms-item" '+(['fotos','fotogramas','parrafos'].includes(key)?'open':'')+'><summary>'+esc(item.titulo||item.pie||label+' '+(i+1))+'</summary>';
    if(movable)out+='<div class="cms-item-actions"><button data-move="'+pathAttr(path)+'" data-index="'+i+'" data-step="-1" '+(!i?'disabled':'')+' aria-label="Subir elemento '+(i+1)+'">↑ Subir</button><button data-move="'+pathAttr(path)+'" data-index="'+i+'" data-step="1" '+(i===value.length-1?'disabled':'')+' aria-label="Bajar elemento '+(i+1)+'">↓ Bajar</button>'+(removable?'<button data-remove="'+pathAttr(path)+'" data-index="'+i+'" '+(value.length===1?'disabled':'')+'>Quitar de la página</button>':'')+'</div>';
    out+=renderValue(item,[...path,i],label+' '+(i+1))+'</details>';
   });
   if(['fotos','fotogramas'].includes(key))out+='<button class="btn fantasma" data-add-photo="'+pathAttr(path)+'">Añadir fotografía</button>';
   if(['parrafos','lista'].includes(key))out+='<button class="btn fantasma" data-add-text="'+pathAttr(path)+'">Añadir '+(key==='lista'?'servicio':'párrafo')+'</button>';
   return out+'</div>';
  }
  return Object.entries(value).filter(([k])=>path.at(-1)==='portada'&&['video','firma','imagen'].includes(k)?false:!omit.has(k)||imageKey(k)).map(([k,v])=>renderValue(v,[...path,k],labels[k]||k)).join('');
 }
 byId('cmsOrden').addEventListener('click',event=>{
  const select=event.target.closest('[data-section]');if(select){selected=select.dataset.section;render();return;}
  const button=event.target.closest('[data-order]');if(!button)return;
  const i=Number(button.dataset.order),j=i+Number(button.dataset.step);[draft.orden[i],draft.orden[j]]=[draft.orden[j],draft.orden[i]];markDirty();render();
 });
 byId('cmsCampos').addEventListener('input',event=>{const field=event.target.closest('[data-path]');if(field)assign(JSON.parse(field.dataset.path),field.value);});
 byId('cmsCampos').addEventListener('click',event=>{
  const photo=event.target.closest('[data-photo],[data-add-photo]');
  if(photo){const adding=!!photo.dataset.addPhoto,path=JSON.parse(photo.dataset.addPhoto||photo.dataset.photo);openLibrary(url=>{
   if(adding){const array=access(path);if(array.length>=40)return notice('La lista admite hasta 40 fotos.',true);array.push(path.at(-1)==='fotos'?{src:url,pie:''}:{imagen:url,titulo:'Nueva fotografía'});markDirty();}
   else assign(path,url);render();
  });return;}
  const move=event.target.closest('[data-move]');if(move){const list=access(JSON.parse(move.dataset.move)),i=Number(move.dataset.index),j=i+Number(move.dataset.step);[list[i],list[j]]=[list[j],list[i]];markDirty();render();return;}
  const remove=event.target.closest('[data-remove]');if(remove){access(JSON.parse(remove.dataset.remove)).splice(Number(remove.dataset.index),1);markDirty();render();return;}
  const add=event.target.closest('[data-add-text]');if(add){const list=access(JSON.parse(add.dataset.addText));if(list.length>=40)return notice('La lista admite hasta 40 elementos.',true);list.push('');markDirty();render();}
 });
 byId('cmsGuardar').addEventListener('click',async()=>{
  if(!draft||uploading)return;const button=byId('cmsGuardar');button.disabled=true;byId('cmsCampos').inert=true;byId('cmsOrden').inert=true;
  try{const result=await api('/site',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:draft,revision})});revision=result.revision;dirty=false;byId('cmsEstado').textContent='Cambios publicados';notice('Listo. Tu página ya muestra los cambios.');}
  catch(error){notice(error.message,true);}finally{button.disabled=false;byId('cmsCampos').inert=false;byId('cmsOrden').inert=false;}
 });
 byId('cmsRecargar').addEventListener('click',()=>{if(dirty&&!confirm('¿Descartar los cambios sin publicar y recargar la página guardada?'))return;window.cargarEditorPagina(true);});
 byId('cmsBiblioteca').addEventListener('click',()=>openLibrary(null));
 const dialog=document.createElement('dialog');dialog.className='cms-library';dialog.setAttribute('aria-label','Biblioteca de fotografías');document.body.append(dialog);
 let choose=null;
 function sourceImages(){const result=new Set();function walk(v,k){if(typeof v==='string'&&imageKey(k)&&v)result.add(v);else if(Array.isArray(v))v.forEach(x=>walk(x,k));else if(v&&typeof v==='object')Object.entries(v).forEach(([key,x])=>walk(x,key));}walk(draft.contenido,'');return [...result].map((url,i)=>({url,nombre:'Fotografía del archivo '+(i+1),carpeta:'Archivo original',tipo:'image/webp'}));}
 async function openLibrary(callback){
  choose=callback;dialog.innerHTML='<div class="cms-library-head"><div><span class="eyebrow">Tu archivo visual</span><h3>Biblioteca de fotos</h3></div><button class="btn fantasma" id="cmsCerrarFotos">Cerrar</button></div><p>Sube fotos de tu computadora o selecciona una carpeta. Puedes reutilizarlas en cualquier sección.</p><div class="cms-upload"><label class="btn" for="cmsArchivos">Subir fotografías</label><input id="cmsArchivos" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden><label class="btn fantasma" for="cmsCarpeta">Subir una carpeta</label><input id="cmsCarpeta" type="file" accept="image/*" webkitdirectory multiple hidden><input id="cmsBuscarFoto" type="search" placeholder="Buscar foto o carpeta…" aria-label="Buscar foto o carpeta"></div><p id="cmsUploadEstado" role="status" aria-live="polite"></p><div class="cms-photo-grid" id="cmsFotos"></div>';
  dialog.showModal();byId('cmsCerrarFotos').onclick=()=>{if(!uploading)dialog.close();};
  byId('cmsBuscarFoto').oninput=renderLibrary;byId('cmsArchivos').onchange=uploadFiles;byId('cmsCarpeta').onchange=uploadFiles;
  dialog.oncancel=event=>{if(uploading)event.preventDefault();};
  byId('cmsFotos').onclick=event=>{const item=event.target.closest('[data-pick]');if(item&&choose&&!uploading){choose(item.dataset.pick);dialog.close();}};
  try{const results=await Promise.all([api('/media-library'),fetch('/site-library.json').then(r=>{if(!r.ok)throw new Error('No se pudo cargar el archivo original.');return r.json();})]);library=results[0].filter(x=>x.tipo.startsWith('image/'));originals=results[1];renderLibrary();}catch(error){byId('cmsUploadEstado').textContent=error.message;renderLibrary();}
 }
 function renderLibrary(){
  const term=byId('cmsBuscarFoto').value.toLowerCase(),seen=new Set();
  const items=[...library,...originals,...sourceImages()].filter(x=>{if(seen.has(x.url))return false;seen.add(x.url);return (x.nombre+' '+x.carpeta).toLowerCase().includes(term);});
  byId('cmsFotos').innerHTML=items.map(item=>'<button type="button" class="cms-photo" '+(choose?'data-pick="'+esc(item.url)+'"':'disabled')+'><img src="'+esc(item.url)+'" alt="'+esc(item.nombre)+'" loading="lazy"><span>'+esc(item.nombre)+'</span><small>'+esc(item.carpeta||'Fotografías subidas')+'</small>'+(choose?'<b>Usar esta foto ↗</b>':'')+'</button>').join('')||'<p>No hay fotografías que coincidan.</p>';
 }
 async function uploadFiles(event){
  const files=[...event.target.files].filter(f=>/^image\/(jpeg|png|webp|gif|avif)$/.test(f.type));
  if(!files.length){byId('cmsUploadEstado').textContent='Elige fotografías JPG, PNG, WebP, GIF o AVIF.';return;}
  uploading=true;byId('cmsGuardar').disabled=true;byId('cmsCerrarFotos').disabled=true;byId('cmsArchivos').disabled=true;byId('cmsCarpeta').disabled=true;
  let success=0;const failures=[];
  for(const file of files){
   byId('cmsUploadEstado').textContent='Subiendo '+(success+failures.length+1)+' de '+files.length+' — '+file.name;
   try{
    if(file.size>25*1024*1024)throw new Error('supera 25 MB');
    const folder=file.webkitRelativePath?.split('/').slice(0,-1).join('/')||'';
    const result=await api('/uploads',{method:'POST',headers:{'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name),'X-File-Folder':encodeURIComponent(folder)},body:file});
    library.unshift({url:result.url,nombre:file.name,carpeta:folder,tipo:file.type});success++;
   }catch(error){failures.push(file.name+': '+error.message);}
  }
  uploading=false;byId('cmsGuardar').disabled=false;byId('cmsCerrarFotos').disabled=false;byId('cmsArchivos').disabled=false;byId('cmsCarpeta').disabled=false;event.target.value='';
  byId('cmsUploadEstado').textContent=success+' fotografías guardadas en tu biblioteca.'+(failures.length?' No se pudieron subir: '+failures.join('; '):'')+(choose?' Selecciona la que quieras usar.':'');renderLibrary();
 }
})();
