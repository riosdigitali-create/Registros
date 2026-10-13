import defaults from '../site-defaults.json' with {type:'json'};
export {defaults};
const imageKeys=new Set(['imagen','foto','src','video','archivo','instagram','instagramDAS','youtube','newsletter']);
const fixedKeys=new Set(['id','estilo','campo','tipo']);
function invalid(message='Contenido de la página inválido.'){throw Object.assign(new Error(message),{status:400});}
function url(value){
 if(!value)return value;
 if(/^\/(?!\/)[\w./-]+$/.test(value)&&!value.includes('..'))return value;
 if(/^img\/[\w./-]+$/.test(value)&&!value.includes('..'))return value;
 try{if(new URL(value).protocol==='https:')return value;}catch{}
 invalid('Selecciona un archivo o un enlace HTTPS válido.');
}
function validate(value,template,key='',depth=0){
 if(depth>12)invalid();
 if(typeof template==='string'){
  if(typeof value!=='string'||value.length>12000)invalid('Un texto es demasiado largo.');
  if(fixedKeys.has(key)&&value!==template)invalid('No se puede cambiar el tipo de este elemento.');
  if(/[<>]/.test(value))invalid('Escribe texto, sin etiquetas HTML.');
  return imageKeys.has(key)?url(value):value;
 }
 if(Array.isArray(template)){
  if(!Array.isArray(value)||value.length>40)invalid('Una lista admite hasta 40 elementos.');
  if(['fotogramas','fotos'].includes(key)&&!value.length)invalid('Conserva al menos una fotografía.');
  if(['caminos','preguntas','materiales'].includes(key)&&value.length!==template.length)invalid('Conserva la estructura de este bloque.');
  return value.map((v,i)=>validate(v,template[i]??template[0],key,depth+1));
 }
 if(template&&typeof template==='object'){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!Object.hasOwn(template,k)))invalid();
  const out={};for(const k of Object.keys(template)){if(!Object.hasOwn(value,k))invalid();out[k]=validate(value[k],template[k],k,depth+1);}return out;
 }
 invalid();
}
export function validateSite(data){
 if(!data||Object.keys(data).some(k=>!['contenido','secciones','orden'].includes(k)))invalid();
 const contenido=validate(data.contenido,defaults.contenido);
 if(!Array.isArray(data.orden)||data.orden.length!==defaults.orden.length||new Set(data.orden).size!==defaults.orden.length||data.orden.some(id=>!defaults.orden.includes(id)))invalid('El orden de las secciones no es válido.');
 if(!Array.isArray(data.secciones)||data.secciones.length!==defaults.secciones.length)invalid();
 const secciones=data.secciones.map((s,i)=>validate(s,defaults.secciones[i]));
 return {contenido,secciones,orden:data.orden};
}
