'use strict';
/* EduRural — app web móvil (estudiante + docente). Todo lo del estudiante funciona sin internet. */
const API = '/api/v1';
const VERSION_APP = '1.0.0';
const BLOOM = [
  { n: 1, nombre: 'Recordar', desc: 'Reconocer y nombrar', color: '#2e7d5b' },
  { n: 2, nombre: 'Comprender', desc: 'Explicar con tus palabras', color: '#2f6db5' },
  { n: 3, nombre: 'Aplicar', desc: 'Usar lo aprendido', color: '#7a4fb5' },
  { n: 4, nombre: 'Analizar', desc: 'Comparar y separar en partes', color: '#b5562f' },
  { n: 5, nombre: 'Evaluar', desc: 'Juzgar y decidir', color: '#a83a6a' },
  { n: 6, nombre: 'Crear', desc: 'Inventar algo nuevo', color: '#8a6a12' }
];
const app = document.getElementById('app');

// ---------------------------------------------------------------- Íconos de línea (24x24, trazo)
const ICONOS = {
  inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
  sync: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 3v5h-5"/>',
  premio: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
  grafica: '<path d="M3 3v18h18"/><path d="M7 15v2"/><path d="M11 10v7"/><path d="M15 12v5"/><path d="M19 6v11"/>',
  grupo: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
  paquete: '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
  documento: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
  sinred: '<path d="M2 2l20 20"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 12.9a10 10 0 0 1 5.2-2.7"/><path d="M19 12.9a10 10 0 0 0-2.4-1.6"/><path d="M2 8.8a15 15 0 0 1 4.2-2.6"/><path d="M22 8.8A15 15 0 0 0 10.7 5"/><path d="M12 20h.01"/>',
  wifi: '<path d="M5 12.6a10 10 0 0 1 14 0"/><path d="M8.5 16.1a5 5 0 0 1 7 0"/><path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M12 20h.01"/>',
  capas: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  birrete: '<path d="M22 9 12 4 2 9l10 5 10-5Z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v6"/>',
  pizarra: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="m7 12 3-3 2 2 4-4"/><path d="M12 16v4"/><path d="M8 20h8"/>',
  candado: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  abierto: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.8-1.2"/>',
  llave: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3"/><path d="m17 6 3 3"/><path d="m14 9 2 2"/>',
  llama: '<path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.5-6-4-8-.5 2-1.5 3-3 3 0-3-1-6-4-8 0 4-3 6.5-3 11 0 5 3 9 7 9Z"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  libro: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 19.5V4.5"/><path d="M8 7h8"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkc: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  play: '<path d="M7 4v16l13-8Z"/>',
  playc: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5.5 3.5-5.5 3.5Z"/>',
  circulo: '<circle cx="12" cy="12" r="9"/>',
  nube: '<path d="M17.5 19H7a5 5 0 1 1 .9-9.9A6 6 0 0 1 19.5 11 4 4 0 0 1 17.5 19Z"/><path d="M12 12v6"/><path d="m9 15 3 3 3-3"/>',
  lista: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3"/><path d="m9 12 2 2 4-4"/><path d="M9 17h6"/>',
  repetir: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  foco: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z"/>',
  equis: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  trofeo: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3"/><path d="M7 5H4v2a3 3 0 0 0 3 3"/>',
  estrella: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z"/>',
  subir: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/>',
  avion: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z"/>',
  alerta: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  cohete: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A13 13 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2Z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0"/><path d="M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  celular: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/>',
  lapiz: '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  impresora: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  mensaje: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
  calculadora: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/>',
  hoja: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
  flecha: '<path d="m9 6 6 6-6 6"/>',
  atras: '<path d="m15 6-6 6 6 6"/>',
  borrar: '<path d="M21 5H9l-7 7 7 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"/><path d="m18 9-6 6"/><path d="m12 9 6 6"/>',
  pulgar: '<path d="M7 10v11"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 18.4 21H7V10l4-8a3 3 0 0 1 4 3.9Z"/><path d="M3 10h4v11H3Z"/>',
  subida: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  descarga: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>',
  mano: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>'
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n] || ICONOS.libro}</svg>`;
const icMateria = m => ic(/mat/i.test(m?.nombre) ? 'calculadora' : /cien/i.test(m?.nombre) ? 'hoja' : 'libro');

// ---------------------------------------------------------------- Utilidades
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast('No queda espacio en el teléfono'); } },
  del(k) { try { localStorage.removeItem(k); } catch { } }
};
const sess = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { } },
  del(k) { try { sessionStorage.removeItem(k); } catch { } }
};
const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
function fechaLocal(d = new Date()) {
  const off = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
  return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off >= 0 ? '+' : '-') + p(off / 60) + ':' + p(off % 60);
}
const hoy = () => fechaLocal().slice(0, 10);
function hace(iso) {
  if (!iso) return 'nunca';
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 1) return 'hace un momento';
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24); return d === 1 ? 'ayer' : `hace ${d} días`;
}
const fechaCorta = s => { const d = new Date(String(s).length <= 10 ? s + 'T12:00:00' : s); return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }); };
let toastT;
function toast(msg) {
  document.querySelector('.toast')?.remove(); clearTimeout(toastT);
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); toastT = setTimeout(() => t.remove(), 3500);
}
function modal(html) {
  const f = document.createElement('div'); f.className = 'modal-fondo';
  f.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  f.addEventListener('click', e => { if (e.target === f) f.remove(); });
  document.body.appendChild(f); return f;
}
const ir = h => { if (location.hash === h) router(); else location.hash = h; };

// SHA-256 (funciona también sin HTTPS, donde crypto.subtle no existe)
const K256 = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
function sha256(str) {
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  const bytes = new TextEncoder().encode(str), l = bytes.length;
  const buf = new Uint8Array(((l + 9 + 63) >> 6) << 6); buf.set(bytes); buf[l] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(buf.length - 4, (l * 8) >>> 0); dv.setUint32(buf.length - 8, Math.floor(l / 0x20000000));
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const W = new Uint32Array(64);
  for (let i = 0; i < buf.length; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = dv.getUint32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3), s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K256[t] + W[t]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H = H.map((v, k) => (v + [a, b, c, d, e, f, g, h][k]) >>> 0);
  }
  return H.map(v => v.toString(16).padStart(8, '0')).join('');
}
const hashPin = (pin, sal) => sha256(sal + ':' + pin);

// ---------------------------------------------------------------- Red
// El modo avión simulado solo aplica dentro de la sesión del estudiante (no bloquea al docente ni la activación).
const offlineSimulado = () => !!perfil && store.get('er_offline', false);
async function api(path, { method = 'GET', body, token } = {}) {
  if (offlineSimulado()) throw new Error('Sin conexión (modo avión simulado)');
  let r;
  try {
    r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  } catch { throw new Error('No hay conexión con el servidor'); }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(data.error || 'Error ' + r.status); e.status = r.status; throw e; }
  return data;
}
let enLinea = navigator.onLine;
async function ping() {
  if (offlineSimulado()) return (enLinea = false);
  try { const c = new AbortController(); setTimeout(() => c.abort(), 3000); const r = await fetch(API + '/ping', { cache: 'no-store', signal: c.signal }); enLinea = r.ok; }
  catch { enLinea = false; }
  document.querySelectorAll('[data-conexion]').forEach(el => { el.outerHTML = chipConexion(); });
  return enLinea;
}
const chipConexion = () => `<span class="chip ${enLinea ? '' : 'off'}" data-conexion>${ic(enLinea ? 'wifi' : 'sinred')}${enLinea ? 'Con conexión' : 'Sin conexión'}</span>`;
window.addEventListener('online', ping); window.addEventListener('offline', ping);

// ---------------------------------------------------------------- Marco de pantallas
let ultimaRutaPintada = null;
function marco({ titulo, atras, contenido, nav, extraTop = '' }) {
  const animar = ultimaRutaPintada !== location.hash; ultimaRutaPintada = location.hash;
  app.innerHTML = `
    <header class="top">
      ${atras ? `<button class="atras" data-atras aria-label="Volver">${ic('atras')}</button><h1>${esc(titulo)}</h1>`
        : `<span class="logo-top">${ic('libro')}</span><h1 class="marca-top">EduRural</h1>`}${extraTop}${chipConexion()}
    </header>
    <main class="wrap ${nav ? 'con-nav' : ''} ${animar ? '' : 'sin-anim'}">${!atras && titulo !== 'EduRural' ? `<h1 class="titulo-pag">${esc(titulo)}</h1>` : ''}${contenido}</main>
    ${nav ? navHtml(nav) : ''}`;
  app.querySelector('[data-atras]')?.addEventListener('click', () => (typeof atras === 'string' ? ir(atras) : history.back()));
}
const NAV_EST = [['#/e/inicio', 'inicio', 'Inicio'], ['#/e/materia', 'libro', 'Materias'], ['#/e/sync', 'descarga', 'Descargas'], ['#/e/logros', 'premio', 'Logros']];
const NAV_DOC = [['#/d/panel', 'grafica', 'Panel'], ['#/d/estudiantes', 'grupo', 'Estudiantes'], ['#/d/paquete', 'paquete', 'Paquete'], ['#/d/reporte', 'documento', 'Reporte']];
function navHtml(items) {
  const h = location.hash;
  return `<nav class="nav" aria-label="Menú">${items.map(([href, ico, txt]) => `<a href="${href}" class="${h.startsWith(href) ? 'activo' : ''}">${ic(ico)}<span class="nav-t">${txt}</span></a>`).join('')}</nav>`;
}
const $ = (s, el = app) => el.querySelector(s);
const $$ = (s, el = app) => [...el.querySelectorAll(s)];

// ================================================================= ESTUDIANTE
let perfil = null;     // perfil activo
let D = null;          // datos locales del perfil activo
const perfiles = () => store.get('er_perfiles', []);
const guardarPerfiles = p => store.set('er_perfiles', p);
function nuevoDatos() {
  return { materias: [], lecciones: {}, preguntas: {}, paquetes: [], descargadas: [], borrados: [], progreso: {}, cola: [], intentos: {},
    historial: [], refuerzos: [], acks: [], ultimaSync: null, desde: null, diasActivos: [], ultimaLeccion: null };
}
const guardar = () => perfil && store.set('er_datos_' + perfil.estudiante_id, D);
function abrirSesion(p) {
  perfil = p; D = Object.assign(nuevoDatos(), store.get('er_datos_' + p.estudiante_id, {}));
  sess.set('er_sesion', String(p.estudiante_id)); marcarDia();
}
function cerrarSesionEst() { perfil = null; D = null; sess.del('er_sesion'); store.set('er_offline', false); }
function marcarDia() { if (D && !D.diasActivos.includes(hoy())) { D.diasActivos.push(hoy()); guardar(); } }
function encolar(ev) { D.cola.push({ id_evento: uid(), fecha_local: fechaLocal(), ...ev }); marcarDia(); guardar(); }
function requiereEst() { if (!perfil) { ir(perfiles().length ? '#/pin' : '#/perfil'); return false; } return true; }

const leccionesDe = mid => Object.values(D.lecciones).filter(l => l.materia_id === mid).sort((a, b) => a.nivel_bloom - b.nivel_bloom || a.orden - b.orden);
const completada = lid => D.progreso[lid]?.estado === 'completada';
function estadoNiveles(mid) {
  const lecs = leccionesDe(mid); let anteriorOk = true;
  return BLOOM.map(b => {
    const ls = lecs.filter(l => l.nivel_bloom === b.n);
    const completo = ls.length > 0 && ls.every(l => completada(l.id));
    const estado = completo ? 'completado' : anteriorOk ? 'en_curso' : 'bloqueado';
    anteriorOk = completo;
    return { ...b, lecs: ls, estado };
  });
}
function nivelDeLeccion(l) { return estadoNiveles(l.materia_id).find(n => n.n === l.nivel_bloom); }
const descargada = lid => D.descargadas.includes(Number(lid));
const disponible = l => descargada(l.id) && nivelDeLeccion(l).estado !== 'bloqueado';
function siguienteLeccion() {
  const ult = D.lecciones[D.ultimaLeccion];
  if (ult && !completada(ult.id) && disponible(ult)) return ult;
  for (const m of D.materias) for (const l of leccionesDe(m.id)) if (!completada(l.id) && disponible(l)) return l;
  return null;
}
const espacioMb = () => Math.round(D.descargadas.reduce((a, id) => a + (D.lecciones[id]?.tamano_mb || 0), 0) * 10) / 10;

// --- A1: elegir perfil
function vPerfil() {
  app.innerHTML = `
    <div class="portada paisaje">
      <div class="sol"></div>
      <svg class="montes" viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 95 L120 25 L210 85 L300 15 L400 70 L400 150 L0 150Z" fill="#2a8a62"/>
        <path d="M0 120 L90 70 L190 115 L290 60 L400 105 L400 150 L0 150Z" fill="#3d9e73"/>
        <path d="M0 132 C90 110 160 145 250 128 C320 115 360 120 400 112 L400 150 L0 150Z" fill="#f3f6f4"/>
      </svg>
      <div class="logo-c">${ic('libro')}</div>
      <h1 class="marca">EduRural</h1>
      <p>Aprende aunque no haya señal</p>
      <div class="pildoras"><span>${ic('sinred')} Sin internet</span><span>${ic('capas')} Taxonomía de Bloom</span><span>${ic('wifi')} Centro Digital</span></div>
    </div>
    <div class="roles paisaje">
      <h2>¿Cómo vas a entrar?</h2>
      <p class="muted small" style="margin-bottom:14px">Elige tu perfil para continuar.</p>
      <button class="rol" data-r="est"><span class="icono-g">${ic('birrete')}</span><span><b>Soy estudiante</b><br><span class="muted small">Estudia tus lecciones y cuestionarios</span></span><span class="flecha">${ic('flecha')}</span></button>
      <button class="rol" data-r="doc"><span class="icono-g ambar">${ic('pizarra')}</span><span><b>Soy docente</b><br><span class="muted small">Mira el avance de tus grupos</span></span><span class="flecha">${ic('flecha')}</span></button>
      <p class="center small muted" style="margin-top:20px">¿Administras la institución? <a href="/admin">Panel del administrador</a></p>
      <p class="center small muted" style="opacity:.7">Agustín Codazzi, Cesar · Versión ${VERSION_APP}</p>
    </div>`;
  $('[data-r=est]').onclick = () => ir(perfiles().length ? '#/pin' : '#/activar');
  $('[data-r=doc]').onclick = () => ir(DS ? '#/d/panel' : '#/d/login');
}

// --- E1: activar cuenta
function vActivar() {
  marco({
    titulo: 'Activar mi cuenta', atras: perfiles().length ? '#/pin' : '#/perfil', contenido: `
    <div class="card aviso small fila">${ic('wifi')}<span>Esto se hace <b>una sola vez</b> y necesita la conexión del Centro Digital. Después estudias sin internet.</span></div>
    <form id="f" autocomplete="off">
      <label for="cc">Código de clase</label><input id="cc" type="text" required placeholder="Te lo da tu profe" style="text-transform:uppercase">
      <label for="gr">Grado</label><select id="gr" required>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(g => `<option value="${g}" ${g === 5 ? 'selected' : ''}>${g}°</option>`).join('')}</select>
      <label for="ce">Tu código de estudiante</label><input id="ce" type="text" required placeholder="Ejemplo: E-07" style="text-transform:uppercase">
      <label for="p1">Crea un PIN de 4 números</label><input id="p1" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required>
      <label for="p2">Repite tu PIN</label><input id="p2" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required>
      <div id="err" class="error" role="alert"></div>
      <button class="btn bloque grande" style="margin-top:16px">Activar</button>
    </form>
    <div class="card small muted" style="margin-top:16px">Para la demostración: código de clase <b>BADILLO5</b>, grado <b>5°</b>, código de estudiante del <b>E-01</b> al <b>E-12</b>, y un PIN que tú inventes.</div>`
  });
  $('#f').onsubmit = async e => {
    e.preventDefault();
    const err = $('#err'); err.textContent = '';
    const p1 = $('#p1').value, p2 = $('#p2').value;
    if (!/^\d{4}$/.test(p1)) return (err.textContent = 'El PIN debe tener 4 números.');
    if (p1 !== p2) return (err.textContent = 'Los dos PIN no son iguales.');
    const btn = $('button.btn', $('#f')); btn.disabled = true; btn.textContent = 'Activando…';
    try {
      const sal = uid(), hash = hashPin(p1, sal);
      const r = await api('/auth/activar', { method: 'POST', body: { codigo_clase: $('#cc').value, grado: $('#gr').value, codigo_estudiante: $('#ce').value, hash_pin: sha256(p1 + ':' + $('#ce').value.toUpperCase()), modelo: modeloEquipo(), version_app: VERSION_APP } });
      const p = { ...r.perfil, token: r.token, dispositivo_id: r.dispositivo_id, sal, hash_pin: hash, fallos: 0, bloqueoHasta: 0 };
      guardarPerfiles([...perfiles().filter(x => x.estudiante_id !== p.estudiante_id), p]);
      store.del('er_datos_' + p.estudiante_id);
      abrirSesion(p);
      btn.textContent = 'Descargando tus lecciones…';
      await sincronizar(() => { });
      toast(`¡Bienvenido, ${p.nombre.split(' ')[0]}! Ya puedes estudiar sin internet.`);
      ir('#/e/inicio');
    } catch (ex) { err.textContent = ex.message; btn.disabled = false; btn.textContent = 'Activar'; }
  };
}
function modeloEquipo() {
  const ua = navigator.userAgent; const m = ua.match(/Android [\d.]+; ([^;)]+)/);
  return m ? m[1].trim() : /iPhone/.test(ua) ? 'iPhone' : /Windows/.test(ua) ? 'Navegador Windows' : 'Navegador';
}

// --- A2: PIN
let pinSel = null;
function vPin() {
  const ps = perfiles();
  if (!ps.length) return ir('#/perfil');
  if (perfil) return ir('#/e/inicio');
  if (!pinSel && ps.length === 1) pinSel = ps[0].estudiante_id;
  const p = ps.find(x => x.estudiante_id === pinSel);
  if (!p) {
    marco({
      titulo: '¿Quién va a estudiar?', atras: '#/perfil', contenido: `
      ${ps.map(x => `<button class="perfil-btn" data-id="${x.estudiante_id}"><span class="avatar">${esc(x.nombre[0])}</span><span><b>${esc(x.nombre)}</b><br><span class="muted small">${esc(x.codigo)} · ${x.grado}°</span></span></button>`).join('')}
      <button class="btn sec bloque" data-nuevo>＋ Agregar otro estudiante en este teléfono</button>`
    });
    $$('[data-id]').forEach(b => b.onclick = () => { pinSel = Number(b.dataset.id); vPin(); });
    $('[data-nuevo]').onclick = () => ir('#/activar');
    return;
  }
  teclado({
    titulo: `Hola, ${p.nombre.split(' ')[0]}`, sub: 'Escribe tu PIN de 4 números',
    pie: `<button class="enlace" data-olvide>¿Olvidaste tu PIN?</button>${ps.length > 1 ? '<button class="enlace" data-cambiar>Cambiar de estudiante</button>' : '<button class="enlace" data-nuevo>Agregar otro estudiante</button>'}`,
    alCompletar: pin => {
      const ps2 = perfiles(); const pp = ps2.find(x => x.estudiante_id === p.estudiante_id);
      if (Date.now() < (pp.bloqueoHasta || 0)) return false;
      if (hashPin(pin, pp.sal) === pp.hash_pin) {
        pp.fallos = 0; guardarPerfiles(ps2); abrirSesion(pp); ir('#/e/inicio'); return true;
      }
      pp.fallos = (pp.fallos || 0) + 1;
      if (pp.fallos >= 5) { pp.bloqueoHasta = Date.now() + 5 * 60000; pp.fallos = 0; }
      guardarPerfiles(ps2); mostrarBloqueo(pp); return false;
    }
  });
  mostrarBloqueo(p);
  $('[data-cambiar]')?.addEventListener('click', () => { pinSel = null; vPin(); });
  $('[data-nuevo]')?.addEventListener('click', () => ir('#/activar'));
  $('[data-olvide]').onclick = () => olvidePin(p);
}
function mostrarBloqueo(p) {
  const el = $('#msg'); if (!el) return;
  const resta = (p.bloqueoHasta || 0) - Date.now();
  if (resta > 0) { el.innerHTML = `<div class="card alerta">${ic('candado')} Escribiste mal el PIN 5 veces. Espera ${Math.ceil(resta / 60000)} min para intentar otra vez.</div>`; }
  else if (p.fallos) el.innerHTML = `<p class="error">PIN incorrecto. Te quedan ${5 - p.fallos} intentos.</p>`;
}
function teclado({ titulo, sub, pie = '', alCompletar, atras = '#/perfil' }) {
  let pin = '';
  marco({
    titulo: 'Entrar', atras, contenido: `
    <div class="center" style="padding-top:12px"><div class="avatar" style="margin:0 auto 10px;width:64px;height:64px;font-size:1.6rem">${ic('llave')}</div>
    <h2>${esc(titulo)}</h2><p class="muted">${esc(sub)}</p></div>
    <div class="dots" id="dots" aria-label="PIN">${'<i></i>'.repeat(4)}</div>
    <div id="msg" class="center"></div>
    <div class="teclado">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-n="${n}">${n}</button>`).join('')}<button class="vacio" tabindex="-1"></button><button data-n="0">0</button><button data-borrar aria-label="Borrar">${ic('borrar')}</button></div>
    <div class="center" style="margin-top:16px">${pie}</div>`
  });
  const pintar = () => $$('#dots i').forEach((d, i) => d.classList.toggle('lleno', i < pin.length));
  const tecla = n => {
    if (pin.length >= 4) return;
    pin += n; pintar();
    if (pin.length === 4) setTimeout(() => {
      const ok = alCompletar(pin);
      if (!ok) { $('#dots')?.classList.add('mal'); setTimeout(() => { pin = ''; pintar(); $('#dots')?.classList.remove('mal'); }, 350); }
    }, 120);
  };
  $$('[data-n]').forEach(b => b.onclick = () => tecla(b.dataset.n));
  $('[data-borrar]').onclick = () => { pin = pin.slice(0, -1); pintar(); };
  document.onkeydown = e => { if (!$('#dots')) return (document.onkeydown = null); if (/^\d$/.test(e.key)) tecla(e.key); if (e.key === 'Backspace') { pin = pin.slice(0, -1); pintar(); } };
}
async function olvidePin(p) {
  const m = modal(`<h2>¿Olvidaste tu PIN?</h2><p id="t">Revisando con el servidor…</p><div class="acciones"><button class="btn sec" data-c>Cerrar</button></div>`);
  m.querySelector('[data-c]').onclick = () => m.remove();
  try {
    const r = await api('/auth/pin-estado', { method: 'POST', token: p.token });
    if (!r.pin_reiniciado) { m.querySelector('#t').textContent = 'Pídele a tu profe que reinicie tu PIN desde su panel. Después vuelve a tocar "¿Olvidaste tu PIN?".'; return; }
    m.remove(); crearPinNuevo(p);
  } catch (e) { m.querySelector('#t').textContent = 'Necesitas conexión del Centro Digital para cambiar tu PIN. (' + e.message + ')'; }
}
function crearPinNuevo(p) {
  let primero = null;
  const paso = () => teclado({
    titulo: primero ? 'Repite tu PIN nuevo' : 'Crea un PIN nuevo', sub: 'Tu profe reinició tu PIN', atras: '#/pin',
    alCompletar: pin => {
      if (!primero) { primero = pin; paso(); return true; }
      if (pin !== primero) { primero = null; toast('Los PIN no son iguales. Intenta otra vez.'); paso(); return true; }
      api('/auth/nuevo-pin', { method: 'POST', token: p.token, body: { hash_pin: sha256(pin + ':' + p.codigo) } }).then(() => {
        const ps = perfiles(); const pp = ps.find(x => x.estudiante_id === p.estudiante_id);
        pp.sal = uid(); pp.hash_pin = hashPin(pin, pp.sal); pp.fallos = 0; pp.bloqueoHasta = 0; guardarPerfiles(ps);
        toast('¡Listo! Ya tienes PIN nuevo.'); abrirSesion(pp); ir('#/e/inicio');
      }).catch(e => { toast(e.message); ir('#/pin'); });
      return true;
    }
  });
  paso();
}

