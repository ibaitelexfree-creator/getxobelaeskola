# 🧭 Guía Operativa: Orquestación Multi-Agente para getxobelaeskola

> **Versión:** 1.1 · **Fecha:** 2026-02-21
> **Orquestador único:** AntiGravity (solo Ibai)
> **Trabajadores:** 3 Jules en GitHub compartiendo 1 pool de tareas
> **Comunicación:** Telegram como hub central
> **Opus 4.6:** Solo bajo decisión explícita de Ibai
> **Proyecto:** Getxo Bela Eskola — Next.js 14 + Capacitor (Android/iOS) + Supabase

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Inventario Real del Proyecto](#2-inventario-real-del-proyecto)
3. [Arquitectura de Memoria](#3-arquitectura-de-memoria)
4. [Roles y Cuentas](#4-roles-y-cuentas)
5. [Fase I — Fundación y Contexto](#5-fase-i--fundación-y-contexto)
6. [Fase II — Onboarding de Cuentas B y C](#6-fase-ii--onboarding-de-cuentas-b-y-c)
7. [Fase III — Desarrollo Paralelo](#7-fase-iii--desarrollo-paralelo)
8. [Fase IV — Integración y Validación](#8-fase-iv--integración-y-validación)
9. [Fase V — Consolidación y Cierre](#9-fase-v--consolidación-y-cierre)
10. [Protocolos de Comunicación](#10-protocolos-de-comunicación)
11. [Gestión de Riesgos](#11-gestión-de-riesgos)
12. [Apéndice: Checklists por Fase](#12-apéndice-checklists-por-fase)

---

## 1. Visión General

### Arquitectura Real del Sistema

```
           IBAI
             │
    ┌────────┴────────┐
    │   AntiGravity   │  ← ÚNICO orquestador. Solo Ibai lo tiene.
    │   (este AI)     │  Lee código, valida, asigna, revisa PRs.
    └────────┬────────┘
             │  escribe tareas masticadas
             ▼
    ┌─────────────────┐
    │  GitHub / Repo  │  ← Pool único de tareas (AGENT_TASKS.md)
    │  project_memory │     Memoria compartida legible por todos
    └──┬────┬────┬───┘
       │    │    │
     Jules Jules Jules
     (A)   (B)   (C)
     Ibai  Amigo1 Amigo2
       │    │    │
       └────┴────┘
             │
          Telegram  ← Ibai comanda, todos reportan. Rápido.
```

### Principios Rectores

| Principio | Significado Práctico |
|-----------|---------------------|
| **AntiGravity = Cerebro único** | Solo el AI de Ibai orquesta, valida visualmente, revisa y asigna |
| **Jules = Ejecutores en GitHub** | Los 3 Jules trabajan en el repo, leen el mismo pool de tareas |
| **Telegram = Mando rápido** | Ibai manda órdenes a sus amigos desde Telegram. Sin reuniones. |
| **Memoria como Código** | Todo contexto vive en archivos del repo, no en la cabeza de nadie |
| **Tareas masticadas** | Flash Fast ejecuta, no planifica. Ibai + AntiGravity piensan, Jules hacen. |
| **Humano = Gatekeeper** | Ibai aprueba antes de cada ejecución. Opus solo cuando Ibai lo decide. |

### Estado Actual del Equipo

| Cuenta | Titular | Jules | AntiGravity | Telegram | Estado |
|--------|---------|-------|-------------|----------|--------|
| **A (Ibai)** | Ibai | ✅ Configurado | ✅ **Exclusivo** | ✅ Admin | Operativo |
| **B (Amigo 1)** | Por asignar | ❌ Pendiente | ❌ No tiene | ✅ Miembro | Preparación |
| **C (Amigo 2)** | Por asignar | ❌ Pendiente | ❌ No tiene | ✅ Miembro | Preparación |

---

## 2. Inventario Real del Proyecto

> Lo que existe HOY. Flash no inventa — trabaja sobre esto.

### Tech Stack Completo

```
Framework:     Next.js 14 (App Router) + React 18
Styling:       Tailwind CSS 3.4 (Design System "Nautical")
Database:      Supabase (PostgreSQL + Auth + Storage + Edge Functions)
Payments:      Stripe (Checkout Sessions + Webhooks)
i18n:          next-intl 4.x (es, eu, en, fr)
Mobile:        Capacitor 8.x (Android + iOS)
State:         Zustand + React Query
Testing:       Vitest + Testing Library
CI/CD:         GitHub Actions (deploy.yml + android-build.yml)
Deploy Web:    Vercel
Deploy Mobile: Capacitor CLI → Android Studio / Xcode
Orchestration: MCP Bridge (puerto 3323)
```

### Estructura de Directorios Relevante

```
getxobelaeskola/
├── src/
│   ├── app/              # Next.js App Router (174 archivos)
│   │   ├── api/          # ← DOMINIO: Jules / Agente 1
│   │   └── [locale]/     # ← COMPARTIDO (coordinar)
│   ├── components/       # ← DOMINIO: ClawdBot / Agente 2 (195 archivos)
│   ├── lib/              # ← DOMINIO: Jules / Agente 1 (44 archivos)
│   ├── hooks/            # ← COMPARTIDO (pedir permiso)
│   ├── types/            # ← COMPARTIDO (pedir permiso)
│   └── stores/           # ← COMPARTIDO
├── android/              # Capacitor Android (Gradle)
├── ios/                  # Capacitor iOS
├── messages/             # Traducciones (es, eu, en, fr)
├── supabase/             # Migrations, Edge Functions
├── scripts/              # Build scripts, utilidades
├── project_memory/       # ← MEMORIA COMPARTIDA ENTRE AGENTES
├── orchestration/        # Sistema de orquestación MCP
├── antigravity/          # Artefactos de AntiGravity
├── docs/                 # Documentación del proyecto
├── .agent/               # Skills y agentes de IA
└── .github/workflows/    # CI/CD pipelines
```

### Agentes ya Configurados

| Agente | Dominio | Rama | Notas |
|--------|---------|------|-------|
| **Jules** | `/src/app/api`, `/src/lib`, `/supabase` | `feature/jules-*` | Backend, APIs, DB |
| **ClawdBot** | `/src/components`, `/messages`, `/public` | `feature/clawd-*` | UI, traducciones |
| **Antigravity** | Coordinación, PRs, docs, `/project_memory` | — | No genera código pesado |

---

## 3. Arquitectura de Memoria

### Capas de Memoria (Adaptado al proyecto real)

| Capa | Archivo(s) | Quién escribe | Quién lee |
|------|-----------|--------------|-----------|
| **🧠 Memoria Central** | `GEMINI.md` (raíz) | Ibai (manualmente) | Todos los agentes |
| **🌐 Estado Global** | `project_memory/GLOBAL_STATE.md` | Todos al iniciar/terminar | Todos al iniciar |
| **📋 Tareas** | `project_memory/AGENT_TASKS.md` | Ibai + Antigravity | Todos |
| **⚙️ Contexto Técnico** | `project_memory/TECHNICAL_CONTEXT.md` | Agente 1 (Arquitecto) | Todos |
| **📖 Decisiones** | `project_memory/DECISIONS_LOG.md` | Todos (append-only) | Todos |
| **🤝 Handoffs** | `project_memory/HANDOFF_[agente].md` | Agente que termina tarea | Agente que la recibe |
| **🏗️ Arquitectura** | `docs/ARCHITECTURE.md` | Agente 1 | Todos |
| **📸 Artefactos** | `antigravity/` | AntiGravity | Ibai (revisión) |

### Regla de Oro de la Memoria

```
ANTES de tocar código:
  1. Leer GLOBAL_STATE.md     → ¿hay conflictos?
  2. Leer AGENT_TASKS.md      → ¿qué me toca?
  3. Leer TECHNICAL_CONTEXT.md → ¿qué límites tengo?

DESPUÉS de terminar código:
  1. Actualizar GLOBAL_STATE.md  → qué hice, qué archivos toqué
  2. Actualizar AGENT_TASKS.md   → marcar tarea como completada
  3. Crear/Actualizar HANDOFF.md → resumen para el siguiente agente
  4. Registrar en DECISIONS_LOG.md → si tomé una decisión no trivial
```

---

## 4. Roles y Cuentas

### 🎯 AntiGravity — El Orquestador (Solo Ibai)

> **Este AI es el único con visión completa del proyecto. No ejecuta código — dirige.

| Capacidad | Uso en el proyecto |
|-----------|-------------------|
| **Leer el repo completo** | Analiza código, detecta inconsistencias, genera tareas masticadas |
| **Visual Probing** | Navega la app en el navegador para validar UX/UI tras cada ciclo |
| **Generar AGENT_TASKS.md** | Escribe tareas masticadas que Jules puede ejecutar sin ambigüedad |
| **Revisar PRs** | Analiza el diff, aprueba o pide cambios antes de que Ibai mergee |
| **Actualizar project_memory** | Mantiene GLOBAL_STATE, DECISIONS_LOG y SESSION_SUMMARY |
| **Notificar por Telegram** | Envía órdenes y notificaciones al grupo/chat de los 3 |

---

### Jules A — Arquitecto de Core (Cuenta A — Ibai)

> **Filosofía:** "Construyo los cimientos. Si mi trabajo está bien hecho, los otros dos no se cruzan nunca."

| Aspecto | Detalle |
|---------|---------|
| **Dominio** | `/src/app/api/`, `/src/lib/`, `/supabase/`, `types/`, configuración global |
| **Rama** | `feature/jules-a-*` |
| **Responsabilidades** | Esquemas Supabase, contratos API, lógica de dominio, servicios compartidos, migraciones, configuración Gradle/Capacitor |
| **Herramientas** | Terminal de GitHub (migraciones, builds, npm scripts) |
| **Restricción exclusiva** | ÚNICO que puede editar: `package.json`, `next.config.mjs`, `capacitor.config.ts`, `tailwind.config.js`, `.env.example` |

### Jules B — Ingeniero de Producto / UI (Cuenta B — Amigo 1)

> **Filosofía:** "Hago que la app se SIENTA bien. Cada pixel tiene propósito."

| Aspecto | Detalle |
|---------|---------|
| **Dominio** | `/src/components/`, `/messages/`, `/public/`, `/src/app/[locale]/` (páginas) |
| **Rama** | `feature/jules-b-*` |
| **Responsabilidades** | Componentes React, pantallas, animaciones, traducciones i18n, assets visuales |
| **Herramientas** | Terminal de GitHub (npm run dev, lint, build) |
| **Sin AntiGravity** | NO hace Visual Probing. Eso lo hace AntiGravity (Ibai). Jules B valida con `npm run build`. |
| **Restricción** | NO toca APIs ni lógica de dominio. Consulta `docs/API_CONTRACTS.md` para saber qué puede consumir. |

### Jules C — Especialista en Calidad / QA (Cuenta C — Amigo 2)

> **Filosofía:** "Si no hay prueba, no existe. Mi código cierra el ciclo."

| Aspecto | Detalle |
|---------|---------|
| **Dominio** | `/tests/`, `/docs/`, `*.test.tsx`, `*.test.ts`, `scripts/` (auditoría) |
| **Rama** | `feature/jules-c-*` |
| **Responsabilidades** | Tests unitarios, tests E2E (Playwright/Vitest), documentación técnica |
| **Herramientas** | Terminal de GitHub (npm run test, lint, tsc) |
| **Sin AntiGravity** | NO hace Visual Probing real. Escribe tests automatizados que simulan flujos. AntiGravity (Ibai) hace la validación visual. |
| **Restricción** | NO modifica código de producción. Si encuentra bug → crea entry en `AGENT_TASKS.md` con descripción exacta del fallo. |

### Matriz de Permisos de Archivos

| Archivo/Directorio | Agente 1 | Agente 2 | Agente 3 |
|---------------------|----------|----------|----------|
| `src/app/api/` | ✅ Escribe | ❌ | ❌ |
| `src/lib/` | ✅ Escribe | 🔍 Solo lee | ❌ |
| `src/components/` | ❌ | ✅ Escribe | 🔍 Solo lee |
| `messages/*.json` | ❌ | ✅ Escribe | 🔍 Solo lee |
| `src/hooks/` | ✅ Con aviso | ✅ Con aviso | ❌ |
| `src/types/` | ✅ Escribe | 🔍 Solo lee | ❌ |
| `supabase/` | ✅ Escribe | ❌ | 🔍 Audita |
| `tests/` | ❌ | ❌ | ✅ Escribe |
| `*.test.*` | ❌ | ❌ | ✅ Escribe |
| `project_memory/` | ✅ Estado | ✅ Estado | ✅ Estado |
| `docs/` | ✅ Arquitectura | ❌ | ✅ Documentación |
| Config global | ✅ Exclusivo | ❌ | ❌ |

---

## 5. Fase I — Fundación y Contexto

> **Ejecutor:** Cuenta A (Ibai) con Flash Fast
> **Duración estimada:** 1 sesión
> **Objetivo:** Preparar el repositorio para operación multi-agente

### I.1 — Actualizar Memoria Central

Actualizar `GEMINI.md` de la raíz con las reglas multi-agente:

- Añadir sección `## Multi-Agent Protocol` con los 3 roles
- Definir la tabla de permisos de archivos
- Documentar el flujo: `Leer Memoria → Planificar → Aprobar → Ejecutar → Validar → Handoff`

### I.2 — Crear Archivos de Contexto por Agente

Crear instrucciones específicas que cada cuenta cargará al iniciar sesión:

```
project_memory/
├── AGENT_1_CONTEXT.md    # Instrucciones para el Arquitecto
├── AGENT_2_CONTEXT.md    # Instrucciones para el UI Engineer
├── AGENT_3_CONTEXT.md    # Instrucciones para el QA Specialist
├── HANDOFF_TEMPLATE.md   # Plantilla estándar de handoff
└── (existentes: GLOBAL_STATE.md, AGENT_TASKS.md, etc.)
```

### I.3 — Definir Contratos de Interfaz

Crear `docs/API_CONTRACTS.md` documentando:

- Cada endpoint existente en `/src/app/api/`
- Los tipos compartidos en `/src/types/`
- Los hooks públicos que los componentes pueden usar
- Las tablas de Supabase con sus RPC disponibles

### I.4 — Preparar Branching Strategy

```
main (producción, protegida)
├── develop (integración, protegida)
│   ├── feature/jules-*    (Agente 1)
│   ├── feature/ui-*       (Agente 2)
│   └── feature/qa-*       (Agente 3)
```

Configurar reglas de protección en GitHub:
- `main`: Solo merge desde `develop` con PR aprobada por Ibai
- `develop`: Merge desde features con checks verdes

### I.5 — Validar CI/CD Existente

Verificar que los workflows de GitHub Actions pasan:
- `deploy.yml` → Build + Deploy web
- `android-build.yml` → Build Android APK

### Checklist de Fase I

```
[ ] GEMINI.md actualizado con protocolo multi-agente
[ ] AGENT_1_CONTEXT.md creado
[ ] AGENT_2_CONTEXT.md creado
[ ] AGENT_3_CONTEXT.md creado
[ ] HANDOFF_TEMPLATE.md creado
[ ] docs/API_CONTRACTS.md generado
[ ] Branching strategy configurada en GitHub
[ ] CI/CD verificado y pasando
[ ] GLOBAL_STATE.md actualizado con nuevo estado
```

---

## 6. Fase II — Onboarding de Cuentas B y C

> **Ejecutor:** Ibai coordina; cada amigo ejecuta en su cuenta
> **Duración estimada:** 1 sesión por cuenta
> **Objetivo:** Las cuentas B y C operativas con Jules y contexto cargado

### II.1 — Setup de Jules en Cuenta B

Pasos que el titular de la Cuenta B debe seguir:

1. **Clonar el repositorio** desde la fuente (Bitbucket/GitHub)
2. **Configurar Jules** siguiendo la guía de setup de Gemini Pro
3. **Cargar contexto inicial:**
   - Apuntar Jules a leer `GEMINI.md` (raíz)
   - Apuntar Jules a leer `project_memory/AGENT_2_CONTEXT.md`
   - Apuntar Jules a leer `project_memory/TECHNICAL_CONTEXT.md`
4. **Test de humo:** Pedir a Jules que liste los componentes en `/src/components/` y describa la estructura
5. **Verificar rama:** Crear `feature/ui-test` y hacer un cambio trivial para confirmar permisos

### II.2 — Setup de Jules en Cuenta C

Mismo proceso que II.1 pero con:
- Contexto: `project_memory/AGENT_3_CONTEXT.md`
- Test de humo: Pedir que ejecute `npm run lint` y reporte resultado
- Rama de prueba: `feature/qa-test`

### II.3 — Test de Coordinación (Smoke Test)

Ejercicio coordinado para validar que la memoria compartida funciona:

1. **Agente 1** crea un nuevo tipo en `/src/types/test-coordination.ts`
2. **Agente 1** actualiza `GLOBAL_STATE.md` → "tipo nuevo disponible"
3. **Agente 2** lee `GLOBAL_STATE.md`, importa el tipo en un componente de prueba
4. **Agente 3** escribe un test unitario para ese tipo
5. **Los tres** verifican que no hubo conflictos
6. **Limpiar** archivos de prueba

### Checklist de Fase II

```
[ ] Cuenta B: Jules configurado
[ ] Cuenta B: Contexto cargado y verificado
[ ] Cuenta B: Rama feature/ui-test creada exitosamente
[ ] Cuenta C: Jules configurado
[ ] Cuenta C: Contexto cargado y verificado
[ ] Cuenta C: Rama feature/qa-test creada exitosamente
[ ] Smoke test de coordinación completado sin conflictos
[ ] GLOBAL_STATE.md actualizado post-onboarding
```

---

## 7. Fase III — Desarrollo Paralelo

> **Ejecutores:** Los 3 agentes en paralelo
> **Duración:** Continua (sprints de 1-2 días)
> **Objetivo:** Desarrollo de features sin colisiones

### III.1 — Protocolo de Sprint

Cada "sprint" de trabajo sigue este ciclo:

```
┌─────────────────┐
│  1. IBAI ASIGNA │ → Actualiza AGENT_TASKS.md con tareas masticadas
│     TAREAS      │   (ver TASKS_MASTER.md para el backlog)
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. AGENTE LEE   │ → Lee GLOBAL_STATE + su CONTEXT + tarea asignada
│    CONTEXTO     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. AGENTE       │ → Crea rama feature/[prefijo]-[tarea]
│    EJECUTA      │   Flash Fast: tarea masticada = ejecutar, no planificar
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. AGENTE       │ → Genera HANDOFF_[agente].md
│    REPORTA      │   Actualiza GLOBAL_STATE.md
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. IBAI REVISA  │ → PR review → merge a develop
│    Y APRUEBA    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 6. QA VALIDA    │ → Agente 3 ejecuta tests + Visual Probing
│    (Agente 3)   │
└─────────────────┘
```

### III.2 — Formato de Tarea "Masticada" para Flash Fast

> Flash en modo fast NO razona largo. Las tareas deben ser **atómicas y autocontenidas**.

Cada tarea en `AGENT_TASKS.md` debe seguir este formato:

```markdown
## T-XXX: [Título corto]
- **Agente:** 1 | 2 | 3
- **Prioridad:** 1-5
- **Archivos a tocar:** [lista exacta]
- **Patrón a seguir:** [archivo existente como referencia]
- **Input:** [qué datos/contratos necesita]
- **Output esperado:** [qué debe producir]
- **Criterio de éxito:** [cómo saber que está "done"]
- **NO hacer:** [restricciones explícitas]
```

**Ejemplo real:**

```markdown
## T-010: Crear endpoint GET /api/fleet/availability
- **Agente:** 1
- **Prioridad:** 2
- **Archivos a tocar:** `src/app/api/fleet/availability/route.ts` (NUEVO)
- **Patrón a seguir:** `src/app/api/fleet/route.ts` (existente)
- **Input:** Tabla `embarcaciones` + tabla `reservas` en Supabase
- **Output esperado:** JSON con boats disponibles por fecha
- **Criterio de éxito:** `curl localhost:3000/api/fleet/availability?date=2026-03-01` retorna array
- **NO hacer:** No tocar la tabla reservas. Solo lectura.
```

### III.3 — Reglas de Paralelización

| Situación | Protocolo |
|-----------|-----------|
| Agente 1 y 2 trabajan en la misma feature | Agente 1 termina backend PRIMERO → handoff → Agente 2 conecta UI |
| Dos agentes necesitan editar `hooks/` | Uno espera. Se turnan. Notificar en GLOBAL_STATE |
| Agente 3 encuentra bug en código de Agente 1 | Registra en AGENT_TASKS → Agente 1 lo arregla en su próximo sprint |
| Conflicto de merge en `develop` | SOLO Ibai resuelve conflictos |

### III.4 — Optimización de Tokens (Flash Fast)

Para minimizar consumo de tokens con Gemini Flash:

| Técnica | Implementación |
|---------|----------------|
| **Contexto mínimo** | El agente solo carga SU context file + la tarea actual. No todo el repo. |
| **Archivos de referencia** | En vez de describir un patrón, indicar "sigue el patrón de [archivo X]" |
| **Tareas atómicas** | 1 tarea = 1 archivo nuevo o modificado. Máximo 2-3 archivos. |
| **Sin replanificación** | Flash Fast no decide QUÉ hacer. Solo CÓMO hacerlo. Las decisiones las toma Ibai. |
| **Cacheo de instrucciones** | Las reglas fijas van en GEMINI.md (se cachea). Las tareas van en AGENT_TASKS.md (se lee fresco). |

---

## 8. Fase IV — Integración y Validación

> **Ejecutor tests:** Jules C (QA) — ejecuta batería automatizada
> **Ejecutor visual:** AntiGravity (Ibai) — **único** con acceso a navegador
> **Duración:** 1 sesión por ciclo de integración
> **Objetivo:** Verificar que todo el trabajo paralelo funciona junto

### IV.1 — Merge a Develop

Ibai ejecuta los merges desde las ramas feature a `develop`:

```bash
# Orden de merge recomendado (backend primero)
git checkout develop
git merge feature/jules-a-[tarea]    # Jules A (backend) primero
git merge feature/jules-b-[tarea]    # Jules B (UI) después
git merge feature/jules-c-[tarea]    # Jules C (tests) al final
# Resolver conflictos si los hay
npm run build                         # Verificar build post-merge
```

### IV.2 — Suite de Validación Automatizada (Jules C)

Jules C ejecuta en su terminal de GitHub (sin AntiGravity):

```
1. npm run lint          → Sin errores
2. npx tsc --noEmit      → Sin errores de tipos
3. npm run build         → Build exitoso
4. npm run test          → Tests verdes
5. Reporte en project_memory/QA_REPORT_[fecha].md
```

### IV.3 — Visual Probing con AntiGravity (SOLO IBAI)

> ⚠️ Esta parte la ejecuta **AntiGravity (el AI de Ibai)**, no Jules C.

Rutas críticas que AntiGravity navega tras cada integración:

| Ruta | Qué verificar |
|------|--------------|
| `/es/` | Home carga, hero visible, navbar funcional |
| `/es/academy/` | Lista de cursos visible, navegación funciona |
| `/es/academy/[curso]` | Contenido del curso, progreso, evaluaciones |
| `/es/rentals/` | Catálogo de barcos, filtros, booking flow |
| `/es/dashboard/` | Dashboard del estudiante, stats, calendario |
| `/es/admin/` | Panel admin (si autenticado como admin) |
| Responsive (375px) | Todo lo anterior en mobile viewport |

Cada verificación genera artefactos en `antigravity/`:
- Screenshot → `antigravity/screenshots/[ruta]-[fecha].png`
- Grabación → `antigravity/recordings/[flujo]-[fecha].webm`
- Reporte → `project_memory/VISUAL_PROBING_[fecha].md`

### IV.4 — Protocolo de Regresión

Si el Agente 3 detecta un fallo:

```markdown
## BUG-XXX: [Descripción corta]
- **Severidad:** Crítica | Alta | Media | Baja
- **Ruta afectada:** /es/...
- **Evidencia:** [link a screenshot/grabación]
- **Archivos sospechosos:** [lista]
- **Agente responsable:** 1 | 2
- **Pasos para reproducir:**
  1. Ir a...
  2. Hacer clic en...
  3. El resultado es... (esperado: ...)
```

### Checklist Fase IV

```
[ ] Ramas feature mergeadas a develop
[ ] npm run lint → 0 errores
[ ] npx tsc --noEmit → 0 errores
[ ] npm run build → exitoso
[ ] npm run test → todos verdes
[ ] Visual Probing completado para rutas críticas
[ ] Screenshots/grabaciones guardados
[ ] Bugs reportados (si los hay) en AGENT_TASKS.md
[ ] develop listo para merge a main
```

---

## 9. Fase V — Consolidación y Cierre

> **Ejecutor:** Ibai + Agente 3
> **Duración:** Final de cada ciclo
> **Objetivo:** Merge a main, documentar, limpiar

### V.1 — Merge a Main

```bash
git checkout main
git merge develop
git tag v[X.Y.Z]
git push origin main --tags
```

### V.2 — Resumen de Sesión Global

Ibai (o Agente 3) crea `project_memory/SESSION_SUMMARY_[fecha].md`:

```markdown
# Resumen de Sesión - [FECHA]

## Features Completadas
- [Lista de features con su T-ID]

## Archivos Modificados  
- [Lista completa]

## Decisiones Tomadas
- [Copiar de DECISIONS_LOG]

## Bugs Encontrados y Estado
- [Lista de bugs detectados y si fueron resueltos]

## Deuda Técnica Identificada
- [Items para futuros sprints]

## Métricas
- Tokens consumidos (estimado por cuenta): A: ___ | B: ___ | C: ___
- Tareas completadas: ___/___
- Bugs encontrados: ___ (resueltos: ___)
```

### V.3 — Limpieza

```
[ ] Eliminar ramas feature ya mergeadas
[ ] Archivar HANDOFF files completados
[ ] Actualizar GLOBAL_STATE.md a estado limpio
[ ] Limpiar AGENT_TASKS.md (mover completadas a historial)
[ ] Verificar que .env.example está actualizado
```

---

## 10. Protocolos de Comunicación

### Arquitectura de Comunicación

```
IBAI (AntiGravity)
    │
    ├─── Telegram ──────► Amigo 1 (Jules B)
    │                 └──► Amigo 2 (Jules C)
    │
    └─── GitHub ────────► AGENT_TASKS.md  (pool compartido)
                           GLOBAL_STATE.md (estado compartido)
```

### Canal 1: Telegram — Órdenes y Reportes Rápidos

Ibai usa Telegram para comunicarse con sus amigos (y Jules via bot) de forma instantánea:

| Quién | Mensaje tipo | Propósito |
|-------|--------------|-----------|
| **Ibai → Amigos** | `📋 T-XXX para Jules B: [descripción breve]. Está en AGENT_TASKS.md` | Asignar tarea |  
| **Ibai → Amigos** | `⚠️ STOP: Conflicto en hooks/. Espera mi OK antes de tocar ese archivo` | Control de emergencia |
| **Amigos → Ibai** | `✅ T-XXX hecha. PR abierta: [link]` | Reportar completitud |
| **Amigos → Ibai** | `🔴 Bloqueado en T-XXX: [descripción]. Necesito ayuda` | Escalar problema |
| **Bot CI/CD → Grupo** | `🚀 Deploy exitoso: v[X.Y.Z] en producción` | Notificación automática |
| **Bot CI/CD → Grupo** | `❌ Build fallido en rama [X]. Logs: [link]` | Alerta de fallo |

### Canal 2: GitHub — Pool de Tareas y Memoria Compartida

GitHub es donde los 3 Jules beben del mismo pool:

| Archivo | Propósito | Quién actualiza |
|---------|-----------|----------------|
| `project_memory/AGENT_TASKS.md` | Cola de tareas activas | AntiGravity (Ibai) escribe, Jules leen |
| `project_memory/GLOBAL_STATE.md` | Estado actual, conflictos, ramas activas | Jules actualizan al empezar/terminar |
| `project_memory/DECISIONS_LOG.md` | Registro append-only de decisiones | Cualquiera (append) |
| `project_memory/HANDOFF_[X].md` | Traspaso entre Jules | El Jules que termina escribe |

### Flujo Estándar de Asignación de Tarea

```
1. AntiGravity escribe T-XXX en AGENT_TASKS.md (masticada y detallada)
2. Ibai envía mensaje en Telegram: "📋 T-XXX lista para Jules B"
3. Jules B (Amigo 1) lee T-XXX, crea rama, ejecuta
4. Jules B actualiza GLOBAL_STATE.md → "T-XXX: en_curso"
5. Jules B termina → abre PR → avisa en Telegram: "✅ T-XXX done. PR: [link]"
6. AntiGravity revisa PR → Ibai mergea si OK
7. AntiGravity hace Visual Probing para verificar visualmente
```

### Plantilla de Handoff

```markdown
# HANDOFF — [Agente X] → [Próximo paso]
**Fecha:** YYYY-MM-DD
**Tarea:** T-XXX

## Archivos Modificados
- `path/to/file.ts` — [qué cambió y por qué]

## Descubrimientos
- [Cosas no obvias que encontré durante la implementación]

## Estado de Tests
- [Tests que pasan / que fallan / que faltan]

## Bloqueadores para el Siguiente
- [Qué necesita estar resuelto antes de continuar]

## Contexto para Flash Fast
> [Resumen en 2-3 líneas de todo lo relevante para que el próximo
> agente pueda empezar SIN leer más archivos]
```

---

## 11. Gestión de Riesgos

### R1: Sobreescritura de Archivos de Configuración

| Aspecto | Detalle |
|---------|---------|
| **Riesgo** | Dos agentes modifican `package.json`, `next.config.mjs` u otro archivo global |
| **Mitigación** | Solo el Agente 1 tiene permisos de escritura sobre archivos de config global |
| **Protocolo** | Si Agente 2/3 necesita un cambio → crea `project_memory/CONFIG_REQUEST_[fecha].md` describiendo el cambio necesario → Agente 1 lo aplica |

### R2: Alucinaciones de API

| Aspecto | Detalle |
|---------|---------|
| **Riesgo** | Un agente usa un endpoint/hook/tipo que no existe |
| **Mitigación** | `docs/API_CONTRACTS.md` como fuente de verdad + TypeScript strict mode |
| **Detección** | `npx tsc --noEmit` falla inmediatamente si un import no existe |
| **Protocolo** | Si Flash inventa un endpoint → el build falla → el agente corrige consultando `API_CONTRACTS.md` |

### R3: Saturación de Tokens

| Aspecto | Detalle |
|---------|---------|
| **Riesgo** | Una cuenta agota sus créditos antes de terminar sus tareas |
| **Mitigación** | Tareas masticadas (atómicas), Flash Fast (bajo consumo), contexto mínimo |
| **Monitoreo** | Registrar estimación de tokens consumidos en cada SESSION_SUMMARY |
| **Protocolo de emergencia** | Si una cuenta se queda sin créditos → sus tareas pendientes se redistribuyen entre las otras dos |

### R4: Divergencia Arquitectónica

| Aspecto | Detalle |
|---------|---------|
| **Riesgo** | Los agentes toman decisiones inconsistentes sobre patrones de código |
| **Mitigación** | Todos los agentes leen `GEMINI.md` + `TECHNICAL_CONTEXT.md` al inicio |
| **Detección** | Agente 3 (QA) revisa consistencia durante Visual Probing |
| **Protocolo** | Si se detecta → STOP → Ibai decide → se documenta en `DECISIONS_LOG.md` |

### R5: Capacitor Build Breaks

| Aspecto | Detalle |
|---------|---------|
| **Riesgo** | Cambios en web rompen el build de Android/iOS |
| **Mitigación** | Ejecutar `npm run build:capacitor` como parte de la validación de Fase IV |
| **Responsable** | Agente 1 (es el único que toca configuración de Capacitor) |

---

## 12. Apéndice: Checklists por Fase

### Quick Reference: ¿Qué fase estoy ejecutando?

```
¿Es la primera vez que configuro el sistema?        → FASE I
¿Estoy configurando una cuenta nueva?                → FASE II
¿Estoy desarrollando features?                       → FASE III
¿Estoy integrando y probando trabajo de los 3?       → FASE IV
¿Estoy cerrando un ciclo y deployando?               → FASE V
```

### Archivo de Referencia Rápida para Flash Fast

Cada agente al iniciar sesión ejecuta esta secuencia:

```
1. "Lee project_memory/GLOBAL_STATE.md"
2. "Lee project_memory/AGENT_[N]_CONTEXT.md"
3. "Lee project_memory/AGENT_TASKS.md y busca tu próxima tarea"
4. "Ejecuta la tarea según las instrucciones masticadas"
5. "Cuando termines, actualiza GLOBAL_STATE.md y crea HANDOFF"
```

---

> **Documento mantenido por:** Ibai (Cuenta A)
> **Próxima revisión:** Después de completar Fase I
> **Versión:** 1.0
