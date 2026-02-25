-- Migración para robustecer el sistema de Stripe
-- 027_robust_stripe_system.sql

-- 1. Tabla para evitar procesar el mismo evento dos veces (Idempotencia)
CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Suscripciones (Fuente de Verdad funcional)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    status TEXT NOT NULL, -- 'active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'trialing'
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 4. Seguridad (RLS)
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Solo el rol de servicio (admin) puede escribir en estas tablas generalmente
-- Los usuarios pueden ver sus propias suscripciones
CREATE POLICY "Servicio puede todo en eventos" ON public.processed_webhook_events FOR ALL USING (true);
CREATE POLICY "Servicio puede todo en suscripciones" ON public.subscriptions FOR ALL USING (true);

CREATE POLICY "Usuarios pueden ver sus propias suscripciones" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Función para actualizar el updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_subscription_updated
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
