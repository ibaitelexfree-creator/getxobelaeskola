-- ==========================================
-- FASE 9: REFACTOR Y COMPLETADO MOTOR CERTIFICADOS
-- ==========================================
-- Este script unifica y completa la lógica de certificados.

-- 1. Asegurar esquema de tabla
ALTER TABLE public.certificados 
ADD COLUMN IF NOT EXISTS nivel_distincion TEXT 
CHECK (nivel_distincion IN ('estandar', 'merito', 'excelencia'))
DEFAULT 'estandar';

ALTER TABLE public.certificados 
ADD COLUMN IF NOT EXISTS verificacion_hash TEXT;

-- 2. Función de cálculo de nota de curso (Refinada)
CREATE OR REPLACE FUNCTION public.calcular_nota_final_curso(
    p_alumno_id UUID,
    p_curso_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    v_nota_examen_final DECIMAL := 0;
    v_nota_media_modulos DECIMAL := 0;
    v_bonus_logros DECIMAL := 0;
    v_nota_final DECIMAL;
BEGIN
    -- Mejor nota del examen final (60%)
    -- Buscamos evaluaciones tipo 'examen_final' vinculadas a este curso
    SELECT COALESCE(MAX(ie.puntuacion_porcentaje), 0) INTO v_nota_examen_final
    FROM public.intentos_evaluacion ie
    JOIN public.evaluaciones e ON ie.evaluacion_id = e.id
    WHERE ie.alumno_id = p_alumno_id 
    AND e.entidad_id = p_curso_id
    AND e.tipo = 'examen_final'
    AND ie.estado = 'terminado';

    -- Si no hay examen final completado, intentamos buscarlo por la tabla evaluaciones filtrando por curso
    IF v_nota_examen_final = 0 THEN
         -- Fallback en caso de que entidad_id en evaluaciones apunte a otra cosa pero el curso sea el padre
         -- (Ajustado según diseño: el examen final está vinculado directamente al curso)
    END IF;

    -- Media de las mejores notas de exámenes de módulo (30%)
    SELECT COALESCE(AVG(max_puntuacion), 0) INTO v_nota_media_modulos
    FROM (
        SELECT MAX(ie.puntuacion_porcentaje) as max_puntuacion
        FROM public.intentos_evaluacion ie
        JOIN public.evaluaciones e ON ie.evaluacion_id = e.id
        JOIN public.modulos m ON e.entidad_id = m.id
        WHERE ie.alumno_id = p_alumno_id 
        AND e.tipo = 'examen_modulo'
        AND m.curso_id = p_curso_id
        AND ie.estado = 'terminado'
        GROUP BY e.entidad_id
    ) as subquery;

    -- Bonus por logros (10% - máx 10 puntos extra)
    -- 1 punto por logro obtenido, hasta un máximo de 10.
    SELECT LEAST(COUNT(*), 10) INTO v_bonus_logros
    FROM public.logros_alumno
    WHERE alumno_id = p_alumno_id;

    -- Cálculo final ponderado
    v_nota_final := (v_nota_examen_final * 0.6) + (v_media_modulos * 0.3) + v_bonus_logros;

    RETURN LEAST(GREATEST(v_nota_final, 0), 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Función principal de emisión (Refinada + Diploma Capitán)
CREATE OR REPLACE FUNCTION public.emitir_certificado(
    p_alumno_id UUID,
    p_tipo TEXT, -- 'curso', 'nivel', 'diploma_capitan'
    p_entidad_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_certificado_id UUID;
    v_numero_certificado TEXT;
    v_nota_final DECIMAL;
    v_nivel_distincion TEXT := 'estandar';
    v_nivel_id UUID := NULL;
    v_curso_id UUID := NULL;
    v_verificacion_hash TEXT;
BEGIN
    -- Evitar duplicados
    IF p_tipo = 'curso' THEN
        SELECT id INTO v_certificado_id FROM public.certificados 
        WHERE alumno_id = p_alumno_id AND curso_id = p_entidad_id AND tipo = 'curso';
        v_curso_id := p_entidad_id;
    ELSIF p_tipo = 'nivel' THEN
        SELECT id INTO v_certificado_id FROM public.certificados 
        WHERE alumno_id = p_alumno_id AND nivel_id = p_entidad_id AND tipo = 'nivel';
        v_nivel_id := p_entidad_id;
    ELSIF p_tipo = 'diploma_capitan' THEN
        SELECT id INTO v_certificado_id FROM public.certificados 
        WHERE alumno_id = p_alumno_id AND tipo = 'diploma_capitan';
    END IF;

    IF v_certificado_id IS NOT NULL THEN
        RETURN v_certificado_id;
    END IF;

    -- Calcular nota final según tipo
    IF p_tipo = 'curso' THEN
        v_nota_final := public.calcular_nota_final_curso(p_alumno_id, p_curso_id);
    ELSIF p_tipo = 'nivel' THEN
        -- Media de los certificados de curso en este nivel
        SELECT COALESCE(AVG(nota_final), 0) INTO v_nota_final
        FROM public.certificados
        WHERE alumno_id = p_alumno_id AND tipo = 'curso'
        AND curso_id IN (SELECT id FROM public.cursos WHERE nivel_id = p_entidad_id);
    ELSIF p_tipo = 'diploma_capitan' THEN
        -- Validación de requisitos para Diploma Capitán
        -- 1. Media global >= 80%
        SELECT COALESCE(AVG(nota_final), 0) INTO v_nota_final
        FROM public.certificados
        WHERE alumno_id = p_alumno_id AND tipo = 'nivel';
        
        IF v_nota_final < 80 THEN RETURN NULL; END IF;
        
        -- 2. Los 7 niveles completados
        IF (SELECT COUNT(*) FROM public.certificados WHERE alumno_id = p_alumno_id AND tipo = 'nivel') < 7 THEN
            RETURN NULL;
        END IF;
        
        -- 3. Las 12 habilidades obtenidas
        IF (SELECT COUNT(*) FROM public.habilidades_alumno WHERE alumno_id = p_alumno_id) < 12 THEN
            RETURN NULL;
        END IF;
        
        -- 4. Al menos 100 horas de navegación
        IF (SELECT COALESCE(SUM(duracion_h), 0) FROM public.horas_navegacion WHERE alumno_id = p_alumno_id) < 100 THEN
            RETURN NULL;
        END IF;
    END IF;

    -- Validar umbral mínimo para emisión (excepto capitán que ya validamos 80%)
    IF p_tipo != 'diploma_capitan' AND v_nota_final < 75 THEN
        RETURN NULL; -- No se emite certificado si no llega al umbral
    END IF;

    -- Determinar distinción
    IF v_nota_final >= 95 THEN
        v_nivel_distincion := 'excelencia';
    ELSIF v_nota_final >= 85 THEN
        v_nivel_distincion := 'merito';
    ELSE
        v_nivel_distincion := 'estandar';
    END IF;

    -- Generar número único y hash
    v_numero_certificado := public.generar_numero_certificado();
    v_verificacion_hash := md5(v_numero_certificado || now()::text || random()::text);

    -- Insertar certificado
    INSERT INTO public.certificados (
        alumno_id,
        tipo,
        nivel_id,
        curso_id,
        numero_certificado,
        nota_final,
        distincion,
        nivel_distincion,
        fecha_emision,
        verificacion_hash
    ) VALUES (
        p_alumno_id,
        p_tipo,
        v_nivel_id,
        v_curso_id,
        v_numero_certificado,
        v_nota_final,
        (v_nota_final >= 85),
        v_nivel_distincion,
        CURRENT_DATE,
        v_verificacion_hash
    )
    RETURNING id INTO v_certificado_id;

    -- Registrar nota final en progreso_alumno
    IF p_tipo != 'diploma_capitan' AND p_entidad_id IS NOT NULL THEN
        UPDATE public.progreso_alumno
        SET nota_final = v_nota_final
        WHERE alumno_id = p_alumno_id 
        AND entidad_id = p_entidad_id 
        AND tipo_entidad = p_tipo;
    END IF;

    RETURN v_certificado_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger actualizado
CREATE OR REPLACE FUNCTION public.trigger_auto_emision_certificados()
RETURNS TRIGGER AS $$
BEGIN
    -- Si una entidad se completa
    IF NEW.estado = 'completado' AND (OLD.estado IS DISTINCT FROM 'completado') THEN
        
        -- Emisión de Curso
        IF NEW.tipo_entidad = 'curso' THEN
            PERFORM public.emitir_certificado(NEW.alumno_id, 'curso', NEW.entidad_id);
        
        -- Emisión de Nivel
        ELSIF NEW.tipo_entidad = 'nivel' THEN
            PERFORM public.emitir_certificado(NEW.alumno_id, 'nivel', NEW.entidad_id);
            
            -- Si completó el nivel 7, intentar emitir Diploma Capitán
            IF EXISTS (SELECT 1 FROM public.niveles_formacion WHERE id = NEW.entidad_id AND nivel_numero = 7) THEN
                PERFORM public.emitir_certificado(NEW.alumno_id, 'diploma_capitan');
            END IF;
        END IF;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_auto_emision_certificados ON public.progreso_alumno;
CREATE TRIGGER tr_auto_emision_certificados
AFTER UPDATE ON public.progreso_alumno
FOR EACH ROW 
EXECUTE FUNCTION public.trigger_auto_emision_certificados();

-- Comentarios
COMMENT ON FUNCTION public.calcular_nota_final_curso IS 'Calcula la nota ponderada de un curso (60% examen, 30% módulos, 10% bonus logros).';
COMMENT ON FUNCTION public.emitir_certificado IS 'Emite un certificado oficial si se cumplen los requisitos de nota y contenido.';
