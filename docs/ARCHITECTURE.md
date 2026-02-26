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
<<<<<<< HEAD
## 5. Portability & Orchestration
The project environment is designed for absolute portability. 
- **Relative Paths:** All management scripts (`/scripts/*.ps1`, `/orchestration/*.py`) utilize dynamic path detection (via `$PSScriptRoot` or `__file__`) to eliminate dependencies on local user directories.
- **Orchestration Hub:** The system uses a centralized orchestration logic in `/orchestration` to coordinate various AI agents and external services.
- **Portability Rule:** Hardcoded absolute paths are strictly forbidden to ensure the project remains functional across different development environments without manual reconfiguration.

---
*Last Updated: February 2024*
=======
- **Strict Typing:** All new code must be fully typed. Avoid `any`.
- **Localization:** All user-facing text must be in `messages/es.json` & `eu.json`.
- **Server vs Client:** Prefer Server Components by default. Use 'use client' only for interactive islands.
>>>>>>> pr-286
