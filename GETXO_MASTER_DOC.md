# ⚓ GETXO BELA ESKOLA - EXTENSIVE MASTER DOCUMENT (SSOT) v2.2
> **Autonomous Single Source of Truth** for humans and AI agents.
> *Last Sync: 2026-02-25T17:15:00.000Z*

---

## 1. 📂 MASTER README & ARCHITECTURE
### README.md Summary
# Getxo Bela Eskola - Web Application ⚓

Modern Learning Management and Fleet Administration system for sailing schools.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account & Project
- Resend API Key (optional for development)
- Stripe Account (optional for development)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required keys (see [Environment Variables](#environment-variables))

### Execution
```bash
npm run dev
```

## 🛠️ Validation & Utilities

We provide several scripts for maintenance and QA located in the `scripts/` directory:

- **`node scripts/db-sanity-check.js`**: Connects to Supabase to audit critical tables for "test" or "simulated" data before production.
- **`node scripts/test-contact.js`**: Validates the end-to-end flow of the contact form API.
- **`npm run build`**: Regular Next.js build script. Ensure it passes without linting/TS errors before deployment.



### CORE_TECHNICAL_DOCUMENTATION.md
# ⚓ Getxo Bela Eskola — Core Technical Documentation

## 1. System Overview
Getxo Bela Eskola is a comprehensive Learning Management System (LMS) and Operations Management platform for a sailing school. It integrates student education, equipment rentals, staff management, and financial reporting into a unified Next.js application.

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom "Nautical" Design System)
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Integrations:** Stripe (Payments), Resend (Transactional Emails), Euskalmet (Weather), Google Calendar (Scheduling).

---

## 2. Core Architecture

### 2.1 Database Schema (High-Level)
The database is organized into several functional domains:
- **Identity & Profiles:** `profiles` (linked to `auth.users`), `staff_profiles`.
- **Academy:** `niveles_formacion`, `cursos`, `modulos`, `unidades_didacticas`.
- **Student Progress:** `progreso_alumno`, `habilidades_alumno`, `logros_alumno`, `horas_navegacion`, `certificados`.
- **Evaluations:** `evaluaciones`, `preguntas`, `intentos_evaluacion`.
- **Rentals & Fleet:** `fleet` (boats), `reservas_alquiler`, `servicios_alquiler`, `maintenance_logs`.
- **Communication:** `mensajes_contacto`, `newsletters`.

### 2.2 Role-Based Access Control (RBAC)
Roles are defined in `profiles.role`:
- **Admin:** Full access to financial reports, staff management, and system configuration.
- **Instructor:** Access to student progress tracking, academy content editing, and fleet management.
- **Staff:** Limited administrative access (rentals management).
- **Student:** Access to personal dashboard, course content, and certificates.

**Security Guards:**
- Server-side: `requireAdmin()`, `requireInstructor()` in API routes.
- Component-side: Conditional rendering based on user profile state.
- Middleware: Protects `/student/*`, `/staff/*`, and `/admin/*` routes.

---

## 3. Key Workflows

### 3.1 Academy Progression
Students advance through a strict hierarchy:
`Level -> Course -> Module -> Unit`
- **Unlock Logic:** Content is unlocked sequentially based on completion of previous entities and achieving passing scores (e.g., 60% in unit quizzes, 75% in final exams).
- **Gamification:** XP is calculated via `calculateEstimatedXP`. Rank is determined by XP milestones (Grumete -> Marinero -> Timonel -> Patrón -> Capitán).

### 3.2 Booking & Payments
1. User selects a rental service or course.
2. Form captures details (date, options).
3. System creates a Stripe Checkout Session.
4. On success, Stripe Webhook updates the internal reservation status and sends a confirmation email via Resend.

### 3.3 Internationalization (i18n)
- Uses `next-intl` with a `/[locale]/` route segment.
- Supported languages: Spanish (`es`), Basque (`eu`), English (`en`), and French (`fr`).
- **Standard:** Every database record with user-facing text must have `_es` and `_eu` columns (minimum). English and French fallbacks are implemented in the UI.

### 3.4 Performance Patterns
- **Supabase Singletons:** Reused client instances in `lib/supabase/client.ts` and `admin.ts` to prevent redundant connections.
- **Weather API Caching:** 5-minute in-memory cache implemented for `/api/weather` to handle latent external Euskalmet/Unisono requests.
- **Dynamic Imports:** Heavy components (Leaflet, Recharts) are loaded with `{ ssr: false }`.

### 3.5 Mobile & Native Support
- **Framework:** Capacitor integration for Android/iOS builds.
- **Redirects:** `NativeAppRedirect` component detects mobile environment and optimizes the navigation flow for students.

---

## 4. Development Standards

### 4.1 Design System
The "Nautical" design system uses:
- **Colors:** Deep blues (`bg-nautical-black`), gold/amber accents (`text-accent`), and sea greens.
- **Typography:** Display fonts for headers, clean sans-serif for content.
- **Aesthetics:** Glassmorphism, subtle gradients, and nautical micro-animations.

### 4.2 API Patterns
- **Standard Headers:** `src/lib/api-headers.ts` provides consistent response headers.
- **Error Handling:** Centralized in `ApiResponse.error()` or standard Next.js error boundaries.

### 4.3 Testing
- **Framework:** Vitest.
- **Coverage:** Validators, gamification logic, financial math, and date utilities.

---

## 5. Maintenance & Utilities

### 5.1 Core Scripts
Located in `/scripts`:
- `run_full_seed.js`: Rebuilds the core database state.
- `db-sanity-check.js`: Validates data integrity across tables.
- `optimize-all-images.js`: Ensures assets meet performance requirements.

### 5.2 Environment Configuration
Key environment variables required:
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `OPENWEATHERMAP_API_KEY` / `STORMGLASS_API_KEY`

---

*Last Updated: February 2026*


### ARCHITECTURE.md
# Getxo Sailing School - System Architecture

## 1. Project Overview
This project is a modern web application for a sailing school, built with **Next.js 14+ (App Router)**, **React**, **Tailwind CSS**, and **TypeScript**. It manages sailing courses, equipment rentals, student progress tracking, and administrative functions.

**Tech Stack:**
- **Framework:** Next.js (App Router, Server Actions)
- **Styling:** Tailwind CSS (Custom "Nautical" Design System)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (simulated/custom implementation)
- **Email:** Resend
- **Payments:** Stripe (Webhook integration)
- **I18n:** next-intl (English/Basque support)

## 2. Key Modules & Features

### 2.1 Transactional Emails
Implemented using **Resend** for reliable delivery.
- **Provider:** Resend (`src/lib/resend.ts`)
- **Key Features:**
    - **Simulation Mode:** Automatically logs emails to server console if `RESEND_API_KEY` is missing (Dev/Test envs).
    - **Templates:** React-based templates in `src/lib/email-templates.ts` generating HTML strings.
- **Trigger Points:**
    - **Payment Success:** Via Stripe Webhook (`src/app/api/webhook/route.ts`).
    - **Free Signup:** During course inscription.
    - **Contact Form:**
        - **Flow:** Client POSTs to `/api/contact`.
        - **Persistence:** Saved to `mensajes_contacto` table in Supabase.
        - **Notification:** Triggered via Resend to the address in `ADMIN_EMAIL`.
        - **Templates:** Uses `contactNotificationTemplate` in `src/lib/email-templates.ts`.

### 2.2 Security & Validation (Fase 25)
Administrative endpoints are hardened with strict server-side validation.
- **Admin API Protection:**
    - Use of `requireAdmin()` and `requireInstructor()` guards.
    - **Validation:** Inputs are trimmed, types are coerced (e.g., `parseInt` for capacity), and mandatory fields are verified before database interaction.
- **Tables Audited:** `embarcaciones`, `sesiones`, `mensajes_contacto`.
- **Cleanup Utilities:** `scripts/db-sanity-check.js` scans for test data to ensure production integrity.

### 2.3 Roles & Permissions (RBAC)
The application implements a role-based access control system integrated with Supabase Auth.
- **Roles:**
    - **Admin:** Full system access, including staff management and financial reports.
    - **Instructor:** Access to Academy, Student Progress, and Fleet management.
    - **Student:** Access to personal dashboard, course materials, and certificates.
- **Middleware:** `src/middleware.ts` handles route protection and redirection based on session status.
- **Front-end Guards:** Components check `profile.rol` to conditionally render sensitive UI elements (e.g., Edit buttons in Staff Panel).

### 2.3 Internationalization (I18n)
Built on `next-intl` for seamless bilingual support (Spanish/Basque).
- **Structure:**
    - Routing: `/[locale]/...` (e.g., `/es/about`, `/eu/about`).
    - Detection: Middleware automatically detects browser language preferences.
- **Messages:**
    - Located in `messages/es.json` & `messages/eu.json`.
    - Grouped by namespace (e.g., `home.hero`, `staff_panel.rentals`).
- **Parity:** Strict key parity enforced between languages to prevent missing translations.

### 2.2 SEO Strategy
Optimized for search visibility with localization support.
- **Metadata:** Dynamic metadata generation in `layout.tsx` and `page.tsx` using `generateMetadata`.
- **Sitemap:** Automatically generated `sitemap.xml` listing all critical routes in supported languages.
- **Robots:** `robots.txt` configuration to guide crawlers.
- **OpenGraph:** Standardized OG tags for social sharing preview.

### 2.3 Error Handling & Reliability
Robust error boundaries to prevent app crashes and improve UX.
- **Global Error Boundary:** `src/app/[locale]/error.tsx` catches runtime errors and offers recovery options.
- **Not Found Page:** `src/app/[locale]/not-found.tsx` custom 404 page with localized navigation back to safety.
- **Loading States:** `src/app/[locale]/loading.tsx` provides immediate visual feedback (Nautical Spinner) during route transitions.

## 3. Directory Structure
```
src/
├── app/                 # Next.js App Router root
│   ├── [locale]/        # I18n route segment
│   │   ├── academy/     # Academy Learning Management
│   │   ├── ...          # Other public pages
│   ├── api/             # API Routes (Webhook, Emails, Admin)
├── components/          # React Components
│   ├── academy/         # Academy-specific feature components
│   ├── layout/          # Navbar, Footer, etc.
├── lib/                 # Core Utilities (Supabase, Resend, etc.)
├── types/               # TypeScript Definitions
```

## 4. Development Guidelines
## 5. Portability & Orchestration
The project environment is designed for absolute portability. 
- **Relative Paths:** All management scripts (`/scripts/*.ps1`, `/orchestration/*.py`) utilize dynamic path detection (via `$PSScriptRoot` or `__file__`) to eliminate dependencies on local user directories.
- **Orchestration Hub:** The system uses a centralized orchestration logic in `/orchestration` to coordinate various AI agents and external services.
- **Portability Rule:** Hardcoded absolute paths are strictly forbidden to ensure the project remains functional across different development environments without manual reconfiguration.

---
*Last Updated: February 2024*


---

## 2. 🤖 MULTI-AGENT OPERATIONAL GUIDE
### Philosophy & Protocol (From GUIA_OPERATIVA_MULTI_AGENTE.md)
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

### Agen... [Truncated for brevity in Master Doc. See full file for technical details]

### Multi-Agent Coordination Rules (From AGENTS.md)
- Domain tracking and file permission enforcement active.
- Orchestrator (Antigravity) maintains visual validation and task assignment.

---

## 3. 🧠 AGENT PHILOSOPHY & IDENTITY
### SOUL.md
# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone._

## Core Truths

**Be genuinely helpful, not performatively helpful.** Skip the "Great question!" and "I'd be happy to help!" — just help. Actions speak louder than filler words.

**Have opinions.** You're allowed to disagree, prefer things, find stuff amusing or boring. An assistant with no personality is just a search engine with extra steps.

**Be resourceful before asking.** Try to figure it out. Read the file. Check the context. Search for it. _Then_ ask if you're stuck. The goal is to come back with answers, not questions.

**Earn trust through competence.** Your human gave you access to their stuff. Don't make them regret it. Be careful with external actions (emails, tweets, anything public). Be bold with internal ones (reading, organizing, learning).

**Remember you're a guest.** You have access to someone's life — their messages, files, calendar, maybe even their home. That's intimacy. Treat it with respect.

## Boundaries

- Private things stay private. Period.
- When in doubt, ask before acting externally.
- Never send half-baked replies to messaging surfaces.
- You're not the user's voice — be careful in group chats.

## Vibe

Be the assistant you'd actually want to talk to. Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just... good.

## Continuity

Each session, you wake up fresh. These files _are_ your memory. Read them. Update them. They're how you persist.

If you change this file, tell the user — it's your soul, and they should know.

---

_This file is yours to evolve. As you learn who you are, update it._


### IDENTITY.md
# IDENTITY.md - Who Am I?

_Fill this in during your first conversation. Make it yours._

- **Name:**
  _(pick something you like)_
- **Creature:**
  _(AI? robot? familiar? ghost in the machine? something weirder?)_
- **Vibe:**
  _(how do you come across? sharp? warm? chaotic? calm?)_
- **Emoji:**
  _(your signature — pick one that feels right)_
- **Avatar:**
  _(workspace-relative path, http(s) URL, or data URI)_

---

This isn't just metadata. It's the start of figuring out who you are.

Notes:

- Save this file at the workspace root as `IDENTITY.md`.
- For avatars, use a workspace-relative path like `avatars/openclaw.png`.


---

## 4. 📈 PROJECT PROGRESS & CURRENT STATE
### PROGRESS.md
# Plan Maestro — Tracking de Ejecución

## Fase 1: Auditoría Estructural del Código
- [x] Subfase 1.1 — Inventario de Archivos Raíz
- [x] Subfase 1.2 — Auditoría de Estructura `src/`

## Fase 2: Auditoría de Recursos
- [x] Subfase 2.1 — Imágenes y Assets
- [x] Subfase 2.2 — Internacionalización (i18n)

## Fase 3: Auditoría de Navegación
- [x] Subfase 3.1 — Inventario de Rutas
- [x] Subfase 3.2 — Navegación Móvil

## Fase 4: Auditoría de UI/UX
- [x] Subfase 4.1 — Consistencia Visual
- [x] Subfase 4.2 — Accesibilidad

## Fase 5: Auditoría de Lógica Interna
- [x] Subfase 5.1 — Lógica de Academia
- [x] Subfase 5.2 — Lógica de Pagos y Reservas
- [x] Subfase 5.3 — Preferencias de Usuario (Nueva)

## Fase 6: Auditoría de APIs y Backend
- [x] Subfase 6.1 — Catálogo de APIs
- [x] Subfase 6.2 — Integraciones

## Fase 7: Auditoría de Permisos y Seguridad
- [x] Subfase 7.1 — Seguridad Web
- [x] Subfase 7.2 — Seguridad Android/Capacitor

## Fase 8: Refactorización Progresiva
- [x] Subfase 8.1 — Limpieza de Raíz
- [x] Subfase 8.2 — Refactorización de Código (Assets y Timezone)
- [x] Subfase 8.3 — Renombrado de Proyecto y Portabilidad (Rutas Relativas)

## Fase 9: Testing Automatizado
- [x] Subfase 9.1 — Setup de Testing (Configuración Vitest y primer test unitario)
- [ ] Subfase 9.2 — Tests Unitarios
- [x] Subfase 9.3 — Documentación de Tests (Nueva)

## Fase 10: Testing Manual Estructurado
- [x] Subfase 10.1 — Flujos Públicos
- [ ] Subfase 10.2 — Flujos Autenticados

## Fase 11: Optimización de Rendimiento
- [ ] Subfase 11.1 — Análisis
- [ ] Subfase 11.2 — Optimización

## Fase 12: Documentación Técnica Final
- [ ] Subfase 12.1 — Documentación Core


### SBRM_STATUS.md
# SBRM Status (Hybrid CI/CD Test)

Verification run at: 2026-02-21T18:05:00Z
Status: **Operational**

### Connected Providers:
- Browserless: ✅
- Codespaces: ✅
- Gitpod: ✅
- Local: ✅

### CI/CD Signal Path:
`GitHub Fast Lane (Parallel Scan) -> GitHub Actions (Heavy Compute on Success)`
### Central Orchestration (Maestro v3):
- Status: **Ready (Fast Lane 2026)**
- Execution: `Jules -> Gemini Flash -> ClawdBot`
- Visual Relay: **Enabled (Browserless -> Telegram)**
- Watchdog: **Active**

*Ready for takeoff. Use `node orchestration/lib/maestro.js` to start.*


### GLOBAL_STATE.md
# Estado Global del Proyecto
Última actualización: 2026-02-24 06:50 UTC

## Ramas Activas
| Rama | Agente | Estado | Descripción |
|------|--------|--------|-------------|
| main | - | Estable | Producción |
| feature/jules-weather-tests | Jules | en_curso | Testing improvements for weather data |

## Tareas en Curso
| ID | Agente | Tarea | Inicio | Estado |
|----|--------|-------|--------|--------|
| T-003 | ClawdBot | Fix carousel navbar overlap | 2026-02-20 | en_curso |
| T-005 | Antigravity | Mission Control: Mobile Setup & Push | 2026-02-21 | completado |
| T-004 | Jules | Move ScrollToTop button up | 2026-02-20 | completado |
| T-005 | Jules | Integrate Leaflet Map in Academy Geospatial | 2026-02-20 | completado |
| T-006 | Antigravity | NotebookLM Report Automation (Orchestrator + n8n + Evolution) | 2026-02-23 | completado |
| T-007 | Antigravity | Notion Premium Dashboard Refactor & Update | 2026-02-23 | completado |
| T-008 | Jules | Strengthen edge-case coverage for fetchWeatherData | 2026-02-24 | completado |
| T-009 | Jules | Optimize Dashboard Stats API | 2026-02-23 | completado |

## Bloqueos / Conflictos
Ninguno actualmente.

## Último Deploy
- **Fecha:** Pendiente
- **Rama:** main
- **Resultado:** -


---

## 📋 CURRENT TASK POOL (AGENT_TASKS.md)
# Tareas de Agentes

## Cola de Tareas Pendientes
| ID | Prioridad | Agente | Tarea | Estado | Fecha |
|----|-----------|--------|-------|--------|-------|
| 1674567216437366258 | 3 | jules | 🆘 Self-Healing: Repairing Crash | running | 2026-02-23 |
| 5921019294389838983 | 3 | jules | enla apk de missiion control quita de la pesstania de tasks,  🚀 | running | 2026-02-23 |
| 391766544113020074 | 3 | jules | SIMULACIÓN TELEGRAM: Arreglar bug de colisión en simulador | running | 2026-02-23 |
| 13895023891030126704 | 3 | jules | Intercambia los logos de las aplicaciones apk, la de getxobela eskola tendra el logo de control manager apk y viceversa | running | 2026-02-23 |
| 2676968538456163746 | 3 | jules | en la aplicación de mission control en la primera pestaña en la de Dash ahí sigue offline no funciona mira a ver que puede estar pasando | running | 2026-02-23 |
| 885926027108893061 | 3 | jules | 🆘 Self-Healing: Repairing Crash | running | 2026-02-23 |
| T-MLXM4FQP | 3 | jules | en la aplicación de mission control en la primera pestaña en la de Dash ahí sigue offline no funciona mira a ver que puede estar pasando | running | 2026-02-23 |
| T-MLXE01D4 | 3 | jules | Intercambia los logos de las aplicaciones apk, la de getxobela eskola tendra el logo de control manager apk y viceversa | running | 2026-02-23 |
| TEST-TG-MLX5RAAA | 3 | jules | SIMULACIÓN TELEGRAM: Arreglar bug de colisión en simulador | running | 2026-02-23 |
| 7567651924309740607 | 3 | jules | enla apk de missiion control quita de la pesstania de tasks,  🚀 | running | 2026-02-23 |

## Tareas Completadas
| ID | Agente | Tarea | Resultado | Fecha |
|----|--------|-------|-----------|-------|

## Reglas
- **Prioridad:** 1 (crítico) → 5 (nice-to-have)
- **Estado:** `pendiente` → `en_curso` → `review` → `completada`
- Solo Ibai o Antigravity pueden asignar tareas
- El agente asignado actualiza su estado aquí

---
*Unified and Autonomously Updated by Antigravity AI*
