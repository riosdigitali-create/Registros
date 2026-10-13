# Registro de un Amar Salvaje

Sitio editorial y panel privado de Adriana A. Antequera Salas.
Dominio: https://registrodeunamorsalvaje.com
Panel: https://registrodeunamorsalvaje.com/panel

## Infraestructura

- Cloudflare Workers: HTML, CSS, JavaScript, imágenes y API del mismo dominio.
- Cloudflare D1: mensajes, entradas de bitácora, sesiones y límites de solicitudes.
- Cloudflare R2: imágenes, audio, vídeo MP4 y PDF subidos desde el panel.
- Contraseña del panel: hash PBKDF2 guardado como secreto; sesiones con cookie HttpOnly.

El panel permite consultar, filtrar, buscar, archivar y exportar mensajes; crear, editar y publicar entradas con archivos. Los borradores y los mensajes requieren sesión. No se almacena ninguna contraseña en GitHub.

## Desarrollo

```powershell
npm install
node scripts/setup-test.mjs
npm run build
npm run db:local
node scripts/seed.mjs
npx wrangler d1 execute DB --local --file work/seed.sql
npx wrangler dev --local --port 8787
```

`setup-test.mjs` configura una contraseña exclusiva del entorno local. Nunca publica ese archivo ni afecta al acceso de producción.
Con el servidor local ejecutándose, `npm test` verifica las funciones de la API contra D1 y R2 locales. Las pruebas usan siempre `127.0.0.1`.

## Publicación

El archivo `wrangler.jsonc` identifica la cuenta y los recursos existentes. No crees una segunda base o un segundo almacén para volver a publicar.

```powershell
npx wrangler whoami
npm run build
npx wrangler deploy
```

Para cambiar la contraseña de producción, ejecuta `node scripts/password.mjs` en una terminal interactiva. La entrada se oculta y solo se envía el hash a Cloudflare. El script admite al menos 6 caracteres. Después de cambiarla se pueden revocar las sesiones activas desde D1.

## Editar la página desde el panel

La pestaña **Editar página** permite cambiar títulos, textos, servicios, redes, biografía, fotografías y pies de foto. Las flechas cambian el orden de las ocho secciones y el de las fotografías de portada o de cada proyecto. Los cambios se mantienen como borrador en la pestaña hasta pulsar **Guardar y publicar**; **Recargar página guardada** descarta cambios locales.

**Elegir fotografía** abre la biblioteca: incluye los originales, las versiones optimizadas y las fotos ya subidas. **Subir fotografías** admite selección múltiple; **Subir una carpeta** conserva el nombre de la carpeta para buscar después sus imágenes. JPG, PNG, WebP, GIF y AVIF de hasta 25 MB por archivo. Las fotos subidas permanecen en R2 aunque se quiten de una sección. La bitácora conserva su editor independiente.

La configuración pública se guarda en D1 (`sitio`), con control de revisión para evitar sobrescrituras entre pestañas. La biblioteca privada guarda nombres y carpetas en `biblioteca`; las escrituras requieren sesión y el mismo origen. `site-defaults.json` conserva el contenido inicial; no se debe regenerar para publicar cambios hechos desde el panel.

## Contenido e imágenes

La dirección visual utiliza ciruela, rosa profundo y fondos rosados suaves, con fotografía documental, titulares en Bricolage Grotesque y un archivo de composición asimétrica. `direction.css` define el sitio y `panel-direction.css` adapta la misma identidad al panel. La portada permite elegir entre tres fotografías y los llamados a conversar invitan a «Cuéntame tu historia».

Las fuentes se sirven desde el propio dominio. `scripts/display-font.mjs` prepara Bricolage Grotesque; el sitio ya incluye los archivos necesarios, por lo que no hace falta ejecutar los scripts de fuentes para volver a publicar.

`contenido.js` conserva servicios, portafolio, biografía y redes. Las entradas iniciales se importan una vez en D1; después se editan desde el panel. `scripts/seed.mjs` genera SQL con `INSERT OR IGNORE`, de modo que no sobrescribe cambios existentes.

Las fotografías originales se conservan en `img/`. Las variantes de IA se encuentran en `img/premium/`, junto al manifiesto con dimensiones, selección y límites observados. Las versiones WebP sirven para reducir transferencia, sin atribuir al archivo más resolución que la realmente generada.

Se generaron y revisaron 20 variantes con IA. El sitio utiliza 12; conserva 8 fuentes originales donde la variante disminuyó resolución o modificó rostros, obras, logotipos o detalles documentales. Las 20 versiones WebP seleccionadas pesan aproximadamente 6,1 MB en conjunto. Las tipografías y sus licencias también están incluidas y se sirven desde Cloudflare.

Las imágenes se integraron una vez con `scripts/images.mjs`; no es necesario volver a generarlas para publicar. Los nombres WebP incluyen una huella del archivo para evitar versiones antiguas en caché.

## Migración de la conexión anterior

La dirección Supabase incluida en el repositorio original no resolvió durante este trabajo. Se trasladaron las tres entradas y los archivos que sí estaban en GitHub. Los mensajes o borradores que solo existieran en esa base no pudieron verificarse ni recuperarse. Conserva cualquier exportación anterior para importarla en D1 cuando esté disponible.

El correo y WhatsApp de contacto del repositorio eran valores pendientes; no se publican como contactos verificados. El formulario guarda los mensajes en el panel y los Instagram originales permanecen disponibles.
