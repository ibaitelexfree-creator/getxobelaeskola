# 📋 TASKS MASTER — getxobelaeskola Multi-Agente

> **Generado:** 2026-02-21 · **Mantenido por:** AntiGravity (Ibai)
> **Orquestador:** AntiGravity (solo Ibai) — escribe y asigna tareas
> **Ejecutores:** Jules A (Ibai), Jules B (Amigo 1), Jules C (Amigo 2) en GitHub
> **Comunicación:** Telegram para asignar tareas; GitHub para pool compartido
> **Formato:** Tareas "masticadas" para Gemini Flash Fast
---

## Fase I — Fundación y Contexto

> **Responsable:** Agente 1 (Cuenta A — Ibai)

### T-100: Actualizar GEMINI.md con Protocolo Multi-Agente

- **Agente:** 1
- **Prioridad:** 1 (Crítico)
- **Archivos a tocar:** `GEMINI.md` (raíz del proyecto, NO `.agent/`)
- **Input:** `docs/GUIA_OPERATIVA_MULTI_AGENTE.md` sección 4 (Roles y Cuentas)
- **Output esperado:** Sección `## Multi-Agent Protocol` añadida con tabla de permisos, roles, y flujo de trabajo
- **Criterio de éxito:** Los 3 agentes pueden leer GEMINI.md y saber exactamente sus límites
- **NO hacer:** No borrar reglas existentes. Solo AÑADIR sección

---

### T-101: Crear AGENT_1_CONTEXT.md (Arquitecto)

- **Jules:** A (Ibai)
- **Prioridad:** 1
- **Archivos a tocar:** `project_memory/AGENT_1_CONTEXT.md` (NUEVO)
- **Patrón a seguir:** Estructura de `project_memory/TECHNICAL_CONTEXT.md`
- **Output esperado:** Documento con:
  - Identidad: "Eres Jules A, el Arquitecto de Core"
  - Dominio permitido (carpetas exactas)
  - Convenciones de nomenclatura (úmicas: `feature/jules-a-*`)
  - Stack técnico relevante a su rol
  - Checklist de inicio de sesión
  - **Regla especial:** Jules A es el único con permisos sobre archivos de config global
- **Criterio de éxito:** Un Jules recién conectado en Cuenta A sabe exactamente qué puede y no puede hacer
- **NO hacer:** No incluir información de los otros Jules. Solo SU contexto.

---

### T-102: Crear AGENT_2_CONTEXT.md (Jules B — UI)

- **Jules:** A (Ibai genera el archivo para que Amigo 1 lo lea)
- **Prioridad:** 1
- **Archivos a tocar:** `project_memory/AGENT_2_CONTEXT.md` (NUEVO)
- **Contenido clave:**
  - Identidad: "Eres Jules B, el Ingeniero de Producto y UI"
  - Dominio: `/src/components/`, `/messages/`, `/public/`, `/src/app/[locale]/` (páginas)
  - Design system: Referencia a `tailwind.config.js` y sistema "Nautical"
  - Rama: Siempre `feature/jules-b-*`
  - **Regla clave:** NO tienes AntiGravity. Validas con `npm run build`. Visual Probing lo hace Ibai.
  - Regla: "Si necesitas datos de una API, consulta `docs/API_CONTRACTS.md`. NO inventes endpoints."
  - Checklist de inicio de sesión
  - Cómo reportar: "Cuando termines → abre PR → avisa a Ibai por Telegram"
- **Criterio de éxito:** Amigo 1 puede empezar sin preguntar qué puede tocar
- **NO hacer:** No duplicar toda la documentación técnica. Solo lo relevante para UI.

---

### T-103: Crear AGENT_3_CONTEXT.md (Jules C — QA)

