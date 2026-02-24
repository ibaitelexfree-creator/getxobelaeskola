---
title: GPS Tracking, Admin Radar & Exploration Fog-of-War Map
type: implementation_plan
status: pending
priority: high
created: 2026-02-25
phases: 5
---

# 🗺️ GPS Tracking, Admin Radar & Fog-of-War Exploration Map

## Resumen del Sistema

Tres funcionalidades interconectadas:

1. **GPS Live Sync** — La app móvil envía coordenadas GPS al servidor con frecuencia dinámica (adaptada a velocidad, viento y alertas Euskalmet).
2. **Admin Radar** — Panel de administración con mapa en tiempo real que muestra todos los usuarios "en el agua" (detección automática vía polígonos de agua existentes). Permite buscar un usuario y rastrear su historial de posiciones.
3. **Fog-of-War Map** — Mapa personal del alumno donde las aguas exploradas se van coloreando con un efecto "rotulador gordo" (línea intensa en el centro, difuminada en los bordes, con transparencia acumulativa por cada pasada).

## Inventario de Piezas Existentes

| Pieza | Estado | Ubicación |
|-------|--------|-----------|
| `useSmartTracker` hook | ✅ Existe | `src/hooks/useSmartTracker.ts` — Ya captura GPS con lógica inteligente (detección vehículo, geofence escuela, water-check) |
| `useGeolocation` hook | ✅ Existe | `src/hooks/useGeolocation.ts` — Hook básico con Capacitor Geolocation |
| `useWindSpeed` hook | ✅ Existe | `src/hooks/useWindSpeed.ts` — Obtiene viento actual cada 10 min |
| `fetchEuskalmetAlerts` | ✅ Existe | `src/lib/euskalmet.ts` — Alertas meteorológicas de Euskalmet |
| `isPointInWater` | ✅ Existe | `src/lib/geospatial/water-check.ts` — Spatial index con RBush + Turf.js |
| `water-geometry.json` | ✅ Existe | `src/data/geospatial/water-geometry.json` — Polígonos de agua de Getxo |
| `LeafletMap` component | ✅ Existe | `src/components/academy/dashboard/LeafletMap.tsx` — Mapa Leaflet dark theme |
| `NavigationExperienceMap` | ✅ Existe | `src/components/academy/dashboard/NavigationExperienceMap.tsx` — Mapa de navegaciones del alumno |
| `save-tracking` API | ✅ Existe | `src/app/api/logbook/save-tracking/route.ts` — Guarda tracks en `horas_navegacion` |
| `upload-track` API | ✅ Existe | `src/app/api/logbook/upload-track/route.ts` — Upload GPX + stats con Turf.js |
| Supabase Realtime | ✅ Configurado | Se usa en `RealtimeNotifications`, `useMultiplayerStore`, `WindStation` |
| Admin Explorer API | ✅ Existe | `src/app/api/admin/explorer/route.ts` — Búsqueda de usuarios/tablas |
| `horas_navegacion` table | ✅ Existe | Tabla Supabase con `track_log` (JSON), `alumno_id`, `ubicacion`, `duracion_h` |
| Constantes geospatiales | ✅ Existe | `src/lib/geospatial/constants.ts` — `SCHOOL_COORDS`, umbrales de velocidad |
| `auth-guard` | ✅ Existe | `src/lib/auth-guard.ts` — `requireAdmin()`, `requireInstructor()`, `checkAuth()` |

## Piezas que FALTAN (a crear)

