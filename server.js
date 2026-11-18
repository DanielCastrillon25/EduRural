'use strict';
// EduRural — servidor del MVP (Node 22+ con SQLite incluido, sin dependencias externas)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const CONTENIDO = require('./content');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const SECRET_FILE = path.join(DATA_DIR, '.secret');
if (!fs.existsSync(SECRET_FILE)) fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString('hex'));
const SECRET = process.env.EDURURAL_SECRET || fs.readFileSync(SECRET_FILE, 'utf8').trim();
const DEMO = process.env.DEMO !== '0';

// ---------------------------------------------------------------- Base de datos
const db = new DatabaseSync(path.join(DATA_DIR, 'edurural.db'));
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
db.exec(`
CREATE TABLE IF NOT EXISTS instituciones (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, municipio TEXT);
CREATE TABLE IF NOT EXISTS sedes (id INTEGER PRIMARY KEY, institucion_id INTEGER NOT NULL REFERENCES instituciones(id), nombre TEXT NOT NULL, vereda TEXT);
CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY, institucion_id INTEGER NOT NULL REFERENCES instituciones(id),
  rol TEXT NOT NULL CHECK (rol IN ('admin','docente','estudiante')), nombre TEXT NOT NULL, correo TEXT UNIQUE,
  hash_contrasena TEXT, activo INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS grupos (id INTEGER PRIMARY KEY, sede_id INTEGER NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
  grado INTEGER NOT NULL, anio INTEGER NOT NULL, codigo_clase TEXT NOT NULL UNIQUE, docente_id INTEGER REFERENCES usuarios(id));
CREATE TABLE IF NOT EXISTS estudiantes (id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  grupo_id INTEGER NOT NULL REFERENCES grupos(id) ON DELETE CASCADE, codigo TEXT NOT NULL, hash_pin TEXT,
  pin_reiniciado INTEGER NOT NULL DEFAULT 0, UNIQUE (grupo_id, codigo));
CREATE TABLE IF NOT EXISTS dispositivos (id TEXT PRIMARY KEY, estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  modelo TEXT, version_app TEXT, ultima_sincronizacion TEXT);
CREATE TABLE IF NOT EXISTS materias (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, grado INTEGER NOT NULL, icono TEXT);
CREATE TABLE IF NOT EXISTS lecciones (id INTEGER PRIMARY KEY, materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  nivel_bloom INTEGER NOT NULL CHECK (nivel_bloom BETWEEN 1 AND 6), orden INTEGER NOT NULL DEFAULT 1, titulo TEXT NOT NULL,
  contenido TEXT NOT NULL, escenas TEXT NOT NULL DEFAULT '[]', ilustracion TEXT, tamano_mb REAL NOT NULL DEFAULT 5,
  version INTEGER NOT NULL DEFAULT 1, actualizado TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS preguntas (id INTEGER PRIMARY KEY, leccion_id INTEGER NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
  enunciado TEXT NOT NULL, opciones TEXT NOT NULL, respuesta_correcta INTEGER NOT NULL, pista TEXT);
CREATE TABLE IF NOT EXISTS respuestas (id_evento TEXT PRIMARY KEY, estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE, opcion INTEGER, correcta INTEGER NOT NULL,
  intento INTEGER NOT NULL DEFAULT 1, fecha_local TEXT NOT NULL, recibido TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS progreso (estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  leccion_id INTEGER NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE, estado TEXT NOT NULL, porcentaje INTEGER NOT NULL DEFAULT 0,
  actualizado TEXT NOT NULL, PRIMARY KEY (estudiante_id, leccion_id));
CREATE TABLE IF NOT EXISTS eventos_recibidos (id_evento TEXT PRIMARY KEY, estudiante_id INTEGER, tipo TEXT, datos TEXT, recibido TEXT);
CREATE TABLE IF NOT EXISTS paquetes (id INTEGER PRIMARY KEY, grupo_id INTEGER NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  semana TEXT NOT NULL, titulo TEXT, lecciones TEXT NOT NULL, tamano_mb REAL NOT NULL, publicado TEXT);
CREATE TABLE IF NOT EXISTS refuerzos (id INTEGER PRIMARY KEY, estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  docente_id INTEGER NOT NULL REFERENCES usuarios(id), leccion_id INTEGER REFERENCES lecciones(id), actividades TEXT NOT NULL,
  mensaje TEXT, creado TEXT NOT NULL, entregado TEXT);
CREATE TABLE IF NOT EXISTS sincronizaciones (id INTEGER PRIMARY KEY, estudiante_id INTEGER NOT NULL, dispositivo_id TEXT, sede_id INTEGER,
  fecha TEXT NOT NULL, eventos INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS auditoria (id INTEGER PRIMARY KEY, usuario_id INTEGER, accion TEXT NOT NULL, estudiante_id INTEGER, detalle TEXT, fecha TEXT NOT NULL);
`);

const q = (sql) => db.prepare(sql);
const nowIso = () => new Date().toISOString();
const OFFSET_CO = 5 * 3600e3; // Colombia UTC-5
function fechaLocal(d) { return new Date(d.getTime() - OFFSET_CO).toISOString().slice(0, 19) + '-05:00'; }
function lunesDe(d) { const t = new Date(d.getTime() - OFFSET_CO); t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7)); return t.toISOString().slice(0, 10); }
function sumarDias(fecha, n) { const t = new Date(fecha + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
function tx(fn) { db.exec('BEGIN'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } }
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const falla = (status, msg) => { throw new HttpError(status, msg); };
const texto = (v, max = 200) => String(v ?? '').trim().slice(0, max);

// ---------------------------------------------------------------- Seguridad
function hashPass(p) { const salt = crypto.randomBytes(16).toString('hex'); return `scrypt$${salt}$${crypto.scryptSync(p, salt, 32).toString('hex')}`; }
function checkPass(p, h) {
  if (!h) return false;
  const [, salt, hex] = h.split('$'); const a = crypto.scryptSync(String(p), salt, 32); const b = Buffer.from(hex, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function sign(payload, ttlSec) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec })).toString('base64url');
  return body + '.' + crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}
function verify(tok) {
  if (!tok || typeof tok !== 'string') return null;
  const [body, sig] = tok.split('.'); if (!body || !sig) return null;
  const esperado = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (sig.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado))) return null;
  try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() / 1000 ? p : null; } catch { return null; }
}
function tokensUsuario(u) {
  return {
    access: sign({ sub: u.id, rol: u.rol, inst: u.institucion_id, typ: 'access' }, 15 * 60),
    refresh: sign({ sub: u.id, rol: u.rol, inst: u.institucion_id, typ: 'refresh' }, 30 * 86400)
  };
}
function auditar(usuarioId, accion, estudianteId = null, detalle = null) {
  q('INSERT INTO auditoria(usuario_id, accion, estudiante_id, detalle, fecha) VALUES (?,?,?,?,?)').run(usuarioId, accion, estudianteId, detalle, nowIso());
}

