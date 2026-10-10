
/* ============================================================
   PANEL PRIVADO — Registro de un Amar Salvaje
   ============================================================ */
const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

const esc = (t) => String(t == null ? "" : t)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const MESES = ["enero","febrero","marzo","abril","mayo","junio",
               "julio","agosto","septiembre","octubre","noviembre","diciembre"];

function fechaLarga(valor){
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(valor)) ? valor + "T12:00:00" : valor);
  if(isNaN(d)) return String(valor || "");
  return d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear();
}
function fechaHora(valor){
  const d = new Date(valor);
  if(isNaN(d)) return String(valor || "");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return fechaLarga(valor) + ", " + hh + ":" + mm + " h";
}
function hoyISO(){
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
         "-" + String(d.getDate()).padStart(2, "0");
}

/* ==========================================================
   SESIÓN
   ========================================================== */
let sesion = null;
function borrarSesion(){ sesion = null; fetch(NUBE.url + "/auth/logout", {method:"POST", credentials:"same-origin"}).catch(()=>{}); }
async function entrar(clave){
 const r=await fetch(NUBE.url + "/auth/login", {method:"POST", credentials:"same-origin", headers:{"Content-Type":"application/json"},body:JSON.stringify({password:clave})});
 const d=await r.json().catch(()=>({})); if(!r.ok)throw new Error(d.error || "No se pudo iniciar sesión.");
 sesion=d; return d;
}
async function api(ruta, opciones={}){
 const r=await fetch(NUBE.url + ruta.replace("/rest/v1", ""), {...opciones,credentials:"same-origin"});
 if(r.status===401){ salir(); throw new Error("La sesión caducó. Vuelve a entrar."); }
 if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.error || "No se pudo completar la solicitud.");}
 if(r.status===204)return null;const t=await r.text();return t?JSON.parse(t):null;
}

function salir(){
  borrarSesion();
  $("#pantallaPanel").classList.add("oculto");
  $("#pantallaEntrada").classList.remove("oculto");
  $("#clave").value = "";
}

$("#formEntrada").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#btnEntrar");
  const err = $("#errorEntrada");
  err.innerHTML = "";
  btn.disabled = true; btn.textContent = "Entrando…";
  try {
    await entrar($("#clave").value.trim());
    abrirPanel();
  } catch(ex){
    err.innerHTML = '<div class="error">' + esc(ex.message) + "</div>";
  } finally {
    btn.disabled = false; btn.textContent = "Entrar";
  }
});

$("#btnSalir").addEventListener("click", salir);

function abrirPanel(){
  $("#pantallaEntrada").classList.add("oculto");
  $("#pantallaPanel").classList.remove("oculto");
  cargarMensajes();
  cargarEntradas();
}

/* ==========================================================
   PESTAÑAS
   ========================================================== */
$$(".pestana[data-vista]").forEach(b => b.addEventListener("click", () => {
  $$(".pestana[data-vista]").forEach(x => x.classList.toggle("on", x === b));
  const v = b.dataset.vista;
  $("#vistaMensajes").classList.toggle("oculto", v !== "mensajes");
  $("#vistaBitacora").classList.toggle("oculto", v !== "bitacora");
}));

/* ==========================================================
   MENSAJES
   ========================================================== */
const ORIGENES = {
  general:    "Contacto general",
  personales: "Historias personales",
  artisticos: "Proyectos artísticos",
};

/* Nombres bonitos para las preguntas de cada camino. */
const PREGUNTAS = {
  ocasion:  "Qué quiere conservar",
  material: "Material que tiene",
  fecha:    "Para cuándo",
  historia: "Su historia",
  tipo:     "Tipo de proyecto",
  etapa:    "Etapa",
  rol:      "Qué necesita",
  fechas:   "Fechas y presupuesto",
  proyecto: "El proyecto",
  nombre:   "Nombre",
  correo:   "Correo",
  telefono: "Teléfono",
  mensaje:  "Mensaje",
};

let mensajes = [];
let filtroMensajes = "todos";
let busqueda = "";