| Pieza | Descripción |
|-------|-------------|
| Tabla `user_live_locations` | Tabla Supabase para posiciones en tiempo real (una fila por usuario, se actualiza con UPSERT) |
| Tabla `exploration_tracks` | Tabla Supabase para almacenar los segmentos de tracks explorados por usuario (para acumular el fog-of-war) |
| API `POST /api/tracking/heartbeat` | Endpoint para que la app envíe su posición periódicamente al servidor |
| API `GET /api/admin/live-map` | Endpoint para que el Admin obtenga todas las posiciones activas |
| API `GET /api/admin/user-track/[userId]` | Endpoint para ver historial de posiciones de un usuario |
| API `GET /api/exploration/my-tracks` | Endpoint para obtener los tracks explorados del usuario actual |
| Hook `useDynamicHeartbeat` | Hook cliente que envía heartbeats con frecuencia dinámica según velocidad + viento + alertas |
| Componente `AdminLiveRadar` | Mapa admin con todos los niños en el agua en tiempo real |
| Componente `FogOfWarMap` | Mapa del alumno con efecto de exploración acumulativa |
| Lógica de renderizado Canvas/SVG | Para el efecto "rotulador gordo" con difuminado y transparencia acumulativa |

---

## FASE 1: Base de Datos y API de Heartbeat

**Objetivo:** Crear las tablas en Supabase, el endpoint de heartbeat, y el hook de cliente que envía posiciones con frecuencia dinámica.

### Tarea 1.1 — Crear tabla `user_live_locations` en Supabase

Crear la tabla con la siguiente estructura:

```
user_live_locations:
  - id: uuid (PK, default gen_random_uuid())
  - user_id: uuid (FK → auth.users.id, UNIQUE)
  - lat: float8 (NOT NULL)
  - lng: float8 (NOT NULL)
  - speed: float8 (nullable, m/s)
  - heading: float8 (nullable, grados)
  - in_water: boolean (NOT NULL, default false)
  - accuracy: float8 (nullable, metros)
  - updated_at: timestamptz (NOT NULL, default now())
  - created_at: timestamptz (NOT NULL, default now())
```

**Políticas RLS:**
- SELECT: `auth.uid() = user_id` OR `profile.rol IN ('admin', 'instructor')`
- INSERT/UPDATE: `auth.uid() = user_id`
- DELETE: Solo admin

**Índices:**
- `idx_live_locations_user` en `user_id` (UNIQUE)
- `idx_live_locations_in_water` en `in_water` WHERE `in_water = true`
- `idx_live_locations_updated` en `updated_at`

**Trigger:** Auto-actualizar `updated_at` en cada UPDATE.

**Realtime:** Habilitar Supabase Realtime en esta tabla para que el Admin reciba updates sin polling.

### Tarea 1.2 — Crear tabla `exploration_tracks` en Supabase

```
exploration_tracks:
  - id: uuid (PK, default gen_random_uuid())
  - user_id: uuid (FK → auth.users.id)
  - track_segment: jsonb (NOT NULL) — Array de {lat, lng} simplificado (max 50 puntos por segmento)
  - pass_count: integer (NOT NULL, default 1) — Veces que se ha pasado por esta zona
  - session_date: date (NOT NULL)
  - created_at: timestamptz (default now())
```

**Políticas RLS:**
- SELECT: `auth.uid() = user_id` OR admin/instructor
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id` (para incrementar `pass_count`)

**Índices:**
- `idx_exploration_user_date` en `(user_id, session_date)`

### Tarea 1.3 — Crear API `POST /api/tracking/heartbeat`

**Ubicación:** `src/app/api/tracking/heartbeat/route.ts`

**Lógica:**
1. `requireAuth()` — Verificar autenticación
2. Recibir `{ lat, lng, speed, heading, accuracy }` del body
3. Ejecutar `isPointInWater(lat, lng)` del módulo existente para determinar `in_water`
4. UPSERT en `user_live_locations` (insertar si no existe, actualizar si existe)
5. Si `in_water === true`:
   - Guardar el punto en un buffer temporal (o agregar al `exploration_tracks` actual del día)
   - Cada N puntos (ej: 10), simplificar y guardar un segmento de exploración
6. Devolver `{ success: true, in_water, server_interval }` donde `server_interval` es la frecuencia recomendada de envío calculada dinámicamente

**Cálculo de `server_interval` (frecuencia dinámica):**

```
Lógica:
- speed === 0 (parado): interval = 60s
- speed < 1 m/s (drift/parado): interval = 30s
- speed 1-3 m/s (navegación lenta): interval = 15s
- speed 3-7 m/s (navegación normal): interval = 10s
- speed > 7 m/s (planeando/rápido): interval = 5s