// ---------------------------------------------------------------- Contenido
function normalizarPregunta(p, k) {
  if (Array.isArray(p)) { // [enunciado, [correcta, ...incorrectas], pista]
    const [enunciado, ops, pista] = p; const incorrectas = ops.slice(1); const pos = k % ops.length;
    const opciones = [...incorrectas]; opciones.splice(pos, 0, ops[0]);
    return { enunciado, opciones, correcta: pos, pista: pista || '' };
  }
  const opciones = (p.opciones || []).map(o => texto(o, 200));
  const correcta = Number(p.correcta);
  if (!p.enunciado || opciones.length < 2 || !(correcta >= 0 && correcta < opciones.length)) falla(400, `Pregunta inválida: ${texto(p.enunciado, 60)}`);
  return { enunciado: texto(p.enunciado, 400), opciones, correcta, pista: texto(p.pista, 300) };
}
function importarContenido(materias) {
  let nL = 0, nP = 0;
  for (const m of materias) {
    if (!m.nombre || !(Number(m.grado) >= 0)) falla(400, 'Cada materia necesita nombre y grado');
    const mat = q('SELECT id FROM materias WHERE nombre=? AND grado=?').get(m.nombre, Number(m.grado));
    const materiaId = mat ? mat.id : Number(q('INSERT INTO materias(nombre, grado, icono) VALUES (?,?,?)').run(texto(m.nombre, 80), Number(m.grado), m.icono || '📘').lastInsertRowid);
    (m.lecciones || []).forEach((l, li) => {
      const nivel = Number(l.nivel);
      if (!(nivel >= 1 && nivel <= 6) || !l.titulo) falla(400, 'Cada lección necesita nivel (1 a 6) y título');
      const contenido = JSON.stringify(Array.isArray(l.contenido) ? l.contenido.map(t => texto(t, 2000)) : [texto(l.contenido, 2000)]);
      const escenas = JSON.stringify((l.escenas || []).map(t => texto(t, 200)));
      const ex = q('SELECT id FROM lecciones WHERE materia_id=? AND nivel_bloom=? AND titulo=?').get(materiaId, nivel, l.titulo);
      let lid;
      if (ex) {
        q('UPDATE lecciones SET contenido=?, escenas=?, ilustracion=?, tamano_mb=?, version=version+1, actualizado=? WHERE id=?')
          .run(contenido, escenas, l.ilustracion || '📘', Number(l.mb) || 5, nowIso(), ex.id);
        lid = ex.id;
      } else {
        lid = Number(q('INSERT INTO lecciones(materia_id, nivel_bloom, orden, titulo, contenido, escenas, ilustracion, tamano_mb, actualizado) VALUES (?,?,?,?,?,?,?,?,?)')
          .run(materiaId, nivel, Number(l.orden) || 1, texto(l.titulo, 120), contenido, escenas, l.ilustracion || '📘', Number(l.mb) || 5, nowIso()).lastInsertRowid);
      }
      nL++;
      const existentes = q('SELECT id FROM preguntas WHERE leccion_id=? ORDER BY id').all(lid);
      (l.preguntas || []).forEach((p, qi) => {
        const n = normalizarPregunta(p, li * 3 + qi + 1);
        if (existentes[qi]) q('UPDATE preguntas SET enunciado=?, opciones=?, respuesta_correcta=?, pista=? WHERE id=?').run(n.enunciado, JSON.stringify(n.opciones), n.correcta, n.pista, existentes[qi].id);
        else q('INSERT INTO preguntas(leccion_id, enunciado, opciones, respuesta_correcta, pista) VALUES (?,?,?,?,?)').run(lid, n.enunciado, JSON.stringify(n.opciones), n.correcta, n.pista);
        nP++;
      });
    });
  }
  return { lecciones: nL, preguntas: nP };
}

// ---------------------------------------------------------------- Progreso y reglas
const RANGO = { pendiente: 0, en_curso: 1, completada: 2 };
function aplicarProgreso(estId, ev, fecha) {
  const lid = Number(ev.leccion_id);
  if (!q('SELECT 1 FROM lecciones WHERE id=?').get(lid)) return;
  const estado = RANGO[ev.estado] !== undefined ? ev.estado : 'en_curso';
  const pct = Math.max(0, Math.min(100, Math.round(Number(ev.porcentaje) || 0)));
  const act = q('SELECT * FROM progreso WHERE estudiante_id=? AND leccion_id=?').get(estId, lid);
  if (!act) q('INSERT INTO progreso(estudiante_id, leccion_id, estado, porcentaje, actualizado) VALUES (?,?,?,?,?)').run(estId, lid, estado, pct, fecha);
  // El progreso nunca retrocede (RF-BE-22)
  else if (RANGO[estado] > RANGO[act.estado] || (RANGO[estado] === RANGO[act.estado] && pct > act.porcentaje))
    q('UPDATE progreso SET estado=?, porcentaje=?, actualizado=? WHERE estudiante_id=? AND leccion_id=?').run(estado, pct, fecha, estId, lid);
}
function nivelesDe(estId, grado) {
  const materias = q('SELECT id FROM materias WHERE grado=?').all(grado);
  const lecs = q('SELECT l.id, l.materia_id, l.nivel_bloom FROM lecciones l JOIN materias m ON m.id=l.materia_id WHERE m.grado=?').all(grado);
  const hechas = new Set(q("SELECT leccion_id FROM progreso WHERE estudiante_id=? AND estado='completada'").all(estId).map(r => r.leccion_id));
  const out = {};
  for (const m of materias) {
    let completos = 0;
    for (let n = 1; n <= 6; n++) {
      const ls = lecs.filter(l => l.materia_id === m.id && l.nivel_bloom === n);
      if (ls.length && ls.every(l => hechas.has(l.id))) completos = n; else break;
    }
    out[m.id] = { completos, actual: Math.min(completos + 1, 6) };
  }
  return out;
}
function estudiantesDeGrupo(gid) {
  return q('SELECT e.*, u.nombre FROM estudiantes e JOIN usuarios u ON u.id=e.usuario_id WHERE e.grupo_id=? ORDER BY e.codigo').all(gid);
}
function statsEstudiante(e, grado) {
  const resp = q('SELECT r.correcta, r.intento, r.fecha_local, p.leccion_id FROM respuestas r JOIN preguntas p ON p.id=r.pregunta_id WHERE r.estudiante_id=?').all(e.id);
  const total = resp.length, ok = resp.filter(r => r.correcta).length;
  const aciertos = total ? Math.round(ok * 100 / total) : null;
  const niveles = nivelesDe(e.id, grado);
  const vals = Object.values(niveles).map(v => v.actual);
  const nivel = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 1;
  const disp = q('SELECT * FROM dispositivos WHERE estudiante_id=? ORDER BY ultima_sincronizacion DESC').get(e.id);
  const ultima = disp?.ultima_sincronizacion || null;
  const activado = !!(e.hash_pin || disp);
  // Reglas de "necesita apoyo" (RF-BE-31)
  const apoyo = [];
  const intentos = {};
  for (const r of resp) { const k = r.leccion_id + '|' + r.intento; (intentos[k] ||= { lid: r.leccion_id, n: 0, ok: 0 }); intentos[k].n++; intentos[k].ok += r.correcta; }
  const fallos = {};
  for (const it of Object.values(intentos)) if (it.ok / it.n < 0.6) fallos[it.lid] = (fallos[it.lid] || 0) + 1;
  const hechas = new Set(q("SELECT leccion_id FROM progreso WHERE estudiante_id=? AND estado='completada'").all(e.id).map(r => r.leccion_id));
  for (const [lid, n] of Object.entries(fallos)) {
    if (n >= 3 && !hechas.has(Number(lid))) apoyo.push(`${n} intentos fallidos en "${q('SELECT titulo FROM lecciones WHERE id=?').get(Number(lid))?.titulo}"`);
  }
  if (activado) {
    const dias = ultima ? (Date.now() - Date.parse(ultima)) / 864e5 : Infinity;
    if (dias >= 5) apoyo.push(ultima ? `${Math.floor(dias)} días sin sincronizar` : 'Nunca ha sincronizado');
  }
  if (aciertos !== null && aciertos < 60) apoyo.push(`Aciertos de ${aciertos} %`);
  return {
    id: e.id, codigo: e.codigo, activado, nivel, niveles, aciertos, respuestas: total, ultima_sync: ultima,
    dispositivo: disp ? { modelo: disp.modelo, version_app: disp.version_app } : null, apoyo, necesita_apoyo: apoyo.length > 0
  };
}
function respuestasEntre(gid, desde, hasta) {
  return q(`SELECT r.estudiante_id, r.correcta, r.intento, substr(r.fecha_local,1,10) dia, p.leccion_id
    FROM respuestas r JOIN preguntas p ON p.id=r.pregunta_id JOIN estudiantes e ON e.id=r.estudiante_id
    WHERE e.grupo_id=? AND substr(r.fecha_local,1,10) BETWEEN ? AND ?`).all(gid, desde, hasta);
}

