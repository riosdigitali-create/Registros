/* ============================================================
   CONEXIÓN CON LA NUBE — no hace falta tocar este archivo
   ------------------------------------------------------------
   Aquí viven la dirección y la llave pública de la base de datos
   donde se guardan los mensajes del formulario y las entradas
   de la bitácora.

   La llave de abajo es PÚBLICA a propósito: solo permite
   ENVIAR mensajes y LEER las entradas ya publicadas.
   Para leer los mensajes o publicar en la bitácora hace falta
   entrar al panel con la contraseña.
   ============================================================ */
const NUBE = {
  url:   "https://dgxryosqryppnrzqyalj.supabase.co",
  clave: "sb_publishable_SWt_pFGPYmieQwMsJYQvdQ_JnYypV-6",
  /* Correo con el que entra Adriana al panel. La contraseña no
     se guarda en ningún archivo: se escribe al entrar. */
  usuario: "adriana@amarsalvaje.com",
};