Modificadores:
- Si hay alertas Euskalmet activas (naranja/roja): interval = min(interval, 10s)
- Si viento > 25 kn: interval = min(interval, 8s) — más frecuente para seguridad
- Si !in_water: interval = 120s (en tierra, muy poco frecuente)
```

### Tarea 1.4 — Crear hook `useDynamicHeartbeat`

**Ubicación:** `src/hooks/useDynamicHeartbeat.ts`

**Lógica:**
1. Depende de `useSmartTracker` (ya existe) para obtener `currentPosition` y `isTracking`
2. Depende de `useWindSpeed` (ya existe) para obtener velocidad del viento
3. Implementa un `setInterval` dinámico que ajusta su frecuencia según la respuesta `server_interval` del heartbeat
4. Envía POST a `/api/tracking/heartbeat` con la posición actual
5. Manejo de errores: Si falla, exponential backoff (5s → 10s → 20s → max 60s)
6. Si la app pasa a background (Capacitor App.addListener), reducir frecuencia a 30s mínimo
7. Limpiar todo en unmount

### Tarea 1.5 — Integrar heartbeat en el smart tracker existente

**Archivo a modificar:** `src/hooks/useSmartTracker.ts`

**Cambios:**
- Importar y activar `useDynamicHeartbeat` cuando `isTracking === true`
- El heartbeat debe empezar automáticamente cuando el tracking comienza
- Debe parar cuando el tracking se detiene

### Tarea 1.6 — Tests para heartbeat API

**Archivo:** `src/app/api/tracking/heartbeat/route.test.ts`

- Test: Devuelve 401 si no autenticado
- Test: UPSERT correcto en `user_live_locations`
- Test: Calcula `in_water` correctamente usando mock de `isPointInWater`
- Test: `server_interval` cambia según velocidad
- Test: `server_interval` se reduce con alertas Euskalmet activas
- Test: Guarda segmento de exploración cuando se acumulan suficientes puntos

---

## FASE 2: Admin Live Radar — Mapa de Tiempo Real

**Objetivo:** Crear la pantalla de administración con un mapa que muestra todos los usuarios activos "en el agua" en tiempo real, con posibilidad de buscar y rastrear un usuario específico.

### Tarea 2.1 — Crear API `GET /api/admin/live-map`

**Ubicación:** `src/app/api/admin/live-map/route.ts`

**Lógica:**
1. `requireInstructor()` — Solo admin/instructor
2. Query `user_live_locations` WHERE `in_water = true` AND `updated_at > NOW() - interval '10 minutes'`
3. JOIN con `profiles` para obtener `nombre`, `apellido`, `avatar_url`
4. Devolver array de `{ user_id, nombre, lat, lng, speed, heading, in_water, updated_at }`

### Tarea 2.2 — Crear API `GET /api/admin/user-track/[userId]`

**Ubicación:** `src/app/api/admin/user-track/[userId]/route.ts`

**Lógica:**
1. `requireInstructor()`
2. Parámetros query: `?from=YYYY-MM-DD&to=YYYY-MM-DD` (por defecto: hoy)
3. Query `horas_navegacion` WHERE `alumno_id = userId` filtrado por fecha
4. Query `user_live_locations` WHERE `user_id = userId` para posición actual
5. Devolver `{ currentPosition, sessions: [...track_logs], profile }`

### Tarea 2.3 — Crear componente `AdminLiveRadar`

**Ubicación:** `src/components/admin/live-radar/AdminLiveRadar.tsx`

**Estructura:**
```
AdminLiveRadar
├── AdminRadarMap (Leaflet, reutiliza patrón de LeafletMap existente)
│   ├── Polígonos de agua (water-geometry.json) como overlay semi-transparente azul
│   ├── Marcadores de usuarios en el agua (punto pulsante + nombre)
│   ├── Track line del usuario seleccionado
│   └── Controles de zoom centrados en bahía de Getxo
├── UserList (sidebar)
│   ├── Barra de búsqueda (filtro por nombre)
│   ├── Lista de usuarios activos con avatar, nombre, velocidad
│   └── Click → centra mapa en ese usuario + muestra su track
├── StatsBar (barra superior)
│   ├── Total en el agua ahora
│   ├── Viento actual (reusar useWindSpeed)
│   ├── Alertas Euskalmet activas
│   └── Tiempo desde última actualización
└── UserDetailPanel (panel lateral expandible al seleccionar usuario)
    ├── Info del perfil
    ├── Track del día actual
    ├── Historial de sesiones (últimos 7 días)
    └── Botón "Ver Perfil Completo"