// ---------------------------------------------------------------- Permisos
function grupoPermitido(user, grupoId) {
  const g = q('SELECT g.*, s.institucion_id, s.nombre sede FROM grupos g JOIN sedes s ON s.id=g.sede_id WHERE g.id=?').get(Number(grupoId));
  if (!g) falla(404, 'Grupo no encontrado');
  if (g.institucion_id !== user.inst) falla(403, 'Sin permiso sobre este grupo');
  if (user.rol === 'docente' && g.docente_id !== user.sub) falla(403, 'Este grupo no es tuyo');
  return g;
}
function estudiantePermitido(user, estId) {
  const e = q('SELECT e.*, u.nombre FROM estudiantes e JOIN usuarios u ON u.id=e.usuario_id WHERE e.id=?').get(Number(estId));
  if (!e) falla(404, 'Estudiante no encontrado');
  return { e, g: grupoPermitido(user, e.grupo_id) };
}
function sedePermitida(user, sedeId) {
  const s = q('SELECT * FROM sedes WHERE id=?').get(Number(sedeId));
  if (!s || s.institucion_id !== user.inst) falla(404, 'Sede no encontrada');
  return s;
}

// ---------------------------------------------------------------- Rutas
const routes = [];
function route(method, pattern, roles, handler) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ method, re, keys, roles, handler });
}

route('GET', '/ping', null, () => ({ ok: true, hora: nowIso() }));

// --- Autenticación
route('POST', '/auth/activar', null, ({ body }) => {
  const g = q('SELECT g.*, s.nombre sede FROM grupos g JOIN sedes s ON s.id=g.sede_id WHERE upper(g.codigo_clase)=?').get(texto(body.codigo_clase, 40).toUpperCase());
  if (!g) falla(404, 'Ese código de clase no existe. Pídeselo a tu profe.');
  if (Number(body.grado) !== g.grado) falla(400, 'El grado no coincide con el código de clase.');
  const e = q('SELECT e.*, u.nombre FROM estudiantes e JOIN usuarios u ON u.id=e.usuario_id WHERE e.grupo_id=? AND upper(e.codigo)=?').get(g.id, texto(body.codigo_estudiante, 20).toUpperCase());
  if (!e) falla(404, 'No encontramos tu código de estudiante en esa clase.');
  if (!/^[a-f0-9]{64}$/.test(body.hash_pin || '')) falla(400, 'PIN inválido');
  const dispId = 'd-' + crypto.randomBytes(6).toString('hex');
  tx(() => {
    q('INSERT INTO dispositivos(id, estudiante_id, modelo, version_app, ultima_sincronizacion) VALUES (?,?,?,?,?)').run(dispId, e.id, texto(body.modelo, 80) || 'Desconocido', texto(body.version_app, 20), null);
    q('UPDATE estudiantes SET hash_pin=?, pin_reiniciado=0 WHERE id=?').run(body.hash_pin, e.id);
  });
  return {
    token: sign({ sub: e.usuario_id, rol: 'estudiante', est: e.id, disp: dispId, typ: 'device' }, 90 * 86400),
    dispositivo_id: dispId,
    perfil: { estudiante_id: e.id, codigo: e.codigo, nombre: e.nombre, grado: g.grado, sede: g.sede }
  };
});
route('POST', '/auth/login', null, ({ body }) => {
  const u = q("SELECT * FROM usuarios WHERE correo=? AND rol IN ('docente','admin')").get(texto(body.correo, 120).toLowerCase());
  if (!u || !checkPass(body.contrasena || '', u.hash_contrasena)) falla(401, 'Correo o contraseña incorrectos');
  if (!u.activo) falla(403, 'Tu cuenta está desactivada');
  const grupos = u.rol === 'docente'
    ? q('SELECT g.id, g.grado, g.codigo_clase, s.nombre sede FROM grupos g JOIN sedes s ON s.id=g.sede_id WHERE g.docente_id=? ORDER BY g.grado').all(u.id) : [];
  return { ...tokensUsuario(u), usuario: { id: u.id, nombre: u.nombre, rol: u.rol, correo: u.correo }, grupos };
});
route('POST', '/auth/refresh', null, ({ body }) => {
  const p = verify(body.refresh);
  if (!p || p.typ !== 'refresh') falla(401, 'Sesión vencida');
  const u = q('SELECT * FROM usuarios WHERE id=? AND activo=1').get(p.sub);
  if (!u) falla(401, 'Sesión vencida');
  return { access: tokensUsuario(u).access };
});
route('POST', '/auth/recuperar', null, ({ body }) => {
  const u = q("SELECT id, correo FROM usuarios WHERE correo=? AND rol IN ('docente','admin') AND activo=1").get(texto(body.correo, 120).toLowerCase());
  let enlace = null;
  if (u) {
    enlace = `/#/restablecer?token=${sign({ sub: u.id, typ: 'reset' }, 3600)}`;
    console.log(`\n[correo simulado] Para: ${u.correo}\nCambia tu contraseña aquí: http://localhost:${PORT}${enlace}\n`);
  }
  return { mensaje: 'Si el correo está registrado, enviamos un enlace para cambiar la contraseña.', ...(DEMO && enlace ? { enlace_demo: enlace } : {}) };
});
route('POST', '/auth/cambiar', null, ({ body }) => {
  const p = verify(body.token);
  if (!p || p.typ !== 'reset') falla(400, 'El enlace venció o no es válido');
  if (String(body.nueva || '').length < 6) falla(400, 'La contraseña debe tener al menos 6 caracteres');
  q('UPDATE usuarios SET hash_contrasena=? WHERE id=?').run(hashPass(body.nueva), p.sub);
  auditar(p.sub, 'cambio_contrasena');
  return { ok: true };
});
route('POST', '/auth/pin-estado', ['estudiante'], ({ user }) => {
  const e = q('SELECT pin_reiniciado FROM estudiantes WHERE id=?').get(user.est);
  return { pin_reiniciado: !!e?.pin_reiniciado };
});
route('POST', '/auth/nuevo-pin', ['estudiante'], ({ user, body }) => {
  const e = q('SELECT pin_reiniciado FROM estudiantes WHERE id=?').get(user.est);
  if (!e?.pin_reiniciado) falla(403, 'Tu profe todavía no ha reiniciado tu PIN');
  if (!/^[a-f0-9]{64}$/.test(body.hash_pin || '')) falla(400, 'PIN inválido');
  q('UPDATE estudiantes SET hash_pin=?, pin_reiniciado=0 WHERE id=?').run(body.hash_pin, user.est);
  return { ok: true };
});

