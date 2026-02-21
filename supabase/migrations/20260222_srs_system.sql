-- ==========================================
-- SISTEMA DE REPETICIÓN ESPACIADA (SRS)
-- ==========================================

-- 1. Tabla de Progreso SRS por Pregunta
CREATE TABLE IF NOT EXISTS public.progreso_preguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pregunta_id UUID NOT NULL REFERENCES public.preguntas(id) ON DELETE CASCADE,
    easiness_factor DECIMAL(4, 2) DEFAULT 2.50,
    interval INT DEFAULT 0, -- Días hasta la siguiente revisión
    repetitions INT DEFAULT 0, -- Número de veces consecutivas acertadas
    next_review_date TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alumno_id, pregunta_id)
);

-- 2. Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_progreso_preguntas_alumno ON public.progreso_preguntas(alumno_id);
CREATE INDEX IF NOT EXISTS idx_progreso_preguntas_next_review ON public.progreso_preguntas(next_review_date);

-- 3. Habilitar RLS
ALTER TABLE public.progreso_preguntas ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de seguridad
CREATE POLICY "Ver progreso propio preguntas" ON public.progreso_preguntas FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Actualizar progreso propio preguntas" ON public.progreso_preguntas FOR UPDATE USING (auth.uid() = alumno_id);
CREATE POLICY "Insertar progreso propio preguntas" ON public.progreso_preguntas FOR INSERT WITH CHECK (auth.uid() = alumno_id);

-- 5. Trigger para updated_at
DO $$ BEGIN
    CREATE TRIGGER update_progreso_preguntas_updated_at BEFORE UPDATE ON public.progreso_preguntas
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Función RPC para seleccionar preguntas priorizando SRS
CREATE OR REPLACE FUNCTION public.seleccionar_preguntas_srs(
    p_alumno_id UUID,
    p_entidad_tipo TEXT,
    p_entidad_id UUID,
    p_num_preguntas INT
)
RETURNS JSONB AS $$
DECLARE
    preguntas_srs UUID[];
    preguntas_nuevas UUID[];
    preguntas_totales UUID[];
    num_srs INT;
    num_nuevas INT;
BEGIN
    -- 1. Obtener preguntas pendientes de revisión (SRS)
    -- Seleccionamos preguntas que ya han sido vistas por el alumno y cuya fecha de revisión es hoy o antes.
    SELECT ARRAY_AGG(p.id ORDER BY pp.next_review_date ASC)
    INTO preguntas_srs
    FROM public.preguntas p
    JOIN public.progreso_preguntas pp ON p.id = pp.pregunta_id
    WHERE pp.alumno_id = p_alumno_id
      AND pp.next_review_date <= NOW()
      AND p.activa = TRUE
      AND (
        -- Filtro por entidad (igual que en seleccionar_preguntas_evaluacion)
        (p.entidad_tipo = p_entidad_tipo AND p.entidad_id = p_entidad_id)
        OR
        (p_entidad_tipo = 'modulo' AND p.entidad_tipo = 'unidad' AND p.entidad_id IN (
            SELECT id FROM public.unidades_didacticas WHERE modulo_id = p_entidad_id
        ))
        OR
        (p_entidad_tipo = 'curso' AND p.entidad_tipo = 'unidad' AND p.entidad_id IN (
            SELECT u.id
            FROM public.unidades_didacticas u
            JOIN public.modulos m ON u.modulo_id = m.id
            WHERE m.curso_id = p_entidad_id
        ))
      )
    LIMIT p_num_preguntas;

    -- Calcular cuántas preguntas nuevas necesitamos
    num_srs := COALESCE(ARRAY_LENGTH(preguntas_srs, 1), 0);
    num_nuevas := p_num_preguntas - num_srs;

    IF num_nuevas > 0 THEN
        -- 2. Obtener preguntas nuevas (no en SRS para este usuario) o rellenar con aleatorias si no hay suficientes nuevas
        -- Priorizamos preguntas que NO están en progreso_preguntas para este alumno.
        -- Si aún así faltan, rellenamos con las que ya están pero no tocaba revisión (repaso extra).

        SELECT ARRAY_AGG(id)
        INTO preguntas_nuevas
        FROM (
            SELECT id
            FROM public.preguntas p
            WHERE p.activa = TRUE
              AND (
                (p.entidad_tipo = p_entidad_tipo AND p.entidad_id = p_entidad_id)
                OR
                (p_entidad_tipo = 'modulo' AND p.entidad_tipo = 'unidad' AND p.entidad_id IN (
                    SELECT id FROM public.unidades_didacticas WHERE modulo_id = p_entidad_id
                ))
                OR
                (p_entidad_tipo = 'curso' AND p.entidad_tipo = 'unidad' AND p.entidad_id IN (
                    SELECT u.id
                    FROM public.unidades_didacticas u
                    JOIN public.modulos m ON u.modulo_id = m.id
                    WHERE m.curso_id = p_entidad_id
                ))
              )
              -- Excluir las que ya seleccionamos en el paso 1
              AND (preguntas_srs IS NULL OR NOT (p.id = ANY(preguntas_srs)))
            -- Ordenar: Primero las que NO ha visto nunca (LEFT JOIN check), luego random
            ORDER BY
                CASE WHEN EXISTS (
                    SELECT 1 FROM public.progreso_preguntas pp
                    WHERE pp.pregunta_id = p.id AND pp.alumno_id = p_alumno_id
                ) THEN 1 ELSE 0 END ASC,
                RANDOM()
            LIMIT num_nuevas
        ) sub;
    END IF;

    -- Combinar arrays
    IF preguntas_srs IS NULL THEN
        preguntas_totales := COALESCE(preguntas_nuevas, ARRAY[]::UUID[]);
    ELSIF preguntas_nuevas IS NULL THEN
        preguntas_totales := preguntas_srs;
    ELSE
        preguntas_totales := preguntas_srs || preguntas_nuevas;
    END IF;

    -- Devolver como JSONB
    RETURN TO_JSONB(preguntas_totales);
END;
$$ LANGUAGE plpgsql;
