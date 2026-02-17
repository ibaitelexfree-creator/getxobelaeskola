-- ==========================================
-- FASE 1: ACADEMIA DIGITAL - NIVELES Y ESTRUCTURA ACADÉMICA
-- ==========================================

-- 1. Tabla de Niveles de Formación
CREATE TABLE IF NOT EXISTS public.niveles_formacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nombre_es TEXT NOT NULL,
    nombre_eu TEXT NOT NULL,
    orden INT NOT NULL UNIQUE,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    objetivo_formativo_es TEXT,
    objetivo_formativo_eu TEXT,
    perfil_alumno_es TEXT,
    perfil_alumno_eu TEXT,
    competencias_es TEXT[],
    competencias_eu TEXT[],
    duracion_teorica_h INT,
    duracion_practica_h INT,
    icono TEXT,
    prerequisitos UUID[], -- Array de IDs de niveles que deben completarse antes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ampliar tabla cursos con campos académicos
ALTER TABLE public.cursos 
ADD COLUMN IF NOT EXISTS nivel_formacion_id UUID REFERENCES public.niveles_formacion(id),
ADD COLUMN IF NOT EXISTS horas_teoricas INT,
ADD COLUMN IF NOT EXISTS horas_practicas INT,
ADD COLUMN IF NOT EXISTS prerequisitos_curso UUID[], -- Array de IDs de cursos que deben completarse
ADD COLUMN IF NOT EXISTS orden_en_nivel INT;

-- 3. Tabla de Módulos
CREATE TABLE IF NOT EXISTS public.modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    nombre_es TEXT NOT NULL,
    nombre_eu TEXT NOT NULL,
    slug TEXT NOT NULL,
    orden INT NOT NULL,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    objetivos_json JSONB, -- Array de objetivos de aprendizaje
    duracion_estimada_h INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(curso_id, orden),
    UNIQUE(curso_id, slug)
);

-- 4. Tabla de Unidades Didácticas
CREATE TABLE IF NOT EXISTS public.unidades_didacticas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
    nombre_es TEXT NOT NULL,
    nombre_eu TEXT NOT NULL,
    slug TEXT NOT NULL,
    orden INT NOT NULL,
    objetivos_es TEXT[],
    objetivos_eu TEXT[],
    contenido_teoria_es TEXT, -- Contenido rico (markdown/HTML)
    contenido_teoria_eu TEXT,
    contenido_practica_es TEXT,
    contenido_practica_eu TEXT,
    errores_comunes_es TEXT[],
    errores_comunes_eu TEXT[],
    duracion_estimada_min INT,
    recursos_json JSONB, -- Enlaces a vídeos, PDFs, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(modulo_id, orden),
    UNIQUE(modulo_id, slug)
);

-- 5. Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_cursos_nivel ON public.cursos(nivel_formacion_id);
CREATE INDEX IF NOT EXISTS idx_modulos_curso ON public.modulos(curso_id);
CREATE INDEX IF NOT EXISTS idx_unidades_modulo ON public.unidades_didacticas(modulo_id);

-- 6. Habilitar RLS en las nuevas tablas
ALTER TABLE public.niveles_formacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades_didacticas ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de seguridad (lectura pública para contenido académico)
CREATE POLICY "Lectura pública niveles" ON public.niveles_formacion FOR SELECT USING (true);
CREATE POLICY "Lectura pública módulos" ON public.modulos FOR SELECT USING (true);
CREATE POLICY "Lectura pública unidades" ON public.unidades_didacticas FOR SELECT USING (true);

-- 8. Seed data: Los 7 niveles de formación
INSERT INTO public.niveles_formacion (slug, nombre_es, nombre_eu, orden, descripcion_es, objetivo_formativo_es, perfil_alumno_es, duracion_teorica_h, duracion_practica_h, icono) VALUES
('iniciacion', 'Iniciación a la Vela', 'Belaren Hasiera', 1, 
 'Familiarizar al alumno con el entorno náutico, la embarcación y los principios básicos de navegación a vela',
 'Entender el viento como fuerza motriz y realizar maniobras básicas con seguridad',
 'Principiante absoluto, sin experiencia previa. Cualquier edad (+12 años)',
 20, 10, '⚓'),

('perfeccionamiento', 'Perfeccionamiento', 'Hobekuntza', 2,
 'Consolidar la técnica base y navegar con mayor autonomía en condiciones estables',
 'Dominar el trimado de velas y navegar con autonomía en condiciones favorables',
 'Alumno que ha completado Iniciación o tiene experiencia equivalente',
 25, 15, '⛵'),

('vela-ligera', 'Vela Ligera', 'Bela Arina', 3,
 'Dominar la vela en embarcaciones ligeras (derivadores, catamaranes) con enfoque en rendimiento',
 'Navegar con técnica avanzada en derivador y competir en regatas',
 'Navegante con base sólida que busca velocidad y competición',
 30, 20, '🏁'),

('crucero', 'Crucero', 'Kruzeroa', 4,
 'Preparar al alumno para la navegación de crucero costera con embarcaciones de quilla',
 'Planificar y ejecutar travesías costeras con seguridad',
 'Navegante que quiere navegar en cruceros de día o travesías cortas',
 40, 25, '🗺️'),

('maniobras-avanzadas', 'Maniobras Avanzadas', 'Manobra Aurreratuak', 5,
 'Perfeccionar maniobras complejas y navegar en condiciones adversas',
 'Navegar con seguridad en condiciones meteorológicas adversas',
 'Patrón de Bahía que quiere ampliar su rango de navegación',
 30, 20, '🌊'),

('seguridad-emergencias', 'Seguridad y Emergencias', 'Segurtasuna eta Larrialdia', 6,
 'Formar al navegante en protocolos de supervivencia, primeros auxilios marítimos y gestión de crisis',
 'Gestionar emergencias a bordo y aplicar protocolos de seguridad',
 'Cualquier navegante a partir de Perfeccionamiento (curso transversal)',
 20, 10, '🆘'),

('meteorologia', 'Meteorología Náutica', 'Meteorologia Nautikoa', 7,
 'Interpretar condiciones meteorológicas para tomar decisiones de navegación seguras',
 'Predecir el tiempo y tomar decisiones meteorológicas informadas',
 'Navegante a partir de Perfeccionamiento (curso transversal especializado)',
 25, 5, '🌤️')
ON CONFLICT (slug) DO NOTHING;

-- 9. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers para updated_at
DO $$ BEGIN
    CREATE TRIGGER update_niveles_updated_at BEFORE UPDATE ON public.niveles_formacion
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON public.cursos
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_modulos_updated_at BEFORE UPDATE ON public.modulos
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON public.unidades_didacticas
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
