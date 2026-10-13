CREATE TABLE IF NOT EXISTS sitio (
 id INTEGER PRIMARY KEY CHECK(id=1), contenido TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1, actualizado TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS biblioteca (
 url TEXT PRIMARY KEY, nombre TEXT NOT NULL, carpeta TEXT NOT NULL DEFAULT '', tipo TEXT NOT NULL,
 creado_en TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
