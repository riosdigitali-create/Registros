
/* ============================================================
   Lógica del sitio. No hace falta editar nada aquí:
   todo el contenido vive en contenido.js
   ============================================================ */
(function(){
"use strict";

const C = window.CONTENIDO || CONTENIDO;
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = (t) => String(t == null ? "" : t)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");

/* ---------- helpers de medios ---------- */
function marcador(texto){ return 'class="imgph" data-falta="' + esc(texto) + '"'; }

/* Crea una <img> que se marca como cargada si el archivo existe. */
function img(src, alt){
  src = safeMedia(src);
  if(!src) return "";
  return '<img loading="lazy" src="' + esc(src) + '" alt="' + esc(alt || "") + '" ' +
         'decoding="async">';
}

/* Si una imagen no existe, se quita y se muestra el aviso del marco. */
function marcarFalta(el){
  const marco = el.closest(".imgph");
  if(marco) marco.classList.add("falta");
  el.remove();
}

/* Normaliza links de video (YouTube, Vimeo, Drive) a formato incrustable. */
function safeMedia(url){
 if(!url) return "";
 try { const parsed = new URL(url, location.origin); return ["https:", "http:"].includes(parsed.protocol) ? url : ""; } catch { return ""; }
}
function embed(url){
 url = safeMedia(url);
  if(!url) return "";
  let m;
  if((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/))) return "https://www.youtube.com/embed/" + m[1];
  if((m = url.match(/vimeo\.com\/(\d+)/)))                                return "https://player.vimeo.com/video/" + m[1];
  if((m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)))            return "https://drive.google.com/file/d/" + m[1] + "/preview";
  return url;
}

function fechaLarga(iso){
  const p = String(iso || "").split("-");
  if(p.length !== 3) return iso || "";
  return p[2] + " · " + p[1] + " · " + p[0];
}

/* ==========================================================
   HERO
   ========================================================== */