// --- E2: inicio
function vInicio() {
  if (!requiereEst()) return;
  const sig = siguienteLeccion();
  const nuevos = D.refuerzos.filter(r => !r.visto);
  const pendientes = D.refuerzos.filter(r => !r.hecho);
  const paqueteNuevo = D.paquetes.filter(p => !D.borrados.includes(p.id)).slice(-1)[0];
  const matCamino = sig ? materiaDe(sig) : D.materias[0];
  let continua = '';
  if (sig) {
    const m = materiaDe(sig), lecs = leccionesDe(m.id), hechas = lecs.filter(l => completada(l.id)).length;
    continua = `<div class="card destacada">
      <div class="etiqueta">${D.progreso[sig.id] ? 'Continúa donde quedaste' : 'Tu siguiente lección'}</div>
      <h2 class="t-leccion">${esc(sig.titulo)}</h2>
      <p class="muted small" style="margin:0 0 14px">${esc(m.nombre)} · Nivel ${sig.nivel_bloom}: ${BLOOM[sig.nivel_bloom - 1].nombre}</p>
      <div class="fila" style="margin-bottom:16px"><div class="barra crece"><i style="width:${lecs.length ? hechas / lecs.length * 100 : 0}%"></i></div><b class="small">${hechas} de ${lecs.length}</b></div>
      <button class="btn claro" data-go="#/e/leccion/${sig.id}">${ic('play')} Seguir estudiando</button></div>`;
  } else continua = `<div class="card center">${D.materias.length ? 'Terminaste todo lo descargado. Sincroniza en el Centro Digital para recibir más lecciones.' : 'Todavía no tienes lecciones. Sincroniza en el Centro Digital.'}</div>`;
  marco({
    titulo: 'EduRural', nav: NAV_EST, contenido: `
    <h1 class="hola">Hola, ${esc(perfil.nombre.split(' ')[0])}</h1>
    <p class="muted">Todo tu contenido está guardado en el teléfono. Puedes estudiar sin internet.</p>
    ${nuevos.length ? `<div class="card aviso click fila" data-go="#/e/refuerzos"><span class="icono-g ambar chico">${ic('correo')}</span><div class="crece"><b>¡Tu profe te envió ${nuevos.length === 1 ? 'un refuerzo' : nuevos.length + ' refuerzos'}!</b><br><span class="small">Toca aquí para verlo.</span></div><span class="flecha">${ic('flecha')}</span></div>`
      : pendientes.length ? `<div class="card click fila" data-go="#/e/refuerzos"><span class="icono-g ambar chico">${ic('correo')}</span><span class="crece">Tienes ${pendientes.length} refuerzo(s) por hacer</span><span class="flecha">${ic('flecha')}</span></div>` : ''}
    ${continua}
    ${matCamino ? caminoHtml(matCamino) : ''}
    <div class="grid3">
      <div class="mini"><b>${ic('llama', 'ambar')} ${racha()}</b><span>días seguidos</span></div>
      <div class="mini"><b>${Object.values(D.progreso).filter(p => p.estado === 'completada').length}</b><span>lecciones</span></div>
      <div class="mini"><b>${D.cola.length}</b><span>por enviar</span></div>
    </div>
    <div class="seccion"><h2>Mis materias</h2><a href="#/e/materia" class="small">Ver todas</a></div>
    <div class="grid2">${D.materias.map(tarjetaMateria).join('')}</div>`
  });
  $$('[data-go]').forEach(el => el.onclick = () => ir(el.dataset.go));
}
function caminoHtml(m) {
  const niveles = estadoNiveles(m.id), hechos = niveles.filter(n => n.estado === 'completado'), actual = niveles.find(n => n.estado === 'en_curso');
  const txt = hechos.length ? `Completaste ${hechos.map(n => n.nombre).join(', ').replace(/, ([^,]*)$/, ' y $1')}. ` : '';
  return `<div class="card click" data-go="#/e/materia/${m.id}">
    <div class="fila" style="margin-bottom:12px"><b class="crece">Tu camino de aprendizaje</b><span class="small muted">${esc(m.nombre)}</span></div>
    <div class="camino-seg">${niveles.map(n => `<div><i class="${n.estado}"></i><span>${n.n}</span></div>`).join('')}</div>
    <p class="small" style="margin:10px 0 0">${txt}${actual ? `Ahora estás en <b>${actual.nombre}</b>.` : '¡Completaste todos los niveles!'}</p></div>`;
}
function tarjetaMateria(m) {
  const lecs = leccionesDe(m.id), hechas = lecs.filter(l => completada(l.id)).length;
  return `<div class="card click t-materia" data-go="#/e/materia/${m.id}"><span class="letra">${esc(m.nombre[0])}</span>
    <b>${esc(m.nombre)}</b><span class="small muted">${hechas} de ${lecs.length} lecciones</span>
    <div class="barra" style="margin-top:10px;height:6px"><i style="width:${lecs.length ? hechas / lecs.length * 100 : 0}%"></i></div></div>`;
}
function vMaterias() {
  if (!requiereEst()) return;
  marco({
    titulo: 'Materias', nav: NAV_EST, contenido: `<p class="muted">Elige una materia para ver sus 6 niveles.</p>
    ${D.materias.map(m => `${caminoHtml(m).replace('Tu camino de aprendizaje', `<span class="fila" style="gap:10px"><span class="letra">${esc(m.nombre[0])}</span>${esc(m.nombre)}</span>`).replace(`<span class="small muted">${esc(m.nombre)}</span>`, `<span class="small muted">${leccionesDe(m.id).filter(l => descargada(l.id)).length} guardadas</span>`)}`).join('') || '<p class="muted">Sincroniza para recibir tus materias.</p>'}`
  });
  $$('[data-go]').forEach(el => el.onclick = () => ir(el.dataset.go));
}
const materiaDe = l => D.materias.find(m => m.id === l.materia_id) || { nombre: '' };

