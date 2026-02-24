-- ==========================================
-- FASE 3: SISTEMA DE EVALUACIÓN (QUIZZES Y EXÁMENES)
-- ==========================================

-- 1. Tabla de Preguntas
CREATE TABLE IF NOT EXISTS public.preguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_tipo TEXT NOT NULL CHECK (entidad_tipo IN ('unidad', 'modulo', 'curso')),
    entidad_id UUID NOT NULL,
    tipo_pregunta TEXT NOT NULL CHECK (tipo_pregunta IN ('opcion_multiple', 'verdadero_falso', 'completar', 'ordenar', 'asociar')),
    enunciado_es TEXT NOT NULL,
    enunciado_eu TEXT NOT NULL,
    opciones_json JSONB, -- Array de opciones para opción múltiple
    respuesta_correcta TEXT NOT NULL, -- Puede ser índice, texto, o JSON según el tipo
    explicacion_es TEXT, -- Explicación de por qué es correcta
    explicacion_eu TEXT,
    dificultad TEXT CHECK (dificultad IN ('basico', 'intermedio', 'avanzado')) DEFAULT 'basico',
    categoria TEXT, -- 'teoria', 'practica', 'seguridad', 'tactica'
    puntos INT DEFAULT 1,
    tiempo_sugerido_seg INT DEFAULT 60,
    imagen_url TEXT,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Evaluaciones (Quizzes y Exámenes)
CREATE TABLE IF NOT EXISTS public.evaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL CHECK (tipo IN ('quiz_unidad', 'examen_modulo', 'examen_final', 'caso_practico')),
    entidad_tipo TEXT NOT NULL CHECK (entidad_tipo IN ('unidad', 'modulo', 'curso')),
    entidad_id UUID NOT NULL,
    titulo_es TEXT NOT NULL,
    titulo_eu TEXT NOT NULL,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    num_preguntas INT NOT NULL DEFAULT 10,
    tiempo_limite_min INT, -- NULL = sin límite
    nota_aprobado DECIMAL(5, 2) DEFAULT 60.00, -- Porcentaje para aprobar
    intentos_maximos INT, -- NULL = ilimitados
    mostrar_respuestas BOOLEAN DEFAULT TRUE, -- Mostrar respuestas correctas al finalizar
    aleatorizar_preguntas BOOLEAN DEFAULT TRUE,
    aleatorizar_opciones BOOLEAN DEFAULT TRUE,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Intentos de Evaluación
CREATE TABLE IF NOT EXISTS public.intentos_evaluacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    evaluacion_id UUID NOT NULL REFERENCES public.evaluaciones(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('quiz_unidad', 'examen_modulo', 'examen_final', 'caso_practico')),
    estado TEXT NOT NULL CHECK (estado IN ('en_progreso', 'completado', 'abandonado')) DEFAULT 'en_progreso',
    preguntas_json JSONB NOT NULL, -- Array de IDs de preguntas seleccionadas
    respuestas_json JSONB, -- Objeto con respuestas del alumno
    puntuacion DECIMAL(5, 2), -- Nota final (0-100)
    puntos_obtenidos INT,
    puntos_totales INT,
    tiempo_empleado_seg INT,
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_completado TIMESTAMPTZ,
    aprobado BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Actividades Interactivas
CREATE TABLE IF NOT EXISTS public.actividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id UUID REFERENCES public.unidades_didacticas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('decision_tactica', 'simulacion_maniobra', 'identificacion_visual', 'escenario_emergencia', 'meteorologia', 'nudos', 'regata')),
    titulo_es TEXT NOT NULL,
    titulo_eu TEXT NOT NULL,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    config_json JSONB NOT NULL, -- Configuración específica del juego
    puntuacion_maxima INT DEFAULT 100,
    tiempo_limite_seg INT,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Intentos de Actividad
