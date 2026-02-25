-- ==========================================
-- FASE HARDENING (BLUE TEAM): ENFORCEMENT DE PAGO EN DB
-- ==========================================

-- Redefinimos la función de acceso para que sea la ÚNICA FUENTE DE VERDAD.
-- Ya no confiamos solo en que la API haya verificado el pago. La DB lo exige.

CREATE OR REPLACE FUNCTION public.puede_acceder_entidad(
    p_alumno_id UUID,
    p_tipo_entidad TEXT,
    p_entidad_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_estado TEXT;
    v_curso_id UUID;
    v_tiene_inscripcion BOOLEAN;
BEGIN
    -- 1. IDENTIFICAR EL CURSO RAÍZ
    -- Dependiendo de la entidad, buscamos su curso padre
    IF p_tipo_entidad = 'curso' THEN
        v_curso_id := p_entidad_id;
    ELSIF p_tipo_entidad = 'modulo' THEN
        SELECT curso_id INTO v_curso_id FROM public.modulos WHERE id = p_entidad_id;
    ELSIF p_tipo_entidad = 'unidad' THEN
        SELECT m.curso_id INTO v_curso_id 
        FROM public.unidades_didacticas u
        JOIN public.modulos m ON u.modulo_id = m.id
        WHERE u.id = p_entidad_id;
    ELSIF p_tipo_entidad = 'nivel' THEN
        -- Los niveles suelen estar abiertos si son el 1, pero si queremos restringir niveles enteros:
        -- Por ahora, el nivel es un contenedor lógico, no pagable en sí mismo (se pagan los cursos).
        -- Dejamos pasar la verificación de pago para 'nivel' y confiamos en la lógica de 'cursos'.
        -- O si el modelo cambia a "Pagar por Nivel", aquí iría.
        v_curso_id := NULL; 
    END IF;

    -- 2. VERIFICACIÓN DE PAGO (HARDENING)
    -- Si es una entidad dentro de un curso, VERIFICAR INSCRIPCIÓN PAGADA.
    IF v_curso_id IS NOT NULL THEN
        -- Verificar si existe inscripción PAGADA
        SELECT EXISTS (
            SELECT 1 
            FROM public.inscripciones 
            WHERE perfil_id = p_alumno_id 
            AND curso_id = v_curso_id 
            AND estado_pago = 'pagado'
        ) INTO v_tiene_inscripcion;

        -- Si no hay inscripción pagada, RECHAZAR ACCESO INMEDIATAMENTE.
        -- Exception: Si implementamos "Cursos Gratuitos" en el futuro, 
        -- aquí deberíamos chequear si el curso tiene precio 0.
        -- Por seguridad (Fail Closed), hoy se requiere inscripción explícita.
        IF NOT v_tiene_inscripcion THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- 3. VERIFICACIÓN DE PROGRESO ACADÉMICO (Lógica original)
    -- Si pagó, ahora vemos si académicamente puede verlo (desbloqueado secuencialmente).

    -- Buscar estado explícito
    SELECT estado INTO v_estado
    FROM public.progreso_alumno
    WHERE alumno_id = p_alumno_id AND tipo_entidad = p_tipo_entidad AND entidad_id = p_entidad_id;
    
    IF v_estado IN ('no_iniciado', 'en_progreso', 'completado') THEN
        RETURN TRUE;
    END IF;
    
    -- Si no hay registro, verificar si es el "Primer elemento" de una estructura superior desbloqueada.
    -- (Lógica de failsafe para el primer ítem)
    
    -- Validar Nivel 1 por defecto
    IF p_tipo_entidad = 'nivel' THEN
         IF EXISTS (SELECT 1 FROM public.niveles_formacion WHERE id = p_entidad_id AND (prerequisitos IS NULL OR array_length(prerequisitos, 1) = 0)) THEN
             RETURN TRUE;
         END IF;
    END IF;
    
    -- Validar primer curso de un nivel (si el nivel está accesible) -> pero ya pasamos check de pago arriba.
    -- Si pagó el curso, debería tener un registro 'no_iniciado' creado al inscribirse o al completar el anterior.
    -- Si no existe registro, es que algo falló en la propagación o es el primero.
    
    -- Permitimos acceso si es el PRIMER elemento y el padre está accesible (lógica laxa para UX, 
    -- pero protegida por el check de pago anterior).
    
    RETURN FALSE; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
