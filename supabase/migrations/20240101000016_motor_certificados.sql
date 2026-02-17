-- PHASE 9: MOTOR DE CERTIFICADOS
-- ==========================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Función para calcular la nota final de un curso
CREATE OR REPLACE FUNCTION public.calcular_nota_final_curso(
    p_alumno_id UUID,
    p_curso_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    v_nota_examen_final DECIMAL := 0;
    v_nota_media_modulos DECIMAL := 0;
    v_puntos_logros INT := 0;
    v_nota_final DECIMAL;
BEGIN
    -- 1. Mejor nota del examen final (60%)
    SELECT COALESCE(MAX(i.puntuacion), 0) INTO v_nota_examen_final
    FROM public.intentos_evaluacion i
    JOIN public.evaluaciones e ON i.evaluacion_id = e.id
    WHERE i.alumno_id = p_alumno_id 
    AND e.entidad_tipo = 'curso' 
    AND e.entidad_id = p_curso_id
    AND i.estado = 'completado';

    -- 2. Media de las mejores notas de exámenes de módulo (30%)
    SELECT COALESCE(AVG(max_puntuacion), 0) INTO v_nota_media_modulos
    FROM (
        SELECT MAX(i.puntuacion) as max_puntuacion
        FROM public.intentos_evaluacion i
        JOIN public.evaluaciones e ON i.evaluacion_id = e.id
        JOIN public.modulos m ON e.entidad_id = m.id
        WHERE i.alumno_id = p_alumno_id 
        AND e.entidad_tipo = 'modulo'
        AND m.curso_id = p_curso_id
        AND i.estado = 'completado'
        GROUP BY e.entidad_id
    ) as subquery;

    -- 3. Bonus por logros (10% - máx 10 puntos)
    -- Calculamos proporcionalmente: si tiene 10 logros, +10 puntos.
    -- O simplemente sumamos puntos de logros obtenidos durante el curso.
    -- Siguiendo diseño: "10% bonus por logros (máx 10 puntos)". 
    -- Asumimos 1 punto por logro obtenido, hasta un máximo de 10.
    SELECT LEAST(COUNT(*), 10) INTO v_puntos_logros
    FROM public.logros_alumno
    WHERE alumno_id = p_alumno_id;

    -- Cálculo final
    v_nota_final := (v_nota_examen_final * 0.6) + (v_nota_media_modulos * 0.3) + v_puntos_logros;

    RETURN GREATEST(LEAST(v_nota_final, 100), 0);
END;
$$ LANGUAGE plpgsql;


-- 2. Función para emitir el certificado
CREATE OR REPLACE FUNCTION public.emitir_certificado(
    p_alumno_id UUID,
    p_tipo TEXT, -- 'curso' o 'nivel'
    p_entidad_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_certificado_id UUID;
    v_numero_certificado TEXT;
    v_nota_final DECIMAL;
    v_distincion BOOLEAN := FALSE;
    v_nivel_id UUID;
    v_curso_id UUID;
BEGIN
    -- Evitar duplicados
    IF p_tipo = 'curso' THEN
        SELECT id INTO v_certificado_id FROM public.certificados 
        WHERE alumno_id = p_alumno_id AND curso_id = p_entidad_id AND tipo = 'curso';
        v_curso_id := p_entidad_id;
    ELSE
        SELECT id INTO v_certificado_id FROM public.certificados 
        WHERE alumno_id = p_alumno_id AND nivel_id = p_entidad_id AND tipo = 'nivel';
        v_nivel_id := p_entidad_id;
    END IF;

    IF v_certificado_id IS NOT NULL THEN
        RETURN v_certificado_id;
    END IF;

    -- Calcular nota final
    IF p_tipo = 'curso' THEN
        v_nota_final := public.calcular_nota_final_curso(p_alumno_id, p_entidad_id);
    ELSE
        -- Para nivel, hacemos media de cursos
        SELECT AVG(nota_final) INTO v_nota_final
        FROM public.certificados
        WHERE alumno_id = p_alumno_id AND tipo = 'curso'
        AND curso_id IN (SELECT id FROM public.cursos WHERE nivel_formacion_id = p_entidad_id);
    END IF;

    -- Determinar distinción (Excelencia >= 95%)
    IF v_nota_final >= 95 THEN
        v_distincion := TRUE;
    END IF;

    -- Generar número único y hash de verificación
    v_numero_certificado := public.generar_numero_certificado();

    -- Insertar certificado
    INSERT INTO public.certificados (
        alumno_id,
        tipo,
        nivel_id,
        curso_id,
        numero_certificado,
        nota_final,
        distincion,
        fecha_emision,
        verificacion_hash
    ) VALUES (
        p_alumno_id,
        p_tipo,
        v_nivel_id,
        v_curso_id,
        v_numero_certificado,
        v_nota_final,
        v_distincion,
        CURRENT_DATE,
        encode(digest(v_numero_certificado || p_alumno_id::text || now()::text, 'sha256'), 'hex')
    )
    RETURNING id INTO v_certificado_id;

    RETURN v_certificado_id;
END;
$$ LANGUAGE plpgsql;


-- 2.1 Función para el Diploma de Capitán (Hito Final)
CREATE OR REPLACE FUNCTION public.verificar_y_emitir_diploma_capitan(p_alumno_id UUID)
RETURNS VOID AS $$
DECLARE
    v_niveles_completados INT;
    v_habilidades_count INT;
    v_horas_totales DECIMAL;
    v_nota_media DECIMAL;
    v_ya_tiene BOOLEAN;
BEGIN
    -- 1. Verificar si ya lo tiene
    SELECT EXISTS(SELECT 1 FROM public.certificados WHERE alumno_id = p_alumno_id AND tipo = 'diploma_capitan') INTO v_ya_tiene;
    IF v_ya_tiene THEN RETURN; END IF;

    -- 2. Niveles completados (7)
    SELECT COUNT(*) INTO v_niveles_completados FROM public.progreso_alumno 
    WHERE alumno_id = p_alumno_id AND tipo_entidad = 'nivel' AND estado = 'completado';

    -- 3. Habilidades (12)
    -- Ajustar según si la tabla es student_skills o habilidades_alumno
    -- El Phase 7 usa student_skills. El Phase 2 usó habilidades_alumno.
    -- Vamos a ser robustos y mirar ambas o la que estemos usando.
    -- Según LOG_COORDINACION Fase 7 usa student_skills.
    SELECT COUNT(*) INTO v_habilidades_count FROM public.student_skills WHERE student_id = p_alumno_id;

    -- 4. Horas (100)
    SELECT COALESCE(SUM(duracion_h), 0) INTO v_horas_totales FROM public.horas_navegacion 
    WHERE alumno_id = p_alumno_id AND verificado = TRUE;

    -- 5. Nota Media (80)
    SELECT AVG(nota_final) INTO v_nota_media FROM public.certificados 
    WHERE alumno_id = p_alumno_id AND tipo = 'curso';

    -- Evaluación final
    IF v_niveles_completados >= 7 AND v_habilidades_count >= 12 AND v_horas_totales >= 100 AND v_nota_media >= 80 THEN
        INSERT INTO public.certificados (
            alumno_id,
            tipo,
            numero_certificado,
            nota_final,
            distincion,
            fecha_emision,
            verificacion_hash
        ) VALUES (
            p_alumno_id,
            'diploma_capitan',
            public.generar_numero_certificado(),
            v_nota_media,
            TRUE,
            CURRENT_DATE,
            encode(digest('CAP-' || p_alumno_id::text || now()::text, 'sha256'), 'hex')
        );
    END IF;
END;
$$ LANGUAGE plpgsql;


-- 3. Integración con el Recalculo de Progreso
-- Modificamos recalcular_progreso_alumno (mediante un trigger post-update para no tocar la función core de la migración 004 que es sagrada)

CREATE OR REPLACE FUNCTION public.trigger_emitir_certificados_progreso()
RETURNS TRIGGER AS $$
BEGIN
    -- Si un curso se completa
    IF NEW.tipo_entidad = 'curso' AND NEW.estado = 'completado' AND (OLD.estado IS DISTINCT FROM 'completado') THEN
        PERFORM public.emitir_certificado(NEW.alumno_id, 'curso', NEW.entidad_id);
    END IF;

    -- Si un nivel se completa
    IF NEW.tipo_entidad = 'nivel' AND NEW.estado = 'completado' AND (OLD.estado IS DISTINCT FROM 'completado') THEN
        PERFORM public.emitir_certificado(NEW.alumno_id, 'nivel', NEW.entidad_id);
        
        -- Verificar si este es el último nivel para el diploma de capitán
        PERFORM public.verificar_y_emitir_diploma_capitan(NEW.alumno_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_emitir_certificados_progreso ON public.progreso_alumno;
CREATE TRIGGER tr_emitir_certificados_progreso
AFTER UPDATE ON public.progreso_alumno
FOR EACH ROW EXECUTE FUNCTION public.trigger_emitir_certificados_progreso();