// --- E3: niveles de Bloom
function vMateria(id) {
  if (!requiereEst()) return;
  const m = D.materias.find(x => x.id === Number(id)); if (!m) return ir('#/e/inicio');
  const niveles = estadoNiveles(m.id);
  marco({
    titulo: m.nombre, atras: '#/e/inicio', nav: NAV_EST, contenido: `
    <p class="muted">Sube nivel por nivel. Cada nivel se abre cuando terminas el anterior.</p>
    <div class="camino">${niveles.map(n => `
      <div class="nivel ${n.estado}">
        <div class="num" style="background:${n.color}">${n.estado === 'completado' ? ic('check') : n.estado === 'bloqueado' ? ic('candado') : n.n}</div>
        <div class="card">
          <div class="fila"><div class="crece"><b>Nivel ${n.n}: ${n.nombre}</b><br><span class="small muted">${n.desc}</span></div>
          <span class="estado ${n.estado}">${{ completado: 'Completado', en_curso: 'En curso', bloqueado: 'Bloqueado' }[n.estado]}</span></div>
          ${n.lecs.map(l => {
            const ok = descargada(l.id), abierto = n.estado !== 'bloqueado' && ok;
            const est = completada(l.id) ? ic('checkc', 'verde') : D.progreso[l.id] ? ic('playc', 'ambar') : abierto ? ic('circulo', 'gris') : ic('candado', 'gris');
            return `<button class="leccion-item" ${abierto ? `data-go="#/e/leccion/${l.id}"` : 'disabled'}><span>${est}</span><span class="crece" style="flex:1">${esc(l.titulo)}<br>
              <span class="small muted">${!ok ? 'Aún no descargada: sincroniza en el Centro Digital' : n.estado === 'bloqueado' ? 'Termina el nivel anterior' : l.tamano_mb + ' MB guardados'}</span></span></button>`;
          }).join('') || '<p class="small muted" style="margin-top:8px">Sin lecciones todavía.</p>'}
        </div>
      </div>`).join('')}</div>`
  });
  $$('[data-go]').forEach(el => el.onclick = () => ir(el.dataset.go));
}

