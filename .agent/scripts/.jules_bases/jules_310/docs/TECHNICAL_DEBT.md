# Technical Debt Report - Getxo Sailing School

This document tracks known issues, placeholders, and areas for improvement within the codebase.

## 🔴 High Priority (Functional Gaps)

- **Achievement Integration (`src/hooks/useAcademyFeedback.ts`):** 
  - `checkForNewAchievements` is currently a placeholder. It fetches data but doesn't compare it or trigger notifications for new achievements.
- **User Preferences (`src/hooks/useAcademyFeedback.ts`):** 
  - `toggleAnimations` is not implemented. Needs integration with Supabase profiles to persist user settings.

## 🟡 Medium Priority (Refactoring & UX)

- **Hardcoded URLs:** 
  - Several components (e.g., `EmailTemplates`) and API routes have hardcoded production URLs (`https://getxo-sailing-school.vercel.app`). These should be replaced by `NEXT_PUBLIC_APP_URL`.
- **RBAC Enforcement:**
  - While middleware exists, some API routes (like `admin/courses/create`) should be double-checked for consistent use of `requireAdmin()` or `requireInstructor()`.

## 🟢 Low Priority (Cleanup)

- **Simulation Mode Warning:**
  - Resend simulation logs messages to the console. This is fine for development but should be strictly monitored to never hit "simulation" in production due to misconfiguration.
- **Translation Parity:**
  - Continuous audit needed for `messages/es.json` and `messages/eu.json` to ensure no keys are missing during new feature development.

## 🔦 Tracked TODOs/FIXMEs

- `src/hooks/useAcademyFeedback.ts`: Update user preferences in Supabase.
- `src/components/academy/evaluation/SimpleEvaluation.tsx`: Generic TODOs related to quiz state.
- `src/app/api/academy/evaluation/start/route.ts`: TODOs regarding attempt counting and cooldown.