```

**Diseño visual:**
- Tema oscuro náutico (consistente con `LeafletMap` existente: `bg-blue-950`)
- Marcadores de usuarios con color según velocidad:
  - Parado (< 0.5 kn): punto gris pulsante
  - Lento (0.5-3 kn): punto azul
  - Normal (3-8 kn): punto verde
  - Rápido (> 8 kn): punto naranja con estela
- Si hay alerta Euskalmet: banner rojo en la parte superior con el detalle
- Mapa centrado en `SCHOOL_COORDS` (43.3424, -3.0135) zoom 14

### Tarea 2.4 — Supabase Realtime para actualizaciones en vivo

**En el componente `AdminLiveRadar`:**
- Suscribirse a Supabase Realtime channel en `user_live_locations`
- Listener `INSERT`, `UPDATE`: actualizar marcadores en el mapa sin refresh
- Listener `DELETE`: quitar marcador (usuario salió del agua / timeout)

### Tarea 2.5 — Página Admin para el Radar

**Ubicación:** Depende de la estructura de rutas del admin existente.

- Crear la page que renderiza `AdminLiveRadar`
- Agregar enlace en el menú/sidebar de admin existente con icono de radar/satélite
- Proteger con `requireAdmin()` o `requireInstructor()`

### Tarea 2.6 — Tests para Admin Live Map

**Archivo:** `src/app/api/admin/live-map/route.test.ts`

- Test: Devuelve 403 si no es admin/instructor
- Test: Filtra correctamente usuarios `in_water = true` y `updated_at` reciente
- Test: JOIN con profiles devuelve nombre correctamente
- Test: Devuelve array vacío si nadie está en el agua

**Archivo:** `src/app/api/admin/user-track/[userId]/route.test.ts`

- Test: Devuelve track_log del usuario correcto
- Test: Filtra por rango de fechas

---

## FASE 3: Fog-of-War — Almacenamiento y Acumulación de Tracks

**Objetivo:** Implementar la lógica de server-side que acumula los segmentos de exploración para el efecto fog-of-war, incluyendo la detección de "pasadas repetidas" para incrementar la intensidad.

### Tarea 3.1 — Crear servicio `ExplorationService`

**Ubicación:** `src/lib/geospatial/exploration-service.ts`

**Funciones:**
```typescript
// Guarda un nuevo segmento de exploración para el usuario
saveExplorationSegment(userId: string, points: LocationPoint[]): Promise<void>

// Obtiene todos los segmentos de exploración del usuario
getExplorationData(userId: string): Promise<ExplorationSegment[]>

// Simplifica el track a max N puntos usando Douglas-Peucker (Turf.js)
simplifyTrack(points: LocationPoint[], maxPoints: number): LocationPoint[]