- **Jules:** A (Ibai genera el archivo para que Amigo 2 lo lea)
- **Prioridad:** 1
- **Archivos a tocar:** `project_memory/AGENT_3_CONTEXT.md` (NUEVO)
- **Contenido clave:**
  - Identidad: "Eres Jules C, el Especialista en Calidad"
  - Dominio: Tests, docs, scripts de auditoría
  - Rama: Siempre `feature/jules-c-*`
  - Herramientas: Vitest, Playwright (terminal), scripts de `.agent/skills/`
  - **Regla clave:** NO tienes AntiGravity. Escribes tests automatizados. El Visual Probing lo hace Ibai con AntiGravity.
  - Formato de reporte de bugs (`BUG-XXX`)
  - Cómo reportar: "Cuando termines → abre PR → avisa a Ibai por Telegram"
  - Checklist de inicio de sesión
- **Criterio de éxito:** Amigo 2 puede ejecutar la batería de QA completa y reportar
- **NO hacer:** No tocar código de producción. Solo tests y documentación.

---

### T-104: Crear HANDOFF_TEMPLATE.md

- **Agente:** 1
- **Prioridad:** 2
- **Archivos a tocar:** `project_memory/HANDOFF_TEMPLATE.md` (NUEVO)
- **Patrón a seguir:** Plantilla en `docs/GUIA_OPERATIVA_MULTI_AGENTE.md` sección 10
- **Output esperado:** Template markdown estandarizado para handoffs entre agentes
- **Criterio de éxito:** Cualquier agente puede copiar esta plantilla y rellenarla en <2 minutos
- **NO hacer:** No complicar. Máximo 20 líneas la plantilla.

---

### T-105: Generar docs/API_CONTRACTS.md

- **Agente:** 1
- **Prioridad:** 1
- **Archivos a tocar:** `docs/API_CONTRACTS.md` (NUEVO)
- **Input:** Escanear `/src/app/api/` (todos los `route.ts`), `/src/types/`, `/src/hooks/`
- **Output esperado:** Documento con:
  - Tabla de endpoints: método, ruta, parámetros, respuesta
  - Tabla de tipos exportados desde `/src/types/`
  - Tabla de hooks públicos con su interfaz
  - Tabla de RPCs de Supabase disponibles
- **Criterio de éxito:** El Agente 2 puede saber exactamente qué datos puede consumir sin leer código fuente
- **NO hacer:** No documentar implementación interna. Solo contratos públicos.

---

### T-106: Configurar Branching Strategy

- **Agente:** 1
- **Prioridad:** 2
- **Archivos a tocar:** GitHub settings (manual) + `project_memory/GLOBAL_STATE.md`
- **Output esperado:**
  - Rama `develop` creada desde `main`
  - Reglas de protección en GitHub (main: solo merge desde develop)
  - GLOBAL_STATE actualizado con la nueva estructura de ramas
- **Criterio de éxito:** `git checkout develop` funciona. `git push main` directo está bloqueado.
- **NO hacer:** No crear ramas feature todavía. Solo la estructura base.

---

### T-107: Verificar CI/CD Existente

- **Agente:** 1
- **Prioridad:** 2
- **Archivos a tocar:** Ninguno (solo verificación)
- **Comandos a ejecutar:**
  ```
  npm run lint
  npx tsc --noEmit
  npm run build
  ```
- **Output esperado:** Reporte en `project_memory/CI_STATUS_[fecha].md` con resultado de cada comando
- **Criterio de éxito:** Los 3 comandos pasan sin errores
- **NO hacer:** No arreglar errores en esta tarea. Solo reportar. Los arreglos son tareas separadas.

---

## Fase II — Onboarding

> **Responsable:** Ibai coordina por Telegram; cada amigo ejecuta en su cuenta
> ⚠️ **Nota clave:** Los amigos NO tienen AntiGravity. Solo tienen Jules en su cuenta y acceso al repo en GitHub.

### T-200: Setup Jules en Cuenta B (Amigo 1)

- **Responsable:** Amigo 1 (guiado por Ibai vía Telegram)
- **Prioridad:** 1
- **Herramientas disponibles:** Jules en Gemini Pro + GitHub
- **Checklist:**
  ```
  [ ] Clonar repositorio desde GitHub
  [ ] Instalar dependencias (npm install)
  [ ] Activar Jules en Gemini Pro (Cuenta B)
  [ ] Decirle a Jules: "Lee project_memory/AGENT_2_CONTEXT.md y dime tu rol"
  [ ] Verificar que Jules responde correctamente con su rol y dominio
  [ ] Crear rama feature/jules-b-test y hacer cambio trivial en un componente
  [ ] Abrir PR y mandar link a Ibai por Telegram
  [ ] Ibai cierra la PR (es de prueba)
  ```
