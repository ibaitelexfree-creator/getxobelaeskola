# 🗺️ PLAN DE IMPLEMENTACIÓN POR FASES — Sistema de Progreso y Gamificación
## Getxo Bela Eskola — Academia Digital de Vela

> **Documento de referencia:** [DISENO_SISTEMA_PROGRESO.md](file:///c:/Users/User/Desktop/Saili8ng%20School%20Test/DISENO_SISTEMA_PROGRESO.md)

---

# 1️⃣ VISIÓN GENERAL DE ARQUITECTURA

El sistema se divide en **8 bloques funcionales** que deben construirse en orden de dependencia:

| # | Bloque | Función | Estado actual |
|---|--------|---------|---------------|
| A | **Estructura Académica** | Niveles → Cursos → Módulos → Unidades | ✅ Migración 001 + seed |
| B | **Motor de Evaluaciones** | Preguntas, quizzes, exámenes, calificación | ✅ Migración 003 + APIs básicas |
| C | **Motor de Progreso** | Registro de avance por entidad, estados, porcentajes | ⚠️ Tablas creadas, lógica parcial |
| D | **Motor de Desbloqueo** | Reglas de acceso secuencial a contenido | ❌ No implementado |
| E | **Motor de Habilidades** | Concesión automática de competencias | ⚠️ Catálogo seeded, lógica no implementada |
| F | **Motor de Logros** | Evaluación automática de 30 achievements | ⚠️ 8 logros seeded, motor no implementado |
| G | **Motor de Certificados** | Emisión, verificación, PDF | ⚠️ Tabla creada, lógica no implementada |
| H | **Dashboard del Alumno** | UI completa: barras, rangos, animaciones | ❌ No implementado |

---

# 2️⃣ PRINCIPIOS DE IMPLEMENTACIÓN

### Orden de dependencia

```
A (Estructura) ──→ B (Evaluaciones) ──→ C (Progreso) ──→ D (Desbloqueo)
                                                 │
                                                 ├──→ E (Habilidades)
                                                 ├──→ F (Logros)
                                                 └──→ G (Certificados)
                                                          │
                                                 H (Dashboard) ◄─── Todo lo anterior
```

### Reglas de construcción

1. **Núcleo primero, capas después.** El Motor de Progreso (C) es el corazón del sistema; todo depende de él.
2. **Backend antes que frontend.** Cada fase construye API primero, luego UI.
3. **Cada fase es autónoma.** Al terminar una fase, se puede probar aisladamente.
4. **No romper lo existente.** Las APIs y páginas actuales deben seguir funcionando.
5. **Seed data real.** Cada fase incluye la inserción de datos reales del Curso 1 (las 200 preguntas ya están escritas).

---

# 3️⃣ PLAN POR FASES CORTAS

---

## FASE 1 — Seed de Preguntas del Curso 1

**Objetivo:** Poblar la tabla `preguntas` con las 200 preguntas reales escritas en los archivos markdown, vinculadas a las unidades existentes.

**Incluye:**
- Script SQL de seed que inserta las 200 preguntas del Curso 1 en la tabla `preguntas`
- Cada pregunta vinculada a su `unidad_id` correspondiente (`entidad_tipo = 'unidad'`)
- Campos: `pregunta_es`, `opciones_json`, `respuesta_correcta`, `explicacion_es`, `tipo`, `dificultad`, `puntos`
- Verificar que las unidades y módulos del Curso 1 estén correctamente seeded (usar `001_curso_iniciacion.sql` como referencia)

**No incluye todavía:**
- Evaluaciones (quizzes/exámenes) — eso es Fase 2
- Lógica de selección aleatoria
- Frontend de quiz

**Depende de:**
- Migración 001 (estructura académica) ✅
- Migración 003 (tabla preguntas) ✅
- Los 4 archivos de preguntas markdown ✅

**Verificación:**
- `SELECT COUNT(*) FROM preguntas WHERE entidad_tipo = 'unidad';` → debe devolver 200
- `SELECT entidad_id, COUNT(*) FROM preguntas GROUP BY entidad_id;` → distribución por unidad

---

## FASE 2 — Seed de Evaluaciones (Quizzes y Exámenes)

**Objetivo:** Crear las evaluaciones (quizzes de unidad + exámenes de módulo + examen final) para el Curso 1 con sus configuraciones según el diseño funcional.

**Incluye:**
- 1 quiz por cada unidad (12 quizzes de unidad): 5 preguntas, umbral 60%, sin límite de tiempo
- 1 examen por cada módulo (3-4 exámenes de módulo): 15 preguntas, umbral 70%, 20 min límite
- 1 examen final del curso: 30 preguntas, umbral 75%, 45 min límite
- Configuración de `reintentos_max`, `cooldown_minutos`, `mostrar_respuestas` según diseño funcional
- Seed de los 10 casos prácticos como actividades vinculadas a unidades

**No incluye todavía:**
- Lógica de cooldown entre intentos — eso es Fase 5
- Frontend de quiz
- Cálculo automático de nota del módulo/curso

**Depende de:**
- Fase 1 (preguntas seeded)

**Verificación:**
- `SELECT tipo, COUNT(*) FROM evaluaciones GROUP BY tipo;` → 12 quiz_unidad, ~4 examen_modulo, 1 examen_final
- Cada evaluación tiene sus preguntas vinculadas

---

## FASE 3 — Motor de Progreso: Lógica de Completado de Unidad

**Objetivo:** Implementar la lógica completa para marcar una unidad como completada según las 3 condiciones del diseño funcional.

**Incluye:**
- API ampliada `POST /api/academy/progress/unit-read` que registra la lectura de cada sección (teoría, práctica, errores) de una unidad
- Nueva tabla o campo JSONB `secciones_vistas` en `progreso_alumno` para rastrear qué secciones ha leído el alumno
- Validación de tiempo mínimo (5 min entre apertura y completado)
- Modificar `POST /api/academy/evaluation/submit` para que al aprobar un quiz de unidad, solo marque la unidad como completada si TAMBIÉN ha leído las 3 secciones y cumple el tiempo mínimo
- La nota del quiz guarda **la mejor nota** (nunca baja)

**No incluye todavía:**
- Propagación hacia módulo (eso es Fase 4)
- Desbloqueo de siguiente unidad (eso es Fase 6)
- Frontend de lectura con tracking de secciones (eso es Fase 10)

**Depende de:**
- Fase 2 (evaluaciones existentes)
- API actual de submit evaluación ✅

**Verificación:**
- API de progreso devuelve `secciones_vistas` para cada unidad
- Un quiz aprobado SIN leer las 3 secciones NO marca la unidad como completada
- Un quiz aprobado CON las 3 secciones Y ≥ 5 min SÍ la marca como completada
- Repetir el quiz con mejor nota actualiza la nota; con peor nota no la baja

---

## FASE 4 — Motor de Progreso: Propagación Módulo → Curso → Nivel

**Objetivo:** Implementar la cascada automática de progreso: al completar la última unidad de un módulo, evaluar si el módulo se puede marcar como completado (si también se aprobó el examen de módulo), y así sucesivamente hacia arriba.

**Incluye:**
- Función backend `evaluarProgresoModulo(alumno_id, modulo_id)`:
  - Comprueba si todas las unidades del módulo están completadas
  - Comprueba si existe un intento de examen de módulo aprobado (≥ 70%)
  - Si ambas condiciones: marca el módulo como completado
  - Calcula la nota del módulo (mejor nota del examen)
- Función backend `evaluarProgresoCurso(alumno_id, curso_id)`:
  - Comprueba si todos los módulos están completados
  - Comprueba si existe un intento de examen final aprobado (≥ 75%)
  - Comprueba horas de navegación mínimas
  - Si todo correcto: marca el curso como aprobado
  - Calcula nota del curso (60% examen final + 30% media módulos + 10% bonus logros)
- Función backend `evaluarProgresoNivel(alumno_id, nivel_id)`:
  - Comprueba si todos los cursos del nivel están aprobados
  - Comprueba habilidades requeridas para el nivel
  - Si todo correcto: marca el nivel como superado
- Estas funciones se ejecutan en cadena automáticamente tras cada completado

**No incluye todavía:**
- Desbloqueo del siguiente contenido (Fase 6)
- Emisión de certificados (Fase 9)
- Notificaciones al alumno (Fase 13)

**Depende de:**
- Fase 3 (completado de unidad)
- Tabla `horas_navegacion` ✅

**Verificación:**
- Completar todas las unidades de un módulo + aprobar examen de módulo → módulo marcado como completado
- El porcentaje del módulo se calcula correctamente (ej. 3/4 unidades = 75%)
- El curso NO se marca como completado si faltan horas de navegación aunque se haya aprobado todo

---

## FASE 5 — Motor de Evaluaciones: Cooldowns y Reintentos

**Objetivo:** Implementar la lógica de cooldown entre intentos y límites de reintentos según el diseño funcional.

**Incluye:**
- Modificar `POST /api/academy/evaluation/start`:
  - Quiz de unidad: cooldown de 2 min entre intentos, reintentos ilimitados
  - Examen de módulo: máx 3 intentos por 24 horas, cooldown 24h tras tercer fallo
  - Examen final: máx 2 intentos por 48 horas, cooldown 48h
- Al intentar iniciar una evaluación, comprobar último intento y aplicar cooldown
- Si hay cooldown activo, devolver error con tiempo restante
- Guardar siempre la mejor nota (no la última)

**No incluye todavía:**
- Frontend con mensaje de "espera X minutos" (Fase 11)
- Timer visible durante el examen (Fase 11)

**Depende de:**
- Fase 2 (evaluaciones seeded con configuración de cooldown)
- API de start evaluación ✅

**Verificación:**
- Iniciar quiz → completar → intentar iniciar otro antes de 2 min → error con tiempo restante
- Suspender examen de módulo 3 veces en < 24h → bloqueado hasta mañana
- Aprobar con 85% → repetir con 70% → la nota guardada sigue siendo 85%

---

## FASE 6 — Motor de Desbloqueo: Lógica Secuencial

**Objetivo:** Implementar las reglas de desbloqueo que determinan qué contenido está accesible para cada alumno.

**Incluye:**
- Función backend `calcularEstadoDesbloqueo(alumno_id)` que devuelve el estado de cada entidad:
  - `bloqueado`, `disponible`, `en_progreso`, `completado`
- Reglas de desbloqueo de unidades: primera unidad desbloqueada cuando el módulo está desbloqueado, siguientes al completar la anterior
- Reglas de desbloqueo de módulos: primer módulo cuando el curso está desbloqueado, siguientes al completar el anterior
- Reglas de desbloqueo de cursos: primer curso cuando el nivel está desbloqueado, siguientes al aprobar el anterior
- Reglas de desbloqueo de niveles según tabla del diseño funcional:
  - Nivel 1: siempre abierto
  - Nivel 2: requiere Nivel 1 + 10h nav + 2 habilidades
  - Nivel 3: requiere Nivel 2 + 30h nav + 2 habilidades
  - Niveles 6 y 7 (transversales): solo requieren Nivel 2 + 20h nav
- Modificar API `GET /api/academy/progress` para incluir estados de desbloqueo
- Modificar APIs de course/module/unit para devolver el estado de desbloqueo

**No incluye todavía:**
- Bloqueo visual en frontend (Fase 10)
- Mensajes de "qué te falta para desbloquear" (Fase 13)

**Depende de:**
- Fase 4 (propagación de progreso)
- Motor de habilidades parcial (Fase 7) — para los niveles que requieren habilidades se puede devolver `bloqueado` sin saber aún cuáles tiene

**Verificación:**
- Alumno nuevo: solo el Nivel 1 y su primer curso/módulo/unidad están disponibles
- Al completar la Unidad 1, la Unidad 2 pasa a "disponible"
- Al completar el Nivel 1 SIN las horas requeridas, el Nivel 2 permanece bloqueado

---

## FASE 6.5 (HARDENING) — Robustez y Seguridad del Progreso

**Objetivo:** Blindar la lógica de progreso contra inconsistencias de datos, condiciones de carrera y ataques simples.

**Incluye:**
- **Script SQL (`006_hardening_desbloqueo.sql`)**
- Validación de integridad referencial en arrays de UUID (prerequisitos).
- Índices de rendimiento para consultas masivas de estado.
- Función de seguridad `puede_acceder_entidad` para endpoints de escritura.
- Trigger anti-borrado accidental de progreso completado.

**Depende de:**
- Fase 6 (Motor de Desbloqueo)

**Verificación:**
- Intentar insertar un nivel con prerequisito inexistente -> Error SQL.
- Intentar borrar un progreso completado -> Error SQL.
- Endpoint de escritura rechaza intento si `puede_acceder_entidad` es falso.

---

## FASE 7 — Motor de Habilidades

**Objetivo:** Implementar la concesión automática de habilidades cuando se cumplen las condiciones.

**Incluye:**
- Función backend `evaluarHabilidades(alumno_id)` que comprueba todas las condiciones de las 12 habilidades:
  - "Marinero de Agua Dulce": completar Módulo 1 de Iniciación
  - "Domador del Viento": completar Módulo 2 de Iniciación
  - "Manos de Marinero": completar unidad de Nudos + ≥ 90% en quiz
  - etc. (las 12 habilidades del catálogo)
- Se ejecuta automáticamente tras cada cambio de progreso (completar unidad/módulo/curso)
- API `GET /api/academy/skills` que devuelve: catálogo completo + cuáles tiene el alumno
- Calcular el **Rango de Navegante** basado en el número de habilidades:
  - 0 → Grumete 🟤
  - 1-3 → Marinero 🟢
  - 4-6 → Timonel 🔵
  - 7-9 → Patrón 🟣
  - 10-12 → Capitán 🟡

**No incluye todavía:**
- Animación de desbloqueo de habilidad (Fase 13)
- Dashboard visual de habilidades (Fase 12)

**Depende de:**
- Fase 4 (saber qué módulos/cursos ha completado)
- Catálogo de habilidades seeded ✅

**Verificación:**
- Completar Módulo 1 del Curso 1 → habilidad "Marinero de Agua Dulce" aparece en `habilidades_alumno`
- El rango se calcula correctamente según número de habilidades
- Una habilidad concedida nunca se revoca

---

## FASE 8 — Motor de Logros

**Objetivo:** Implementar el motor que evalúa las 30 condiciones de logros y los concede automáticamente.

**Incluye:**
- Seed SQL de los 30 logros (ampliar los 8 existentes al catálogo completo de 30)
- Función backend `evaluarLogros(alumno_id, evento)` donde `evento` indica qué acaba de pasar:
  - `unidad_completada` → chequea logros de progreso (Primer Día, Estudiante Aplicado, etc.)
  - `examen_aprobado` → chequea logros de rendimiento (Primera Matrícula, Perfeccionista, etc.)
  - `login` → chequea logros de constancia (Semana Activa, Mes Activo, etc.)
  - `horas_registradas` → chequea logros de experiencia (10h, 50h, 100h, etc.)
  - `habilidad_obtenida` → chequea logros de habilidades (Nudos de Acero, etc.)
- Tabla `dias_acceso` o campo en profiles para rastrear días de acceso consecutivos / totales
- API `GET /api/academy/achievements` que devuelve: catálogo completo + cuáles tiene el alumno + progreso hacia logros cercanos
- La evaluación se ejecuta en hooks post-acción (tras completar unidad, tras submit, tras login)

**No incluye todavía:**
- Notificación toast al desbloquear logro (Fase 13)
- Galería visual de logros (Fase 12)
- Bonus de 10% en nota de curso por logros (integrar en Fase 4, retroactivo)

**Depende de:**
- Fase 4 (progreso de módulos/cursos para logros de progreso)
- Fase 7 (habilidades para logros de habilidades)

**Verificación:**
- Completar 1 unidad → logro "Primer Día" aparece en `logros_alumno`
- Obtener 100% en un quiz → logro "Primera Matrícula" concedido
- Logros ya concedidos no se duplican si se re-evalúan
- `GET /api/academy/achievements` muestra correctamente obtenidos vs. no obtenidos

---

## FASE 9 — Motor de Certificados

**Objetivo:** Implementar la emisión automática de certificados al completar cursos y niveles.

**Incluye:**
- Función backend `emitirCertificado(alumno_id, tipo, entidad_id)`:
  - Calcula la nota final (según diseño: para curso = 60% examen + 30% módulos + 10% logros)
  - Determina la distinción (Estándar 75-84%, Mérito 85-94%, Excelencia 95-100%)
  - Genera número de certificado único con la función existente `generar_numero_certificado()`
  - Inserta en tabla `certificados`
- Se ejecuta automáticamente al aprobar un curso o completar un nivel
- API `GET /api/academy/certificates` que devuelve los certificados del alumno
- API `GET /api/academy/certificates/verify/[hash]` pública para verificar un certificado
- Diploma de Capitán: emitido solo cuando los 7 niveles están completados + 12 habilidades + 100h + nota media ≥ 80%

**No incluye todavía:**
- Generación de PDF (Fase 14)
- Página pública de verificación (Fase 14)
- Compartir en redes sociales (fuera del MVP)

**Depende de:**
- Fase 4 (progreso completado de cursos/niveles)
- Fase 7 (habilidades para Diploma de Capitán)
- Función `generar_numero_certificado()` ✅

**Verificación:**
- Completar un curso con nota = 88% → certificado emitido con distinción "Mérito"
- `GET /api/academy/certificates` muestra el certificado con todos los campos
- Completar un curso con nota < 75% → NO se emite certificado (no debería pasar si el examen requiere 75%)

---

## FASE 10 — Frontend: Páginas de Unidad y Módulo con Progreso

**Objetivo:** Actualizar las páginas frontend existentes para reflejar el sistema de progreso y desbloqueo.

**Incluye:**
- Página de unidad (`/academy/unit/[id]`):
  - Tracking visual de secciones leídas (checkmarks en Teoría ✓, Práctica ✓, Errores ✓)
  - Timer invisible que registra el tiempo de lectura
  - Botón de "Hacer Quiz" que aparece solo cuando las 3 secciones están leídas
  - Indicador de nota actual del quiz si ya se hizo
- Página de módulo (`/academy/module/[id]`):
  - Lista de unidades con estados: 🔒 bloqueada, 🔓 disponible, 🔄 en progreso, ✅ completada, ⭐ con distinción
  - Barra de progreso del módulo
  - Botón "Examen de Módulo" visible solo cuando todas las unidades están completadas
- Página de curso (`/academy/course/[slug]`):
  - Lista de módulos con estados de desbloqueo
  - Barra de progreso del curso
  - Indicador de horas de navegación: X/Y horas
  - Botón "Examen Final" visible solo cuando todos los módulos están completados

**No incluye todavía:**
- Dashboard completo del alumno (Fase 12)
- Animaciones de desbloqueo (Fase 13)
- Sistema de quiz frontend con timer (Fase 11)

**Depende de:**
- Fase 3 (tracking de secciones leídas)
- Fase 6 (estados de desbloqueo)

**Verificación:**
- Abrir una unidad → ver las 3 secciones con checkmarks que se van marcando
- Una unidad bloqueada NO se puede abrir (redirect o modal)
- Barra de progreso del módulo muestra porcentaje correcto

---

## FASE 11 — Frontend: Quiz/Examen con Timer y Resultados

**Objetivo:** Construir la experiencia completa de evaluación: interfaz de quiz con timer, pantalla de resultados, cooldown visible.

**Incluye:**
- Componente `QuizPlayer`:
  - Muestra preguntas una a una o todas a la vez (configurable)
  - Timer countdown visible (20 min examen módulo, 45 min examen final, sin límite quiz unidad)
  - Selección de respuesta con feedback visual
  - Envío automático al terminar el tiempo
  - Barra de progreso (pregunta X de Y)
- Componente `QuizResults`:
  - Nota obtenida con animación (número que sube)
  - Aprobado/Suspenso con color verde/rojo
  - Resumen de respuestas correctas e incorrectas con explicaciones
  - Botón "Reintentar" con cooldown visible ("Puedes reintentar en 1:45")
  - Botón "Siguiente unidad" si aprobó
- Integración con APIs existentes de start/submit evaluación

**No incluye todavía:**
- Animaciones de logros/habilidades al aprobar (Fase 13)
- Casos prácticos interactivos (futuro)

**Depende de:**
- Fase 5 (cooldowns)
- Fase 10 (botón de quiz en la página de unidad)

**Verificación:**
- Completar un quiz → ver pantalla de resultados con nota y explicaciones
- Timer de 20 minutos funcional y se auto-envía al acabar
- Intentar reintentar antes del cooldown → ver mensaje con tiempo restante

---

## FASE 12 — Frontend: Dashboard del Alumno

**Objetivo:** Construir la página principal del alumno con todas las métricas, rangos, logros y habilidades.

**Incluye:**
- Página `/academy/dashboard`:
  - **Sección Identidad:** Avatar, nombre, rango actual (Grumete/Marinero/Timonel/Patrón/Capitán), barra "Camino a Capitán" (X/12 habilidades)
  - **Sección Actividad:** Curso activo con barra de progreso, próxima unidad (acceso directo), racha de días (🔥 X días), horas de navegación con mini-gráfico
  - **Sección Logros:** Últimos 3 logros obtenidos, logro más cercano con barra de progreso, enlace a galería de logros
  - **Sección Puntos:** Puntos totales, posición en ranking (si se implementa)
- Página `/academy/achievements`:
  - Grid de los 30 logros: obtenidos en color + fecha, no obtenidos en gris con candado
  - Filtro por categoría
  - Hover muestra condición de desbloqueo
- Página `/academy/skills`:
  - Las 12 habilidades con estado (obtenida/bloqueada)
  - Icono + nombre + qué se necesita para obtenerla
- Página `/academy/certificates`:
  - Lista de certificados emitidos con fecha, nota, distinción
  - Botón "Descargar PDF" (placeholder hasta Fase 14)

**No incluye todavía:**
- Animaciones de desbloqueo sofisticadas (Fase 13)
- Generación de PDF real (Fase 14)
- Mensajes motivacionales contextuales (Fase 13)

**Depende de:**
- Fase 7 (API de habilidades)
- Fase 8 (API de logros)
- Fase 9 (API de certificados)

**Verificación:**
- Dashboard muestra datos reales del alumno
- La galería de logros muestra 30 logros, con los obtenidos en color
- El rango se actualiza visualmente según las habilidades obtenidas

---

## FASE 13 — Notificaciones, Mensajes Motivacionales y Animaciones

**Objetivo:** Implementar el sistema de feedback al alumno: toasts, animaciones de desbloqueo, mensajes motivacionales contextuales.

**Incluye:**
- Componente `AchievementToast`: toast animado cuando se obtiene un logro (badge con efecto dorado + nombre)
- Componente `SkillUnlockedModal`: modal animado cuando se desbloquea una habilidad (icono + confetti)
- Componente `LevelUnlockedAnimation`: pantalla completa temporal cuando se desbloquea un nivel
- Componente `RankUpAnimation`: cuando el rango sube (Grumete → Marinero)
- Sistema de mensajes motivacionales:
  - Al completar unidad: frases marineras de ánimo
  - Al suspender: frases de aliento sin dramatismo
  - Racha de días: mensaje diferente cada hito (3, 5, 7, 14, 30 días)
- Preferencia del alumno para desactivar animaciones

**No incluye todavía:**
- Notificaciones por email (fuera del MVP)
- Push notifications (fuera del MVP)

**Depende de:**
- Fase 12 (dashboard donde se muestran)
- Fase 8 (motor de logros que dispara los toasts)

**Verificación:**
- Completar una unidad por primera vez → toast de logro "Primer Día" visible
- La animación dura ≤ 3 segundos y es dismissible
- Desactivar animaciones en ajustes → no aparecen

---

## FASE 14 — Certificados PDF y Verificación Pública

**Objetivo:** Generar PDFs de certificados descargables y una página pública de verificación.

**Incluye:**
- Generación de PDF del certificado con:
  - Diseño profesional con logo de la escuela
  - Nombre del alumno, curso/nivel, nota, distinción
  - Número de certificado único
  - Código QR que enlaza a la URL de verificación
  - Habilidades demostradas
- Almacenamiento del PDF en Supabase Storage o generación on-the-fly
- Página pública `/verify/[hash]` que muestra:
  - Nombre del alumno
  - Certificado emitido
  - Fecha y nota
  - Sello de verificación "Certificado Auténtico ✅"
- Botón de descarga desde `/academy/certificates`

**No incluye todavía:**
- Compartir en LinkedIn/redes (futuro)
- Certificado físico impreso (fuera del digital)

**Depende de:**
- Fase 9 (certificados emitidos)
- Fase 12 (página de certificados del alumno)

**Verificación:**
- Descargar PDF → abre un PDF correctamente formateado
- Escanear QR del PDF → abre la página de verificación con datos correctos
- URL de verificación funciona sin autenticación (pública)

---

## FASE 17 — Integración con Panel de Staff (Academia)

**Objetivo:** Permitir que los instructores y administradores visualicen el progreso académico y los certificados de los alumnos desde el panel de gestión.

**Incluye:**
- Pestaña "Academia" en el Staff Panel.
- Buscador de alumnos con vista de expediente académico.
- Visualización de: Unidades leídas, Quizzes aprobados, Habilidades obtenidas.
- Acceso a descarga de certificados del alumno.
- Auditoría de actividad académica (opcional).

**Depende de:**
- Fase 12 (Dashboard)
- Fase 14 (Certificados PDF)

**Verificación:**
- El instructor puede buscar a un alumno y ver su % de progreso global.
- El instructor puede previsualizar/descargar el certificado de un alumno.

---

# 4️⃣ ORDEN LÓGICO DE CONSTRUCCIÓN

```
 FASE   NOMBRE                                      DEPENDE DE    BLOQUE
 ─────  ──────────────────────────────────────────  ────────────  ──────
   ...
   14    Certificados PDF y Verificación             Fase 9, 12    G/H
   15    Hardening y Auditoría de Seguridad          Fase 14       S
   16    Integración Dashboard Principal              Fase 12       H
   17    Integración Panel de Staff                   Fase 14, 15   Admin
```

### Fases paralelizables
- **Fase 5** (Cooldowns) en paralelo con **Fases 3-4** (Progreso)
- **Fase 7** (Habilidades) y **Fase 8** (Logros) parcialmente en paralelo
- **Fase 10** y **Fase 11** parcialmente en paralelo

---

# 5️⃣ CONDICIÓN FINAL

Este documento sirve como guía maestra. Para ejecutar cada fase, el prompt será:

> *"Implementa la FASE X del plan de implementación. Lee el archivo `PLAN_IMPLEMENTACION_FASES.md` en la raíz del proyecto para ver los detalles exactos de la fase, sus dependencias y criterios de verificación. El diseño funcional está en `DISENO_SISTEMA_PROGRESO.md`."*

Cada fase produce un entregable verificable por sí mismo.

---

*Plan de Implementación v1.0 — Getxo Bela Eskola — Febrero 2026*
