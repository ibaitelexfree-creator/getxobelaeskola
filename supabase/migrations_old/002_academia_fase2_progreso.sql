-- ==========================================
-- FASE 2: SISTEMA DE PROGRESO DEL ALUMNO
-- ==========================================

-- 1. Tabla de Progreso del Alumno
CREATE TABLE IF NOT EXISTS public.progreso_alumno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo_entidad TEXT NOT NULL CHECK (tipo_entidad IN ('nivel', 'curso', 'modulo', 'unidad')),
    entidad_id UUID NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('no_iniciado', 'en_progreso', 'completado', 'bloqueado')) DEFAULT 'no_iniciado',
    porcentaje INT DEFAULT 0 CHECK (porcentaje >= 0 AND porcentaje <= 100),
    fecha_inicio TIMESTAMPTZ,
    fecha_completado TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alumno_id, tipo_entidad, entidad_id)
);

-- 2. Tabla de Habilidades (Skills Tree)
CREATE TABLE IF NOT EXISTS public.habilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nombre_es TEXT NOT NULL,
    nombre_eu TEXT NOT NULL,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    icono TEXT,
    categoria TEXT, -- 'tecnica', 'tactica', 'seguridad', 'meteorologia'
    nivel_requerido INT, -- Nivel mínimo para desbloquear
    modulo_desbloqueo_id UUID REFERENCES public.modulos(id), -- Módulo que desbloquea esta habilidad
    orden_visual INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Habilidades del Alumno
CREATE TABLE IF NOT EXISTS public.habilidades_alumno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    habilidad_id UUID NOT NULL REFERENCES public.habilidades(id) ON DELETE CASCADE,
    fecha_obtenido TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alumno_id, habilidad_id)
);

-- 4. Tabla de Logros/Medallas
CREATE TABLE IF NOT EXISTS public.logros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nombre_es TEXT NOT NULL,
    nombre_eu TEXT NOT NULL,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    icono TEXT,
    categoria TEXT, -- 'constancia', 'excelencia', 'exploracion', 'social', 'horas'
    condicion_json JSONB, -- Condiciones para obtener el logro
    puntos INT DEFAULT 0,
    rareza TEXT CHECK (rareza IN ('comun', 'raro', 'epico', 'legendario')) DEFAULT 'comun',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Logros del Alumno
CREATE TABLE IF NOT EXISTS public.logros_alumno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    logro_id UUID NOT NULL REFERENCES public.logros(id) ON DELETE CASCADE,
    fecha_obtenido TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alumno_id, logro_id)
);

-- 6. Tabla de Horas de Navegación
CREATE TABLE IF NOT EXISTS public.horas_navegacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    tipo TEXT CHECK (tipo IN ('practica_libre', 'clase_dirigida', 'regata', 'travesia')) DEFAULT 'practica_libre',
    duracion_h DECIMAL(4, 2) NOT NULL,
    embarcacion TEXT,
    condiciones_meteo TEXT,
    notas TEXT,
    instructor_id UUID REFERENCES public.profiles(id),
    verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Certificados
CREATE TABLE IF NOT EXISTS public.certificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nivel_id UUID REFERENCES public.niveles_formacion(id),
    curso_id UUID REFERENCES public.cursos(id),
    tipo TEXT CHECK (tipo IN ('nivel', 'curso', 'diploma_capitan')) NOT NULL,
    numero_certificado TEXT UNIQUE NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    nota_final DECIMAL(5, 2),
    distincion BOOLEAN DEFAULT FALSE, -- true si nota >= 90%
    pdf_url TEXT,
    verificacion_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_progreso_alumno ON public.progreso_alumno(alumno_id, tipo_entidad);
CREATE INDEX IF NOT EXISTS idx_progreso_entidad ON public.progreso_alumno(tipo_entidad, entidad_id);
CREATE INDEX IF NOT EXISTS idx_habilidades_alumno ON public.habilidades_alumno(alumno_id);
CREATE INDEX IF NOT EXISTS idx_logros_alumno ON public.logros_alumno(alumno_id);
CREATE INDEX IF NOT EXISTS idx_horas_navegacion_alumno ON public.horas_navegacion(alumno_id);
CREATE INDEX IF NOT EXISTS idx_certificados_alumno ON public.certificados(alumno_id);

-- 9. Habilitar RLS
ALTER TABLE public.progreso_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habilidades_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horas_navegacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- 10. Políticas de seguridad
-- Progreso: solo el alumno ve su propio progreso
CREATE POLICY "Ver progreso propio" ON public.progreso_alumno FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Actualizar progreso propio" ON public.progreso_alumno FOR UPDATE USING (auth.uid() = alumno_id);

-- Habilidades: lectura pública del catálogo
CREATE POLICY "Lectura pública habilidades" ON public.habilidades FOR SELECT USING (true);

-- Habilidades del alumno: solo el alumno ve las suyas
CREATE POLICY "Ver habilidades propias" ON public.habilidades_alumno FOR SELECT USING (auth.uid() = alumno_id);

-- Logros: lectura pública del catálogo
CREATE POLICY "Lectura pública logros" ON public.logros FOR SELECT USING (true);

-- Logros del alumno: solo el alumno ve los suyos
CREATE POLICY "Ver logros propios" ON public.logros_alumno FOR SELECT USING (auth.uid() = alumno_id);

-- Horas de navegación: solo el alumno ve las suyas
CREATE POLICY "Ver horas propias" ON public.horas_navegacion FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Insertar horas propias" ON public.horas_navegacion FOR INSERT WITH CHECK (auth.uid() = alumno_id);

