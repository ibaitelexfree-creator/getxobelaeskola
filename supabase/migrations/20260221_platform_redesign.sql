-- =============================================================================
-- Platform Redesign Migration
-- Matches ALL data from "Cursos y Actividades" Excel (source of truth)
-- =============================================================================

-- =====================
-- 1. MEMBERSHIP TIERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.tipos_membresia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    nombre_eu TEXT,
    descripcion TEXT,
    descripcion_eu TEXT,
    precio_anual NUMERIC(10,2),
    precio_mensual NUMERIC(10,2),
    beneficio TEXT NOT NULL,
    beneficio_eu TEXT,
    max_salidas INT, -- NULL = unlimited
    incluye_entrenamientos BOOLEAN DEFAULT false,
    categoria TEXT DEFAULT 'vela', -- 'vela' or 'windsurf'
    activo BOOLEAN DEFAULT true,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tipos_membresia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tipos_membresia" ON public.tipos_membresia FOR SELECT USING (true);

-- Seed membership tiers from Excel
INSERT INTO public.tipos_membresia (nombre, nombre_eu, precio_anual, precio_mensual, beneficio, beneficio_eu, max_salidas, incluye_entrenamientos, categoria, orden) VALUES
('Socia Básica', 'Oinarrizko Bazkidea', 630, 70, '30 salidas', '30 irteera', 30, false, 'vela', 1),
('Socia Entrenamientos', 'Entrenamendu Bazkidea', 1000, 110, '3 entrenamientos/semana', '3 entrenamendu/astean', NULL, true, 'vela', 2),
('Socia Premium', 'Premium Bazkidea', 1000, 110, 'Salidas ilimitadas', 'Irteera mugagabeak', NULL, false, 'vela', 3),
('Socia Premium+', 'Premium+ Bazkidea', 1200, NULL, 'Entrenamientos y salidas ilimitadas', 'Entrenamendu eta irteera mugagabeak', NULL, true, 'vela', 4),
('Socia Básica Windsurf', 'Oinarrizko Windsurf Bazkidea', 600, 55, '12h/mes', '12h/hilabete', NULL, false, 'windsurf', 5)
ON CONFLICT DO NOTHING;

-- =====================
-- 2. ADD AVAILABILITY & GPS COLUMNS TO servicios_alquiler
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicios_alquiler' AND column_name='unidades_totales') THEN
        ALTER TABLE public.servicios_alquiler ADD COLUMN unidades_totales INT DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicios_alquiler' AND column_name='unidades_disponibles') THEN
        ALTER TABLE public.servicios_alquiler ADD COLUMN unidades_disponibles INT DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicios_alquiler' AND column_name='ubicacion_lat') THEN
        ALTER TABLE public.servicios_alquiler ADD COLUMN ubicacion_lat DECIMAL(10,8) DEFAULT 43.34860000;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicios_alquiler' AND column_name='ubicacion_lng') THEN
        ALTER TABLE public.servicios_alquiler ADD COLUMN ubicacion_lng DECIMAL(11,8) DEFAULT -3.01380000;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicios_alquiler' AND column_name='ubicacion_nombre') THEN
        ALTER TABLE public.servicios_alquiler ADD COLUMN ubicacion_nombre TEXT DEFAULT 'Puerto Deportivo de Getxo';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicios_alquiler' AND column_name='tripulacion_minima') THEN
        ALTER TABLE public.servicios_alquiler ADD COLUMN tripulacion_minima INT DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicios_alquiler' AND column_name='fianza') THEN
        ALTER TABLE public.servicios_alquiler ADD COLUMN fianza NUMERIC(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicios_alquiler' AND column_name='duracion_default_h') THEN
        ALTER TABLE public.servicios_alquiler ADD COLUMN duracion_default_h NUMERIC(4,1) DEFAULT 4;
    END IF;
END $$;

-- =====================
-- 3. FIX BONOS DATA (Excel says 5 salidas, not 10h)
-- =====================
UPDATE public.tipos_bono SET horas_totales = 5, descripcion = '5 salidas de navegación' WHERE nombre LIKE '%Vela Ligera%';
UPDATE public.tipos_bono SET horas_totales = 5, precio = 130, descripcion = '5 salidas de windsurf' WHERE nombre LIKE '%Windsurf%';
UPDATE public.tipos_bono SET horas_totales = 5, nombre = 'Bono J80 5 Salidas', precio = 150, descripcion = '5 salidas en J80' WHERE nombre LIKE '%J80%';

-- =====================
-- 4. ADD MISSING COURSES (Windsurf variants)
-- =====================
INSERT INTO public.cursos (nombre_es, nombre_eu, slug, descripcion_es, descripcion_eu, precio, duracion_h, nivel, categoria_id, activo, visible)
SELECT 
    'Windsurf 3 Sesiones', 
    'Windsurf 3 Saio', 
    'windsurf-3-sesiones',
    'Pack de 3 sesiones de windsurf de 2 horas cada una. Ideal para practicar y mejorar.',
    '3 windsurf saioko paketea (2 ordu saio bakoitzeko). Praktikatzeko eta hobetzeko aproposa.',
    100, 6, 'iniciacion',
    (SELECT id FROM public.categorias WHERE slug = 'windsurf' LIMIT 1),
    true, true
WHERE NOT EXISTS (SELECT 1 FROM public.cursos WHERE slug = 'windsurf-3-sesiones');

INSERT INTO public.cursos (nombre_es, nombre_eu, slug, descripcion_es, descripcion_eu, precio, duracion_h, nivel, categoria_id, activo, visible)
SELECT 
    'Windsurf 1 Sesión', 
    'Windsurf Saio 1', 
    'windsurf-1-sesion',
    'Sesión individual de windsurf de 2 horas. Perfecto para probar.',
    'Windsurf saio bakarra (2 ordu). Probatzeko bikaina.',
    40, 2, 'iniciacion',
    (SELECT id FROM public.categorias WHERE slug = 'windsurf' LIMIT 1),
    true, true
WHERE NOT EXISTS (SELECT 1 FROM public.cursos WHERE slug = 'windsurf-1-sesion');

-- =====================
-- 5. ADD MISSING RENTAL/MOORING SERVICES
-- =====================

-- Omega/Raquero sin patrón (140€, media jornada)
INSERT INTO public.servicios_alquiler (nombre_es, nombre_eu, slug, categoria, precio_base, descripcion_es, descripcion_eu, activo, tripulacion_minima, duracion_default_h, opciones)
SELECT 
    'Omega/Raquero sin patrón', 'Omega/Raquero patron gabe', 'alquiler-omega-sin-patron', 
    'alquileres', 140,
    'Navega a bordo de un velero clásico sin patrón. Tripulación mínima de 3 personas.',
    'Nabigatu bela ontzi klasiko batean patron gabe. Gutxieneko tripulazioa 3 pertsona.',
    true, 3, 4, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.servicios_alquiler WHERE slug = 'alquiler-omega-sin-patron');