(function hero(){
  const p = C.portada || {};
  if(p.titulo)    $("#heroTitulo").innerHTML   = p.titulo;
  if(p.subtitulo) $("#heroSubtitulo").textContent = p.subtitulo;
  if(p.firma)     $("#heroFirma").textContent  = p.firma;
  if(p.boton)     $("#heroBoton").textContent  = p.boton + " →";

  const media = $("#heroMedia");
  const frames = p.fotogramas || [];
  if(frames.length && $("#heroFrames")){
    media.innerHTML=frames.map((f,i)=>'<div class="hero-frame '+(i===0?'active':'')+'" style="background-image:url(\''+esc(safeMedia(f.imagen))+'\')"></div>').join('');
    $("#heroFrames").innerHTML=frames.map((f,i)=>'<button type="button" class="frame-button" data-frame="'+i+'" aria-label="Mostrar fotografía: '+esc(f.titulo)+'" aria-pressed="'+(i===0)+'">0'+(i+1)+'</button>').join('');
    $("#heroFrames").addEventListener('click',event=>{
      const button=event.target.closest('[data-frame]');if(!button)return;
      const index=Number(button.dataset.frame);
      $$('.hero-frame',media).forEach((frame,i)=>frame.classList.toggle('active',i===index));
      $$('.frame-button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
      $("#heroCaption").textContent='0'+(index+1)+' / '+frames[index].titulo;
    });
    return;
  }
  if(p.video){
    media.classList.add("con-video");
    media.insertAdjacentHTML("afterbegin",
      '<video class="hero-video" autoplay muted loop playsinline ' +
      (p.imagen ? 'poster="' + esc(p.imagen) + '"' : '') + '>' +
      '<source src="' + esc(p.video) + '" type="video/mp4"></video>');
  } else if(p.imagen){
    const test = new Image();
    test.onload = () => { media.style.backgroundImage =
      'url("' + p.imagen + '")'; };
    test.src = p.imagen;
  }
})();

/* ==========================================================
   LOS DOS CAMINOS  +  sus formularios dedicados
   ========================================================== */
(function caminos(){
  const cont = $("#caminosGrid");
  if(!cont) return;
  cont.innerHTML = (C.caminos || []).map((c, i) => `
    <div class="path-card ${esc(c.estilo || "")} reveal">
      <div class="path-media ${c.imagen ? "imgph" : ""}" ${c.imagen ? 'data-falta="Falta la foto"' : ''}>${img(c.imagen, c.titulo)}</div>
      <span class="path-index">0${i+1} / ${i===0 ? "La memoria íntima" : "La creación colectiva"}</span>
      <h3>${esc(c.titulo)}</h3>
      <p class="desc">${esc(c.descripcion)}</p>
      <span class="svc-label">Lo que hacemos</span>
      <ul class="svc-list">${(c.lista || []).map(l => "<li>" + esc(l) + "</li>").join("")}</ul>
      <button class="btn ${c.estilo === "artistic" ? "btn-terra" : "btn-ghost"}" data-camino="${i}">${esc(c.boton)}</button>
    </div>`).join("");

  cont.addEventListener("click", (e) => {
    const b = e.target.closest("[data-camino]");
    if(b) abrirFormCamino(C.caminos[+b.dataset.camino]);
  });
})();

function abrirFormCamino(c){
  if(!c) return;
  const campos = (c.preguntas || []).map(p => {
    const id = "f_" + c.id + "_" + p.campo;
    let control;
    if(p.tipo === "select"){
      control = '<select id="' + id + '" name="' + esc(p.campo) + '" required>' +
        '<option value="">Elige una opción</option>' +
        (p.opciones || []).map(o => '<option>' + esc(o) + '</option>').join("") + '</select>';
    } else if(p.tipo === "textarea"){
      control = '<textarea id="' + id + '" name="' + esc(p.campo) + '" placeholder="' + esc(p.placeholder || "") + '" required></textarea>';
    } else {
      control = '<input id="' + id + '" name="' + esc(p.campo) + '" type="text" placeholder="' + esc(p.placeholder || "") + '">';
    }
    return '<div class="form-field"><label for="' + id + '">' + esc(p.etiqueta) + '</label>' + control + '</div>';
  }).join("");

  abrirModal(`
    <h3>${esc(c.formTitulo || c.titulo)}</h3>
    <p class="intro">${esc(c.formIntro || "")}</p>
    <form data-form="${esc(c.id)}">
      <div class="aviso-slot"></div>
      <div class="form-row">
        <div class="form-field"><label for="fn_${esc(c.id)}">Nombre</label><input id="fn_${esc(c.id)}" name="nombre" type="text" placeholder="Tu nombre" required></div>
        <div class="form-field"><label for="fe_${esc(c.id)}">Correo</label><input id="fe_${esc(c.id)}" name="correo" type="email" placeholder="tu@correo.com" required></div>
      </div>
      ${campos}
      <button class="btn ${c.estilo === "artistic" ? "btn-terra" : ""}" type="submit">Enviar →</button>
      <p class="form-nota">Gracias por compartir tu historia. Leeré tu mensaje con atención y me pondré en contacto contigo.</p>
    </form>`, c.estilo === "artistic" ? "artistic" : "");
}

/* ==========================================================
   PORTAFOLIO — tarjetas + visor con carrete
   ========================================================== */
(function portafolio(){
  const cont = $("#portGrid");
  if(!cont) return;
  cont.innerHTML = (C.portafolio || []).map((p, i) => {
    const f0 = (p.fotos || [])[0] || {};
    const n  = (p.fotos || []).length;
    return `
    <article class="port-card reveal" tabindex="0" role="button" data-proyecto="${i}"
             aria-label="Abrir el carrete de ${esc(p.titulo)}">
      <div class="ph imgph" data-falta="Falta la foto">
        ${img(f0.src, p.titulo)}
        ${p.fotos?.[1] ? '<img loading="lazy" decoding="async" class="port-hover" src="'+esc(safeMedia(p.fotos[1].src))+'" alt="" aria-hidden="true">' : ''}
        ${p.video ? '<div class="ph-play">▶ Video</div>' : ""}
        ${n > 1 ? '<div class="ph-count">▣ ' + n + " fotos</div>" : ""}
      </div>
      <div class="port-body">
        <span class="kicker">0${i+1} / ${esc(p.categoria)}</span>
        <h4>${esc(p.titulo)}</h4>
        <p>${esc(p.resumen)}</p>
        <p class="proceso">${esc(p.proceso)}</p>
        <span class="abrir">Ver el carrete →</span>
      </div>
    </article>`;
  }).join("");

  cont.addEventListener("click", (e) => {
    const c = e.target.closest("[data-proyecto]");
    if(c) abrirVisor(+c.dataset.proyecto);
  });
  cont.addEventListener("keydown", (e) => {
    if(e.key !== "Enter" && e.key !== " ") return;
    const c = e.target.closest("[data-proyecto]");
    if(c){ e.preventDefault(); abrirVisor(+c.dataset.proyecto); }
  });
})();

let visorFotos = [], visorIdx = 0;

let focoVisor = null;
function abrirVisor(i){
  focoVisor = document.activeElement;
  const p = (C.portafolio || [])[i];
  if(!p) return;
  visorFotos = p.fotos || [];
  visorIdx = 0;

  const multi = visorFotos.length > 1;
  $("#visorMedia").innerHTML =
    (p.video
      ? '<iframe src="' + esc(embed(p.video)) + '" allow="autoplay; fullscreen" allowfullscreen title="' + esc(p.titulo) + '"></iframe>'
      : visorFotos.map((f, k) =>
          '<img src="' + esc(f.src) + '" alt="' + esc(f.pie || p.titulo) + '" class="' + (k === 0 ? "activa" : "") + '">').join("") +
        (multi ? '<button class="visor-nav prev" aria-label="Anterior">‹</button><button class="visor-nav next" aria-label="Siguiente">›</button>' : "") +
        '<div class="visor-pie"></div>' +
        (multi ? '<div class="visor-puntos">' + visorFotos.map((_, k) => '<i data-k="' + k + '" class="' + (k === 0 ? "on" : "") + '"></i>').join("") + "</div>" : ""));

  $("#visorInfo").innerHTML = `
    <span class="kicker">${esc(p.categoria)}</span>
    <h3>${esc(p.titulo)}</h3>
    <p>${esc(p.resumen)}</p>
    <p class="proceso">${esc(p.proceso)}</p>
    ${multi ? '<div class="visor-tiras">' + visorFotos.map((f, k) =>
        '<button data-k="' + k + '" class="' + (k === 0 ? "on" : "") + '" aria-label="Foto ' + (k+1) + '"><img src="' + esc(f.src) + '" alt=""></button>').join("") + "</div>" : ""}`;

  pintarPie();
  $("#visor").classList.add("abierto");
  $("#visorCerrar").focus();
  document.body.style.overflow = "hidden";
  $("#visorCerrar").focus();
}

function pintarPie(){
  const pie = $(".visor-pie", $("#visorMedia"));
  if(pie) pie.textContent = (visorFotos[visorIdx] || {}).pie || "";
}

function moverVisor(paso){
  if(visorFotos.length < 2) return;
  visorIdx = (visorIdx + paso + visorFotos.length) % visorFotos.length;
  $$("#visorMedia img").forEach((im, k) => im.classList.toggle("activa", k === visorIdx));
  $$("#visor .visor-puntos i").forEach((d, k) => d.classList.toggle("on", k === visorIdx));
  $$("#visor .visor-tiras button").forEach((b, k) => b.classList.toggle("on", k === visorIdx));
  pintarPie();
}

function irVisor(k){
  visorIdx = (k - 1 + visorFotos.length) % visorFotos.length;
  moverVisor(1);
}

function cerrarVisor(){
  $("#visor").classList.remove("abierto");
  if(focoVisor) focoVisor.focus();
  $("#visorMedia").innerHTML = "";
  document.body.style.overflow = "";
}

$("#visor").addEventListener("click", (e) => {
  if(e.target.id === "visor") return cerrarVisor();
  if(e.target.closest(".visor-nav.prev")) return moverVisor(-1);
  if(e.target.closest(".visor-nav.next")) return moverVisor(1);
  const t = e.target.closest("[data-k]");
  if(t) irVisor(+t.dataset.k);
});
$("#visorCerrar").addEventListener("click", cerrarVisor);

/* ==========================================================
   BITÁCORA
   ========================================================== */
const COLORES = {
  "Lugares": "var(--petroleo)",
  "Miradas": "var(--terracota)",
  "Detrás de las historias": "var(--violeta)",
  "Bitácora": "#7d8a7a",
  "Amar Salvaje": "#b8925f",
};
let filtro = "todas";

function pintarBitacora(){
  const cont = $("#entriesGrid");
  if(!cont) return;
  const posts = (C.bitacora || [])
    .slice()
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .filter(p => filtro === "todas" || p.categoria === filtro);

  if(!posts.length){
    cont.innerHTML = '<p class="sin-entradas">Todavía no hay entradas en esta categoría.</p>';
    return;
  }

  cont.innerHTML = posts.map(p => {
    const idx = C.bitacora.indexOf(p);
    const medios = [];
    if(p.video) medios.push("▶ Video");
    if(p.audio) medios.push("♪ Audio");
    if(p.mapa)  medios.push("⌖ Mapa");
    if((p.fotos || []).length) medios.push("▣ " + p.fotos.length + " fotos");
    return `
    <article class="entry reveal in" tabindex="0" role="button" data-post="${idx}"
             aria-label="Leer ${esc(p.titulo)}">
      <div class="ph imgph" data-falta="Falta la foto">${img(p.portada, p.titulo)}</div>
      <div class="entry-body">
        <div class="entry-meta"><span class="tag">${esc(p.categoria)}</span><span>${esc(fechaLarga(p.fecha))}</span></div>
        <h4>${esc(p.titulo)}</h4>
        <p>${esc(p.resumen)}</p>
        ${medios.length ? '<div class="entry-medios">' + medios.map(m => "<span>" + esc(m) + "</span>").join("") + "</div>" : ""}
      </div>
    </article>`;
  }).join("");
}

(function filtros(){
  const cont = $("#catsFiltro");
  if(!cont) return;
  const cats = ["todas"].concat(Object.keys(COLORES));
  cont.innerHTML = cats.map(c => `
    <button type="button" class="cat ${c === "todas" ? "on" : ""}" data-cat="${esc(c)}" aria-pressed="${c === "todas"}">
      <span class="cdot" style="background:${c === "todas" ? "var(--carbon-soft)" : COLORES[c]}"></span>${c === "todas" ? "Todas" : esc(c)}
    </button>`).join("");

  cont.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]");
    if(!c) return;
    filtro = c.dataset.cat;
    $$("#catsFiltro .cat").forEach(x => {x.classList.toggle("on", x === c);x.setAttribute("aria-pressed",String(x===c));});
    pintarBitacora();
  });
})();

