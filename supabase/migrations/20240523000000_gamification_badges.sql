-- Create tables for Gamification (Badges) if they don't exist

-- 1. Logros (Badges)
CREATE TABLE IF NOT EXISTS public.logros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nombre_es TEXT NOT NULL,
    nombre_eu TEXT NOT NULL,
    descripcion_es TEXT NOT NULL,
    descripcion_eu TEXT NOT NULL,
    icono TEXT NOT NULL,
    puntos INT NOT NULL DEFAULT 10,
    rareza TEXT NOT NULL CHECK (rareza IN ('comun', 'raro', 'epico', 'legendario')),
    categoria TEXT NOT NULL DEFAULT 'general',
    condicion_json JSONB, -- Added for compatibility with existing system
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure condicion_json exists if table was created previously without it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logros' AND column_name = 'condicion_json') THEN
        ALTER TABLE public.logros ADD COLUMN condicion_json JSONB;
    END IF;
END $$;

-- 2. Logros Alumno (User Badges)
CREATE TABLE IF NOT EXISTS public.logros_alumno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    logro_id UUID REFERENCES public.logros(id) ON DELETE CASCADE,
    fecha_obtenido TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alumno_id, logro_id)
);

-- RLS Policies
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros_alumno ENABLE ROW LEVEL SECURITY;

-- Public read access to badges
DO $$ BEGIN
    CREATE POLICY "Public Read Badges" ON public.logros FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users can read their own badges
DO $$ BEGIN
    CREATE POLICY "Read Own Badges" ON public.logros_alumno FOR SELECT USING (auth.uid() = alumno_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users can insert (unlock) their own badges (via API or client logic securely)
DO $$ BEGIN
    CREATE POLICY "Unlock Own Badge" ON public.logros_alumno FOR INSERT WITH CHECK (auth.uid() = alumno_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- SEED DATA: 20 Badges (Using 'manual' type for condition to avoid automatic trigger interference for now)
INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, descripcion_eu, icono, puntos, rareza, categoria, condicion_json) VALUES
-- General / First Steps
('grumete_novato', 'Grumete Novato', 'Grumete Berria', 'Inicia sesión por primera vez.', 'Hasi saioa lehenengo aldiz.', '👋', 10, 'comun', 'general', '{"tipo": "manual"}'),
('primeros_pasos', 'Primeros Pasos', 'Lehen Urratsak', 'Completa tu primer módulo.', 'Osatu zure lehen modulua.', '👣', 20, 'comun', 'general', '{"tipo": "manual"}'),
('explorador', 'Explorador', 'Esploratzailea', 'Visita todas las secciones principales.', 'Bisitatu atal nagusi guztiak.', '🧭', 30, 'comun', 'general', '{"tipo": "manual"}'),
('perfil_perfecto', 'Perfil Perfecto', 'Profil Perfektua', 'Completa tu perfil de usuario.', 'Osatu zure erabiltzaile profila.', '👤', 20, 'comun', 'general', '{"tipo": "manual"}'),

-- Knowledge / Study
('raton_biblioteca', 'Ratón de Biblioteca', 'Liburutegiko Sagua', 'Lee 5 páginas de teoría.', 'Irakurri teoria 5 orrialde.', '📚', 30, 'comun', 'conocimiento', '{"tipo": "manual"}'),
('capitan_examen', 'Capitán de Examen', 'Azterketa Kapitaina', 'Aprueba un examen.', 'Gainditu azterketa bat.', '📝', 50, 'raro', 'conocimiento', '{"tipo": "manual"}'),
('perfeccionista', 'Perfeccionista', 'Perfekzionista', 'Obtén 100% en un cuestionario.', 'Lortu %100 galdetegi batean.', '💯', 50, 'raro', 'conocimiento', '{"tipo": "manual"}'),
('enciclopedia', 'Enciclopedia', 'Entziklopedia', 'Consulta el glosario náutico.', 'Kontsultatu itsas glosarioa.', '📖', 20, 'comun', 'conocimiento', '{"tipo": "manual"}'),
('meteorologo', 'Meteorólogo', 'Meteorologoa', 'Consulta el tiempo 5 veces.', 'Kontsultatu eguraldia 5 aldiz.', '☁️', 30, 'comun', 'conocimiento', '{"tipo": "manual"}'),

-- Simulation / Skills
('primera_maniobra', 'Primera Maniobra', 'Lehen Maniobra', 'Completa una maniobra en el simulador.', 'Osatu maniobra bat simuladorean.', '⛵', 50, 'raro', 'simulacion', '{"tipo": "manual"}'),
('maestro_viento', 'Maestro del Viento', 'Haizearen Maisua', 'Identifica correctamente la dirección del viento 10 veces.', 'Identifikatu haizearen norabidea zuzen 10 aldiz.', '💨', 50, 'raro', 'simulacion', '{"tipo": "manual"}'),
('timonel_firme', 'Timonel Firme', 'Timonel irmoa', 'Mantén el rumbo durante 5 minutos.', 'Mantendu norabidea 5 minutuz.', '⚓', 40, 'raro', 'simulacion', '{"tipo": "manual"}'),
('navegante_nocturno', 'Navegante Nocturno', 'Gaueko Nabigatzailea', 'Estudia o navega después de las 22:00.', 'Ikasi edo nabigatu 22:00ak ondoren.', '🌙', 40, 'raro', 'simulacion', '{"tipo": "manual"}'),

-- Modules Specific
('salvavidas', 'Salvavidas', 'Soroslea', 'Completa el módulo de Seguridad.', 'Osatu Segurtasun modulua.', '🛟', 50, 'epico', 'modulos', '{"tipo": "manual"}'),
('eco_friendly', 'Eco-Friendly', 'Eco-Friendly', 'Completa el módulo de Medio Ambiente.', 'Osatu Ingurumen modulua.', '🌿', 50, 'epico', 'modulos', '{"tipo": "manual"}'),
('nudo_marinero', 'Nudo Marinero', 'Korapilo Marinela', 'Aprende 5 nudos marineros.', 'Ikasi 5 korapilo marinel.', '🪢', 40, 'epico', 'modulos', '{"tipo": "manual"}'),
('radio_operador', 'Radio Operador', 'Irrati Operadorea', 'Completa el módulo de Radio.', 'Osatu Irrati modulua.', '📻', 40, 'epico', 'modulos', '{"tipo": "manual"}'),

-- Engagement / Social
('racha_10_dias', '10 Días de Racha', '10 Egun Jarraian', 'Estudia durante 10 días seguidos.', 'Ikasi 10 egun jarraian.', '🔥', 100, 'legendario', 'social', '{"tipo": "manual"}'),
('regatista', 'Regatista', 'Estropadalaria', 'Participa en una regata virtual.', 'Parte hartu estropada birtual batean.', '🏁', 50, 'epico', 'social', '{"tipo": "manual"}'),
('leyenda', 'Leyenda de la Escuela', 'Eskolako Kondaira', 'Desbloquea todos los demás badges.', 'Desblokeatu beste badge guztiak.', '👑', 500, 'legendario', 'social', '{"tipo": "manual"}')

ON CONFLICT (slug) DO UPDATE SET
    nombre_es = EXCLUDED.nombre_es,
    nombre_eu = EXCLUDED.nombre_eu,
    descripcion_es = EXCLUDED.descripcion_es,
    descripcion_eu = EXCLUDED.descripcion_eu,
    icono = EXCLUDED.icono,
    puntos = EXCLUDED.puntos,
    rareza = EXCLUDED.rareza,
    categoria = EXCLUDED.categoria,
    condicion_json = EXCLUDED.condicion_json;