async function cargarMensajes(){
  const cont = $("#listaMensajes");
  cont.innerHTML = '<p class="cargando">Cargando…</p>';
  try {
    mensajes = await api("/rest/v1/mensajes?select=*&order=creado_en.desc") || [];
    pintarMensajes();
  } catch(ex){
    cont.innerHTML = '<div class="aviso mal">' + esc(ex.message) + "</div>";
  }
}

function mensajesVisibles(){
  const t = busqueda.trim().toLowerCase();
  return mensajes.filter(m => {
    if(filtroMensajes === "sinleer"    && (m.leido || m.archivado)) return false;
    if(filtroMensajes === "archivados" && !m.archivado) return false;
    if(filtroMensajes === "todos"      && m.archivado) return false;
    if(!t) return true;
    const paja = [m.nombre, m.correo, m.telefono, m.mensaje,
                  JSON.stringify(m.respuestas || {})].join(" ").toLowerCase();
    return paja.indexOf(t) >= 0;
  });
}

function pintarMensajes(){
  pintarEstadisticas();
  const cont = $("#listaMensajes");
  const lista = mensajesVisibles();

  const sinLeer = mensajes.filter(m => !m.leido && !m.archivado).length;
  const globo = $("#globoSinLeer");
  globo.textContent = sinLeer;
  globo.classList.toggle("oculto", sinLeer === 0);

  if(!lista.length){
    cont.innerHTML = '<div class="vacio"><p class="grande">Nada por aquí todavía</p>' +
      "<p>Cuando alguien llene un formulario de la página, su mensaje aparece en esta lista.</p></div>";
    return;
  }

  cont.innerHTML = lista.map(m => {
    const extracto = m.mensaje || Object.values(m.respuestas || {}).join(" · ");
    return '<article class="tarjeta ' + (m.leido ? "" : "sinleer") +
      (m.archivado ? " archivada" : "") + '" data-id="' + esc(m.id) + '">' +
      '<div class="tarjeta-alto">' +
        '<h3>' + esc(m.nombre || "Sin nombre") + "</h3>" +
        '<span class="sello ' + esc(m.origen) + '">' + esc(ORIGENES[m.origen] || m.origen) + "</span>" +
        (m.archivado ? '<span class="sello">Archivado</span>' : "") +
        '<span class="fecha">' + esc(fechaHora(m.creado_en)) + "</span>" +
      "</div>" +
      '<p class="extracto">' + esc(extracto) + "</p>" +
    "</article>";
  }).join("");
}

$("#listaMensajes").addEventListener("click", (e) => {
  const t = e.target.closest("[data-id]");
  if(t) abrirFicha(t.dataset.id);
});

$$(".filtro").forEach(b => b.addEventListener("click", () => {
  $$(".filtro").forEach(x => x.classList.toggle("on", x === b));
  filtroMensajes = b.dataset.filtro;
  pintarMensajes();
}));

$("#buscador").addEventListener("input", (e) => { busqueda = e.target.value; pintarMensajes(); });
$("#btnActualizar").addEventListener("click", cargarMensajes);

