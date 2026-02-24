-- Add onboarding columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS meta_titulacion text;

-- Add "Marino Novel" badge
INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, descripcion_eu, icono, puntos, rareza, categoria, condicion_json)
VALUES (
    'marino-novel',
    'Marino Novel',
    'Marinel Hasiberria',
    'Has completado el onboarding y estás listo para zarpar.',
    'Onboarding-a osatu duzu eta itsasoratzeko prest zaude.',
    '🧭',
    50,
    'comun',
    'general',
    '{"type": "onboarding_completed"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