-- Certificados: solo el alumno ve los suyos
CREATE POLICY "Ver certificados propios" ON public.certificados FOR SELECT USING (auth.uid() = alumno_id);

-- 11. Triggers para updated_at
DO $$ BEGIN
    CREATE TRIGGER update_progreso_updated_at BEFORE UPDATE ON public.progreso_alumno
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 12. Seed data: Habilidades básicas
INSERT INTO public.habilidades (slug, nombre_es, nombre_eu, descripcion_es, icono, categoria, nivel_requerido, orden_visual) VALUES
('marinero-agua-dulce', 'Marinero de Agua Dulce', 'Ur Gezako Marinela', 'Has completado tu primera inmersión en el mundo náutico', '⚓', 'tecnica', 1, 1),
('domador-viento', 'Domador del Viento', 'Haizearen Domatzailea', 'Entiendes cómo funciona el viento y las velas', '💨', 'tecnica', 1, 2),
('manos-marinero', 'Manos de Marinero', 'Marinelaren Eskuak', 'Dominas los nudos esenciales', '🪢', 'tecnica', 1, 3),
('trimador', 'Trimador', 'Trimatzailea', 'Sabes ajustar las velas para máximo rendimiento', '⛵', 'tecnica', 2, 4),
('tactico', 'Táctico', 'Taktikaria', 'Tomas decisiones tácticas acertadas', '🧭', 'tactica', 2, 5),
('patron-rescate', 'Patrón de Rescate', 'Erreskate Patrona', 'Has demostrado capacidad para rescatar a alguien del agua', '🛟', 'seguridad', 2, 6),
('regatista', 'Regatista', 'Erregatista', 'Compites en regatas con técnica', '🏁', 'tactica', 3, 7),
('patron-bahia', 'Patrón de Bahía', 'Badiako Patrona', 'Navegas con autonomía en aguas costeras', '🗺️', 'tecnica', 4, 8),
('lobo-mar', 'Lobo de Mar', 'Itsasoko Otsoa', 'Navegas en condiciones adversas con seguridad', '🌊', 'tecnica', 5, 9),
('oficial-seguridad', 'Oficial de Seguridad', 'Segurtasun Ofiziala', 'Gestionas emergencias a bordo', '🆘', 'seguridad', 6, 10),
('meteorologo-abordo', 'Meteorólogo de Abordo', 'Ontziaren Meteorologoa', 'Predices el tiempo y tomas decisiones meteorológicas', '🌤️', 'meteorologia', 7, 11),
('capitan', 'Capitán', 'Kapitaina', 'Has completado todos los niveles de formación', '⭐', 'excelencia', 7, 12)
ON CONFLICT (slug) DO NOTHING;

-- 13. Seed data: Logros iniciales
INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, icono, categoria, condicion_json, puntos, rareza) VALUES
('primer-dia', 'Primer Día', 'Lehen Eguna', 'Completa tu primera unidad didáctica', '🎓', 'exploracion', '{"tipo": "unidades_completadas", "cantidad": 1}', 10, 'comun'),
('semana-activa', '7 Días Seguidos', '7 Egun Jarraian', 'Accede a la plataforma 7 días consecutivos', '📅', 'constancia', '{"tipo": "dias_consecutivos", "cantidad": 7}', 50, 'raro'),
('mes-activo', '30 Días Activo', '30 Egun Aktibo', 'Accede a la plataforma durante 30 días', '🗓️', 'constancia', '{"tipo": "dias_totales", "cantidad": 30}', 100, 'epico'),
('perfeccionista', 'Perfeccionista', 'Perfekzionista', 'Obtén un 100% en 3 exámenes', '💯', 'excelencia', '{"tipo": "examenes_perfectos", "cantidad": 3}', 150, 'epico'),
('explorador', 'Explorador', 'Esploratzailea', 'Completa todas las actividades de un curso', '🔍', 'exploracion', '{"tipo": "actividades_curso_completo", "cantidad": 1}', 75, 'raro'),
('10-horas', '10 Horas Navegadas', '10 Ordu Nabigatuta', 'Acumula 10 horas de navegación registradas', '⏱️', 'horas', '{"tipo": "horas_navegacion", "cantidad": 10}', 50, 'comun'),
('50-horas', '50 Horas Navegadas', '50 Ordu Nabigatuta', 'Acumula 50 horas de navegación registradas', '⏱️', 'horas', '{"tipo": "horas_navegacion", "cantidad": 50}', 200, 'raro'),
('100-horas', '100 Horas Navegadas', '100 Ordu Nabigatuta', 'Acumula 100 horas de navegación registradas', '⏱️', 'horas', '{"tipo": "horas_navegacion", "cantidad": 100}', 500, 'legendario')
ON CONFLICT (slug) DO NOTHING;

-- 14. Función para generar número de certificado único
CREATE OR REPLACE FUNCTION public.generar_numero_certificado()
RETURNS TEXT AS $$
DECLARE
    nuevo_numero TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        -- Formato: GBE-YYYY-XXXXXX (Getxo Bela Eskola - Año - Número secuencial)
        nuevo_numero := 'GBE-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || 
                       LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
        
        -- Verificar si ya existe
        SELECT EXISTS(SELECT 1 FROM public.certificados WHERE numero_certificado = nuevo_numero) INTO existe;
        
        EXIT WHEN NOT existe;
    END LOOP;
    
    RETURN nuevo_numero;
END;
$$ LANGUAGE plpgsql;