function abrirFicha(id){
  const m = mensajes.find(x => x.id === id);
  if(!m) return;

  const filas = [];
  const agrega = (k, v) => { if(v) filas.push('<div class="dato"><div class="k">' + esc(k) +
    '</div><div class="v">' + esc(v) + "</div></div>"); };

  agrega("Recibido", fechaHora(m.creado_en));
  agrega("Viene de", ORIGENES[m.origen] || m.origen);
  agrega("Nombre", m.nombre);
  agrega("Correo", m.correo);
  agrega("Teléfono", m.telefono);
  Object.keys(m.respuestas || {}).forEach(k => {
    if(k === "nombre" || k === "correo" || k === "mensaje") return;
    agrega(PREGUNTAS[k] || k, m.respuestas[k]);
  });
  if(m.mensaje) agrega("Mensaje", m.mensaje);

  const tel = String(m.telefono || "").replace(/[^0-9]/g, "");
  const asunto = encodeURIComponent("Sobre tu mensaje en Registro de un Amar Salvaje");

  abrirVelo(
    '<button class="cerrar" data-cerrar>&times;</button>' +
    '<span class="sello ' + esc(m.origen) + '">' + esc(ORIGENES[m.origen] || m.origen) + "</span>" +
    "<h2>" + esc(m.nombre || "Sin nombre") + "</h2>" +
    '<p class="ayuda">' + esc(fechaHora(m.creado_en)) + "</p>" +
    '<div class="datos">' + filas.join("") + "</div>" +
    '<div class="acciones">' +
      (m.correo ? '<a class="btn" href="mailto:' + esc(m.correo) + "?subject=" + asunto + '">Responder por correo</a>' : "") +
      (tel ? '<a class="btn terra" target="_blank" rel="noopener" href="https://wa.me/' + esc(tel) + '">Responder por WhatsApp</a>' : "") +
      '<button class="btn fantasma" data-accion="leido">' + (m.leido ? "Marcar como no leído" : "Marcar como leído") + "</button>" +
      '<button class="btn fantasma" data-accion="archivar">' + (m.archivado ? "Desarchivar" : "Archivar") + "</button>" +
      '<button class="btn fantasma" data-accion="borrar">Eliminar</button>' +
    "</div>",
    async (accion, cerrar) => {
      if(accion === "leido")    await cambiarMensaje(m.id, { leido: !m.leido });
      if(accion === "archivar") await cambiarMensaje(m.id, { archivado: !m.archivado, leido: true });
      if(accion === "borrar"){
        if(!confirm("¿Eliminar este mensaje para siempre?")) return;
        await api("/rest/v1/mensajes?id=eq." + m.id, { method: "DELETE" });
        mensajes = mensajes.filter(x => x.id !== m.id);
        pintarMensajes();
      }
      cerrar();
    }
  );

  if(!m.leido) cambiarMensaje(m.id, { leido: true });
}

async function cambiarMensaje(id, cambios){
  await api("/rest/v1/mensajes?id=eq." + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(cambios),
  });
  const m = mensajes.find(x => x.id === id);
  if(m) Object.assign(m, cambios);
  pintarMensajes();
}