// --- Sincronización del estudiante
route('POST', '/sync/push', ['estudiante'], ({ user, body }) => {
  const est = q('SELECT e.*, g.sede_id, g.grado FROM estudiantes e JOIN grupos g ON g.id=e.grupo_id WHERE e.id=?').get(user.est);
  const eventos = Array.isArray(body.eventos) ? body.eventos.slice(0, 1000) : [];
  const aceptados = []; let nuevos = 0, duplicados = 0;
  tx(() => {
    for (const ev of eventos) {
      if (!ev || typeof ev.id_evento !== 'string' || ev.id_evento.length > 64) continue;
      const fecha = typeof ev.fecha_local === 'string' ? ev.fecha_local.slice(0, 30) : fechaLocal(new Date());
      if (ev.tipo === 'respuesta') {
        const p = q('SELECT id, respuesta_correcta FROM preguntas WHERE id=?').get(Number(ev.pregunta_id));
        if (p) {
          const correcta = Number(ev.opcion) === p.respuesta_correcta ? 1 : 0; // el servidor recalcula
          const r = q('INSERT OR IGNORE INTO respuestas(id_evento, estudiante_id, pregunta_id, opcion, correcta, intento, fecha_local, recibido) VALUES (?,?,?,?,?,?,?,?)')
            .run(ev.id_evento, est.id, p.id, Number(ev.opcion), correcta, Number(ev.intento) || 1, fecha, nowIso());
          r.changes ? nuevos++ : duplicados++;
        }
      } else {
        const r = q('INSERT OR IGNORE INTO eventos_recibidos(id_evento, estudiante_id, tipo, datos, recibido) VALUES (?,?,?,?,?)')
          .run(ev.id_evento, est.id, texto(ev.tipo, 30), JSON.stringify(ev).slice(0, 2000), nowIso());
        if (r.changes) {
          nuevos++;
          if (ev.tipo === 'progreso') aplicarProgreso(est.id, ev, fecha);
          if (ev.tipo === 'refuerzo_recibido') q('UPDATE refuerzos SET entregado=COALESCE(entregado, ?) WHERE id=? AND estudiante_id=?').run(nowIso(), Number(ev.refuerzo_id), est.id);
        } else duplicados++;
      }
      aceptados.push(ev.id_evento);
    }
    const ahora = nowIso();
    q('UPDATE dispositivos SET ultima_sincronizacion=?, version_app=COALESCE(?, version_app) WHERE id=? AND estudiante_id=?').run(ahora, body.version_app || null, user.disp, est.id);
    q('INSERT INTO sincronizaciones(estudiante_id, dispositivo_id, sede_id, fecha, eventos) VALUES (?,?,?,?,?)').run(est.id, user.disp, est.sede_id, ahora, nuevos);
  });
  return { aceptados, nuevos, duplicados, niveles: nivelesDe(est.id, est.grado) };
});
route('GET', '/sync/pull', ['estudiante'], ({ user, query }) => {
  const est = q('SELECT e.*, g.grado FROM estudiantes e JOIN grupos g ON g.id=e.grupo_id WHERE e.id=?').get(user.est);
  const desde = query.desde || '1970-01-01';
  const materias = q('SELECT id, nombre, grado, icono FROM materias WHERE grado=? ORDER BY id').all(est.grado);
  const lecciones = q('SELECT l.* FROM lecciones l JOIN materias m ON m.id=l.materia_id WHERE m.grado=? AND l.actualizado > ?').all(est.grado, desde)
    .map(l => ({ ...l, contenido: JSON.parse(l.contenido), escenas: JSON.parse(l.escenas) }));
  const ids = lecciones.map(l => l.id);
  const preguntas = ids.length
    ? q(`SELECT id, leccion_id, enunciado, opciones, respuesta_correcta, pista FROM preguntas WHERE leccion_id IN (${ids.map(() => '?').join(',')}) ORDER BY id`).all(...ids)
      .map(p => ({ ...p, opciones: JSON.parse(p.opciones) })) : [];
  const paquetes = q('SELECT id, semana, titulo, lecciones, tamano_mb, publicado FROM paquetes WHERE grupo_id=? AND publicado IS NOT NULL ORDER BY publicado').all(est.grupo_id)
    .map(p => ({ ...p, lecciones: JSON.parse(p.lecciones) }));
  const refuerzos = q('SELECT r.id, r.leccion_id, r.actividades, r.mensaje, r.creado, u.nombre docente FROM refuerzos r JOIN usuarios u ON u.id=r.docente_id WHERE r.estudiante_id=? AND r.entregado IS NULL ORDER BY r.creado')
    .all(est.id).map(r => ({ ...r, actividades: JSON.parse(r.actividades) }));
  const progreso = q('SELECT leccion_id, estado, porcentaje, actualizado FROM progreso WHERE estudiante_id=?').all(est.id);
  return { servidor_hora: nowIso(), materias, lecciones, preguntas, paquetes, refuerzos, progreso, pin_reiniciado: !!est.pin_reiniciado, niveles: nivelesDe(est.id, est.grado) };
});

// --- Docente
route('GET', '/grupos', ['docente'], ({ user }) =>
  q('SELECT g.id, g.grado, g.codigo_clase, s.nombre sede FROM grupos g JOIN sedes s ON s.id=g.sede_id WHERE g.docente_id=? ORDER BY g.grado').all(user.sub));