// --- E4: lección
let leccionActiva = null, videoT = null;
function cerrarLeccionActiva() {
  clearInterval(videoT);
  if (leccionActiva && D) {
    const seg = Math.round((Date.now() - leccionActiva.inicio) / 1000);
    if (seg >= 3) encolar({ tipo: 'tiempo', leccion_id: leccionActiva.id, segundos: seg });
  }
  leccionActiva = null;
}
function vLeccion(id) {
  if (!requiereEst()) return;
  const l = D.lecciones[id]; if (!l || !disponible(l)) return ir('#/e/inicio');
  const m = materiaDe(l);
  D.ultimaLeccion = l.id;
  if (!D.progreso[l.id]) { D.progreso[l.id] = { estado: 'en_curso', porcentaje: 0, actualizado: fechaLocal() }; encolar({ tipo: 'progreso', leccion_id: l.id, estado: 'en_curso', porcentaje: 0 }); }
  encolar({ tipo: 'leccion_vista', leccion_id: l.id });
  leccionActiva = { id: l.id, inicio: Date.now() };
  const escenas = l.escenas?.length ? l.escenas : [l.titulo];
  marco({
    titulo: l.titulo, atras: `#/e/materia/${m.id}`, nav: NAV_EST, contenido: `
    <p class="small muted">${esc(m.nombre)} · <b style="color:${BLOOM[l.nivel_bloom - 1].color}">Nivel ${l.nivel_bloom}: ${BLOOM[l.nivel_bloom - 1].nombre}</b></p>
    <div class="video" id="video" aria-label="Video de la lección">
      <span class="etq">360p · guardado en el teléfono</span>
      <div class="ilus">${icMateria(m)}</div>
      <button class="play" id="play" aria-label="Reproducir video">${ic('play')}</button>
      <div class="escena" id="escena" hidden></div>
      <div class="pb"><i id="pb" style="width:0"></i></div>
    </div>
    <div class="contenido card">${l.contenido.map(p => `<p>${esc(p)}</p>`).join('')}</div>
    <div class="card fila"><span class="icono-g">${ic('lista')}</span><div class="crece"><b>Cuestionario</b><br><span class="small muted">${(D.preguntas[l.id] || []).length} preguntas · Necesitas 60 % para completar</span></div></div>
    <button class="btn bloque grande" data-go="#/e/quiz/${l.id}">Hacer el cuestionario</button>`
  });
  $('[data-go]').onclick = () => { quiz = null; ir(`#/e/quiz/${l.id}`); };
  $('#play').onclick = () => {
    let i = 0; const esc_ = $('#escena'); $('#play').hidden = true; esc_.hidden = false;
    const mostrar = () => { esc_.textContent = escenas[i]; esc_.style.animation = 'none'; void esc_.offsetWidth; esc_.style.animation = ''; $('#pb').style.width = ((i + 1) / escenas.length * 100) + '%'; };
    mostrar(); clearInterval(videoT);
    videoT = setInterval(() => {
      i++; if (i >= escenas.length) { clearInterval(videoT); $('#play').hidden = false; $('#play').innerHTML = ic('repetir'); esc_.hidden = true; return; }
      mostrar();
    }, 2600);
  };
}

// --- E5: cuestionario
let quiz = null;
function vQuiz(id) {
  if (!requiereEst()) return;
  const l = D.lecciones[id]; const ps = D.preguntas[id] || [];
  if (!l || !disponible(l) || !ps.length) return ir('#/e/inicio');
  if (!quiz || quiz.lid !== l.id) quiz = { lid: l.id, idx: 0, resp: [], intento: (D.intentos[l.id] || 0) + 1, pista: false, elegida: null };
  if (quiz.idx >= ps.length) return ir(`#/e/resultado/${l.id}`);
  const p = ps[quiz.idx]; const respondida = quiz.elegida !== null;
  marco({
    titulo: 'Cuestionario', atras: `#/e/leccion/${l.id}`, contenido: `
    <div class="fila small muted" style="margin-bottom:6px"><span class="crece">${esc(l.titulo)}</span><span>Pregunta ${quiz.idx + 1} de ${ps.length}</span></div>
    <div class="barra" style="margin-bottom:16px"><i style="width:${quiz.idx / ps.length * 100}%"></i></div>
    <h2 style="font-size:1.25rem;margin-bottom:16px">${esc(p.enunciado)}</h2>
    ${p.opciones.map((o, i) => {
      let cls = ''; if (respondida) { if (i === p.respuesta_correcta) cls = 'bien'; else if (i === quiz.elegida) cls = 'mal'; }
      return `<button class="opcion ${cls}" data-op="${i}" ${respondida ? 'disabled' : ''}><b>${'ABCD'[i]}.</b> ${esc(o)}</button>`;
    }).join('')}
    ${respondida ? `<div class="feedback ${quiz.elegida === p.respuesta_correcta ? 'bien' : 'mal'}">${quiz.elegida === p.respuesta_correcta ? ic('checkc') + ' ¡Muy bien! Respuesta correcta.' : `${ic('equis')} No es esa. La correcta es: <b>${esc(p.opciones[p.respuesta_correcta])}</b>`}</div>
      <button class="btn bloque grande" id="sig">${quiz.idx + 1 < ps.length ? 'Siguiente pregunta' : 'Ver mi resultado'}</button>`
      : quiz.pista ? `<div class="pista">${ic('foco')} <b>Pista:</b> ${esc(p.pista)}</div>` : `<button class="btn sec bloque" id="pista">${ic('foco')} Ver una pista</button>`}`
  });
  $('#pista')?.addEventListener('click', () => { quiz.pista = true; vQuiz(id); });
  $$('[data-op]').forEach(b => b.onclick = () => {
    const i = Number(b.dataset.op); const ok = i === p.respuesta_correcta;
    quiz.elegida = i; quiz.resp.push({ pregunta_id: p.id, opcion: i, correcta: ok });
    encolar({ tipo: 'respuesta', pregunta_id: p.id, opcion: i, correcta: ok, intento: quiz.intento, uso_pista: quiz.pista });
    vQuiz(id);
  });
  $('#sig')?.addEventListener('click', () => {
    quiz.idx++; quiz.elegida = null; quiz.pista = false;
    if (quiz.idx >= ps.length) terminarQuiz(l, ps); else vQuiz(id);
  });
}
function terminarQuiz(l, ps) {
  const aciertos = quiz.resp.filter(r => r.correcta).length, total = ps.length, pct = Math.round(aciertos * 100 / total);
  const pasa = pct >= 60;
  D.intentos[l.id] = quiz.intento;
  const antes = D.progreso[l.id];
  if (pasa) D.progreso[l.id] = { estado: 'completada', porcentaje: 100, actualizado: fechaLocal() };
  else if (!antes || (antes.estado !== 'completada' && antes.porcentaje < pct)) D.progreso[l.id] = { estado: 'en_curso', porcentaje: pct, actualizado: fechaLocal() };
  encolar({ tipo: 'progreso', leccion_id: l.id, estado: D.progreso[l.id].estado, porcentaje: D.progreso[l.id].porcentaje });
  D.historial.push({ leccion_id: l.id, aciertos, total, pasa, fecha: fechaLocal(), fallidas: quiz.resp.filter(r => !r.correcta).map(r => r.pregunta_id), intento: quiz.intento });
  // si era un refuerzo con ejercicios, marcarlo como hecho
  D.refuerzos.filter(r => r.leccion_id === l.id && !r.hecho).forEach(r => { r.hecho = true; });
  guardar(); quiz = null;
  ir(`#/e/resultado/${l.id}`);
}

// --- E6: resultado
function vResultado(id) {
  if (!requiereEst()) return;
  const l = D.lecciones[id]; const h = [...D.historial].reverse().find(x => x.leccion_id === Number(id));
  if (!l || !h) return ir('#/e/inicio');
  const ps = D.preguntas[l.id] || [];
  const niveles = estadoNiveles(l.materia_id); const nv = niveles.find(n => n.n === l.nivel_bloom); const sig = niveles.find(n => n.n === l.nivel_bloom + 1);
  let falta;
  if (!h.pasa) falta = `Necesitas al menos ${Math.ceil(h.total * 0.6)} de ${h.total} respuestas correctas para completar esta lección. ¡Repasa e inténtalo otra vez!`;
  else if (nv.estado === 'completado' && sig) {
    const descarg = sig.lecs.some(x => descargada(x.id));
    falta = `¡Desbloqueaste el nivel ${sig.n}: ${sig.nombre}!${descarg ? '' : ' Sincroniza en el Centro Digital para descargar sus lecciones.'}`;
  } else if (nv.estado === 'completado') falta = '¡Completaste todos los niveles de esta materia!';
  else { const quedan = nv.lecs.filter(x => !completada(x.id)); falta = `Para pasar al siguiente nivel te falta: ${quedan.map(x => x.titulo).join(', ')}.`; }
  const repasar = ps.filter(p => h.fallidas.includes(p.id));
  marco({
    titulo: 'Tu resultado', atras: `#/e/materia/${l.materia_id}`, nav: NAV_EST, contenido: `
    <div class="card center"><div class="icono-res ${h.pasa ? '' : 'ambar'}">${ic(h.pasa ? (h.aciertos === h.total ? 'estrella' : 'trofeo') : 'subida')}</div>
      <div class="puntaje">${h.aciertos}/${h.total}</div><p class="muted">respuestas correctas</p>
      <span class="estado ${h.pasa ? 'completado' : 'en_curso'}">${h.pasa ? 'Lección completada' : 'Sigue practicando'}</span></div>
    <div class="card ${h.pasa ? '' : 'aviso'}"><b>¿Qué sigue?</b><p style="margin:6px 0 0">${esc(falta)}</p></div>
    ${repasar.length ? `<div class="card"><b>Preguntas para repasar</b>${repasar.map(p => `<div style="margin-top:10px"><p style="margin:0">${esc(p.enunciado)}</p><p class="small" style="margin:0;color:var(--verde)">${ic('check')} ${esc(p.opciones[p.respuesta_correcta])}</p></div>`).join('')}</div>` : ''}
    <p class="small muted center">Tus respuestas quedaron guardadas en el teléfono y se enviarán cuando sincronices.</p>
    <div class="acciones"><button class="btn sec" data-rep>Repetir</button><button class="btn" data-vol>Continuar</button></div>`
  });
  $('[data-rep]').onclick = () => { quiz = null; ir(`#/e/leccion/${l.id}`); };
  $('[data-vol]').onclick = () => ir(h.pasa && siguienteLeccion() ? `#/e/inicio` : `#/e/materia/${l.materia_id}`);
}

