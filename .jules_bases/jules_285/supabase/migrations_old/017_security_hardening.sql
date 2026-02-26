-- ==========================================
-- FASE 15: HARDENING DE SEGURIDAD (ACADEMIA)
-- ==========================================

-- 1. Restringir el acceso directo a la tabla de preguntas para evitar que los alumnos vean las respuestas correctas.
-- Reemplazamos la política de lectura pública por una restringida a Staff.
DROP POLICY IF EXISTS "Lectura pública preguntas" ON public.preguntas;

CREATE POLICY "Solo Staff ve preguntas completas" 
ON public.preguntas FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND rol IN ('admin', 'instructor')
    )
);

-- 2. Hacer que las funciones de evaluación sean SECURITY DEFINER para que puedan 
-- acceder a la tabla de preguntas incluso si el alumno no tiene permiso de SELECT.

-- A. Función de selección de preguntas
ALTER FUNCTION public.seleccionar_preguntas_evaluacion(text, uuid, int, text) SECURITY DEFINER;
-- Asegurarnos de que el esquema sea explícito para seguridad en SECURITY DEFINER
-- Nota: En Supabase es buena práctica establecer el search_path.

-- B. Función de cálculo de puntuación
ALTER FUNCTION public.calcular_puntuacion_intento(uuid) SECURITY DEFINER;

-- 3. Restringir la tabla de evaluaciones para evitar que se vea la configuración interna
-- (aunque no es estrictamente crítico, es mejor por diseño).
DROP POLICY IF EXISTS "Lectura pública evaluaciones" ON public.evaluaciones;

CREATE POLICY "Lectura pública segura evaluaciones" 
ON public.evaluaciones FOR SELECT 
TO authenticated
USING (true); -- Permitimos lectura, pero controlaremos qué columnas se exponen en las APIs.

-- 4. Nueva RPC para obtener detalles de preguntas de forma segura (sin respuestas)
-- Esto permite que el frontend obtenga el texto de las preguntas sin que la tabla sea pública.
CREATE OR REPLACE FUNCTION public.get_preguntas_seguras(p_preguntas_ids uuid[])
RETURNS TABLE(
    id UUID,
    tipo_pregunta TEXT,
    enunciado_es TEXT,
    enunciado_eu TEXT,
    opciones_json JSONB,
    puntos INT,
    imagen_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.tipo_pregunta, p.enunciado_es, p.enunciado_eu, p.opciones_json, p.puntos, p.imagen_url
    FROM public.preguntas p
    WHERE p.id = ANY(p_preguntas_ids) AND p.activa = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Hardening de Certificados: Asegurar que el hash sea único y no nulo
ALTER TABLE public.certificados ALTER COLUMN verificacion_hash SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_certificados_hash ON public.certificados(verificacion_hash);
