-- Añadir soporte para IDs de productos de Stripe
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE public.servicios_alquiler ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