/* ---------- exportar ---------- */
$("#btnExportar").addEventListener("click", () => {
  const lista = mensajesVisibles();
  if(!lista.length) return alert("No hay mensajes que exportar.");
  const cols = ["creado_en","origen","nombre","correo","telefono","mensaje","respuestas","leido","archivado"];
  const celda = (v) => '"' + String(v == null ? "" : (typeof v === "object" ? JSON.stringify(v) : v))
    .replace(/"/g, '""') + '"';
  const csv = "﻿" + cols.join(",") + "\n" +
    lista.map(m => cols.map(c => celda(m[c])).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = "mensajes-" + hoyISO() + ".csv";
  a.click();
  URL.revokeObjectURL(a.href);
});

/* ==========================================================
   VELO / FICHA
   ========================================================== */
function abrirVelo(html, alAccionar){
  const velo = $("#velo");
  velo.className = "velo";
  velo.innerHTML = '<div class="ficha">' + html + "</div>";
  const cerrar = () => { velo.className = ""; velo.innerHTML = ""; document.body.style.overflow = ""; };
  document.body.style.overflow = "hidden";
  velo.onclick = (e) => {
    if(e.target === velo || e.target.closest("[data-cerrar]")) return cerrar();
    const b = e.target.closest("[data-accion]");
    if(b && alAccionar) alAccionar(b.dataset.accion, cerrar);
  };
  document.onkeydown = (e) => { if(e.key === "Escape") cerrar(); };
}

/* ==========================================================
   BITÁCORA
   ========================================================== */
const CATEGORIAS = ["Lugares", "Miradas", "Detrás de las historias", "Bitácora", "Amar Salvaje"];
let entradas = [];

async function cargarEntradas(){
  const cont = $("#listaEntradas");
  cont.innerHTML = '<p class="cargando">Cargando…</p>';
  try {
    entradas = await api("/rest/v1/bitacora?select=*&order=fecha.desc") || [];
    pintarEntradas();
  } catch(ex){
    cont.innerHTML = '<div class="aviso mal">' + esc(ex.message) + "</div>";
  }
}

function pintarEntradas(){
  const cont = $("#listaEntradas");
  if(!entradas.length){
    cont.innerHTML = '<div class="vacio"><p class="grande">Todavía no has escrito nada aquí</p>' +
      '<p>Empieza con el botón «Escribir una entrada nueva».</p></div>';
    return;
  }
  cont.innerHTML = entradas.map(e => {
    const medios = [];
    if(e.video) medios.push("video");
    if(e.audio) medios.push("audio");
    if(e.mapa)  medios.push("mapa");
    if((e.fotos || []).length) medios.push((e.fotos || []).length + " fotos");
    return '<article class="entrada-fila">' +
      (e.portada ? '<img src="' + esc(e.portada) + '" alt="">' : "") +
      '<div class="cuerpo">' +
        "<h4>" + esc(e.titulo) + "</h4>" +
        '<div class="meta">' + esc(fechaLarga(e.fecha)) + " · " + esc(e.categoria) +
        (medios.length ? " · " + esc(medios.join(", ")) : "") + "</div>" +
      "</div>" +
      (e.publicado ? "" : '<span class="sello borrador">Borrador</span>') +
      '<button class="btn fantasma chico" data-editar="' + esc(e.id) + '">Editar</button>' +
      '<button class="btn fantasma chico" data-borrar="' + esc(e.id) + '">Eliminar</button>' +
    "</article>";
  }).join("");
}

$("#listaEntradas").addEventListener("click", async (ev) => {
  const ed = ev.target.closest("[data-editar]");
  if(ed) return abrirEditor(entradas.find(x => x.id === ed.dataset.editar));
  const bo = ev.target.closest("[data-borrar]");
  if(bo){
    if(!confirm("¿Eliminar esta entrada de la bitácora?")) return;
    await api("/rest/v1/bitacora?id=eq." + bo.dataset.borrar, { method: "DELETE" });
    entradas = entradas.filter(x => x.id !== bo.dataset.borrar);
    pintarEntradas();
  }
});

$("#btnNueva").addEventListener("click", () => abrirEditor(null));
$("#btnActualizarBit").addEventListener("click", cargarEntradas);

let fotosEditor = [];

function abrirEditor(e){
  e = e || {};
  fotosEditor = Array.isArray(e.fotos) ? e.fotos.slice() : [];

  const caja = $("#editorCaja");
  caja.classList.remove("oculto");
  caja.innerHTML =
  '<form class="editor" id="formEntradaBit">' +
    "<h3>" + (e.id ? "Editar la entrada" : "Una entrada nueva") + "</h3>" +
    '<div id="avisoEditor"></div>' +

    '<div class="campos-2">' +
      '<div class="campo"><label for="eFecha">Fecha</label>' +
        '<input id="eFecha" type="date" value="' + esc(e.fecha || hoyISO()) + '"></div>' +
      '<div class="campo"><label for="eCategoria">Categoría</label><select id="eCategoria">' +
        CATEGORIAS.map(c => '<option' + (c === (e.categoria || "Bitácora") ? " selected" : "") +
          ">" + esc(c) + "</option>").join("") +
      "</select></div>" +
    "</div>" +

    '<div class="campo"><label for="eTitulo">Título</label>' +
      '<input id="eTitulo" value="' + esc(e.titulo || "") + '" placeholder="El mercado antes de que amanezca" required></div>' +

    '<div class="campo"><label for="eResumen">Resumen — las dos líneas que se ven en la tarjeta</label>' +
      '<input id="eResumen" value="' + esc(e.resumen || "") + '" placeholder="Voces, cajas de fruta y una luz que todavía no decide de qué color será el día."></div>' +

    '<div class="campo"><label>Foto de portada</label>' +
      '<div class="subida">' +
        '<img class="previa' + (e.portada ? "" : " oculto") + '" id="ePortadaPrevia" src="' + esc(e.portada || "") + '" alt="">' +
        '<label class="boton-archivo" for="ePortadaArchivo">Elegir una foto</label>' +
        '<input type="file" id="ePortadaArchivo" accept="image/*" class="archivo-real">' +
        (e.portada ? '<button type="button" class="btn fantasma chico" id="eQuitarPortada">Quitar</button>' : "") +
      "</div>" +
        '<p class="ayuda">Se sube sola al elegirla. Hasta 25 MB por archivo.</p></div>' +

    '<div class="campo"><label for="eTexto">El texto</label>' +
      '<textarea id="eTexto" placeholder="Escribe con calma. Deja un renglón en blanco entre párrafo y párrafo.">' +
      esc(e.texto || "") + "</textarea>" +
      '<p class="ayuda">Cada renglón en blanco separa un párrafo.</p></div>' +

    '<div class="campo"><label>Más fotos (galería)</label>' +
      '<label class="boton-archivo" for="eFotosArchivos">Elegir varias fotos</label>' +
      '<input type="file" id="eFotosArchivos" accept="image/*" multiple class="archivo-real">' +
      '<div class="galeria-previa" id="eGaleria"></div></div>' +

    '<div class="campos-2">' +
      '<div class="campo"><label for="eVideo">Video (enlace de YouTube, Vimeo o Drive)</label>' +
        '<input id="eVideo" value="' + esc(e.video || "") + '" placeholder="https://youtu.be/…"></div>' +
      '<div class="campo"><label for="eAudioArchivo">Audio (sube un mp3)</label>' +
        '<label class="boton-archivo" for="eAudioArchivo">Elegir un audio</label>' +
        '<input type="file" id="eAudioArchivo" accept="audio/*" class="archivo-real">' +
        '<input id="eAudio" value="' + esc(e.audio || "") + '" placeholder="…o pega aquí un enlace" style="margin-top:8px"></div>' +
    "</div>" +

    '<div class="campos-2">' +
      '<div class="campo"><label for="eMapa">Mapa (enlace de Google Maps)</label>' +
        '<input id="eMapa" value="' + esc(e.mapa || "") + '" placeholder="https://maps.app.goo.gl/…"></div>' +
      '<div class="campo"><label for="eLugar">Nombre del lugar</label>' +
        '<input id="eLugar" value="' + esc(e.lugar || "") + '" placeholder="Mercado de San Juan"></div>' +
    "</div>" +

    '<div class="campo"><label style="display:flex;align-items:center;gap:10px;text-transform:none;' +
      'letter-spacing:0;font-size:.95rem;font-family:var(--font-serif);color:var(--carbon)">' +
      '<input type="checkbox" id="ePublicado" style="width:auto"' +
      (e.id ? (e.publicado ? " checked" : "") : " checked") + "> Publicada en la página</label></div>" +

    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn" type="submit" id="eGuardar">' + (e.id ? "Guardar los cambios" : "Publicar la entrada") + "</button>" +
      '<button class="btn fantasma" type="button" id="eCancelar">Cancelar</button>' +
    "</div>" +
  "</form>";

  caja.scrollIntoView({ behavior: "smooth", block: "start" });
  pintarGaleria();

  $("#eCancelar").onclick = cerrarEditor;

  const quitar = $("#eQuitarPortada");
  if(quitar) quitar.onclick = () => {
    $("#ePortadaPrevia").src = "";
    $("#ePortadaPrevia").classList.add("oculto");
  };

  $("#ePortadaArchivo").onchange = async (ev) => {
    const f = ev.target.files[0];
    if(!f) return;
    const url = await subir(f, "portadas");
    if(url){
      $("#ePortadaPrevia").src = url;
      $("#ePortadaPrevia").classList.remove("oculto");
    }
  };

  $("#eFotosArchivos").onchange = async (ev) => {
    for(const f of Array.from(ev.target.files)){
      const url = await subir(f, "fotos");
      if(url) fotosEditor.push({ src: url, pie: "" });
    }
    ev.target.value = "";
    pintarGaleria();
  };

  $("#eAudioArchivo").onchange = async (ev) => {
    const f = ev.target.files[0];
    if(!f) return;
    const url = await subir(f, "audio");
    if(url) $("#eAudio").value = url;
  };

  $("#formEntradaBit").onsubmit = async (ev) => {
    ev.preventDefault();
    await guardarEntrada(e.id);
  };
}

function cerrarEditor(){
  $("#editorCaja").classList.add("oculto");
  $("#editorCaja").innerHTML = "";
  fotosEditor = [];
}

function pintarGaleria(){
  const g = $("#eGaleria");
  if(!g) return;
  g.innerHTML = fotosEditor.map((f, i) =>
    "<figure><img src=\"" + esc(f.src) + "\" alt=\"\">" +
    '<button type="button" data-quitar="' + i + '" title="Quitar">&times;</button></figure>').join("");
  g.onclick = (ev) => {
    const b = ev.target.closest("[data-quitar]");
    if(!b) return;
    fotosEditor.splice(+b.dataset.quitar, 1);
    pintarGaleria();
  };
}

function avisoEditor(texto, mal){
  const a = $("#avisoEditor");
  if(a) a.innerHTML = '<div class="aviso ' + (mal ? "mal" : "ok") + '">' + esc(texto) + "</div>";
}

/* Sube un archivo al almacén y devuelve su dirección pública. */
async function subir(archivo, carpeta){
 if(archivo.size>25*1024*1024){avisoEditor("El archivo debe pesar menos de 25 MB.",true);return "";}
 avisoEditor("Subiendo " + archivo.name + "…");
 try{const r=await api("/uploads",{method:"POST",headers:{"Content-Type":archivo.type || "application/octet-stream"},body:archivo});avisoEditor("Listo: " + archivo.name);return r.url;}
 catch(ex){avisoEditor("No se pudo subir " + archivo.name + ". " + ex.message,true);return "";}
}

async function guardarEntrada(id){
  const btn = $("#eGuardar");
  const fila = {
    fecha:     $("#eFecha").value || hoyISO(),
    categoria: $("#eCategoria").value,
    titulo:    $("#eTitulo").value.trim(),
    resumen:   $("#eResumen").value.trim(),
    portada:   $("#ePortadaPrevia").classList.contains("oculto") ? "" : $("#ePortadaPrevia").src,
    texto:     $("#eTexto").value.trim(),
    fotos:     fotosEditor,
    video:     $("#eVideo").value.trim(),
    audio:     $("#eAudio").value.trim(),
    mapa:      $("#eMapa").value.trim(),
    lugar:     $("#eLugar").value.trim(),
    publicado: $("#ePublicado").checked,
  };
  if(!fila.titulo) return avisoEditor("Ponle un título a la entrada.", true);

  btn.disabled = true; btn.textContent = "Guardando…";
  try {
    if(id){
      await api("/rest/v1/bitacora?id=eq." + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(fila),
      });
    } else {
      await api("/rest/v1/bitacora", {
        method: "POST",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(fila),
      });
    }
    cerrarEditor();
    await cargarEntradas();
  } catch(ex){
    avisoEditor("No se pudo guardar. " + ex.message, true);
    btn.disabled = false;
    btn.textContent = id ? "Guardar los cambios" : "Publicar la entrada";
  }
}

/* ==========================================================
   ARRANQUE
   ========================================================== */
(async()=>{try{const r=await fetch(NUBE.url + "/auth/session", {credentials:"same-origin"});const d=await r.json();if(d.authenticated){sesion=d;abrirPanel();}}catch{}})();

function pintarEstadisticas(){
 const box=document.getElementById("estadisticas");if(!box)return;
 const values=[[mensajes.filter(m=>!m.archivado).length,"En la bandeja"],[mensajes.filter(m=>!m.leido&&!m.archivado).length,"Por leer"],[mensajes.filter(m=>m.archivado).length,"Archivados"]];
 box.innerHTML=values.map(([value,label])=>'<div class="stat"><strong>'+value+'</strong><span>'+label+'</span></div>').join("");
}
