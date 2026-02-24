# 🚀 Deployment Guide - Getxo Bela Eskola

This guide connects the dots between your local development and a production-grade deployment on **Vercel** + **Supabase**.

## 1. Prerequisites

- [ ] **GitHub Repository**: Ensure all your code is pushed to a `main` branch.
- [ ] **Vercel Account**: Linked to your GitHub.
- [ ] **Supabase Project**: A separate production project (recommended) or the same one if strictly controlling keys.

## 2. Supabase Production Setup

If creating a **new** production project:

1.  **Create Project**: Go to [database.new](https://database.new) and create a new project.
2.  **link** (Optional): You can link locally, but for production, we'll apply migrations.
3.  **Apply Schema & Migrations**:
    - Go to the SQL Editor in your new project.
    - Copy content from `supabase/schema.sql` (if it contains the baseline).
    - Apply all migrations in `supabase/migrations/` in numeric order.
    - *Tip*: You can concatenate them or use `supabase db push` if you link the project locally to a prod target.

### Vital: Enable Row Level Security (RLS)
The migrations should have enabled this, but verify in **Authentication -> Policies**:
- `profiles`, `progreso_alumno`, `certificados`, etc. should have active policies.
- **Instructors table**: Ensure you manually insert your instructor records if not seeded.

### Storage Buckets
Create the following public buckets if they don't exist:
- `avatars`
- `course-images`
- `certificates` (This one handles generated PDFs)

## 3. Environment Variables (Vercel)

Go to your Vercel Project -> **Settings** -> **Environment Variables**.
Add the following (use the values from your *Production* Supabase project):

| Variable Key | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Check Supabase Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Check Supabase Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRET**. Check Supabase Settings -> API |
| `NEXT_PUBLIC_APP_URL` | Your production domain (e.g. `https://getxobela.vercel.app`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| Stripe Live PK |
| `STRIPE_SECRET_KEY` | Stripe Live SK |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (see below) |

## 4. Stripe Webhook Configuration

1.  Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks).
2.  Add Endpoint: `https://your-production-domain.com/api/webhook`.
3.  Select Events: `checkout.session.completed`, `payment_intent.succeeded`.
4.  Copy the `Signing Secret` (`whsec_...`) and add it to Vercel Environment Variables.

## 5. Deployment

1.  Push to `main`.
2.  Vercel should automatically trigger a build.
3.  **Verify**:
    - Navigate to the URL.
    - Sign Up as a new user.
    - Check if the profile is created in Supabase.
    - Try to access a paid course (should be redirected to Stripe/Locked).

## 6. Post-Deployment Checks

- **Cron Jobs**: If using Vercel Cron for reminders, ensure `vercel.json` is configured (currently handled by client-trigger/user action, so no cron needed strictly for MVP).
- **Assets**: Navigate to the Academy. Do images load? (Check `NEXT_PUBLIC_SUPABASE_URL` in `next.config.mjs` images domains).
- **Certificates**: Complete a course and check if the PDF generation works (this uses `SUPABASE_SERVICE_ROLE_KEY`).

## 🚨 Troubleshooting

- **500 Errors on API**: Check Vercel Logs. Usually missing ENVs.
- **Images not loading**: Add the production Supabase hostname to `next.config.mjs` -> `images.domains`.
- **"Database error saving new user"**: Check `profiles` RLS or Triggers.

## 7. Seeding Production Data (Critical)

After applying the schema and migrations, you must populate the database with the initial content. Run these SQL files in the **exact order**:

1.  `supabase/seeds/FINAL_SEED_CURSO1.sql`
    *   *Creates the Course structure (Levels, Modules, Units) and Questions.*
    *   *Must run first so Skills can link to these IDs.*
2.  `supabase/seeds/004_skills_catalog.sql`
    *   *Creates the Skills Tree and unlock rules.*
3.  `supabase/seeds/005_logros_catalog_v2.sql`
    *   *Creates the Achievements (Logros) catalog.*

**How to run:**
- **Option A (Supabase Dashboard)**: Copy-paste the content of each file into the SQL Editor.
- **Option B (CLI)**:
  ```bash
  psql -h aws-0-eu-central-1.pooler.supabase.com -p 6543 -d postgres -U postgres.<your-ref> -f supabase/seeds/FINAL_SEED_CURSO1.sql
  # ... repeat for others
  ```
