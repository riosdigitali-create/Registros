CREATE TABLE IF NOT EXISTS mensajes (
 id TEXT PRIMARY KEY, creado_en TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 nombre TEXT NOT NULL, correo TEXT NOT NULL, telefono TEXT NOT NULL DEFAULT '',
 mensaje TEXT NOT NULL DEFAULT '', origen TEXT NOT NULL DEFAULT 'general',
 respuestas TEXT NOT NULL DEFAULT '{}', leido INTEGER NOT NULL DEFAULT 0,
 archivado INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS bitacora (
 id TEXT PRIMARY KEY, creado_en TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 fecha TEXT NOT NULL, categoria TEXT NOT NULL DEFAULT 'Bitácora', titulo TEXT NOT NULL,
 resumen TEXT NOT NULL DEFAULT '', portada TEXT NOT NULL DEFAULT '', texto TEXT NOT NULL DEFAULT '',
 fotos TEXT NOT NULL DEFAULT '[]', video TEXT NOT NULL DEFAULT '', audio TEXT NOT NULL DEFAULT '',
 mapa TEXT NOT NULL DEFAULT '', lugar TEXT NOT NULL DEFAULT '', publicado INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS bitacora_publica ON bitacora(publicado,fecha DESC);
CREATE INDEX IF NOT EXISTS mensajes_fecha ON mensajes(creado_en DESC);
CREATE TABLE IF NOT EXISTS sesiones (hash TEXT PRIMARY KEY, vence INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS limites (clave TEXT PRIMARY KEY, ventana INTEGER NOT NULL, cantidad INTEGER NOT NULL DEFAULT 0);
