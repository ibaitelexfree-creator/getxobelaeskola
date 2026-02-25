# ⚓ GETXO BELA ESKOLA - EXTENSIVE MASTER DOCUMENT (SSOT) v2.1
> **Complete Integration of all Project Intelligence**
> *Compiled on: 2026-02-25*

---

## 1. 📂 MASTER README & ARCHITECTURE
### README.md
Modern Learning Management and Fleet Administration system for sailing schools.

#### 🚀 Getting Started
- **Prerequisites:** Node.js 18+, Supabase Account, Resend API, Stripe Account.
- **Installation:** `npm install`
- **Execution:** `npm run dev`

#### 🛠️ Validation & Utilities
- `node scripts/db-sanity-check.js`: Audits critical tables.
- `node scripts/test-contact.js`: Validates contact form API.
- `npm run build`: Standard Next.js build.

#### 🔑 Key Environment Variables
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/cleanup scripts |
| `RESEND_API_KEY` | Transactional emails |
| `ADMIN_EMAIL` | Contact notifications destination |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Public Key |

---

### CORE_TECHNICAL_DOCUMENTATION.md
#### 2.1 Database Schema (High-Level)
The database is organized into several functional domains:
- **Identity & Profiles:** `profiles` (linked to `auth.users`), `staff_profiles`.
- **Academy:** `niveles_formacion`, `cursos`, `modulos`, `unidades_didacticas`.
- **Student Progress:** `progreso_alumno`, `habilidades_alumno`, `logros_alumno`, `horas_navegacion`, `certificados`.
- **Evaluations:** `evaluaciones`, `preguntas`, `intentos_evaluacion`.
- **Rentals & Fleet:** `fleet` (boats), `reservas_alquiler`, `servicios_alquiler`, `maintenance_logs`.
- **Communication:** `mensajes_contacto`, `newsletters`.

#### 3.1 Academy Progression
Students advance through a strict hierarchy: `Level -> Course -> Module -> Unit`
- **Unlock Logic:** Sequential based on completion and passing scores (60% quizzes, 75% exams).
- **Gamification:** XP via `calculateEstimatedXP`. Ranks: Grumete -> Marinero -> Timonel -> Patrón -> Capitán.

#### 3.3 Internationalization (i18n)
- Uses `next-intl` with a `/[locale]/` route segment.
- Languages: ES, EU, EN, FR. Standard: Minimum ES/EU columns in DB.

---

### ARCHITECTURE.md
- **Tech Stack:** Next.js 14 (App Router), Supabase (Auth/DB), Stripe, Resend.
- **Design System:** "Nautical" (Tailwind, deep blues, amber accents).
- **Directory Map:**
  - `src/app/api`: Backend logic.
  - `src/app/[locale]/academy`: LMS core.
  - `src/components`: UI components.
  - `src/lib`: Supabase and API clients.

---

## 2. 🤖 MULTI-AGENT OPERATIONAL GUIDE (GUIA_OPERATIVA_MULTI_AGENTE.md)
*Full Sprint and Permission Protocols*

### 2.1 System Architecture
- **AntiGravity:** ÚNICO orquestador. Solo Ibai. Lee código, valida, asigna, revisa PRs.
- **Jules A (Arquitecto):** Backend, APIs, DB. `/src/app/api`, `/src/lib`, `/supabase`.
- **Jules B (UI Engineer):** UI, traducciones. `/src/components`, `/messages`, `/public`.
- **Jules C (QA Specialist):** Tests, docs, auditoría. `/tests`, `/docs`, `*.test.*`.

### 2.2 Permissions Matrix
| Archivo/Directorio | Agente 1 (A) | Agente 2 (B) | Agente 3 (C) |
|---------------------|----------|----------|----------|
| `src/app/api/` | ✅ Escribe | ❌ | ❌ |
| `src/lib/` | ✅ Escribe | 🔍 Lee | ❌ |
| `src/components/` | ❌ | ✅ Escribe | 🔍 Lee |
| `messages/` | ❌ | ✅ Escribe | 🔍 Lee |
| `tests/` | ❌ | ❌ | ✅ Escribe |

### 2.3 Sprint Cycle
1. **Ibai Asigna:** Actualiza `AGENT_TASKS.md` con tareas masticadas.
2. **Agente Lee:** Consulta `GLOBAL_STATE` y su contexto.
3. **Agente Ejecuta:** Crea rama feature.
4. **Agente Reporta:** Genera `HANDOFF` y actualiza `GLOBAL_STATE`.
5. **Ibai Revisa:** PR review -> merge.

---

## 3. 🧠 AGENT PHILOSOPHY & MEMORY (AGENTS.md & SOUL.md)
### Memory Protocol
- **`memory/YYYY-MM-DD.md`**: Raw daily logs.
- **`MEMORY.md`**: Long-term curated memory (Main session only).
- **`GLOBAL_STATE.md`**: Shared state to avoid agent conflicts.

### The "Soul" Rules
- Be resourcefull before asking.
- Earn trust through competence.
- Text > Brain: If worth remembering, write it to a file.
- Heartbeats: Batch email, calendar, and weather checks to stay proactive.

---

## 4. 📈 PROJECT PROGRESS & CURRENT STATE
### PROGRESS.md (Milestone List)
- [x] Phase 1-7: Full System Audits.
- [x] Phase 8: Progressive Refactoring (Renaming, Portability).
- [x] Phase 9.1: Testing Setup.
- [ ] Phase 11: Performance Optimization (Next Step).

### SBRM_STATUS.md
- **Maestro v3 Status:** Ready.
- **Execution:** Jules -> Gemini Flash -> ClawdBot.
- **Visual Relay:** Enabled via Browserless to Telegram.

### GLOBAL_STATE.md (As of Today)
- **Active Branch:** `feature/jules-weather-tests`.
- **Key Completion:** NotebookLM report generation logic.

---

## 📋 CURRENT TASK POOL (AGENT_TASKS.md)
| ID | Priority | Agente | Tarea | Estado |
|----|-----------|--------|-------|--------|
| T-MLXM4FQP | 3 | jules | Mission control dashboard offline check | running |
| T-MLXE01D4 | 3 | jules | Swap App Icons / Logos Between Apps | running |
| TEST-TG... | 3 | jules | Telegram Simulation: Collision bug | running |

---
*Unified and comprehensive Master Doc generated by Antigravity AI*
