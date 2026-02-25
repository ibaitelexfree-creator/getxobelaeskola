-- Migración para añadir soporte de socios y suscripciones
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS status_socio TEXT DEFAULT 'no_socio' CHECK (status_socio IN ('activo', 'cancelado', 'no_socio', 'past_due')),
ADD COLUMN IF NOT EXISTS fecha_fin_periodo TIMESTAMPTZ;

-- Índice para búsquedas rápidas por ID de Stripe
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON public.profiles(stripe_subscription_id);
