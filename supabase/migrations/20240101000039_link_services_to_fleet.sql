
-- Migration to link Rental Services with Boats for Operativity
-- 029_link_services_to_fleet.sql

-- 1. Add boat_prefix to servicios_alquiler to match with embarcaciones.nombre
ALTER TABLE public.servicios_alquiler ADD COLUMN IF NOT EXISTS boat_prefix TEXT;

-- 2. Seed the prefixes based on current naming convention
UPDATE public.servicios_alquiler SET boat_prefix = 'J80' WHERE nombre_es = 'Veleros J80';
UPDATE public.servicios_alquiler SET boat_prefix = 'Kayak (1 persona)' WHERE nombre_es = 'Kayak (1 Persona)';
UPDATE public.servicios_alquiler SET boat_prefix = 'Kayak (2 personas)' WHERE nombre_es = 'Kayak (2 Personas)';
UPDATE public.servicios_alquiler SET boat_prefix = 'Piragua (1 persona)' WHERE nombre_es = 'Piragua (1 Persona)';
UPDATE public.servicios_alquiler SET boat_prefix = 'Piragua (2 personas)' WHERE nombre_es = 'Piragua (2 Personas)';
UPDATE public.servicios_alquiler SET boat_prefix = 'Optimist' WHERE nombre_es = 'Optimist';
UPDATE public.servicios_alquiler SET boat_prefix = 'Laser' WHERE nombre_es = 'Laser';
UPDATE public.servicios_alquiler SET boat_prefix = 'Raquero' WHERE nombre_es = 'Raquero';
UPDATE public.servicios_alquiler SET boat_prefix = 'Windsurf' WHERE nombre_es = 'Windsurf';
-- Paddle Surf prefix left empty if not in fleet table yet, or we can add them later.