route('GET', '/grupos/:id/resumen', ['docente', 'admin'], ({ user, params }) => {
  const g = grupoPermitido(user, params.id);
  const ests = estudiantesDeGrupo(g.id).map(e => statsEstudiante(e, g.grado));
  const lunes = lunesDe(new Date());
  const semana = respuestasEntre(g.id, lunes, sumarDias(lunes, 6));
  const activos = new Set(semana.map(r => r.estudiante_id));
  for (const s of ests) if (s.ultima_sync && lunesDe(new Date(s.ultima_sync)) === lunes) activos.add(s.id);
  const ok = semana.filter(r => r.correcta).length;
  const activados = ests.filter(s => s.activado);
  return {
    grupo: { id: g.id, grado: g.grado, codigo_clase: g.codigo_clase, sede: g.sede },
    semana: lunes, total: ests.length, sin_activar: ests.length - activados.length, activos: activos.size,
    cuestionarios: new Set(semana.map(r => `${r.estudiante_id}|${r.leccion_id}|${r.intento}`)).size,
    aciertos_semana: semana.length ? Math.round(ok * 100 / semana.length) : null,
    distribucion: [1, 2, 3, 4, 5, 6].map(n => activados.filter(s => s.nivel === n).length),
    apoyo: ests.filter(s => s.necesita_apoyo).map(s => ({ id: s.id, codigo: s.codigo, apoyo: s.apoyo }))
  };
});
route('GET', '/grupos/:id/estudiantes', ['docente', 'admin'], ({ user, params, query }) => {
  const g = grupoPermitido(user, params.id);
  let lista = estudiantesDeGrupo(g.id).map(e => statsEstudiante(e, g.grado));
  if (query.nivel) lista = lista.filter(s => s.nivel === Number(query.nivel));
  if (query.q) lista = lista.filter(s => s.codigo.toLowerCase().includes(String(query.q).toLowerCase()));
  if (query.apoyo === '1') lista = lista.filter(s => s.necesita_apoyo);
  return lista;
});
route('GET', '/estudiantes/:id', ['docente', 'admin'], ({ user, params }) => {
  const { e, g } = estudiantePermitido(user, params.id);
  auditar(user.sub, 'ver_estudiante', e.id);
  const s = statsEstudiante(e, g.grado);
  const materias = q('SELECT id, nombre, icono FROM materias WHERE grado=? ORDER BY id').all(g.grado).map(m => ({ ...m, ...(s.niveles[m.id] || { completos: 0, actual: 1 }) }));
  const cuestionarios = q(`SELECT p.leccion_id, r.intento, l.titulo, m.nombre materia, l.nivel_bloom, COUNT(*) total, SUM(r.correcta) ok, MAX(r.fecha_local) fecha
    FROM respuestas r JOIN preguntas p ON p.id=r.pregunta_id JOIN lecciones l ON l.id=p.leccion_id JOIN materias m ON m.id=l.materia_id
    WHERE r.estudiante_id=? GROUP BY p.leccion_id, r.intento ORDER BY fecha DESC LIMIT 8`).all(e.id);
  const sincronizaciones = q('SELECT fecha, eventos FROM sincronizaciones WHERE estudiante_id=? ORDER BY fecha DESC LIMIT 5').all(e.id);
  const refuerzos = q('SELECT r.id, r.actividades, r.mensaje, r.creado, r.entregado, l.titulo FROM refuerzos r LEFT JOIN lecciones l ON l.id=r.leccion_id WHERE r.estudiante_id=? ORDER BY r.creado DESC LIMIT 5')
    .all(e.id).map(r => ({ ...r, actividades: JSON.parse(r.actividades) }));
  return { ...s, pin_reiniciado: !!e.pin_reiniciado, materias, cuestionarios, sincronizaciones, refuerzos };
});
route('POST', '/estudiantes/:id/refuerzos', ['docente'], ({ user, params, body }) => {
  const { e, g } = estudiantePermitido(user, params.id);
  const validas = ['video', 'ejercicios', 'ficha'];
  const actividades = (Array.isArray(body.actividades) ? body.actividades : []).filter(a => validas.includes(a));
  if (!actividades.length) falla(400, 'Elige al menos una actividad');
  const l = q('SELECT l.id FROM lecciones l JOIN materias m ON m.id=l.materia_id WHERE l.id=? AND m.grado=?').get(Number(body.leccion_id), g.grado);
  if (!l) falla(400, 'Elige una lección del grado');
  const id = Number(q('INSERT INTO refuerzos(estudiante_id, docente_id, leccion_id, actividades, mensaje, creado) VALUES (?,?,?,?,?,?)')
    .run(e.id, user.sub, l.id, JSON.stringify(actividades), texto(body.mensaje, 300), nowIso()).lastInsertRowid);
  auditar(user.sub, 'asignar_refuerzo', e.id, actividades.join(','));
  return { id, mensaje: 'Refuerzo guardado. Le llegará en su próxima sincronización.' };
});
route('POST', '/estudiantes/:id/reiniciar-pin', ['docente'], ({ user, params }) => {
  const { e } = estudiantePermitido(user, params.id);
  q('UPDATE estudiantes SET pin_reiniciado=1 WHERE id=?').run(e.id);
  auditar(user.sub, 'reiniciar_pin', e.id);
  return { mensaje: `PIN de ${e.codigo} reiniciado. En su teléfono debe tocar "¿Olvidaste tu PIN?" con conexión.` };
});
function materiasConLecciones(grado) {
  const materias = q('SELECT id, nombre, icono FROM materias WHERE grado=? ORDER BY id').all(grado);
  const lecs = q('SELECT l.id, l.materia_id, l.nivel_bloom, l.titulo, l.tamano_mb, l.version FROM lecciones l JOIN materias m ON m.id=l.materia_id WHERE m.grado=? ORDER BY l.nivel_bloom, l.orden').all(grado);
  return materias.map(m => ({ ...m, lecciones: lecs.filter(l => l.materia_id === m.id) }));
}
route('GET', '/contenido/materias', ['docente', 'admin'], ({ query }) => materiasConLecciones(Number(query.grado)));
route('GET', '/contenido/materias/:id', ['docente', 'admin'], ({ params }) => {
  const m = q('SELECT * FROM materias WHERE id=?').get(Number(params.id));
  if (!m) falla(404, 'Materia no encontrada');
  return materiasConLecciones(m.grado).find(x => x.id === m.id);
});
route('GET', '/grupos/:id/paquetes', ['docente', 'admin'], ({ user, params }) => {
  const g = grupoPermitido(user, params.id);
  return q('SELECT * FROM paquetes WHERE grupo_id=? ORDER BY publicado DESC').all(g.id).map(p => ({ ...p, lecciones: JSON.parse(p.lecciones) }));
});
route('POST', '/grupos/:id/paquetes', ['docente'], ({ user, params, body }) => {
  const g = grupoPermitido(user, params.id);
  const ids = [...new Set((Array.isArray(body.lecciones) ? body.lecciones : []).map(Number))];
  if (!ids.length) falla(400, 'Elige al menos una lección');
  const lecs = q(`SELECT l.id, l.tamano_mb FROM lecciones l JOIN materias m ON m.id=l.materia_id WHERE m.grado=? AND l.id IN (${ids.map(() => '?').join(',')})`).all(g.grado, ...ids);
  if (lecs.length !== ids.length) falla(400, 'Hay lecciones que no son de este grado');
  const mb = Math.round(lecs.reduce((a, l) => a + l.tamano_mb, 0) * 10) / 10;
  const semana = /^\d{4}-\d{2}-\d{2}$/.test(body.semana || '') ? body.semana : lunesDe(new Date());
  const id = Number(q('INSERT INTO paquetes(grupo_id, semana, titulo, lecciones, tamano_mb, publicado) VALUES (?,?,?,?,?,?)')
    .run(g.id, semana, texto(body.titulo, 100) || `Paquete semana del ${semana}`, JSON.stringify(ids), mb, nowIso()).lastInsertRowid);
  auditar(user.sub, 'publicar_paquete', null, `grupo ${g.id}, ${ids.length} lecciones`);
  return { id, tamano_mb: mb, mensaje: 'Paquete publicado. Los estudiantes lo descargan al sincronizar.' };
});
route('GET', '/grupos/:id/reportes/semanal', ['docente', 'admin'], ({ user, params, query }) => {
  const g = grupoPermitido(user, params.id);
  const semana = /^\d{4}-\d{2}-\d{2}$/.test(query.semana || '') ? query.semana : lunesDe(new Date());
  const fin = sumarDias(semana, 6);
  const resp = respuestasEntre(g.id, semana, fin);
  const ests = estudiantesDeGrupo(g.id);
  const dias = [0, 1, 2, 3, 4, 5, 6].map(i => {
    const fecha = sumarDias(semana, i); const rs = resp.filter(r => r.dia === fecha);
    return { fecha, respuestas: rs.length, estudiantes: new Set(rs.map(r => r.estudiante_id)).size };
  });
  const ok = resp.filter(r => r.correcta).length;
  const temas = q(`SELECT l.id, l.titulo, m.nombre materia, l.nivel_bloom, COUNT(*) total, SUM(1 - r.correcta) errores
    FROM respuestas r JOIN preguntas p ON p.id=r.pregunta_id JOIN lecciones l ON l.id=p.leccion_id JOIN materias m ON m.id=l.materia_id
    JOIN estudiantes e ON e.id=r.estudiante_id WHERE e.grupo_id=? AND substr(r.fecha_local,1,10) BETWEEN ? AND ?
    GROUP BY l.id HAVING errores > 0 ORDER BY errores DESC LIMIT 5`).all(g.id, semana, fin);
  const stats = ests.map(e => statsEstudiante(e, g.grado));
  auditar(user.sub, 'ver_reporte', null, `grupo ${g.id} semana ${semana}`);
  return {
    grupo: { grado: g.grado, codigo_clase: g.codigo_clase, sede: g.sede }, semana, fin, dias,
    respuestas: resp.length, aciertos: resp.length ? Math.round(ok * 100 / resp.length) : null,
    activos: new Set(resp.map(r => r.estudiante_id)).size, total: ests.length,
    cuestionarios: new Set(resp.map(r => `${r.estudiante_id}|${r.leccion_id}|${r.intento}`)).size,
    temas, apoyo: stats.filter(s => s.necesita_apoyo).map(s => ({ codigo: s.codigo, apoyo: s.apoyo }))
  };
});

