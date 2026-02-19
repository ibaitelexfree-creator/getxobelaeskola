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