// Detecta si un nuevo segmento se superpone con segmentos existentes
// y actualiza pass_count para zonas repetidas
mergeOverlappingSegments(userId: string, newSegment: LocationPoint[]): Promise<void>
```

**Lógica de superposición (para `pass_count`):**
- Crear un buffer de 30 metros alrededor de cada segmento existente (usando `turf.buffer()`)
- Si el nuevo segmento pasa por dentro de un buffer existente, incrementar `pass_count` de ese segmento
- Si es zona nueva, crear segmento con `pass_count = 1`

### Tarea 3.2 — Modificar API heartbeat para acumular exploración

**Modificar:** `src/app/api/tracking/heartbeat/route.ts`

**Cambios:**
- Mantener un buffer en memoria (o en la sesión del usuario) de puntos recibidos
- Cada 10 puntos acumulados (o cada 2 minutos, lo que ocurra primero):
  - Simplificar con Douglas-Peucker
  - Llamar a `ExplorationService.mergeOverlappingSegments()`
  - Resetear buffer

### Tarea 3.3 — Crear API `GET /api/exploration/my-tracks`

**Ubicación:** `src/app/api/exploration/my-tracks/route.ts`

**Lógica:**
1. `requireAuth()`
2. Query `exploration_tracks` WHERE `user_id = auth.uid()`
3. Opcionalmente filtrar por `?from=YYYY-MM-DD`
4. Devolver `{ segments: [{ track_segment, pass_count, session_date }] }`

### Tarea 3.4 — Migrar tracks históricos existentes

**Script one-time:** `scripts/migrate-exploration-tracks.ts`

**Lógica:**
- Leer todos los `horas_navegacion` con `track_log` no vacío
- Para cada track, crear segmentos en `exploration_tracks` con `pass_count = 1`
- Esto permite que los tracks anteriores aparezcan en el fog-of-war desde el primer momento

### Tarea 3.5 — Tests para ExplorationService

**Archivo:** `src/lib/geospatial/exploration-service.test.ts`

- Test: `simplifyTrack` reduce correctamente el número de puntos
- Test: `mergeOverlappingSegments` detecta superposición e incrementa `pass_count`
- Test: Segmentos nuevos (sin superposición) se crean con `pass_count = 1`
- Test: `getExplorationData` devuelve los segmentos del usuario correcto

---

## FASE 4: Fog-of-War — Renderizado Visual del Mapa de Exploración

**Objetivo:** Crear el componente visual del mapa que muestra las aguas exploradas con el efecto "rotulador gordo" (línea intensa centrada + difuminado lateral + transparencia acumulativa).

### Tarea 4.1 — Crear componente `FogOfWarMap`

**Ubicación:** `src/components/academy/exploration/FogOfWarMap.tsx`

**Estructura:**
```
FogOfWarMap
├── LeafletMap base (reutilizar patrón dark theme existente)
├── Canvas Overlay (Leaflet L.Canvas custom para dibujar el fog)
├── Water Polygons (overlay azul oscuro semi-transparente = "unexplored")
├── Exploration Trails (dibujados sobre el canvas con efecto brush)
├── Legend (esquina inferior derecha)
│   ├── "Sin explorar" → azul oscuro
│   ├── "1 pasada" → azul claro transparente
│   ├── "2-3 pasadas" → cian medio
│   ├── "4+ pasadas" → cian brillante intenso
│   └── Porcentaje total explorado
└── Stats widget
    ├── Millas náuticas totales exploradas
    ├── Zonas más visitadas
    └── Zonas por descubrir (sugerencias)
```

### Tarea 4.2 — Implementar efecto "Rotulador Gordo" con Canvas

**Ubicación:** `src/lib/geospatial/fog-renderer.ts`

**Técnica de renderizado:**

El efecto "rotulador gordo" se logra dibujando CADA segmento del track como **múltiples líneas superpuestas con diferentes grosores y opacidades**:

```
Para cada segmento de track:
  1. Capa exterior (difuminada): 
     - stroke width: 40px (en zoom 14)
     - color: rgba(0, 200, 255, 0.03 × pass_count)
     - line cap: round
     - filter: blur(8px)
  
  2. Capa media:
     - stroke width: 20px
     - color: rgba(0, 200, 255, 0.08 × pass_count)
     - line cap: round
     - filter: blur(3px)
  
  3. Capa central (intensa):
     - stroke width: 6px
     - color: rgba(0, 220, 255, 0.15 × pass_count)
     - line cap: round
     - No blur