CREATE TABLE IF NOT EXISTS public.intentos_actividad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actividad_id UUID NOT NULL REFERENCES public.actividades(id) ON DELETE CASCADE,
    puntuacion INT NOT NULL,
    puntuacion_maxima INT NOT NULL,
    porcentaje DECIMAL(5, 2),
    tiempo_empleado_seg INT,
    datos_json JSONB, -- Datos específicos del intento (decisiones tomadas, etc.)
    completado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_preguntas_entidad ON public.preguntas(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_dificultad ON public.preguntas(dificultad);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_entidad ON public.evaluaciones(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_intentos_evaluacion_alumno ON public.intentos_evaluacion(alumno_id);
CREATE INDEX IF NOT EXISTS idx_intentos_evaluacion_evaluacion ON public.intentos_evaluacion(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_actividades_unidad ON public.actividades(unidad_id);
CREATE INDEX IF NOT EXISTS idx_intentos_actividad_alumno ON public.intentos_actividad(alumno_id);

-- 7. Habilitar RLS
ALTER TABLE public.preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_actividad ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de seguridad

-- Preguntas: solo lectura para alumnos (no pueden ver respuestas directamente)
CREATE POLICY "Lectura pública preguntas" ON public.preguntas FOR SELECT USING (true);

-- Evaluaciones: lectura pública
CREATE POLICY "Lectura pública evaluaciones" ON public.evaluaciones FOR SELECT USING (true);

-- Intentos de evaluación: solo el alumno ve los suyos
CREATE POLICY "Ver intentos propios evaluacion" ON public.intentos_evaluacion FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Crear intentos propios evaluacion" ON public.intentos_evaluacion FOR INSERT WITH CHECK (auth.uid() = alumno_id);
CREATE POLICY "Actualizar intentos propios evaluacion" ON public.intentos_evaluacion FOR UPDATE USING (auth.uid() = alumno_id);

-- Actividades: lectura pública
CREATE POLICY "Lectura pública actividades" ON public.actividades FOR SELECT USING (true);

-- Intentos de actividad: solo el alumno ve los suyos
CREATE POLICY "Ver intentos propios actividad" ON public.intentos_actividad FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Crear intentos propios actividad" ON public.intentos_actividad FOR INSERT WITH CHECK (auth.uid() = alumno_id);

-- 9. Triggers para updated_at
DO $$ BEGIN
    CREATE TRIGGER update_preguntas_updated_at BEFORE UPDATE ON public.preguntas
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_evaluaciones_updated_at BEFORE UPDATE ON public.evaluaciones
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_actividades_updated_at BEFORE UPDATE ON public.actividades
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. Función para seleccionar preguntas aleatorias para una evaluación
CREATE OR REPLACE FUNCTION public.seleccionar_preguntas_evaluacion(
    p_entidad_tipo TEXT,
    p_entidad_id UUID,
    p_num_preguntas INT,
    p_dificultad TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    preguntas_seleccionadas JSONB;
BEGIN
    SELECT jsonb_agg(id ORDER BY RANDOM())
    INTO preguntas_seleccionadas
    FROM (
        SELECT id
        FROM public.preguntas
        WHERE activa = TRUE
          AND (p_dificultad IS NULL OR dificultad = p_dificultad)
          AND (
            -- Caso 1: Pregunta directa de la unidad/modulo/curso
            (entidad_tipo = p_entidad_tipo AND entidad_id = p_entidad_id)
            OR
            -- Caso 2: Evaluación de Módulo -> Incluye preguntas de sus Unidades
            (p_entidad_tipo = 'modulo' AND entidad_tipo = 'unidad' AND entidad_id IN (
                SELECT id FROM public.unidades_didacticas WHERE modulo_id = p_entidad_id
            ))
            OR
            -- Caso 3: Evaluación de Curso -> Incluye preguntas de sus Unidades (vía Módulos)
            (p_entidad_tipo = 'curso' AND entidad_tipo = 'unidad' AND entidad_id IN (
                SELECT u.id 
                FROM public.unidades_didacticas u
                JOIN public.modulos m ON u.modulo_id = m.id
                WHERE m.curso_id = p_entidad_id
            ))
          )
        ORDER BY RANDOM()
        LIMIT p_num_preguntas
    ) subquery;
    
    RETURN COALESCE(preguntas_seleccionadas, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 11. Función para calcular puntuación de un intento
CREATE OR REPLACE FUNCTION public.calcular_puntuacion_intento(
    p_intento_id UUID
)
RETURNS TABLE(
    puntos_obtenidos INT,
    puntos_totales INT,
    puntuacion DECIMAL(5, 2),
    aprobado BOOLEAN
) AS $$
DECLARE
    v_intento RECORD;
    v_pregunta RECORD;
    v_puntos_obtenidos INT := 0;
    v_puntos_totales INT := 0;
    v_nota_aprobado DECIMAL(5, 2);
    v_pregunta_id UUID;
    v_respuesta_alumno TEXT;
BEGIN
    -- Obtener el intento
    SELECT * INTO v_intento
    FROM public.intentos_evaluacion
    WHERE id = p_intento_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Intento no encontrado';
    END IF;
    
    -- Obtener nota de aprobado
    SELECT nota_aprobado INTO v_nota_aprobado
    FROM public.evaluaciones
    WHERE id = v_intento.evaluacion_id;
    
    -- Iterar sobre cada pregunta
    FOR v_pregunta_id IN SELECT jsonb_array_elements_text(v_intento.preguntas_json)::UUID
    LOOP
        SELECT * INTO v_pregunta
        FROM public.preguntas
        WHERE id = v_pregunta_id;
        
        v_puntos_totales := v_puntos_totales + v_pregunta.puntos;
        
        -- Obtener respuesta del alumno
        v_respuesta_alumno := v_intento.respuestas_json->>v_pregunta_id::TEXT;
        
        -- Verificar si es correcta
        IF v_respuesta_alumno = v_pregunta.respuesta_correcta THEN
            v_puntos_obtenidos := v_puntos_obtenidos + v_pregunta.puntos;
        END IF;
    END LOOP;
    
    -- Calcular porcentaje
    RETURN QUERY SELECT 
        v_puntos_obtenidos,
        v_puntos_totales,
        CASE 
            WHEN v_puntos_totales > 0 THEN ROUND((v_puntos_obtenidos::DECIMAL / v_puntos_totales::DECIMAL) * 100, 2)
            ELSE 0::DECIMAL
        END AS puntuacion,
        CASE 
            WHEN v_puntos_totales > 0 THEN 
                ((v_puntos_obtenidos::DECIMAL / v_puntos_totales::DECIMAL) * 100) >= v_nota_aprobado
            ELSE FALSE
        END AS aprobado;
END;
$$ LANGUAGE plpgsql;

-- 12. Seed data: Ejemplo de evaluación para testing
-- (Se crearán evaluaciones reales cuando se creen los módulos y unidades)

-- Comentario: Las preguntas reales se crearán mediante la interfaz de administración
-- o mediante scripts de seed específicos por curso/módulo
