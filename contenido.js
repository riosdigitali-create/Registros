/* ============================================================
   REGISTRO DE UN AMAR SALVAJE — ARCHIVO DE CONTENIDO
   ------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para actualizar
   la página. No hace falta abrir el index.html nunca.

   Reglas de oro:
   1) Todo lo que va entre comillas "así" es texto que puedes cambiar.
   2) Cada bloque termina en coma. No borres las comas ni las llaves { }.
   3) Guarda el archivo y recarga la página en el navegador.

   Para las imágenes tienes dos formas:
     - Archivo local:  "img/mi-foto.jpg"   (guarda la foto en la carpeta img/)
     - Google Drive:   drive("1AbC...")    (pega solo el ID del archivo)
   ============================================================ */

/* Convierte un ID de Google Drive en una URL de imagen usable.
   El archivo debe estar compartido como "Cualquiera con el enlace". */
function drive(id, ancho = 1600) {
  return "https://drive.google.com/thumbnail?id=" + id + "&sz=w" + ancho;
}

/* Convierte un ID de Drive en un video/PDF incrustable. */
function driveEmbed(id) {
  return "https://drive.google.com/file/d/" + id + "/preview";
}

const CONTENIDO = {

  /* ==========================================================
     1. DATOS DE CONTACTO Y REDES
     Cambia estos valores y se actualizan en TODA la página.
     ========================================================== */
  contacto: {
    correo: "",                              // Se mostrará al confirmar el correo real.
    whatsapp: "",                           // Añade un número confirmado con lada, sin espacios ni +.
    whatsappTexto: "Hola Adriana, vengo de tu página web y me gustaría contarte mi historia.",
    instagram: "https://www.instagram.com/registro_de_un_amar_salvaje/",
    instagramUsuario: "@registro_de_un_amar_salvaje",
    instagramDAS: "https://www.instagram.com/decir_actuar_sentir/",
    instagramDASUsuario: "@decir_actuar_sentir",
    facebook: "",                            // ← vacío = no se muestra el botón
    youtube: "",                             // ← vacío = aparece como "próximamente"
  },

  /* ==========================================================
     2. FORMULARIOS
     Para que los formularios lleguen a tu correo de verdad:
       a) Entra a https://formspree.io y crea una cuenta gratis.
       b) Crea un formulario nuevo y copia el endpoint que te dan.
       c) Pégalo aquí abajo reemplazando el texto.
     Mientras esté vacío, el formulario muestra un aviso de demo.
     ========================================================== */
  formulario: {
    endpoint: "",   // ejemplo: "https://formspree.io/f/abcdwxyz"
  },

  /* ==========================================================
     3. PORTADA (HERO)
     ========================================================== */
  portada: {
    titulo: "<span class=\"hero-word\">Amar</span><span class=\"hero-word hero-word-last\">Salvaje</span>",
    subtitulo: "Lo extraordinario no está en otra parte. Está aquí, en lo que pocos notan.",
    firma: "Por Adriana A. Antequera Salas",
    boton: "Cuéntame tu historia",
    /* Imagen de fondo mientras no haya video. */
    imagen: "img/premium/proyecto-1-03-464a2bbc.webp",
    fotogramas: [
      {imagen: "img/premium/proyecto-1-03-464a2bbc.webp", titulo: "El oficio de mirar"},
      {imagen: "img/premium/proyecto-2-02-693f86aa.webp", titulo: "Las manos que crean"},
      {imagen: "img/premium/portada-783a7f9f.webp", titulo: "Lo cotidiano, de cerca"}
    ],
    /* Video de fondo. Deja "" si aún no lo tienes.
       Debe ser .mp4, horizontal, sin sonido, de 10 a 20 segundos. */
    video: "",
  },

  /* ==========================================================
     4. LOS DOS CAMINOS (SERVICIOS)
     ========================================================== */
  caminos: [
    {
      id: "personales",
      icono: "❤️",
      titulo: "Historias personales",
      imagen: "img/premium/camino-personales-53665bd2.webp",
      descripcion: "Transformamos las fotografías y videos olvidados en tu celular en pequeñas piezas audiovisuales para recordar viajes, cumpleaños, familias, mascotas y momentos importantes.",
      lista: [
        "Videos de viajes", "Cumpleaños", "Regalos audiovisuales", "Bebés",
        "Mascotas", "Aniversarios", "Selección y organización de recuerdos",
        "Edición fotográfica para redes"
      ],
      boton: "Conocer más",
      estilo: "",
      /* Preguntas del formulario que abre este botón. */
      formTitulo: "Cuéntame qué quieres conservar",
      formIntro: "Unas pocas preguntas para entender tu historia antes de conversar.",
      preguntas: [
        { campo: "ocasion",  etiqueta: "¿Qué quieres conservar?", tipo: "select",
          opciones: ["Un viaje", "Un cumpleaños", "Un regalo para alguien", "Un bebé o embarazo", "Una mascota", "Un aniversario", "Ordenar mis recuerdos", "Otra cosa"] },
        { campo: "material", etiqueta: "¿Qué material tienes?", tipo: "select",
          opciones: ["Fotos y videos en el celular", "Fotos impresas o antiguas", "Material de cámara profesional", "Un poco de todo", "Todavía no tengo nada"] },
        { campo: "fecha",    etiqueta: "¿Para cuándo lo necesitas?", tipo: "text",
          placeholder: "Una fecha aproximada, o \"sin prisa\"" },
        { campo: "historia", etiqueta: "Cuéntame la historia", tipo: "textarea",
          placeholder: "En pocas líneas: de quién es, qué momento es, por qué importa…" },
      ],
    },
    {
      id: "artisticos",
      icono: "🎬",
      titulo: "Proyectos artísticos y culturales",
      imagen: "img/premium/camino-artisticos-bc9de1f8.webp",
      descripcion: "Acompañamiento creativo y producción para artistas, cineastas, organizaciones y proyectos culturales.",
      lista: [
        "Producción audiovisual", "Videoclips", "Documentales", "Producción ejecutiva",
        "Dirección de proyectos", "Coordinación de equipos", "Asesoría artística",
        "Gestión de locaciones"
      ],
      boton: "Conversemos",
      estilo: "artistic",
      formTitulo: "Hablemos de tu proyecto",
      formIntro: "Cuéntame en qué punto está y cómo puedo acompañarte.",
      preguntas: [
        { campo: "tipo",   etiqueta: "¿Qué tipo de proyecto es?", tipo: "select",
          opciones: ["Documental", "Videoclip", "Cortometraje o largometraje", "Contenido para una organización", "Festival o ciclo de cine", "Taller o formación", "Otro"] },
        { campo: "etapa",  etiqueta: "¿En qué etapa está?", tipo: "select",
          opciones: ["Solo es una idea", "En desarrollo / escritura", "Buscando financiamiento", "Listo para rodar", "Ya rodado, falta postproducción", "En distribución"] },
        { campo: "rol",    etiqueta: "¿Qué necesitas de mí?", tipo: "select",
          opciones: ["Producción ejecutiva", "Dirección", "Coordinación de equipo", "Asesoría artística", "Gestión de locaciones", "Todavía no lo sé"] },
        { campo: "fechas", etiqueta: "Fechas y presupuesto aproximados", tipo: "text",
          placeholder: "Opcional — ayuda a saber si es viable" },
        { campo: "proyecto", etiqueta: "Cuéntame el proyecto", tipo: "textarea",
          placeholder: "De qué trata, quién está detrás, qué buscas lograr…" },
      ],
    },
  ],

  /* ==========================================================
     5. PORTAFOLIO — un carrete de fotos por proyecto
     Para agregar un proyecto, copia un bloque { ... } completo,
     pégalo debajo y cambia los textos y las fotos.
     ========================================================== */
  portafolio: [
    {
      categoria: "Viaje · Familia",
      titulo: "El camino de vuelta a casa",
      resumen: "Un recorrido por la memoria de un viaje que no quería terminar.",
      proceso: "Del proceso: aprender a mirar lo que ya habíamos vivido.",
      /* Video del proyecto. Acepta YouTube, Vimeo o Drive. Deja "" si no hay. */
      video: "",
      /* El carrete. Agrega tantas fotos como quieras. */
      fotos: [
        { src: "img/premium/proyecto-1-01-b69bc8f1.webp", pie: "La carretera antes del amanecer." },
        { src: "img/premium/proyecto-1-02-9244ef30.webp", pie: "Lo que cabía en la ventanilla." },
        { src: "img/premium/proyecto-1-03-464a2bbc.webp", pie: "El último día, ya sin prisa." },
      ],
    },
    {
      categoria: "Documental · Cultura",
      titulo: "Oficios que no se apagan",
      resumen: "Manos que sostienen una tradición en medio del ruido de la ciudad.",
      proceso: "Del proceso: el tiempo como aliado, no como enemigo.",
      video: "",
      fotos: [
        { src: "img/premium/proyecto-2-01-b0fca147.webp", pie: "El taller, a las seis de la mañana." },
        { src: "img/premium/proyecto-2-02-693f86aa.webp", pie: "Las manos que saben sin mirar." },
      ],
    },
    {
      categoria: "Música · Arte",
      titulo: "Canción para un río",
      resumen: "Un videoclip nacido entre el agua, la niebla y una voz.",
      proceso: "Del proceso: dejar que el paisaje también cantara.",
      video: "",
      fotos: [
        { src: "img/premium/proyecto-3-01-c42cc898.webp", pie: "La niebla llegó puntual." },
        { src: "img/premium/proyecto-3-02-3cff0fbb.webp", pie: "Grabar con el agua como metrónomo." },
      ],
    },
    {
      categoria: "Cumpleaños · Regalo",
      titulo: "Cincuenta vueltas al sol",
      resumen: "Fotos de toda una vida, reunidas en cinco minutos de ternura.",
      proceso: "Del proceso: cada imagen guardaba una voz.",
      video: "",
      fotos: [
        { src: "img/premium/proyecto-4-01-9980aaa9.webp", pie: "Cincuenta años en una caja de zapatos." },
      ],
    },
    {
      categoria: "Fotografía · Detalle",
      titulo: "Lo que cabe en una mañana",
      resumen: "Una serie sobre la luz que atraviesa lo cotidiano.",
      proceso: "Del proceso: mirar despacio hasta que aparece.",
      video: "",
      fotos: [
        { src: "img/premium/proyecto-5-01-e3ca184b.webp", pie: "La luz de las siete." },
        { src: "img/premium/proyecto-5-02-a0cf16a4.webp", pie: "Un vaso, una sombra, nada más." },
      ],
    },
    {
      categoria: "Organización · Producción",
      titulo: "Un festival que camina",
      resumen: "La memoria de un ciclo de cine que llevó historias a otros pueblos.",
      proceso: "Del proceso: producir es también cuidar a la gente.",
      video: "",
      fotos: [
        { src: "img/premium/proyecto-6-01-75cc5d1b.webp", pie: "La pantalla llegó en camioneta." },
        { src: "img/premium/proyecto-6-02-5874b36d.webp", pie: "El público, que siempre aparece." },
      ],
    },
  ],

  /* ==========================================================
     6. BITÁCORA — tus entradas del blog
     ------------------------------------------------------------
     PARA PUBLICAR UNA ENTRADA NUEVA:
     copia el bloque de abajo, pégalo ARRIBA de los demás
     (lo más nuevo va primero) y cambia lo que necesites.

        {
          fecha: "2026-08-18",
          categoria: "Lugares",
          titulo: "Título de la entrada",
          resumen: "Una o dos líneas que se ven en la tarjeta.",
          portada: "img/bitacora-xx.jpg",
          texto: [
            "Primer párrafo.",
            "Segundo párrafo.",
          ],
          fotos:  [],   // fotos extra dentro de la entrada
          video:  "",   // link de YouTube, Vimeo o Drive
          audio:  "",   // link a un .mp3 o a Spotify
          mapa:   "",   // link de Google Maps
          lugar:  "",   // nombre del lugar que se muestra
        },

     Categorías disponibles: Lugares · Miradas · Detrás de las historias
                             Bitácora · Amar Salvaje
     ========================================================== */
  bitacora: [
    {
      fecha: "2026-03-12",
      categoria: "Lugares",
      titulo: "El mercado antes de que amanezca",
      resumen: "Voces, cajas de fruta y una luz que todavía no decide de qué color será el día.",
      portada: "img/premium/bitacora-01-a662491a.webp",
      texto: [
        "Llegué a las cinco y media. El mercado ya llevaba una hora despierto, como si la ciudad tuviera un turno secreto que empieza antes que el resto.",
        "Lo que me interesa de estos lugares no es el color ni el movimiento. Es la manera en que la gente se habla cuando cree que nadie la está mirando.",
      ],
      fotos: [],
      video: "",
      audio: "",
      mapa: "",
      lugar: "Ver en el mapa",
    },
    {
      fecha: "2026-02-28",
      categoria: "Miradas",
      titulo: "Sobre el oficio de observar",
      resumen: "Una reflexión breve sobre la fotografía, el cine y la paciencia que exige la vida cotidiana.",
      portada: "img/premium/bitacora-02-02442cf3.webp",
      texto: [
        "Observar no es mirar más rápido. Es quedarse hasta que la escena deja de actuar para la cámara.",
      ],
      fotos: [],
      video: "",
      audio: "",
      mapa: "",
      lugar: "Reflexión",
    },
    {
      fecha: "2026-02-05",
      categoria: "Detrás de las historias",
      titulo: "Cómo nació el documental",
      resumen: "El origen, los tropiezos y los aprendizajes detrás de un proyecto que tardó dos años.",
      portada: "img/premium/bitacora-03-00dfec18.webp",
      texto: [
        "Dos años suenan a mucho hasta que entiendes que el primero se fue solo en ganarse la confianza de la gente.",
      ],
      fotos: [],
      video: "",
      audio: "",
      mapa: "",
      lugar: "Proceso creativo",
    },
  ],

  /* ==========================================================
     7. LABORATORIO / DAS
     ========================================================== */
  laboratorio: {
    items: [
      { titulo: "Podcast",          texto: "Conversaciones con gente de a pie. Personas extraordinarias con preguntas cotidianas, o personas comunes haciéndose preguntas profundas." },
      { titulo: "Entrevistas",      texto: "Voces de quienes habitan el mundo y el oficio con una mirada distinta." },
      { titulo: "Ciclos de cine",   texto: "Programación seleccionada y proyecciones de cine casero para encontrarnos a mirar juntos." },
      { titulo: "Talleres",         texto: "Espacios de práctica, ensayo y reflexión alrededor del sonido, la fotografía, la imagen en movimiento y la palabra. Sin fórmulas, desde el hacer." },
      { titulo: "Formación",        texto: "Acompañamiento cercano a quienes están empezando a buscar y dar forma a su propia voz." },
      { titulo: "Conversatorios",   texto: "Encuentros abiertos para pensar juntos la época, lo que vemos y lo que nos atraviesa." },
      { titulo: "Asesorías",        texto: "Guía y escucha atenta para proyectos visuales y narrativos en desarrollo." },
      { titulo: "Cine casero",      texto: "Rescatar lo íntimo y volverlo relato." },
    ],
    proyectoLargo: {
      titulo: "Festival y ciclo de cine itinerante por América",
      texto: "Un proyecto a largo plazo para llevar historias de un lugar a otro, tejiendo comunidad alrededor de la imagen.",
      etiqueta: "Proyecto a largo plazo",
    },
    /* Materiales descargables o visibles. Deja "" lo que aún no tengas. */
    materiales: [
      {
        tipo: "pdf",
        titulo: "Programa DAS",
        descripcion: "El documento con las actividades del laboratorio.",
        archivo: "",            // ej: "archivos/programa-das.pdf" o driveEmbed("1AbC...")
        etiqueta: "Descargar PDF",
      },
      {
        tipo: "imagen",
        titulo: "Cartel de la actividad",
        descripcion: "Cartel de Sentidos Emergentes.",
        archivo: "img/premium/cartel-das-bf52a652.webp",
        etiqueta: "Ver cartel",
      },
    ],
  },

  /* ==========================================================
     8. SOBRE MÍ
     ========================================================== */
  sobreMi: {
    foto: "img/premium/adriana-d4bb4098.webp",
    parrafos: [
      "No nací con esta certeza. Fue más bien un despertar de hace unos años, darme cuenta de todo lo que daba por sentado y de cuántas cosas ignoraba por ir demasiado rápido. Hoy, uno de mis aprendizajes más profundos y mi recordatorio diario es simple: lo extraordinario no está en otro lugar, <span class=\"drop\">está aquí, habitando lo cotidiano.</span>",
      "Soy Adriana. La música fue mi primer lenguaje, el sonido me movió antes de nacer y de ahí viene todo lo que escucho y veo. Pero hoy, que soy madre, entiendo que mi oficio principal es la pausa. Me detengo en el detalle, en la luz de una mañana, en los gestos pequeños que casi todos pasan por alto.",
      "Trabajo entre la escritura, la fotografía, el cine y la producción audiovisual. Lo que busco es siempre lo mismo: conservar las historias que merecen permanecer antes de que el tiempo se las lleve.",
      "No me interesa construir un escaparate ni un currículum perfecto. Prefiero un archivo vivo y austero, un cuaderno de viaje que también es galería y taller. Un lugar de encuentro donde tener la decencia y la calma de acompañar a personas y organizaciones a contar lo suyo sin artificios, con el cuidado que las cosas verdaderas exigen.",
    ],
  },
};