pass_count de cada segmento determina la opacidad:
  - 1 pasada: apenas visible (fantasmal)
  - 2-3 pasadas: claramente visible
  - 4+ pasadas: muy intenso, línea brillante
  - Cap de opacidad: max 0.85 para que nunca sea 100% opaco
```

**Optimización:**
- Usar `OffscreenCanvas` para pre-renderizar los tracks
- Agrupar segmentos por `pass_count` para minimizar cambios de estado del canvas
- Solo re-renderizar cuando cambia el zoom o se añaden nuevos segmentos
- Debounce de 200ms en zoom/pan

### Tarea 4.3 — Overlay de "Niebla" (zonas sin explorar)

**Técnica:**
- Dibujar los polígonos de agua (`water-geometry.json`) como un overlay semi-transparente azul oscuro (`rgba(5, 15, 40, 0.6)`)
- Los tracks explorados actúan como "borrador" sobre esta niebla: donde hay exploración, la niebla se aclara
- Esto crea el efecto visual de "descubrir" zonas

**Implementación:**
- Usar `globalCompositeOperation = 'destination-out'` en Canvas para "borrar" la niebla donde hay tracks
- Alternativa: Invertir el polígono (crear un polígono que cubra todo EXCEPTO las zonas exploradas) con Turf.js `difference()`

### Tarea 4.4 — Calcular porcentaje de exploración

**Ubicación:** `src/lib/geospatial/exploration-stats.ts`

**Lógica:**
1. Área total de agua (Turf.js `area()` sobre `water-geometry.json`)
2. Área explorada: Unión de todos los buffers de tracks del usuario con `turf.union()` + `turf.buffer()` (30m)
3. Intersección con polígonos de agua (solo cuenta lo que está en agua)
4. Porcentaje = `(area_explorada_en_agua / area_total_agua) × 100`

### Tarea 4.5 — Integrar en el dashboard del alumno

**Modificar:** `src/components/academy/dashboard/NavigationExperienceMap.tsx`

**Cambios:**
- Añadir tab/toggle para alternar entre "Mis Tracks" (vista actual) y "Exploración" (fog-of-war)
- O: Reemplazar el mapa actual con el fog-of-war como vista por defecto, manteniendo los tracks como overlay activable

### Tarea 4.6 — Tests para el renderer

**Archivo:** `src/lib/geospatial/fog-renderer.test.ts`

- Test: `calculateBrushLayers` devuelve 3 capas con opacidades correctas según `pass_count`
- Test: Opacidad nunca excede 0.85 (cap)
- Test: `pass_count = 1` genera opacidad base correcta
- Test: `pass_count = 5` genera opacidad cercana al cap

**Archivo:** `src/lib/geospatial/exploration-stats.test.ts`

- Test: Calcula área total de agua correctamente
- Test: Porcentaje 0% cuando no hay exploración
- Test: Porcentaje aumenta con más tracks

---

## FASE 5: Integración, Polish y Admin Search

**Objetivo:** Integrar todas las piezas, añadir la capacidad de buscar/rastrear usuario desde el Admin Explorer existente, pulir la UX, y asegurar rendimiento.

### Tarea 5.1 — Integrar rastreo en Admin Explorer existente

**Modificar:** `src/app/api/admin/explorer/route.ts`

**Cambios:**
- Cuando se busca un usuario en `profiles`, añadir a `_relations` la posición en vivo:
  ```
  { label: 'Ubicación en Vivo', table: 'user_live_locations', data: { lat, lng, in_water, updated_at } }
  ```
- Añadir botón "📍 Rastrear" en los resultados de búsqueda de usuarios que lleva al `AdminLiveRadar` centrado en ese usuario

### Tarea 5.2 — Live location badge en búsqueda de usuario

**En la UI del Admin Explorer (cuando busca un perfil):**
- Si el usuario tiene una `user_live_locations` reciente (< 10 min), mostrar badge:
  - 🟢 "En el agua" (pulsante) si `in_water = true`
  - 🟡 "En línea" si `in_water = false` pero actualización reciente
  - ⚫ "Offline" si `updated_at > 10 min`

### Tarea 5.3 — Cleanup automático de posiciones antiguas

**Crear:** Supabase Edge Function o Cron Job

**Lógica:**
- Cada 30 minutos: DELETE FROM `user_live_locations` WHERE `updated_at < NOW() - interval '30 minutes'`
- Esto evita que usuarios inactivos aparezcan en el radar
- Alternativa: Trigger en el heartbeat que marca usuarios como offline si no envían durante 10 min

### Tarea 5.4 — Gamificación de exploración

**Archivo:** `src/lib/gamification/exploration-achievements.ts`

**Logros basados en exploración:**
- 🏅 "Primer Descubrimiento" — Explorar por primera vez (1 segmento)
- 🗺️ "Cartógrafo Novato" — 10% de aguas exploradas
- 🧭 "Explorador" — 25% de aguas exploradas
- 🌊 "Dominio del Mar" — 50% de aguas exploradas
- 👑 "Almirante de Getxo" — 75% de aguas exploradas
- Emitir estos logros via Supabase Realtime (sistema de `RealtimeNotifications` existente)

### Tarea 5.5 — Optimización de rendimiento

**Acciones:**
1. **Heartbeat:** Rate limiting server-side (max 1 request/3s por usuario) usando rate-limit existente (`src/lib/security/rate-limit.ts`)
2. **Canvas:** Implementar tile-based rendering para fog-of-war en zoom lejano
3. **Queries:** Añadir índice GiST en Supabase si se implementan queries geoespaciales nativas (PostGIS)
4. **Bundle:** Lazy-load del componente `FogOfWarMap` con `next/dynamic` (ya se hace con `LeafletMap`)
5. **Supabase Realtime:** Throttle en cliente de 2s mínimo entre updates de marcadores

### Tarea 5.6 — Tests de integración E2E

**Escenarios:**
1. Usuario abre app → se conecta → empieza a navegar → heartbeat se envía → admin ve al usuario en el radar
2. Usuario navega por zona nueva → se acumula en exploration_tracks → fog-of-war se actualiza
3. Usuario pasa por zona ya explorada → `pass_count` incrementa → coloreado más intenso
4. Admin busca usuario en Explorer → ve badge de ubicación → click "Rastrear" → se abre radar centrado

---

## Dependencias entre Fases

```
FASE 1 (DB + Heartbeat API + Hook)
   ↓
FASE 2 (Admin Radar) ←── depende de tabla user_live_locations
   ↓
FASE 3 (Exploration Service) ←── depende de heartbeat enviando puntos
   ↓
FASE 4 (Fog-of-War Visual) ←── depende de datos de exploration_tracks
   ↓
FASE 5 (Integración + Polish) ←── depende de las 4 fases anteriores
```

## Estimación por Fase

| Fase | Descripción | Archivos Nuevos | Archivos Modificados | Complejidad |
|------|-------------|-----------------|---------------------|-------------|
| 1 | DB + Heartbeat + Hook | 4 | 2 | Media |
| 2 | Admin Radar | 5 | 1 | Media-Alta |
| 3 | Exploration Service | 4 | 1 | Media |
| 4 | Fog-of-War Visual | 4 | 1 | Alta |
| 5 | Integración + Polish | 3 | 3 | Media |