pintarBitacora();

/* ----------------------------------------------------------
   Entradas publicadas desde el panel.
   Se suman a las que estén escritas en contenido.js.
   ---------------------------------------------------------- */
(async function bitacoraDeLaNube(){
  if(typeof NUBE === "undefined" || !NUBE.url) return;
  try {
    const r = await fetch(
      NUBE.url + "/bitacora?select=*&publicado=eq.true&order=fecha.desc", {}
    );
    if(!r.ok) return;
    const filas = await r.json();
    if(!Array.isArray(filas)) return;

    const deLaNube = filas.map(f => ({
      fecha:     f.fecha,
      categoria: f.categoria || "Bitácora",
      titulo:    f.titulo,
      resumen:   f.resumen || "",
      portada:   f.portada || "",
      texto:     String(f.texto || "").split(/\n\s*\n/).map(t => t.trim()).filter(Boolean),
      fotos:     Array.isArray(f.fotos) ? f.fotos : [],
      video:     f.video || "",
      audio:     f.audio || "",
      mapa:      f.mapa  || "",
      lugar:     f.lugar || "",
    }));

    C.bitacora = deLaNube;
    pintarBitacora();
  } catch(err){ /* sin conexión: se quedan las entradas de contenido.js */ }
})();

$("#entriesGrid").addEventListener("click", (e) => {
  const c = e.target.closest("[data-post]");
  if(c) abrirPost(+c.dataset.post);
});
$("#entriesGrid").addEventListener("keydown", (e) => {
  if(e.key !== "Enter" && e.key !== " ") return;
  const c = e.target.closest("[data-post]");
  if(c){ e.preventDefault(); abrirPost(+c.dataset.post); }
});

