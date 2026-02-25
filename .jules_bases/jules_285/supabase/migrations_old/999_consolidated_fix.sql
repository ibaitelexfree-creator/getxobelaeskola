-- Consolidated Fix Script for Missing Supabase Columns
-- Created to address discrepancies found during audit

-- 1. Profiles: Add Gamification Columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- 2. Cursos & Servicios: Add Stripe Product ID
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE public.servicios_alquiler ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

-- 3. Ensure Indices for Stripe (from 028)
CREATE INDEX IF NOT EXISTS idx_inscripciones_stripe_session ON public.inscripciones(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_reservas_stripe_session ON public.reservas_alquiler(stripe_session_id);

-- 4. Ensure Indices for speed (from 028)
CREATE INDEX IF NOT EXISTS idx_inscripciones_user_curso ON public.inscripciones(perfil_id, curso_id, edicion_id);
CREATE INDEX IF NOT EXISTS idx_reservas_user_slot ON public.reservas_alquiler(perfil_id, servicio_id, fecha_reserva, hora_inicio);

-- 5. Membership columns review (from 025) - usually present but ensuring
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_socio TEXT DEFAULT 'no_socio' CHECK (status_socio IN ('activo', 'cancelado', 'no_socio', 'past_due'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fecha_fin_periodo TIMESTAMPTZ;

-- Indices for membership
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON public.profiles(stripe_subscription_id);