- **Criterio de éxito:** Amigo 1 puede crear ramas, editar componentes y abrir PRs. Ibai recibe notificación por Telegram.
- **NO hacer:** No empezar tareas de desarrollo todavía.

---

### T-201: Setup Jules en Cuenta C (Amigo 2)

- **Responsable:** Amigo 2 (guiado por Ibai vía Telegram)
- **Prioridad:** 1
- **Herramientas disponibles:** Jules en Gemini Pro + GitHub
- **Checklist:**
  ```
  [ ] Clonar repositorio desde GitHub
  [ ] Instalar dependencias (npm install)
  [ ] Activar Jules en Gemini Pro (Cuenta C)
  [ ] Decirle a Jules: "Lee project_memory/AGENT_3_CONTEXT.md y dime tu rol"
  [ ] Verificar que Jules responde correctamente con su rol y dominio
  [ ] Ejecutar: npm run lint → reportar resultado a Ibai
  [ ] Ejecutar: npm run test → reportar resultado a Ibai
  [ ] Crear rama feature/jules-c-test, escribir un test trivial
  [ ] Abrir PR y mandar link a Ibai por Telegram
  [ ] Ibai cierra la PR (es de prueba)
  ```
- **Criterio de éxito:** Amigo 2 puede ejecutar comandos de terminal, crear tests y abrir PRs.

---

### T-202: Smoke Test de Coordinación

- **Jules:** Los 3 en secuencia, coordinados por Ibai vía Telegram
- **Prioridad:** 2
- **Secuencia:**
  1. Jules A: Crear `src/types/coordination-test.ts` con un tipo simple → push a `feature/jules-a-test`
  2. Ibai: Merges a develop. Avisa por Telegram a Amigo 1.
  3. Jules B: Importar el tipo en un componente de prueba → push a `feature/jules-b-test`
  4. Ibai: Avisa por Telegram a Amigo 2.
  5. Jules C: Escribir test unitario para el tipo → push a `feature/jules-c-test`
  6. Ibai: **AntiGravity** verifica que todos los PRs aplican. Limpiar archivos de prueba.
- **Criterio de éxito:** Los 3 operaron sin conflictos. El flujo Telegram → GitHub → PR → Telegram quedó validado.
- **NO hacer:** No mantener los archivos de prueba. Es solo validación del sistema.

---

## Fase III — Desarrollo Paralelo (Backlog Inicial)

> Las tareas de esta fase se asignan según la prioridad del proyecto.
> Ibai selecciona del backlog y las mueve a `AGENT_TASKS.md` cuando corresponda.

### Backlog: Jules A (Core / Backend / Ibai)

| ID | Título | Prioridad | Dependencias |
|----|--------|-----------|-------------|
| T-300 | Refactorizar API routes a estructura consistente | 3 | Ninguna |
| T-301 | Crear servicio centralizado de Supabase queries | 3 | T-300 |
| T-302 | Implementar endpoint de disponibilidad de flota | 2 | T-301 |
| T-303 | Crear middleware de rate limiting para APIs | 4 | Ninguna |
| T-304 | Migración de Supabase: normalizar tablas de academía | 3 | Ninguna |
| T-305 | Implementar endpoint de progreso del estudiante (v2) | 2 | T-304 |
| T-306 | Crear types compartidos para contratos Android ↔ Web | 2 | Ninguna |
| T-307 | Configurar Capacitor plugins adicionales (si necesario) | 4 | T-306 |
| T-308 | Optimizar Edge Functions de Supabase | 4 | Ninguna |
| T-309 | Implementar caché de datos con React Query patterns | 3 | T-301 |

### Backlog: Jules B (UI / Producto / Amigo 1)