function abrirPost(i){
  const p = (C.bitacora || [])[i];
  if(!p) return;
  abrirModal(`
    ${p.portada ? '<div class="post-portada imgph" data-falta="Falta la foto de portada">' + img(p.portada, p.titulo) + "</div>" : ""}
    <div class="post-cuerpo">
      <div class="entry-meta"><span class="tag">${esc(p.categoria)}</span><span>${esc(fechaLarga(p.fecha))}</span></div>
      <h3>${esc(p.titulo)}</h3>
      ${(p.texto || [p.resumen]).map(t => "<p>" + esc(t) + "</p>").join("")}
      ${p.video ? '<div class="post-media"><iframe src="' + esc(embed(p.video)) + '" allow="fullscreen" allowfullscreen title="Video"></iframe></div>' : ""}
      ${p.audio ? '<div class="post-media"><audio controls src="' + esc(safeMedia(p.audio)) + '"></audio></div>' : ""}
      ${(p.fotos || []).length ? '<div class="post-galeria">' + p.fotos.map(f =>
        '<img loading="lazy" src="' + esc(typeof f === "string" ? f : f.src) + '" alt="">').join("") + "</div>" : ""}
      ${p.mapa ? '<a class="post-mapa" href="' + esc(safeMedia(p.mapa)) + '" target="_blank" rel="noopener">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>' +
        esc(p.lugar || "Ver en el mapa") + "</a>" : ""}
    </div>`, "post-caja");
}

