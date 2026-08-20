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
    correo: "hola@amarsalvaje.com",          // ← PENDIENTE: correo real
    whatsapp: "521XXXXXXXXXX",               // ← PENDIENTE: lada + número, sin espacios ni +
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
    titulo: "Registro de un<br>Amar Salvaje",
    subtitulo: "Lo extraordinario en lo simple, el detalle.",
    firma: "por Adriana A. Antequera Salas",
    boton: "Quiero contar mi historia",
    /* Imagen de fondo mientras no haya video. */
    imagen: "img/portada.jpg",
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
      imagen: "img/camino-personales.jpg",
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
      imagen: "img/camino-artisticos.jpg",
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
        { src: "img/proyecto-1-01.jpg", pie: "La carretera antes del amanecer." },
        { src: "img/proyecto-1-02.jpg", pie: "Lo que cabía en la ventanilla." },
        { src: "img/proyecto-1-03.jpg", pie: "El último día, ya sin prisa." },
      ],
    },
    {
      categoria: "Documental · Cultura",
      titulo: "Oficios que no se apagan",
      resumen: "Manos que sostienen una tradición en medio del ruido de la ciudad.",
      proceso: "Del proceso: el tiempo como aliado, no como enemigo.",
      video: "",
      fotos: [
        { src: "img/proyecto-2-01.jpg", pie: "El taller, a las seis de la mañana." },
        { src: "img/proyecto-2-02.jpg", pie: "Las manos que saben sin mirar." },
      ],
    },
    {
      categoria: "Música · Arte",
      titulo: "Canción para un río",
      resumen: "Un videoclip nacido entre el agua, la niebla y una voz.",
      proceso: "Del proceso: dejar que el paisaje también cantara.",
      video: "",
      fotos: [
        { src: "img/proyecto-3-01.jpg", pie: "La niebla llegó puntual." },
        { src: "img/proyecto-3-02.jpg", pie: "Grabar con el agua como metrónomo." },
      ],
    },
    {
      categoria: "Cumpleaños · Regalo",
      titulo: "Cincuenta vueltas al sol",
      resumen: "Fotos de toda una vida, reunidas en cinco minutos de ternura.",
      proceso: "Del proceso: cada imagen guardaba una voz.",
      video: "",
      fotos: [
        { src: "img/proyecto-4-01.jpg", pie: "Cincuenta años en una caja de zapatos." },
      ],
    },
    {
      categoria: "Fotografía · Detalle",
      titulo: "Lo que cabe en una mañana",
      resumen: "Una serie sobre la luz que atraviesa lo cotidiano.",
      proceso: "Del proceso: mirar despacio hasta que aparece.",
      video: "",
      fotos: [
        { src: "img/proyecto-5-01.jpg", pie: "La luz de las siete." },
        { src: "img/proyecto-5-02.jpg", pie: "Un vaso, una sombra, nada más." },
      ],
    },
    {
      categoria: "Organización · Producción",
      titulo: "Un festival que camina",
      resumen: "La memoria de un ciclo de cine que llevó historias a otros pueblos.",
      proceso: "Del proceso: producir es también cuidar a la gente.",
      video: "",
      fotos: [
        { src: "img/proyecto-6-01.jpg", pie: "La pantalla llegó en camioneta." },
        { src: "img/proyecto-6-02.jpg", pie: "El público, que siempre aparece." },
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
      portada: "img/bitacora-01.jpg",
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
      portada: "img/bitacora-02.jpg",
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
      portada: "img/bitacora-03.jpg",
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
      { titulo: "Podcast",              texto: "Conversaciones sobre creación, memoria y territorio." },
      { titulo: "Entrevistas",          texto: "Voces de artistas y personas que miran distinto." },
      { titulo: "Ciclos de cine",       texto: "Programación y cine casero para compartir." },
      { titulo: "Talleres",             texto: "Formación en fotografía, video y narrativa." },
      { titulo: "Formación",            texto: "Acompañamiento a quienes empiezan a contar." },
      { titulo: "Conversatorios",       texto: "Encuentros para pensar juntos la imagen." },
      { titulo: "Asesorías artísticas", texto: "Guía para proyectos en desarrollo." },
      { titulo: "Cine casero",          texto: "Rescatar lo íntimo y volverlo relato." },
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
        archivo: "img/cartel-das.jpg",
        etiqueta: "Ver cartel",
      },
    ],
  },

  /* ==========================================================
     8. SOBRE MÍ
     ========================================================== */
  sobreMi: {
    foto: "img/adriana.jpg",
    parrafos: [
      "<span class=\"drop\">Registro de un Amar Salvaje</span> nació de una certeza sencilla: lo extraordinario no está en otro lugar, está aquí, habitando lo cotidiano, esperando a que alguien lo mire con calma.",
      "Soy Adriana. Observo. Me detengo en el detalle, en la luz de una mañana, en los gestos que casi nadie nota. Trabajo entre la escritura, la fotografía, el cine y la producción audiovisual, y lo que busco siempre es lo mismo: conservar las historias que merecen permanecer.",
      "No hago un currículum de esto. Hago un archivo con aire orgánico, un cuaderno de viaje que también es galería y estudio. Un lugar donde acompañar a personas y organizaciones a contar y compartir lo suyo con cuidado.",
    ],
  },
};