// --- Administrador institucional
route('GET', '/admin/sedes', ['admin'], ({ user }) =>
  q('SELECT s.*, (SELECT COUNT(*) FROM grupos g WHERE g.sede_id=s.id) grupos FROM sedes s WHERE institucion_id=? ORDER BY nombre').all(user.inst));
route('POST', '/admin/sedes', ['admin'], ({ user, body }) => {
  if (!texto(body.nombre)) falla(400, 'Escribe el nombre de la sede');
  const id = Number(q('INSERT INTO sedes(institucion_id, nombre, vereda) VALUES (?,?,?)').run(user.inst, texto(body.nombre, 100), texto(body.vereda, 100)).lastInsertRowid);
  auditar(user.sub, 'crear_sede', null, body.nombre);
  return { id };
});
route('DELETE', '/admin/sedes/:id', ['admin'], ({ user, params }) => {
  const s = sedePermitida(user, params.id);
  q('DELETE FROM sedes WHERE id=?').run(s.id); auditar(user.sub, 'borrar_sede', null, s.nombre);
});
route('GET', '/admin/grupos', ['admin'], ({ user }) =>
  q(`SELECT g.*, s.nombre sede, u.nombre docente, (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo_id=g.id) estudiantes
     FROM grupos g JOIN sedes s ON s.id=g.sede_id LEFT JOIN usuarios u ON u.id=g.docente_id WHERE s.institucion_id=? ORDER BY s.nombre, g.grado`).all(user.inst));
route('POST', '/admin/grupos', ['admin'], ({ user, body }) => {
  const s = sedePermitida(user, body.sede_id);
  const codigo = texto(body.codigo_clase, 30).toUpperCase().replace(/\s+/g, '');
  if (!codigo || !(Number(body.grado) >= 0 && Number(body.grado) <= 11)) falla(400, 'Faltan el grado o el código de clase');
  if (q('SELECT 1 FROM grupos WHERE codigo_clase=?').get(codigo)) falla(400, 'Ese código de clase ya existe');
  let docente = null;
  if (body.docente_id) {
    docente = q("SELECT id FROM usuarios WHERE id=? AND rol='docente' AND institucion_id=?").get(Number(body.docente_id), user.inst);
    if (!docente) falla(400, 'Docente no válido');
  }
  const id = Number(q('INSERT INTO grupos(sede_id, grado, anio, codigo_clase, docente_id) VALUES (?,?,?,?,?)').run(s.id, Number(body.grado), new Date().getFullYear(), codigo, docente?.id ?? null).lastInsertRowid);
  auditar(user.sub, 'crear_grupo', null, codigo);
  return { id };
});
route('DELETE', '/admin/grupos/:id', ['admin'], ({ user, params }) => {
  const g = grupoPermitido(user, params.id);
  q('DELETE FROM grupos WHERE id=?').run(g.id); auditar(user.sub, 'borrar_grupo', null, g.codigo_clase);
});
route('GET', '/admin/usuarios', ['admin'], ({ user }) =>
  q("SELECT id, rol, nombre, correo, activo FROM usuarios WHERE institucion_id=? AND rol IN ('docente','admin') ORDER BY rol, nombre").all(user.inst));