/* ==========================================================
   LABORATORIO / DAS
   ========================================================== */
(function laboratorio(){
  const L = C.laboratorio || {};
  const grid = $("#labGrid");
  if(grid) grid.innerHTML = (L.items || []).map((it, i) => `
    <div class="lab-item reveal">
      <span class="num">${String(i + 1).padStart(2, "0")}</span>
      <h4>${esc(it.titulo)}</h4>
      <p>${esc(it.texto)}</p>
    </div>`).join("");

  const f = L.proyectoLargo;
  const feat = $("#labFeature");
  if(feat && f) feat.innerHTML =
    "<div><h4>" + esc(f.titulo) + "</h4><p>" + esc(f.texto) + "</p></div>" +
    '<span class="pill">' + esc(f.etiqueta) + "</span>";

  const ICONOS = {
    pdf:    '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>',
    imagen: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  };
  const mats = $("#labMats");
  if(mats) mats.innerHTML = (L.materiales || []).map(m => `
    <div class="lab-mat">
      <span class="mi"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONOS[m.tipo] || ICONOS.pdf}</svg></span>
      <div>
        <h5>${esc(m.titulo)}</h5>
        <p>${esc(m.descripcion)}</p>
        ${m.archivo
          ? '<a href="' + esc(m.archivo) + '" target="_blank" rel="noopener">' + esc(m.etiqueta || "Ver") + " →</a>"
          : '<span class="pendiente">Próximamente</span>'}
      </div>
    </div>`).join("");

  const das = $("#dasLink");
  const ig = (C.contacto || {}).instagramDAS;
  if(das && ig) das.innerHTML = `
    <div>
      <h5>Decir · Actuar · Sentir</h5>
      <p>Próximamente: archivo de audio, clases y encuentros abiertos.</p>
    </div>
    <a class="btn" href="${esc(ig)}" target="_blank" rel="noopener">
      Sumarte a la comunidad en Instagram →
    </a>`;
  else if(das) das.remove();
})();

