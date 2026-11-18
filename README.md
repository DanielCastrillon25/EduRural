# EduRural — MVP para presentación

App web móvil offline-first (estudiante y docente) + panel del administrador + API Node.js con SQLite.
No necesita instalar nada: solo **Node.js 22.13 o superior** (trae SQLite incluido).

## Cómo correrlo

```bash
npm start          # inicia en http://localhost:3000
npm run reset      # borra la base y vuelve a crear los datos de demostración
```

- App móvil: http://localhost:3000 (en el PC, abre las herramientas del navegador con F12 y activa la vista de celular)
- Panel del administrador: http://localhost:3000/admin
- Desde un celular en el mismo wifi: usa la dirección "En la red local" que muestra la consola.

## Cuentas de demostración

| Rol | Cómo entra |
|---|---|
| Estudiante | Código de clase **CODAZZI5**, grado **5°**, código **E-07** (está sin activar), y crea un PIN |
| Docente | docente@edurural.test / docente123 (grupo 5° Sede La Esperanza) |
| Docente 2 | docente2@edurural.test / docente123 (otro grupo: sirve para mostrar que no ve datos ajenos) |
| Administrador | admin@edurural.test / admin123 |

## Guion sugerido para la demo

1. **Estudiante:** activa E-07, crea el PIN, estudia el nivel 1 (video, lectura) y responde el cuestionario.
2. En *Sincronizar*, marca **"Simular modo avión"**: todo sigue funcionando sin red y las respuestas quedan en cola.
3. Quita el modo avión y toca **Sincronizar**: se envían las respuestas sin duplicarse.
4. **Docente:** en el panel aparece E-07; asígnale un refuerzo y publica un paquete con los niveles 4 a 6.
5. **Estudiante:** sincroniza otra vez: recibe el refuerzo y descarga las lecciones nuevas.
6. **Docente:** reinicia el PIN de E-07 → en el teléfono, "¿Olvidaste tu PIN?" deja crear uno nuevo.
7. **Reporte semanal** → "Descargar en PDF". **Admin:** importa estudiantes desde CSV y contenido desde JSON, y revisa la auditoría.

## Qué cubre del documento de requerimientos

- Acceso por rol, PIN de 4 dígitos validado sin internet (hash), bloqueo de 5 min tras 5 errores, varios estudiantes en un mismo teléfono.
- 6 niveles de Bloom con desbloqueo, lección, cuestionario con pista y retroalimentación, resultado, logros, racha e insignias.
- Sincronización push/pull con id único por evento (idempotencia), progreso que nunca retrocede, descarga incremental, paquetes y refuerzos.
- Panel docente: resumen, distribución por nivel, reglas de "necesita apoyo" (3 intentos fallidos, 5 días sin sincronizar, menos de 60 % de aciertos), lista con filtro, detalle, refuerzos, paquete semanal, reporte, datos guardados sin conexión.
- Admin: sedes, grupos, docentes, estudiantes, CSV, carga de contenido JSON, reportes por sede y grado, auditoría.
- Seguridad: contraseñas con scrypt, tokens firmados (acceso 15 min, renovación 30 días, dispositivo 90 días), permisos por rol, institución y grupo validados en el servidor; el docente ve códigos (E-07), no nombres.

## Simplificaciones (versión demo)

- Es una **app web** (instalable como PWA), no Flutter. La lógica y la API sirven igual para una app Flutter más adelante.
- Los videos son animaciones por escenas; no hay archivos de video reales.
- El correo de recuperación no se envía: el enlace sale en pantalla y en la consola del servidor.
- El PDF del reporte usa "Imprimir → Guardar como PDF" del navegador.
- Los datos locales del teléfono quedan en `localStorage` sin cifrar.
- El modo sin internet al recargar la página necesita HTTPS (por ejemplo, desplegando en Render). En `localhost` funciona siempre.