-- Atraque Windsurf (30€/mes)
INSERT INTO public.servicios_alquiler (nombre_es, nombre_eu, slug, categoria, precio_base, descripcion_es, descripcion_eu, activo, opciones)
SELECT 
    'Atraque Windsurf', 'Windsurf Atrakatzea', 'atraque-windsurf', 
    'atraques', 30,
    'Amarre mensual para tabla de windsurf. Matrícula: 50€.',
    'Hilabeteko amarratzea windsurf taularentzat. Matrikula: 50€.',
    true, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.servicios_alquiler WHERE slug = 'atraque-windsurf');

-- Atraque Piragua (25€/mes)
INSERT INTO public.servicios_alquiler (nombre_es, nombre_eu, slug, categoria, precio_base, descripcion_es, descripcion_eu, activo, opciones)
SELECT 
    'Atraque Piragua', 'Piragua Atrakatzea', 'atraque-piragua', 
    'atraques', 25,
    'Amarre mensual para piragua. Matrícula: 50€.',
    'Hilabeteko amarratzea piraguarentzat. Matrikula: 50€.',
    true, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.servicios_alquiler WHERE slug = 'atraque-piragua');

-- Cumpleaños Bigsub (13€/pax)
INSERT INTO public.servicios_alquiler (nombre_es, nombre_eu, slug, categoria, precio_base, descripcion_es, descripcion_eu, activo, tripulacion_minima, opciones)
SELECT 
    'Cumpleaños Bigsub', 'Bigsub Urtebetetzea', 'cumple-bigsub', 
    'eventos', 13,
    'Celebra tu cumpleaños con una aventura en Bigsub. Mínimo 12 participantes. Sin fianza.',
    'Ospatu zure urtebetetzea Bigsub abentura batekin. Gutxienez 12 parte-hartzaile. Fidantzarik gabe.',
    true, 12, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.servicios_alquiler WHERE slug = 'cumple-bigsub');

-- Espacio Alquiler (150€)
INSERT INTO public.servicios_alquiler (nombre_es, nombre_eu, slug, categoria, precio_base, descripcion_es, descripcion_eu, activo, fianza, opciones)
SELECT 
    'Alquiler de Espacio', 'Espazio Alokairua', 'alquiler-espacio-eventos', 
    'eventos', 150,
    'Alquiler de espacio para eventos (16:30-20:30). Fianza 100€.',
    'Espazioa alokatzea ekitaldietarako (16:30-20:30). 100€ fidantza.',
    true, 100, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.servicios_alquiler WHERE slug = 'alquiler-espacio-eventos');

-- =====================
-- 6. UPDATE RENTAL CREW & DURATION DATA FROM EXCEL
-- =====================
UPDATE public.servicios_alquiler SET tripulacion_minima = 1, duracion_default_h = 4 WHERE slug = 'alquiler-j80-patron';
UPDATE public.servicios_alquiler SET tripulacion_minima = 3, duracion_default_h = 4 WHERE slug = 'alquiler-j80-sin-patron';
UPDATE public.servicios_alquiler SET tripulacion_minima = 3, duracion_default_h = 4 WHERE slug = 'alquiler-omega-patron';
UPDATE public.servicios_alquiler SET tripulacion_minima = 2, duracion_default_h = 4 WHERE slug = 'alquiler-420-pro';
UPDATE public.servicios_alquiler SET tripulacion_minima = 1, duracion_default_h = 4 WHERE slug = 'alquiler-laser-pro';
UPDATE public.servicios_alquiler SET tripulacion_minima = 1, duracion_default_h = 4 WHERE slug = 'alquiler-windsurf-pro';
UPDATE public.servicios_alquiler SET tripulacion_minima = 8, duracion_default_h = 4 WHERE slug = 'alquiler-bigsub-group';
UPDATE public.servicios_alquiler SET tripulacion_minima = 1, duracion_default_h = 2 WHERE slug = 'alquiler-tarpon-patron';

-- =====================
-- 7. SET GPS COORDINATES (Puerto Deportivo de Getxo)
-- =====================
UPDATE public.servicios_alquiler SET 
    ubicacion_lat = 43.34860000,
    ubicacion_lng = -3.01380000,
    ubicacion_nombre = 'Puerto Deportivo de Getxo'
WHERE ubicacion_lat IS NULL OR ubicacion_lat = 0;