/* ==========================================================
   SOBRE MÍ
   ========================================================== */
(function sobreMi(){
  const S = C.sobreMi || {};
  const foto = $("#aboutFoto");
  if(foto) foto.innerHTML =
    '<div class="ph imgph" style="position:absolute;inset:0;border-radius:18px;overflow:hidden" data-falta="Falta el retrato">' +
    img(S.foto, "Retrato de Adriana A. Antequera Salas") + "</div>";
  const txt = $("#aboutTexto");
  if(txt) txt.innerHTML = (S.parrafos || []).map(p => "<p>" + p + "</p>").join("");
})();

/* ==========================================================
   CONTACTO, REDES Y WHATSAPP
   ========================================================== */
(function contacto(){
  const K = C.contacto || {};
  const wa = K.whatsapp && !/X/i.test(K.whatsapp)
    ? "https://wa.me/" + K.whatsapp + (K.whatsappTexto ? "?text=" + encodeURIComponent(K.whatsappTexto) : "")
    : "";

  const flt = $("#waFloat");
  if(wa) flt.href = wa; else flt.remove();

  const ICO = {
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    wa:   '<path d="M20 12a8 8 0 01-11.6 7.1L4 20l1-4.2A8 8 0 1120 12z"/>',
    ig:   '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    fb:   '<path d="M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8z"/>',
    yt:   '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M11 9l4 3-4 3V9z"/>',
  };
  const linea = (color, ico, titulo, href, texto) =>
    '<div class="contact-line"><span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.6">' + ICO[ico] + '</svg></span>' +
    "<div><h5>" + titulo + '</h5><a href="' + href + '" target="_blank" rel="noopener">' + esc(texto) + "</a></div></div>";

  const aside = $("#contactAside");
  if(aside){
    let h = "";
    if(K.correo)  h += linea("var(--petroleo)", "mail", "Correo", "mailto:" + K.correo, K.correo);
    if(wa)        h += linea("#25D366", "wa", "WhatsApp", wa, "Contacto directo");
    if(K.instagram) h += linea("var(--terracota)", "ig", "Instagram", K.instagram, K.instagramUsuario || "Instagram");
    if(K.instagramDAS) h += linea("var(--violeta)", "ig", "Instagram DAS", K.instagramDAS, K.instagramDASUsuario || "DAS");
    if(K.facebook) h += linea("var(--violeta)", "fb", "Facebook", K.facebook, "Comunidad");

    const btns = [];
    if(K.instagram) btns.push('<a class="soc-btn" href="' + esc(K.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + ICO.ig + "</svg></a>");
    if(wa)          btns.push('<a class="soc-btn" href="' + esc(wa) + '" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + ICO.wa + "</svg></a>");
    if(K.facebook)  btns.push('<a class="soc-btn" href="' + esc(K.facebook) + '" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + ICO.fb + "</svg></a>");

    h += '<div><div class="soc">' + btns.join("") + "</div>";
    if(!K.youtube){
      h += '<div class="soon"><div class="soc" style="margin-top:14px">' +
           '<span class="soc-btn" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + ICO.yt + "</svg></span>" +
           '<span class="soc-btn" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + ICO.mail + "</svg></span>" +
           '</div><p class="soon-note">YouTube y newsletter — próximamente</p></div>';
    }
    h += "</div>";
    aside.innerHTML = h;
  }

  const fs = $("#footerSoc");
  if(fs){
    const f = [];
    if(K.instagram) f.push('<a href="' + esc(K.instagram) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' + ICO.ig + "</svg>Instagram</a>");
    if(K.instagramDAS) f.push('<a href="' + esc(K.instagramDAS) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' + ICO.ig + "</svg>DAS</a>");
    if(wa)          f.push('<a href="' + esc(wa) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' + ICO.wa + "</svg>WhatsApp</a>");
    if(K.facebook)  f.push('<a href="' + esc(K.facebook) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' + ICO.fb + "</svg>Facebook</a>");
    fs.innerHTML = f.join("");
  }
})();

/* ==========================================================
   ENVÍO DE FORMULARIOS
   ========================================================== */
const ENDPOINT = ((C.formulario || {}).endpoint || "").trim();
const NUBE_LISTA = typeof NUBE !== "undefined" && !!NUBE.url;

/* Campos que tienen su propia columna en la base; el resto del
   formulario se guarda tal cual dentro de "respuestas". */
const CAMPOS_PROPIOS = ["nombre", "correo", "telefono", "mensaje"];

const ETIQUETAS_ORIGEN = {
  general:     "Contacto general",
  personales:  "Historias personales",
  artisticos:  "Proyectos artísticos y culturales",
};

async function guardarEnLaNube(datos, origen){
  const fila = { origen: origen, respuestas: {} };
  datos.forEach((valor, clave) => {
    if(clave.charAt(0) === "_") return;
    if(CAMPOS_PROPIOS.indexOf(clave) >= 0) fila[clave] = valor;
    else fila.respuestas[clave] = valor;
  });
  /* El texto largo de los formularios de cada camino se llama
     distinto (historia, proyecto). Se copia también a "mensaje"
     para que el panel siempre tenga algo que mostrar. */
  if(!fila.mensaje){
    fila.mensaje = fila.respuestas.historia || fila.respuestas.proyecto || "";
  }
  fila.website = datos.get("website") || "";
  const r = await fetch(NUBE.url + "/mensajes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(fila),
  });
  if(!r.ok) throw new Error("La base respondió " + r.status);
}

if(!NUBE_LISTA && !ENDPOINT){
  const a = $("#avisoGeneral");
  if(a) a.innerHTML = '<div class="form-aviso warn">Este formulario todavía no está conectado. ' +
    "Revisa <strong>nube.js</strong>.</div>";
}

async function enviar(form){
  const btn = $("button[type=submit]", form);
  const slot = $(".aviso-slot", form) || $("#avisoGeneral");
  const origen = form.dataset.form || "general";
  const datos = new FormData(form);
  datos.append("_origen", ETIQUETAS_ORIGEN[origen] || origen);

  if(!NUBE_LISTA && !ENDPOINT){
    if(slot) slot.innerHTML = '<div class="form-aviso warn">Modo demostración: el mensaje no se envió.</div>';
    return;
  }

  const textoOriginal = btn ? btn.textContent : "";
  if(btn){ btn.disabled = true; btn.textContent = "Enviando…"; }

  try {
    if(NUBE_LISTA) await guardarEnLaNube(datos, origen);
    /* Formspree es opcional: si está configurado, además llega un correo. */
    if(ENDPOINT){
      try {
        await fetch(ENDPOINT, { method: "POST", body: datos, headers: { Accept: "application/json" } });
      } catch(e){ /* si el correo falla, el mensaje ya quedó guardado */ }
    }
    form.reset();
    if(slot) slot.innerHTML = '<div class="form-aviso ok">¡Gracias! Tu mensaje llegó. Te respondo pronto.</div>';
  } catch(err){
    if(slot) slot.innerHTML = '<div class="form-aviso warn">No se pudo enviar. Inténtalo de nuevo en un momento o escríbeme por Instagram.</div>';
  } finally {
    if(btn){ btn.disabled = false; btn.textContent = textoOriginal; }
  }
}

document.addEventListener("submit", (e) => {
  const form = e.target.closest("form[data-form]");
  if(!form) return;
  e.preventDefault();
  enviar(form);
});

/* ==========================================================
   MODAL GENÉRICO
   ========================================================== */
let ultimoFoco = null;

function abrirModal(html, clase){
  ultimoFoco = document.activeElement;
  const caja = $("#modalCaja");
  caja.className = "modal-caja " + (clase || "");
  $("#modalCuerpo").innerHTML = html;
  $("#modal").classList.add("abierto");
  document.body.style.overflow = "hidden";
  const primero = $("input, select, textarea, button", $("#modalCuerpo"));
  (primero || $("#modalCerrar")).focus();
}

function cerrarModal(){
  $("#modal").classList.remove("abierto");
  $("#modalCuerpo").innerHTML = "";
  document.body.style.overflow = "";
  if(ultimoFoco) ultimoFoco.focus();
}

$("#modalCerrar").addEventListener("click", cerrarModal);
$("#modal").addEventListener("click", (e) => { if(e.target.id === "modal") cerrarModal(); });

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape"){ cerrarModal(); cerrarVisor(); }
  if($("#visor").classList.contains("abierto")){
    if(e.key === "ArrowLeft")  moverVisor(-1);
    if(e.key === "ArrowRight") moverVisor(1);
  }
});

/* ==========================================================
   INTERACCIONES DE SIEMPRE
   ========================================================== */
const header = $("#header");
addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 40));

const toggle = $("#toggle"), menu = $("#menu");
toggle.addEventListener("click", () => {
  const abierto = menu.classList.toggle("open");
  toggle.classList.toggle("open", abierto);
  toggle.setAttribute("aria-expanded", String(abierto));
});
$$("a", menu).forEach(a => a.addEventListener("click", () => {
  menu.classList.remove("open");
  toggle.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}));

/* Los marcos sin foto asignada en contenido.js muestran el aviso desde el inicio. */
$$(".imgph").forEach(m => { if(!m.querySelector("img")) m.classList.add("falta"); });

document.body.classList.add("motion-ready");
const io = new IntersectionObserver((entradas) => {
  entradas.forEach(en => { if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => io.observe(el));
new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
 if(node.nodeType !== 1) return;
 if(node.classList.contains("reveal")) io.observe(node);
 node.querySelectorAll(".reveal").forEach(el => io.observe(el));
}))).observe(document.body, {childList:true, subtree:true});
document.addEventListener("error", event => { if(event.target.tagName === "IMG") marcarFalta(event.target); }, true);
document.querySelectorAll("form[data-form]").forEach(form => addHoneypot(form));
function addHoneypot(form){
 if(form.querySelector('[name="website"]')) return;
 const trap = document.createElement("input"); trap.name = "website"; trap.type = "text"; trap.tabIndex = -1; trap.autocomplete = "off"; trap.className = "honeypot"; trap.setAttribute("aria-hidden", "true"); form.append(trap);
}
new MutationObserver(() => document.querySelectorAll("form[data-form]").forEach(addHoneypot)).observe($("#modalCuerpo"), {childList:true});
const progress = $(".reading-progress");
function updateProgress(){const total=document.documentElement.scrollHeight-innerHeight; progress.style.width=(total>0?scrollY/total*100:0)+"%";}
addEventListener("scroll", updateProgress, {passive:true});
// Keyboard focus remains inside an open modal or gallery.
document.addEventListener("keydown", event => {
 if(event.key !== "Tab")return;
 const dialog=document.querySelector(".modal.abierto, .visor.abierto"); if(!dialog)return;
 const targets=Array.from(dialog.querySelectorAll('a[href],button,input,textarea,select,[tabindex="0"]')).filter(el=>!el.disabled && el.getClientRects().length);
 if(!targets.length)return;
 const first=targets[0],last=targets.at(-1);
 if(event.shiftKey && (document.activeElement===first || !dialog.contains(document.activeElement))){event.preventDefault();last.focus();}
 else if(!event.shiftKey && (document.activeElement===last || !dialog.contains(document.activeElement))){event.preventDefault();first.focus();}
});

})();