| ID | Título | Prioridad | Dependencias |
|----|--------|-----------|-------------|
| T-320 | Unificar Design System en componentes base | 2 | Ninguna |
| T-321 | Refactorizar Navbar (resolver overlap del carrusel) | 1 | T-003 activo |
| T-322 | Crear componente reutilizable para cards de cursos | 3 | T-320 |
| T-323 | Implementar skeleton loaders para todas las páginas | 3 | Ninguna |
| T-324 | Mejorar animaciones de transición con Framer Motion | 4 | Ninguna |
| T-325 | Completar traducciones faltantes (eu, en, fr) | 2 | Ninguna |
| T-326 | Diseño responsivo: auditoría y fixes de breakpoints | 2 | T-320 |
| T-327 | Crear componentes de feedback visual (toasts, alerts) | 3 | T-320 |
| T-328 | Implementar Dark Mode | 5 | T-320 |
| T-329 | Optimizar imágenes y assets (WebP, lazy loading) | 3 | Ninguna |

### Backlog: Jules C (QA / Validación / Amigo 2)

> ⚠️ Jules C NO hace Visual Probing. Escribe tests automatizados. AntiGravity (Ibai) hace la validación visual.

| ID | Título | Prioridad | Dependencias |
|----|--------|-----------|-------------|
| T-340 | Crear suite de tests unitarios para `/src/lib/` | 2 | Ninguna |
| T-341 | Crear tests E2E para flujo de registro/login | 1 | Ninguna |
| T-342 | Crear tests E2E para flujo de compra (Stripe) | 1 | Ninguna |
| T-343 | Auditoría de seguridad: API routes | 2 | Ninguna |
| T-344 | Tests de flujo de academía completo (Playwright) | 2 | Ninguna |
| T-345 | Documentar endpoints en formato OpenAPI (swagger) | 3 | T-105 |
| T-346 | Tests de accesibilidad (a11y) automatizados | 3 | Ninguna |
| T-347 | Performance audit con Lighthouse (script) | 3 | Ninguna |
| T-348 | Validar i18n: paridad de claves entre idiomas | 2 | Ninguna |
| T-349 | Crear script de smoke test automatizado post-deploy | 4 | T-341, T-342 |

---

## Fase IV — Integración (por ciclo)

| ID | Título | Responsable | Trigger |
|----|--------|------------|---------|
| T-400 | Merge features a develop | Ibai | Cuando hay features completadas |
| T-401 | Ejecutar suite de validación completa | Agente 3 | Después de T-400 |
| T-402 | Visual Probing de rutas críticas | Agente 3 | Después de T-401 |
| T-403 | Fix de bugs encontrados | Agente 1 o 2 | Si T-402 detecta problemas |
| T-404 | Re-validación post-fix | Agente 3 | Después de T-403 |

---

## Fase V — Consolidación (por ciclo)

| ID | Título | Responsable | Trigger |
|----|--------|------------|---------|
| T-500 | Merge develop a main | Ibai | Cuando develop está verde |
| T-501 | Tag de versión | Ibai | Después de T-500 |
| T-502 | Generar SESSION_SUMMARY | Ibai / Agente 3 | Después de T-501 |
| T-503 | Limpieza de ramas y archivos temp | Ibai | Final del ciclo |
| T-504 | Actualizar API_CONTRACTS.md | Agente 1 | Si hubo cambios en APIs |
| T-505 | Deploy a producción | CI/CD automático | Post-merge a main |

---

## Leyenda

| Prioridad | Significado |
|-----------|-------------|
| 1 | 🔴 Crítico — Bloquea otros trabajos |
| 2 | 🟠 Alto — Necesario para el sprint actual |
| 3 | 🟡 Medio — Mejora significativa |
| 4 | 🔵 Bajo — Nice to have |
| 5 | ⚪ Futuro — Cuando haya tiempo |

| Estado | Significado |
|--------|-------------|
| `backlog` | En el pool, no asignada |
| `asignada` | Movida a AGENT_TASKS.md |
| `en_curso` | Agente trabajando activamente |
| `review` | Esperando revisión de Ibai |
| `completada` | Mergeada y verificada |

---

> **Uso:** Ibai selecciona tareas de este backlog, las "mastica" con detalles específicos, y las mueve a `project_memory/AGENT_TASKS.md` para ejecución.