route('POST', '/admin/usuarios', ['admin'], ({ user, body }) => {
  const correo = texto(body.correo, 120).toLowerCase();
  if (!texto(body.nombre) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) falla(400, 'Escribe nombre y un correo válido');
  if (String(body.contrasena || '').length < 6) falla(400, 'La contraseña debe tener al menos 6 caracteres');
  if (q('SELECT 1 FROM usuarios WHERE correo=?').get(correo)) falla(400, 'Ese correo ya está registrado');
  const id = Number(q("INSERT INTO usuarios(institucion_id, rol, nombre, correo, hash_contrasena) VALUES (?, 'docente', ?, ?, ?)").run(user.inst, texto(body.nombre, 100), correo, hashPass(body.contrasena)).lastInsertRowid);
  auditar(user.sub, 'crear_docente', null, correo);
  return { id };
});
route('POST', '/admin/usuarios/:id/activo', ['admin'], ({ user, params, body }) => {
  const u = q("SELECT * FROM usuarios WHERE id=? AND institucion_id=? AND rol='docente'").get(Number(params.id), user.inst);
  if (!u) falla(404, 'Docente no encontrado');
  q('UPDATE usuarios SET activo=? WHERE id=?').run(body.activo ? 1 : 0, u.id);
  auditar(user.sub, body.activo ? 'activar_docente' : 'desactivar_docente', null, u.correo);
});
route('GET', '/admin/estudiantes', ['admin'], ({ user, query }) => {
  const g = grupoPermitido(user, query.grupo_id);
  auditar(user.sub, 'listar_estudiantes', null, `grupo ${g.id}`);
  return estudiantesDeGrupo(g.id).map(e => ({ id: e.id, codigo: e.codigo, nombre: e.nombre, activado: !!e.hash_pin }));
});
function crearEstudiante(grupoId, nombre, codigo) {
  nombre = texto(nombre, 100);
  if (!nombre) falla(400, 'Falta el nombre');
  if (!codigo) {
    const n = q('SELECT COUNT(*) n FROM estudiantes WHERE grupo_id=?').get(grupoId).n + 1;
    codigo = 'E-' + String(n).padStart(2, '0');
    while (q('SELECT 1 FROM estudiantes WHERE grupo_id=? AND codigo=?').get(grupoId, codigo)) codigo = 'E-' + String(Number(codigo.slice(2)) + 1).padStart(2, '0');
  }
  codigo = texto(codigo, 20).toUpperCase();
  if (q('SELECT 1 FROM estudiantes WHERE grupo_id=? AND codigo=?').get(grupoId, codigo)) falla(400, `El código ${codigo} ya existe en el grupo`);
  const inst = q('SELECT s.institucion_id FROM grupos g JOIN sedes s ON s.id=g.sede_id WHERE g.id=?').get(grupoId).institucion_id;
  const uid = Number(q("INSERT INTO usuarios(institucion_id, rol, nombre) VALUES (?, 'estudiante', ?)").run(inst, nombre).lastInsertRowid);
  return Number(q('INSERT INTO estudiantes(usuario_id, grupo_id, codigo) VALUES (?,?,?)').run(uid, grupoId, codigo).lastInsertRowid);
}
route('POST', '/admin/estudiantes', ['admin'], ({ user, body }) => {
  const g = grupoPermitido(user, body.grupo_id);
  const id = tx(() => crearEstudiante(g.id, body.nombre, body.codigo));
  auditar(user.sub, 'crear_estudiante', id);
  return { id };
});
route('DELETE', '/admin/estudiantes/:id', ['admin'], ({ user, params }) => {
  const { e } = estudiantePermitido(user, params.id);
  q('DELETE FROM usuarios WHERE id=?').run(e.usuario_id); auditar(user.sub, 'borrar_estudiante', null, e.codigo);
});
route('POST', '/admin/estudiantes/importar', ['admin'], ({ user, body }) => {
  const filas = Array.isArray(body.filas) ? body.filas.slice(0, 2000) : [];
  let creados = 0; const errores = [];
  filas.forEach((f, i) => {
    try {
      const g = q('SELECT g.id FROM grupos g JOIN sedes s ON s.id=g.sede_id WHERE upper(g.codigo_clase)=? AND s.institucion_id=?').get(texto(f.codigo_clase, 40).toUpperCase(), user.inst);
      if (!g) falla(400, `código de clase "${f.codigo_clase}" no existe`);
      tx(() => crearEstudiante(g.id, f.nombre, f.codigo)); creados++;
    } catch (e) { errores.push(`Fila ${i + 2}: ${e.message}`); }
  });
  auditar(user.sub, 'importar_estudiantes', null, `${creados} creados`);
  return { creados, errores };
});
route('POST', '/admin/contenido/importar', ['admin'], ({ user, body }) => {
  if (!Array.isArray(body.materias)) falla(400, 'El archivo debe tener una lista "materias"');
  const r = tx(() => importarContenido(body.materias));
  auditar(user.sub, 'importar_contenido', null, `${r.lecciones} lecciones`);
  return r;
});
route('GET', '/admin/reportes', ['admin'], ({ user }) => {
  const lunes = lunesDe(new Date());
  return q('SELECT g.id, g.grado, g.codigo_clase, s.nombre sede FROM grupos g JOIN sedes s ON s.id=g.sede_id WHERE s.institucion_id=? ORDER BY s.nombre, g.grado').all(user.inst).map(g => {
    const ests = estudiantesDeGrupo(g.id); const resp = respuestasEntre(g.id, lunes, sumarDias(lunes, 6));
    const stats = ests.map(e => statsEstudiante(e, g.grado));
    const conDatos = stats.filter(s => s.aciertos !== null);
    return {
      ...g, estudiantes: ests.length, activados: stats.filter(s => s.activado).length, activos_semana: new Set(resp.map(r => r.estudiante_id)).size,
      aciertos: conDatos.length ? Math.round(conDatos.reduce((a, s) => a + s.aciertos, 0) / conDatos.length) : null,
      necesitan_apoyo: stats.filter(s => s.necesita_apoyo).length
    };
  });
});
route('GET', '/admin/auditoria', ['admin'], ({ user }) =>
  q(`SELECT a.fecha, a.accion, a.detalle, u.nombre usuario, e.codigo estudiante FROM auditoria a LEFT JOIN usuarios u ON u.id=a.usuario_id
     LEFT JOIN estudiantes e ON e.id=a.estudiante_id WHERE u.institucion_id=? ORDER BY a.id DESC LIMIT 150`).all(user.inst));