// --- E7: sincronizar y almacenamiento
async function sincronizar(log) {
  log('Buscando el servidor del Centro Digital…');
  if (!(await ping())) throw new Error('No hay conexión. Conéctate al wifi del Centro Digital y vuelve a intentar.');
  let enviados = 0;
  while (D.cola.length) {
    const lote = D.cola.slice(0, 500);
    log(`Enviando ${lote.length} registros (respuestas, progreso y tiempo)…`);
    const r = await api('/sync/push', { method: 'POST', token: perfil.token, body: { dispositivo_id: perfil.dispositivo_id, version_app: VERSION_APP, eventos: lote } });
    const ok = new Set(r.aceptados); D.cola = D.cola.filter(e => !ok.has(e.id_evento)); guardar();
    enviados += r.nuevos; if (r.duplicados) log(`(${r.duplicados} ya estaban en el servidor; no se duplicaron)`);
    if (!ok.size) break;
  }
  if (!enviados && !D.cola.length) await api('/sync/push', { method: 'POST', token: perfil.token, body: { dispositivo_id: perfil.dispositivo_id, version_app: VERSION_APP, eventos: [] } });
  log('Recibiendo novedades…');
  const r = await api('/sync/pull?desde=' + encodeURIComponent(D.desde || ''), { token: perfil.token });
  D.materias = r.materias;
  r.lecciones.forEach(l => { D.lecciones[l.id] = l; D.preguntas[l.id] = []; });
  r.preguntas.forEach(p => (D.preguntas[p.leccion_id] ||= []).push(p));
  D.paquetes = r.paquetes;
  for (const p of r.progreso) { // recupera progreso del servidor (por ejemplo, en un teléfono nuevo)
    const loc = D.progreso[p.leccion_id], rank = { pendiente: 0, en_curso: 1, completada: 2 };
    if (!loc || rank[p.estado] > rank[loc.estado]) D.progreso[p.leccion_id] = { estado: p.estado, porcentaje: p.porcentaje, actualizado: p.actualizado };
  }
  let nuevosRef = 0;
  for (const rf of r.refuerzos) if (!D.refuerzos.some(x => x.id === rf.id)) { D.refuerzos.push({ ...rf, visto: false, hecho: false }); nuevosRef++; }
  D.desde = r.servidor_hora; guardar();
  const quieren = new Set(D.paquetes.filter(p => !D.borrados.includes(p.id)).flatMap(p => p.lecciones));
  const nuevas = [...quieren].filter(id => !descargada(id) && D.lecciones[id]);
  if (nuevas.length) {
    const mb = Math.round(nuevas.reduce((a, id) => a + D.lecciones[id].tamano_mb, 0) * 10) / 10;
    log(`Descargando ${nuevas.length} lecciones nuevas (${mb} MB)…`);
    for (let i = 0; i < nuevas.length; i++) { D.descargadas.push(nuevas[i]); guardar(); log(`  ✓ ${D.lecciones[nuevas[i]].titulo}`, (i + 1) / nuevas.length); await new Promise(res => setTimeout(res, 180)); }
  }
  if (r.refuerzos.length) await api('/sync/push', { method: 'POST', token: perfil.token, body: { dispositivo_id: perfil.dispositivo_id, eventos: r.refuerzos.map(rf => ({ id_evento: 'ack-' + rf.id + '-' + perfil.dispositivo_id, tipo: 'refuerzo_recibido', refuerzo_id: rf.id, fecha_local: fechaLocal() })) } }).catch(() => { });
  D.ultimaSync = new Date().toISOString(); guardar();
  return { enviados, nuevas: nuevas.length, refuerzos: nuevosRef };
}
function vSync() {
  if (!requiereEst()) return;
  const paqs = D.paquetes.map(p => ({ ...p, guardadas: p.lecciones.filter(id => descargada(id)).length }));
  marco({
    titulo: 'Sincronizar', nav: NAV_EST, contenido: `
    <div class="card">
      <div class="fila"><span class="icono-g">${ic('sync')}</span><div class="crece"><b>Centro Digital</b><br><span class="small muted">Última sincronización: ${hace(D.ultimaSync)}</span></div></div>
      <p class="small" style="margin:12px 0">${ic('subir')} Por enviar: <b>${D.cola.length}</b> registros &nbsp; ${ic('correo')} Refuerzos: <b>${D.refuerzos.length}</b></p>
      <button class="btn bloque grande" id="sync">Sincronizar ahora</button>
      <div class="barra" style="margin-top:12px" hidden id="pbw"><i id="pb" style="width:0"></i></div>
      <div class="log" id="log" hidden></div>
    </div>
    <h2 style="margin-top:20px">Espacio en el teléfono</h2>
    <div class="card"><div class="fila"><div class="crece"><b>${espacioMb()} MB</b> usados por EduRural</div><span class="small muted">${D.descargadas.length} lecciones</span></div>
      <div class="barra" style="margin-top:8px"><i style="width:${Math.min(100, espacioMb() / 2)}%"></i></div><p class="small muted" style="margin:6px 0 0">Límite sugerido: 200 MB</p></div>
    ${paqs.map(p => `<div class="card"><div class="fila"><span class="icono-g">${ic('paquete')}</span><div class="crece"><b>${esc(p.titulo)}</b><br>
      <span class="small muted">${p.lecciones.length} lecciones · ${p.tamano_mb} MB · ${D.borrados.includes(p.id) ? 'borrado del teléfono' : p.guardadas + ' guardadas'}</span></div>
      ${D.borrados.includes(p.id) ? `<button class="btn sec chico" data-rec="${p.id}">Volver a bajar</button>` : `<button class="btn sec chico" data-del="${p.id}">Borrar</button>`}</div></div>`).join('') || '<p class="muted">Sin paquetes todavía.</p>'}
    <div class="card" style="margin-top:20px"><label class="check"><input type="checkbox" id="avion" ${offlineSimulado() ? 'checked' : ''}> ${ic('avion')} Simular modo avión (para la demostración)</label>
      <p class="small muted" style="margin:0">Con esto activo, la app se comporta como si no hubiera señal. Todo sigue funcionando menos sincronizar.</p></div>`
  });
  $('#sync').onclick = async () => {
    const btn = $('#sync'), lg = $('#log'); btn.disabled = true; lg.hidden = false; lg.textContent = ''; $('#pbw').hidden = false;
    const log = (t, frac) => { lg.textContent += t + '\n'; if (frac !== undefined) $('#pb').style.width = frac * 100 + '%'; };
    try {
      const r = await sincronizar(log);
      $('#pb').style.width = '100%';
      log(`\n¡Listo! Enviados: ${r.enviados}. Lecciones nuevas: ${r.nuevas}. Refuerzos nuevos: ${r.refuerzos}.`);
      toast('Sincronización completa');
      setTimeout(() => { if (location.hash === '#/e/sync') vSync(); if (r.refuerzos) toast('Tienes un refuerzo nuevo de tu profe'); }, 1600);
    } catch (e) { log('\nAtención: ' + e.message + '\nTus respuestas siguen guardadas. Se enviarán la próxima vez, sin duplicarse.'); btn.disabled = false; }
  };
  $$('[data-del]').forEach(b => b.onclick = () => {
    const p = D.paquetes.find(x => x.id === Number(b.dataset.del));
    if (!confirm(`¿Borrar "${p.titulo}" del teléfono? Tu progreso no se pierde.`)) return;
    D.borrados.push(p.id);
    const otras = new Set(D.paquetes.filter(x => !D.borrados.includes(x.id)).flatMap(x => x.lecciones));
    D.descargadas = D.descargadas.filter(id => otras.has(id)); guardar(); toast('Paquete borrado'); vSync();
  });
  $$('[data-rec]').forEach(b => b.onclick = () => { D.borrados = D.borrados.filter(x => x !== Number(b.dataset.rec)); guardar(); toast('Se volverá a descargar al sincronizar'); vSync(); });
  $('#avion').onchange = e => { store.set('er_offline', e.target.checked); ping(); toast(e.target.checked ? 'Modo avión simulado: sin conexión' : 'Conexión restablecida'); };
}

// --- E8: logros
function racha() {
  const dias = new Set(D.diasActivos); let n = 0; const d = new Date();
  if (!dias.has(hoy())) d.setDate(d.getDate() - 1);
  while (dias.has(fechaLocal(d).slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function vLogros() {
  if (!requiereEst()) return;
  const hechas = Object.values(D.progreso).filter(p => p.estado === 'completada').length;
  const maxNivel = Math.max(0, ...D.materias.map(m => estadoNiveles(m.id).filter(n => n.estado === 'completado').length));
  const r = racha();
  const insignias = [
    ['cohete', 'Primer paso', D.historial.length >= 1], ['llama', 'Racha de 3 días', r >= 3], ['estrella', 'Cuestionario perfecto', D.historial.some(h => h.aciertos === h.total)],
    ['libro', '5 lecciones', hechas >= 5], ['capas', 'Llegaste a Aplicar', maxNivel >= 2], ['sync', 'Sincronizador', !!D.ultimaSync]
  ];
  marco({
    titulo: 'Mis logros', nav: NAV_EST, contenido: `
    <div class="card fila"><span class="avatar">${esc(perfil.nombre[0])}</span><div class="crece"><b>${esc(perfil.nombre)}</b><br><span class="small muted">${esc(perfil.codigo)} · ${perfil.grado}° · ${esc(perfil.sede || '')}</span></div></div>
    <div class="grid2"><div class="stat"><b>${r}</b>días seguidos</div><div class="stat"><b>${hechas}</b>lecciones terminadas</div></div>
    <h2 style="margin-top:20px">Insignias</h2>
    <div class="insignias">${insignias.map(([ico, t, ok]) => `<div class="insignia ${ok ? '' : 'no'}"><span>${ic(ico)}</span>${t}</div>`).join('')}</div>
    <h2 style="margin-top:20px">Avance por materia</h2>
    ${D.materias.map(m => { const ls = leccionesDe(m.id); const n = ls.filter(l => completada(l.id)).length; const pct = ls.length ? Math.round(n * 100 / ls.length) : 0;
      return `<div class="card"><div class="fila" style="margin-bottom:8px"><span class="icono-g chico">${icMateria(m)}</span><b class="crece">${esc(m.nombre)}</b><span class="small">${pct} %</span></div><div class="barra"><i style="width:${pct}%"></i></div></div>`; }).join('')}
    <div class="acciones" style="margin-top:20px"><button class="btn sec" data-salir>Cerrar sesión</button></div>`
  });
  $('[data-salir]').onclick = () => { cerrarSesionEst(); pinSel = null; ir('#/pin'); };
}

// --- Refuerzos recibidos
function vRefuerzos() {
  if (!requiereEst()) return;
  const lista = [...D.refuerzos].reverse();
  D.refuerzos.forEach(r => { r.visto = true; }); guardar();
  const nombres = { video: ic('video') + ' Ver el video de repaso', ejercicios: ic('lapiz') + ' Hacer los ejercicios otra vez', ficha: ic('impresora') + ' Ficha para imprimir' };
  marco({
    titulo: 'Mis refuerzos', atras: '#/e/inicio', nav: NAV_EST, contenido: lista.map(r => {
      const l = D.lecciones[r.leccion_id];
      return `<div class="card ${r.hecho ? '' : 'aviso'}"><div class="small muted">De ${esc(r.docente)} · ${fechaCorta(r.creado)}</div>
        ${r.mensaje ? `<p style="margin:8px 0;font-size:1.05rem">${ic('mensaje')} “${esc(r.mensaje)}”</p>` : ''}
        <p style="margin:4px 0"><b>${esc(l?.titulo || 'Lección')}</b> ${r.hecho ? '<span class="estado completado">Hecho</span>' : ''}</p>
        ${r.actividades.map(a => `<button class="leccion-item" data-act="${a}" data-l="${r.leccion_id}">${nombres[a]}</button>`).join('')}</div>`;
    }).join('') || '<p class="muted center">No tienes refuerzos por ahora.</p>'
  });
  $$('[data-act]').forEach(b => b.onclick = () => {
    const lid = b.dataset.l, l = D.lecciones[lid];
    if (!l || !descargada(lid)) return toast('Esa lección no está en tu teléfono. Sincroniza primero.');
    if (b.dataset.act === 'ficha') return ir(`#/e/ficha/${lid}`);
    if (b.dataset.act === 'ejercicios') { quiz = null; return ir(`#/e/quiz/${lid}`); }
    ir(`#/e/leccion/${lid}`);
  });
}
function vFicha(id) {
  if (!requiereEst()) return;
  const l = D.lecciones[id]; if (!l) return ir('#/e/refuerzos');
  marco({
    titulo: 'Ficha imprimible', atras: '#/e/refuerzos', contenido: `
    <div class="card"><h2>${esc(l.titulo)}</h2><p class="small muted">${esc(materiaDe(l).nombre)} · Nivel ${l.nivel_bloom}: ${BLOOM[l.nivel_bloom - 1].nombre} · Nombre: ____________________</p>
    ${l.contenido.map(p => `<p>${esc(p)}</p>`).join('')}<h3>Practica</h3>
    ${(D.preguntas[l.id] || []).map((p, i) => `<p><b>${i + 1}.</b> ${esc(p.enunciado)}<br>${p.opciones.map((o, k) => `☐ ${'ABCD'[k]}. ${esc(o)}`).join('&nbsp;&nbsp; ')}</p>`).join('')}</div>
    <button class="btn bloque no-print" onclick="window.print()">${ic('impresora')} Imprimir o guardar en PDF</button>`
  });
}

// ================================================================= DOCENTE
let DS = store.get('er_docente', null) || (() => { try { return JSON.parse(sess.get('er_docente') || 'null'); } catch { return null; } })();
function guardarDS() {
  if (!DS) { store.del('er_docente'); sess.del('er_docente'); return; }
  if (DS.recordar) store.set('er_docente', DS); else { store.del('er_docente'); sess.set('er_docente', JSON.stringify(DS)); }
}
function cerrarDocente() { DS = null; guardarDS(); }
async function dapi(path, opts = {}) {
  const method = opts.method || 'GET', clave = 'er_cache_' + DS.usuario.id + path;
  try {
    let r;
    try { r = await api(path, { ...opts, token: DS.access }); }
    catch (e) {
      if (e.status !== 401) throw e;
      const t = await api('/auth/refresh', { method: 'POST', body: { refresh: DS.refresh } });
      DS.access = t.access; guardarDS();
      r = await api(path, { ...opts, token: DS.access });
    }
    if (method === 'GET') store.set(clave, { t: Date.now(), data: r });
    return r;
  } catch (e) {
    if (e.status === 401) { cerrarDocente(); toast('Tu sesión venció. Entra otra vez.'); ir('#/d/login'); throw e; }
    if (method === 'GET' && !e.status) { const c = store.get(clave, null); if (c) return Object.assign(c.data, { __cache: c.t }); }
    throw e;
  }
}
const grupoActual = () => DS.grupos.find(g => g.id === DS.grupoId) || DS.grupos[0];
function requiereDoc() { if (!DS) { ir('#/d/login'); return false; } if (!DS.grupos.length) { marco({ titulo: 'Panel', contenido: '<div class="card">No tienes grupos asignados. Pídele al administrador que te asigne uno.</div><button class="btn sec" onclick="salirDoc()">Cerrar sesión</button>' }); return false; } return true; }
window.salirDoc = () => { cerrarDocente(); ir('#/perfil'); };
function marcoDoc(titulo, contenido, atras) {
  marco({ titulo, atras, nav: NAV_DOC, contenido });
}
const bannerCache = d => d?.__cache ? `<div class="banner-cache">${ic('sinred')} Sin conexión: mostrando los datos guardados ${hace(new Date(d.__cache).toISOString())}</div>` : '';
async function cargando(titulo, atras, fn) {
  marcoDoc(titulo, '<p class="muted">Cargando…</p>', atras);
  try { await fn(); } catch (e) { if (e.status !== 401) marcoDoc(titulo, `<div class="card alerta">${ic('alerta')} ${esc(e.message)}</div><button class="btn sec" onclick="router()">Reintentar</button>`, atras); }
}

// --- A3: ingreso del docente
function vDLogin() {
  if (DS) return ir('#/d/panel');
  marco({
    titulo: 'Ingreso docente', atras: '#/perfil', contenido: `
    <div class="center" style="padding:16px 0"><div class="icono-g ambar grande">${ic('pizarra')}</div><h2>Bienvenido, profe</h2><p class="muted">Usa tu correo institucional</p></div>
    <form id="f">
      <label for="co">Correo</label><input id="co" type="email" required autocomplete="username">
      <label for="pw">Contraseña</label><div class="pass-wrap"><input id="pw" type="password" required autocomplete="current-password"><button type="button" class="enlace" id="ver">Mostrar</button></div>
      <label class="check"><input type="checkbox" id="rec" checked> Mantener la sesión abierta</label>
      <div id="err" class="error" role="alert"></div>
      <button class="btn bloque grande" style="margin-top:8px">Entrar</button>
    </form>
    <div class="center"><button class="enlace" id="olv">¿Olvidaste tu contraseña?</button></div>
    <div class="card small muted" style="margin-top:16px">Demo: <b>docente@edurural.test</b> / <b>docente123</b></div>`
  });
  $('#ver').onclick = () => { const i = $('#pw'); i.type = i.type === 'password' ? 'text' : 'password'; $('#ver').textContent = i.type === 'password' ? 'Mostrar' : 'Ocultar'; };
  $('#f').onsubmit = async e => {
    e.preventDefault(); $('#err').textContent = '';
    try {
      const r = await api('/auth/login', { method: 'POST', body: { correo: $('#co').value, contrasena: $('#pw').value } });
      if (r.usuario.rol !== 'docente') { $('#err').innerHTML = 'Esta cuenta es de administrador. Usa el <a href="/admin">panel web</a>.'; return; }
      DS = { access: r.access, refresh: r.refresh, usuario: r.usuario, grupos: r.grupos, grupoId: r.grupos[0]?.id, recordar: $('#rec').checked };
      guardarDS(); ir('#/d/panel');
    } catch (ex) { $('#err').textContent = ex.message; }
  };
  $('#olv').onclick = () => {
    const m = modal(`<h2>Recuperar contraseña</h2><label for="rc">Tu correo</label><input id="rc" type="email" value="${esc($('#co').value)}"><div id="rm" class="small" style="margin-top:10px"></div>
      <div class="acciones"><button class="btn sec" data-c>Cerrar</button><button class="btn" data-e>Enviar enlace</button></div>`);
    m.querySelector('[data-c]').onclick = () => m.remove();
    m.querySelector('[data-e]').onclick = async () => {
      try {
        const r = await api('/auth/recuperar', { method: 'POST', body: { correo: m.querySelector('#rc').value } });
        m.querySelector('#rm').innerHTML = esc(r.mensaje) + (r.enlace_demo ? `<br><br><b>Demo (simula el correo):</b> <a href="${esc(r.enlace_demo)}">abrir enlace para cambiar la contraseña</a>` : '');
        m.querySelector('#rm a')?.addEventListener('click', () => m.remove());
      } catch (e) { m.querySelector('#rm').textContent = e.message; }
    };
  };
}
function vRestablecer() {
  const token = new URLSearchParams(location.hash.split('?')[1] || '').get('token');
  marco({
    titulo: 'Nueva contraseña', atras: '#/d/login', contenido: `<form id="f"><label for="n1">Nueva contraseña</label><input id="n1" type="password" minlength="6" required>
    <label for="n2">Repítela</label><input id="n2" type="password" minlength="6" required><div id="err" class="error"></div><button class="btn bloque" style="margin-top:12px">Guardar</button></form>`
  });
  $('#f').onsubmit = async e => {
    e.preventDefault();
    if ($('#n1').value !== $('#n2').value) return ($('#err').textContent = 'No coinciden');
    try { await api('/auth/cambiar', { method: 'POST', body: { token, nueva: $('#n1').value } }); toast('Contraseña cambiada. Ya puedes entrar.'); ir('#/d/login'); }
    catch (ex) { $('#err').textContent = ex.message; }
  };
}

// --- D1: panel
function vDPanel() {
  if (!requiereDoc()) return;
  cargando('Panel', null, async () => {
    const r = await dapi(`/grupos/${grupoActual().id}/resumen`);
    const max = Math.max(1, ...r.distribucion);
    marcoDoc('Panel', `${bannerCache(r)}
      <div class="fila" style="margin-bottom:12px"><div class="crece"><p class="small muted" style="margin:0">Hola, ${esc(DS.usuario.nombre)}</p>
        ${DS.grupos.length > 1 ? `<select id="gsel" aria-label="Grupo">${DS.grupos.map(g => `<option value="${g.id}" ${g.id === grupoActual().id ? 'selected' : ''}>${g.grado}° · ${esc(g.sede)}</option>`).join('')}</select>`
          : `<h2 style="margin:0">${r.grupo.grado}° · ${esc(r.grupo.sede)}</h2>`}
        <p class="small muted" style="margin:0">Código de clase: <b>${esc(r.grupo.codigo_clase)}</b> · Semana del ${fechaCorta(r.semana)}</p></div>
        <button class="btn sec chico" id="salir">Salir</button></div>
      <div class="grid2">
        <div class="stat"><b>${r.activos}/${r.total}</b>activos esta semana</div>
        <div class="stat"><b>${r.cuestionarios}</b>cuestionarios recibidos</div>
        <div class="stat"><b>${r.aciertos_semana ?? '–'}${r.aciertos_semana !== null ? ' %' : ''}</b>aciertos promedio</div>
        <div class="stat rojo"><b>${r.apoyo.length}</b>necesitan apoyo</div>
      </div>
      <div class="card" style="margin-top:12px"><h3>Estudiantes por nivel de Bloom</h3>
        ${BLOOM.map((b, i) => `<div class="hbar"><span class="et">${b.n}. ${b.nombre}</span><div class="barra"><i style="width:${r.distribucion[i] / max * 100}%;background:${b.color}"></i></div><span class="n">${r.distribucion[i]}</span></div>`).join('')}
        ${r.sin_activar ? `<p class="small muted" style="margin:8px 0 0">${r.sin_activar} estudiante(s) aún sin activar su cuenta.</p>` : ''}</div>
      <h2 style="margin-top:20px">Necesitan apoyo</h2>
      ${r.apoyo.map(a => `<div class="card alerta click" data-go="#/d/estudiante/${a.id}"><div class="fila"><span class="avatar" style="background:var(--rojo)">${esc(a.codigo.slice(-2))}</span><div class="crece"><b>${esc(a.codigo)}</b><br><span class="small">${a.apoyo.map(esc).join(' · ')}</span></div><span class="flecha">${ic('flecha')}</span></div></div>`).join('') || '<p class="muted">¡Nadie por ahora!</p>'}`);
    $$('[data-go]').forEach(el => el.onclick = () => ir(el.dataset.go));
    $('#gsel')?.addEventListener('change', e => { DS.grupoId = Number(e.target.value); guardarDS(); vDPanel(); });
    $('#salir').onclick = () => { if (confirm('¿Cerrar sesión?')) { cerrarDocente(); ir('#/perfil'); } };
  });
}

// --- D2: lista de estudiantes
let filtroNivel = '', filtroTxt = '';
function vDEstudiantes() {
  if (!requiereDoc()) return;
  cargando('Estudiantes', null, async () => {
    const todos = await dapi(`/grupos/${grupoActual().id}/estudiantes`);
    marcoDoc('Estudiantes', `${bannerCache(todos)}
      <input type="search" id="q" placeholder="Buscar por código (ej. E-07)" value="${esc(filtroTxt)}" aria-label="Buscar">
      <div class="filtros" role="group" aria-label="Filtrar por nivel"><button data-n="" class="${filtroNivel === '' ? 'activo' : ''}">Todos</button>
        ${BLOOM.map(b => `<button data-n="${b.n}" class="${filtroNivel === String(b.n) ? 'activo' : ''}">${b.n}. ${b.nombre}</button>`).join('')}<button data-n="apoyo" class="${filtroNivel === 'apoyo' ? 'activo' : ''}">Necesitan apoyo</button></div>
      <ul class="lista-est" id="lista"></ul>`);
    const pintar = () => {
      const t = filtroTxt.toLowerCase();
      const ls = todos.filter(s => (!t || s.codigo.toLowerCase().includes(t)) && (filtroNivel === '' || (filtroNivel === 'apoyo' ? s.necesita_apoyo : s.nivel === Number(filtroNivel) && s.activado)));
      $('#lista').innerHTML = ls.map(s => `<li data-id="${s.id}"><span class="avatar" style="background:${s.activado ? BLOOM[s.nivel - 1].color : '#999'}">${esc(s.codigo.slice(-2))}</span>
        <div class="crece"><b>${esc(s.codigo)}</b> ${s.necesita_apoyo ? '<span class="badge rojo">Apoyo</span>' : ''} ${!s.activado ? '<span class="badge gris">Sin activar</span>' : ''}<br>
        <span class="small muted">${s.activado ? `Nivel ${s.nivel}: ${BLOOM[s.nivel - 1].nombre} · ${s.aciertos ?? '–'}${s.aciertos !== null ? ' %' : ''} aciertos · sincronizó ${hace(s.ultima_sync)}` : 'Aún no activa su cuenta'}</span></div><span class="flecha">${ic('flecha')}</span></li>`).join('') || '<p class="muted">No hay estudiantes con ese filtro.</p>';
      $$('#lista li').forEach(li => li.onclick = () => ir('#/d/estudiante/' + li.dataset.id));
    };
    pintar();
    $('#q').oninput = e => { filtroTxt = e.target.value; pintar(); };
    $$('[data-n]').forEach(b => b.onclick = () => { filtroNivel = b.dataset.n; $$('[data-n]').forEach(x => x.classList.toggle('activo', x === b)); pintar(); });
  });
}

// --- D3: detalle del estudiante
function vDEstudiante(id) {
  if (!requiereDoc()) return;
  cargando('Estudiante', '#/d/estudiantes', async () => {
    const s = await dapi(`/estudiantes/${id}`);
    marcoDoc(s.codigo, `${bannerCache(s)}
      <div class="card fila"><span class="avatar" style="width:56px;height:56px;font-size:1.2rem">${esc(s.codigo.slice(-2))}</span><div class="crece"><b style="font-size:1.2rem">${esc(s.codigo)}</b><br>
        <span class="small muted">${ic('celular')} ${esc(s.dispositivo?.modelo || 'Sin dispositivo')} · ${ic('sync')} ${hace(s.ultima_sync)}</span></div></div>
      ${s.apoyo.length ? `<div class="card alerta"><b>${ic('alerta')} Necesita apoyo</b><br><span class="small">${s.apoyo.map(esc).join('<br>')}</span></div>` : ''}
      <div class="grid2"><div class="stat"><b>${s.aciertos ?? '–'}${s.aciertos !== null ? ' %' : ''}</b>aciertos</div><div class="stat"><b>${s.respuestas}</b>respuestas enviadas</div></div>
      <div class="card" style="margin-top:12px"><h3>Camino de Bloom</h3>
        ${s.materias.map(m => `<p style="margin:10px 0 4px">${icMateria(m)} <b>${esc(m.nombre)}</b> <span class="small muted">· en nivel ${m.actual}: ${BLOOM[m.actual - 1].nombre}</span></p>
          <div class="bloom-mini">${BLOOM.map(b => `<i title="${b.nombre}" style="height:12px;background:${b.n <= m.completos ? b.color : b.n === m.actual ? b.color + '55' : ''}"></i>`).join('')}</div>`).join('')}</div>
      <div class="card"><h3>Últimos cuestionarios</h3>
        ${s.cuestionarios.length ? `<table class="tabla"><tr><th>Lección</th><th>Resultado</th><th>Fecha</th></tr>${s.cuestionarios.map(c => `<tr><td>${esc(c.titulo)}<br><span class="small muted">${esc(c.materia)} · N${c.nivel_bloom} · intento ${c.intento}</span></td><td><span class="badge ${c.ok / c.total >= .6 ? '' : 'rojo'}">${c.ok}/${c.total}</span></td><td class="small">${fechaCorta(c.fecha.slice(0, 10))}</td></tr>`).join('')}</table>` : '<p class="muted">Todavía no hay cuestionarios.</p>'}</div>
      ${s.refuerzos.length ? `<div class="card"><h3>Refuerzos asignados</h3>${s.refuerzos.map(r => `<p class="small" style="margin:6px 0">${esc(r.titulo)} · ${r.actividades.join(', ')} · <b>${r.entregado ? 'Entregado' : 'Pendiente de sincronizar'}</b></p>`).join('')}</div>` : ''}
      <div class="acciones"><button class="btn" data-go="#/d/refuerzo/${s.id}">${ic('correo')} Asignar refuerzo</button><button class="btn sec" id="pin">${ic('llave')} Reiniciar PIN</button></div>
      ${s.pin_reiniciado ? '<p class="small muted center">PIN reiniciado: el estudiante debe crear uno nuevo con conexión.</p>' : ''}`, '#/d/estudiantes');
    $('[data-go]').onclick = e => ir(e.currentTarget.dataset.go);
    $('#pin').onclick = async () => {
      if (!confirm(`¿Reiniciar el PIN de ${s.codigo}?`)) return;
      try { const r = await dapi(`/estudiantes/${s.id}/reiniciar-pin`, { method: 'POST' }); toast(r.mensaje); vDEstudiante(id); } catch (e) { toast(e.message); }
    };
  });
}

// --- D4: asignar refuerzo
function vDRefuerzo(id) {
  if (!requiereDoc()) return;
  cargando('Asignar refuerzo', `#/d/estudiante/${id}`, async () => {
    const [s, materias] = await Promise.all([dapi(`/estudiantes/${id}`), dapi(`/contenido/materias?grado=${grupoActual().grado}`)]);
    const sugerida = s.cuestionarios.find(c => c.ok / c.total < .6)?.leccion_id;
    marcoDoc('Asignar refuerzo', `
      <div class="card fila"><span class="avatar">${esc(s.codigo.slice(-2))}</span><div class="crece"><b>Para ${esc(s.codigo)}</b><br><span class="small muted">Le llegará en su próxima sincronización</span></div></div>
      <form id="f">
        <label for="lec">Lección</label>
        <select id="lec">${materias.map(m => `<optgroup label="${esc(m.nombre)}">${m.lecciones.map(l => `<option value="${l.id}" ${l.id === sugerida ? 'selected' : ''}>N${l.nivel_bloom} · ${esc(l.titulo)}</option>`).join('')}</optgroup>`).join('')}</select>
        ${sugerida ? '<p class="small muted">Sugerida: la última lección donde tuvo dificultades.</p>' : ''}
        <label>Actividades</label>
        <label class="check"><input type="checkbox" name="a" value="video" checked> ${ic('video')} Video de repaso</label>
        <label class="check"><input type="checkbox" name="a" value="ejercicios" checked> ${ic('lapiz')} Ejercicios (repetir cuestionario)</label>
        <label class="check"><input type="checkbox" name="a" value="ficha"> ${ic('impresora')} Ficha imprimible</label>
        <label for="msg">Mensaje (opcional)</label><textarea id="msg" maxlength="300" placeholder="Ej.: ¡Tú puedes! Repasa con calma y me cuentas."></textarea>
        <div id="err" class="error"></div>
        <button class="btn bloque grande" style="margin-top:12px">Enviar refuerzo</button>
      </form>`, `#/d/estudiante/${id}`);
    $('#f').onsubmit = async e => {
      e.preventDefault();
      try {
        const r = await dapi(`/estudiantes/${id}/refuerzos`, { method: 'POST', body: { leccion_id: Number($('#lec').value), actividades: $$('input[name=a]:checked').map(i => i.value), mensaje: $('#msg').value } });
        toast(r.mensaje); ir(`#/d/estudiante/${id}`);
      } catch (ex) { $('#err').textContent = ex.message; }
    };
  });
}

// --- D5: paquete semanal
function lunesHoy() { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return fechaLocal(d).slice(0, 10); }
function vDPaquete() {
  if (!requiereDoc()) return;
  cargando('Paquete semanal', null, async () => {
    const g = grupoActual();
    const [materias, paquetes] = await Promise.all([dapi(`/contenido/materias?grado=${g.grado}`), dapi(`/grupos/${g.id}/paquetes`)]);
    const enviadas = new Set(paquetes.flatMap(p => p.lecciones));
    let matSel = materias[0]?.id;
    const sel = new Set();
    const todas = Object.fromEntries(materias.flatMap(m => m.lecciones.map(l => [l.id, l])));
    marcoDoc('Paquete semanal', `
      <p class="muted">Elige las lecciones que tus estudiantes descargarán en el Centro Digital esta semana.</p>
      <div class="filtros" id="mats">${materias.map(m => `<button data-m="${m.id}">${icMateria(m)} ${esc(m.nombre)}</button>`).join('')}</div>
      <div id="lecs"></div>
      <div class="card destacada" style="position:sticky;bottom:72px">
        <div class="fila"><div class="crece"><b id="tot">0 lecciones · 0 MB</b><br><span class="small muted">Semana del ${fechaCorta(lunesHoy())}</span></div></div>
        <input type="text" id="tit" placeholder="Nombre del paquete" value="Semana del ${esc(fechaCorta(lunesHoy()))}" style="margin:10px 0" aria-label="Nombre del paquete">
        <button class="btn claro bloque" id="pub" disabled>Publicar paquete</button>
      </div>
      <h2 style="margin-top:20px">Paquetes publicados</h2>
      ${paquetes.map(p => `<div class="card fila"><span class="icono-g">${ic('paquete')}</span><div class="crece"><b>${esc(p.titulo)}</b><br><span class="small muted">${p.lecciones.length} lecciones · ${p.tamano_mb} MB · ${fechaCorta(p.publicado)}</span></div></div>`).join('') || '<p class="muted">Aún no hay paquetes.</p>'}`);
    const pintar = () => {
      $$('#mats button').forEach(b => b.classList.toggle('activo', Number(b.dataset.m) === matSel));
      const m = materias.find(x => x.id === matSel);
      $('#lecs').innerHTML = BLOOM.map(b => {
        const ls = m.lecciones.filter(l => l.nivel_bloom === b.n); if (!ls.length) return '';
        return `<div class="card"><div class="fila"><b class="crece" style="color:${b.color}">Nivel ${b.n}: ${b.nombre}</b><button class="enlace" data-todo="${b.n}">Todo el nivel</button></div>
          ${ls.map(l => `<label class="check"><input type="checkbox" data-l="${l.id}" ${sel.has(l.id) ? 'checked' : ''}><span style="flex:1">${esc(l.titulo)}${enviadas.has(l.id) ? ' <span class="badge gris">ya enviada</span>' : ''}</span><span class="small muted">${l.tamano_mb} MB</span></label>`).join('')}</div>`;
      }).join('');
      $$('[data-l]').forEach(c => c.onchange = () => { c.checked ? sel.add(Number(c.dataset.l)) : sel.delete(Number(c.dataset.l)); total(); });
      $$('[data-todo]').forEach(b => b.onclick = () => { const ls = m.lecciones.filter(l => l.nivel_bloom === Number(b.dataset.todo)); const todos = ls.every(l => sel.has(l.id)); ls.forEach(l => todos ? sel.delete(l.id) : sel.add(l.id)); pintar(); total(); });
    };
    const total = () => {
      const mb = Math.round([...sel].reduce((a, id) => a + todas[id].tamano_mb, 0) * 10) / 10;
      $('#tot').textContent = `${sel.size} lecciones · ${mb} MB`; $('#pub').disabled = !sel.size;
    };
    $$('#mats button').forEach(b => b.onclick = () => { matSel = Number(b.dataset.m); pintar(); });
    pintar();
    $('#pub').onclick = async () => {
      try { const r = await dapi(`/grupos/${g.id}/paquetes`, { method: 'POST', body: { lecciones: [...sel], titulo: $('#tit').value, semana: lunesHoy() } }); toast(r.mensaje); vDPaquete(); }
      catch (e) { toast(e.message); }
    };
  });
}

// --- D6: reporte semanal
let semanaRep = null;
function vDReporte() {
  if (!requiereDoc()) return;
  semanaRep ||= lunesHoy();
  cargando('Reporte semanal', null, async () => {
    const r = await dapi(`/grupos/${grupoActual().id}/reportes/semanal?semana=${semanaRep}`);
    const max = Math.max(1, ...r.dias.map(d => d.respuestas));
    const cambiar = n => { const d = new Date(semanaRep + 'T12:00:00'); d.setDate(d.getDate() + n * 7); semanaRep = fechaLocal(d).slice(0, 10); vDReporte(); };
    marcoDoc('Reporte semanal', `${bannerCache(r)}
      <div class="fila no-print" style="margin-bottom:10px"><button class="btn sec chico" id="ant">‹ Anterior</button><b class="crece center">${fechaCorta(r.semana)} – ${fechaCorta(r.fin)}</b><button class="btn sec chico" id="sigS" ${semanaRep >= lunesHoy() ? 'disabled' : ''}>Siguiente ›</button></div>
      <div class="card"><h2 style="margin:0">EduRural · Reporte semanal</h2><p class="small muted" style="margin:0">${r.grupo.grado}° · ${esc(r.grupo.sede)} · ${esc(r.grupo.codigo_clase)} · ${fechaCorta(r.semana)} al ${fechaCorta(r.fin)}</p></div>
      <div class="grid2"><div class="stat"><b>${r.activos}/${r.total}</b>estudiantes activos</div><div class="stat"><b>${r.aciertos ?? '–'}${r.aciertos !== null ? ' %' : ''}</b>aciertos</div>
        <div class="stat"><b>${r.cuestionarios}</b>cuestionarios</div><div class="stat"><b>${r.respuestas}</b>respuestas</div></div>
      <div class="card" style="margin-top:12px"><h3>Actividad por día</h3>
        <div class="barras">${r.dias.map(d => `<div class="col"><b>${d.respuestas}</b><i style="height:${d.respuestas / max * 100}%"></i>${new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short' })}</div>`).join('')}</div>
        <p class="small muted" style="margin:6px 0 0">Respuestas enviadas cada día (según la hora del teléfono).</p></div>
      <div class="card"><h3>Temas con más errores</h3>${r.temas.length ? `<table class="tabla"><tr><th>Tema</th><th>Errores</th></tr>${r.temas.map(t => `<tr><td>${esc(t.titulo)}<br><span class="small muted">${esc(t.materia)} · Nivel ${t.nivel_bloom}</span></td><td><b>${t.errores}</b> de ${t.total}</td></tr>`).join('')}</table>` : '<p class="muted">Sin errores registrados esta semana.</p>'}</div>
      <div class="card"><h3>Necesitan apoyo</h3>${r.apoyo.map(a => `<p class="small" style="margin:4px 0"><b>${esc(a.codigo)}</b>: ${a.apoyo.map(esc).join(' · ')}</p>`).join('') || '<p class="muted">Nadie.</p>'}</div>
      <button class="btn bloque no-print" id="pdf">${ic('documento')} Descargar en PDF</button>`);
    $('#ant').onclick = () => cambiar(-1); $('#sigS').onclick = () => cambiar(1);
    $('#pdf').onclick = () => { toast('Elige "Guardar como PDF" en la ventana de impresión'); setTimeout(() => window.print(), 400); };
  });
}

// ================================================================= Rutas
const rutas = [
  [/^#?\/?$/, () => ir(DS ? '#/d/panel' : perfil ? '#/e/inicio' : perfiles().length ? '#/pin' : '#/perfil')],
  [/^#\/perfil$/, vPerfil], [/^#\/activar$/, vActivar], [/^#\/pin$/, vPin],
  [/^#\/e\/inicio$/, vInicio], [/^#\/e\/materia\/(\d+)$/, vMateria], [/^#\/e\/materia$/, vMaterias], [/^#\/e\/leccion\/(\d+)$/, vLeccion],
  [/^#\/e\/quiz\/(\d+)$/, vQuiz], [/^#\/e\/resultado\/(\d+)$/, vResultado], [/^#\/e\/sync$/, vSync], [/^#\/e\/logros$/, vLogros],
  [/^#\/e\/refuerzos$/, vRefuerzos], [/^#\/e\/ficha\/(\d+)$/, vFicha],
  [/^#\/d\/login$/, vDLogin], [/^#\/restablecer/, vRestablecer], [/^#\/d\/panel$/, vDPanel], [/^#\/d\/estudiantes$/, vDEstudiantes],
  [/^#\/d\/estudiante\/(\d+)$/, vDEstudiante], [/^#\/d\/refuerzo\/(\d+)$/, vDRefuerzo], [/^#\/d\/paquete$/, vDPaquete], [/^#\/d\/reporte$/, vDReporte]
];
function router() {
  cerrarLeccionActiva();
  document.onkeydown = null;
  document.querySelectorAll('.modal-fondo').forEach(m => m.remove());
  const h = location.hash || '#/';
  for (const [re, fn] of rutas) { const m = h.match(re); if (m) { window.scrollTo(0, 0); return fn(...m.slice(1)); } }
  ir('#/');
}
window.router = router;
window.addEventListener('hashchange', router);

// Restaurar sesión del estudiante tras recargar la página
(() => { const sid = sess.get('er_sesion'); const p = sid && perfiles().find(x => String(x.estudiante_id) === sid); if (p) abrirSesion(p); })();
if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('/sw.js').catch(() => { });
router(); ping();
setInterval(ping, 20000);