// ---------------------------------------------------------------- Datos de demostración
function seed() {
  if (q('SELECT COUNT(*) n FROM usuarios').get().n > 0) return;
  let s = 42; const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  tx(() => {
    const inst = Number(q('INSERT INTO instituciones(nombre, municipio) VALUES (?,?)').run('Institución Educativa Rural (demo)', 'Agustín Codazzi, Cesar').lastInsertRowid);
    const sede1 = Number(q('INSERT INTO sedes(institucion_id, nombre, vereda) VALUES (?,?,?)').run(inst, 'Sede La Esperanza', 'Vereda La Esperanza').lastInsertRowid);
    const sede2 = Number(q('INSERT INTO sedes(institucion_id, nombre, vereda) VALUES (?,?,?)').run(inst, 'Sede El Rosario', 'Corregimiento Casacará').lastInsertRowid);
    const nuevoUsuario = (rol, nombre, correo, pass) => Number(q('INSERT INTO usuarios(institucion_id, rol, nombre, correo, hash_contrasena) VALUES (?,?,?,?,?)').run(inst, rol, nombre, correo, pass ? hashPass(pass) : null).lastInsertRowid);
    nuevoUsuario('admin', 'Administración (demo)', 'admin@edurural.test', 'admin123');
    const doc1 = nuevoUsuario('docente', 'Profe Demo', 'docente@edurural.test', 'docente123');
    const doc2 = nuevoUsuario('docente', 'Profe Rosario', 'docente2@edurural.test', 'docente123');
    const g1 = Number(q('INSERT INTO grupos(sede_id, grado, anio, codigo_clase, docente_id) VALUES (?,?,?,?,?)').run(sede1, 5, 2026, 'CODAZZI5', doc1).lastInsertRowid);
    const g2 = Number(q('INSERT INTO grupos(sede_id, grado, anio, codigo_clase, docente_id) VALUES (?,?,?,?,?)').run(sede2, 5, 2026, 'ROSARIO5', doc2).lastInsertRowid);
    importarContenido(CONTENIDO);

    const lecciones = q('SELECT l.id, l.materia_id, l.nivel_bloom FROM lecciones l ORDER BY l.materia_id, l.nivel_bloom').all();
    const preguntasDe = lid => q('SELECT id, respuesta_correcta, opciones FROM preguntas WHERE leccion_id=?').all(lid);
    const materias = q('SELECT id FROM materias ORDER BY id').all().map(m => m.id);
    const nombres = ['Luis Fernando', 'María José', 'Andrés', 'Valentina', 'Camilo', 'Daniela', 'Santiago', 'Isabella', 'Juan David', 'Sofía', 'Kevin', 'Mariana'];
    // [niveles completados en Matemáticas, en Ciencias, precisión, días desde la última sincronización]
    const perfiles = [[3, 2, .85, 0], [4, 3, .9, 1], [1, 1, .5, 2], [2, 2, .75, 0], [5, 4, .92, 1], [2, 1, .45, 3], null, [3, 3, .8, 0], [1, 0, .7, 7], [2, 3, .78, 2], [4, 4, .88, 1], [1, 2, .68, 4]];
    const modelos = ['Samsung Galaxy A03', 'Motorola Moto E7', 'Xiaomi Redmi 9A', 'Tecno Spark 8'];
    let ev = 0;
    nombres.forEach((nombre, i) => {
      const estId = crearEstudiante(g1, nombre, 'E-' + String(i + 1).padStart(2, '0'));
      const pf = perfiles[i];
      if (!pf) return; // E-07 queda sin activar para la demostración
      const [nm, nc, prec, diasSync] = pf;
      q('UPDATE estudiantes SET hash_pin=? WHERE id=?').run(crypto.createHash('sha256').update('seed' + i).digest('hex'), estId);
      const ultimaSync = new Date(Date.now() - diasSync * 864e5 - rnd() * 4 * 3600e3);
      const disp = 'd-seed' + i;
      q('INSERT INTO dispositivos(id, estudiante_id, modelo, version_app, ultima_sincronizacion) VALUES (?,?,?,?,?)').run(disp, estId, modelos[i % 4], '1.0.0', ultimaSync.toISOString());
      for (let k = 0; k < 3; k++) q('INSERT INTO sincronizaciones(estudiante_id, dispositivo_id, sede_id, fecha, eventos) VALUES (?,?,?,?,?)').run(estId, disp, sede1, new Date(ultimaSync.getTime() - k * 2.5 * 864e5).toISOString(), 10 + Math.floor(rnd() * 30));
      const intento = (lid, pasa, fecha, n) => {
        const ps = preguntasDe(lid); let buenas = 0;
        ps.forEach((p, qi) => {
          let ok = rnd() < prec;
          if (pasa && qi === ps.length - 1 && buenas + (ok ? 1 : 0) < 2) ok = true;
          if (pasa && qi === ps.length - 2 && buenas + (ok ? 1 : 0) < 1) ok = true;
          if (!pasa && buenas >= 1) ok = false;
          if (ok) buenas++;
          const nOps = JSON.parse(p.opciones).length;
          const opcion = ok ? p.respuesta_correcta : (p.respuesta_correcta + 1 + Math.floor(rnd() * (nOps - 1))) % nOps;
          q('INSERT INTO respuestas(id_evento, estudiante_id, pregunta_id, opcion, correcta, intento, fecha_local, recibido) VALUES (?,?,?,?,?,?,?,?)')
            .run('seed-' + (++ev), estId, p.id, opcion, ok ? 1 : 0, n, fechaLocal(fecha), ultimaSync.toISOString());
        });
      };
      materias.forEach((mid, mi) => {
        const hechos = mi === 0 ? nm : nc;
        for (const l of lecciones.filter(l => l.materia_id === mid && l.nivel_bloom <= Math.min(hechos + 1, 6))) {
          const fecha = () => new Date(ultimaSync.getTime() - rnd() * 8 * 864e5);
          if (l.nivel_bloom <= hechos) {
            let n = 1; if (rnd() > prec) intento(l.id, false, fecha(), n++);
            intento(l.id, true, fecha(), n);
            q('INSERT INTO progreso(estudiante_id, leccion_id, estado, porcentaje, actualizado) VALUES (?,?,?,?,?)').run(estId, l.id, 'completada', 100, fechaLocal(ultimaSync));
          } else {
            const fallos = (i === 2 && mi === 0) ? 3 : 1; // E-03 se atasca en Matemáticas
            for (let n = 1; n <= fallos; n++) intento(l.id, false, fecha(), n);
            q('INSERT INTO progreso(estudiante_id, leccion_id, estado, porcentaje, actualizado) VALUES (?,?,?,?,?)').run(estId, l.id, 'en_curso', 33, fechaLocal(ultimaSync));
          }
        }
      });
    });
    ['Ana Lucía', 'Pedro', 'Yesica', 'Brayan'].forEach((n, i) => crearEstudiante(g2, n, 'E-' + String(i + 1).padStart(2, '0')));
    // Paquete inicial publicado hace 2 semanas: niveles 1 a 3
    const ini = q('SELECT l.id, l.tamano_mb FROM lecciones l WHERE l.nivel_bloom <= 3').all();
    const hace14 = new Date(Date.now() - 14 * 864e5);
    q('INSERT INTO paquetes(grupo_id, semana, titulo, lecciones, tamano_mb, publicado) VALUES (?,?,?,?,?,?)')
      .run(g1, lunesDe(hace14), 'Paquete inicial: niveles 1 a 3', JSON.stringify(ini.map(l => l.id)), Math.round(ini.reduce((a, l) => a + l.tamano_mb, 0) * 10) / 10, hace14.toISOString());
    q('INSERT INTO paquetes(grupo_id, semana, titulo, lecciones, tamano_mb, publicado) VALUES (?,?,?,?,?,?)')
      .run(g2, lunesDe(hace14), 'Paquete inicial: niveles 1 a 3', JSON.stringify(ini.map(l => l.id)), Math.round(ini.reduce((a, l) => a + l.tamano_mb, 0) * 10) / 10, hace14.toISOString());
  });
  console.log('Datos de demostración creados.');
}
seed();

// ---------------------------------------------------------------- Servidor HTTP
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = ''; req.setEncoding('utf8');
    req.on('data', c => { data += c; if (data.length > 5e6) { reject(new HttpError(413, 'Petición muy grande')); req.destroy(); } });
    req.on('end', () => { if (!data) return resolve({}); try { resolve(JSON.parse(data)); } catch { reject(new HttpError(400, 'JSON inválido')); } });
    req.on('error', reject);
  });
}
async function handleApi(req, res, url) {
  const send = (status, obj) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
  try {
    const sub = url.pathname.slice('/api/v1'.length) || '/';
    const r = routes.find(r => r.method === req.method && r.re.test(sub));
    if (!r) falla(404, 'Ruta no encontrada');
    const m = sub.match(r.re); const params = {};
    r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
    let user = null;
    if (r.roles) {
      user = verify((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      const tipoOk = user && (user.rol === 'estudiante' ? user.typ === 'device' : user.typ === 'access');
      if (!tipoOk) falla(401, 'Sesión vencida');
      if (!r.roles.includes(user.rol)) falla(403, 'No tienes permiso para esto');
      if (user.rol === 'estudiante') {
        if (!q('SELECT 1 FROM dispositivos WHERE id=? AND estudiante_id=?').get(user.disp, user.est)) falla(401, 'Este teléfono ya no está registrado');
      } else if (!q('SELECT 1 FROM usuarios WHERE id=? AND activo=1').get(user.sub)) falla(401, 'Cuenta desactivada');
    }
    const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readJson(req) : {};
    const out = await r.handler({ user, params, query: Object.fromEntries(url.searchParams), body, req });
    send(200, out ?? { ok: true });
  } catch (e) {
    if (e instanceof HttpError) send(e.status, { error: e.message });
    else { console.error(e); send(500, { error: 'Error interno del servidor' }); }
  }
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.csv': 'text/csv; charset=utf-8' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/v1/')) return handleApi(req, res, url);
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/index.html';
  if (p === '/admin') p = '/admin.html';
  const file = path.join(PUBLIC, path.normalize(p));
  if (!file.startsWith(PUBLIC + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\nEduRural listo:\n  App:            http://localhost:${PORT}\n  Administrador:  http://localhost:${PORT}/admin`);
  for (const ifs of Object.values(os.networkInterfaces())) for (const i of ifs || []) if (i.family === 'IPv4' && !i.internal) console.log(`  En la red local: http://${i.address}:${PORT}`);
});
