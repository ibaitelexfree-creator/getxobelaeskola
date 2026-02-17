-- ==========================================
-- FASE 9: MOTOR DE CERTIFICADOS
-- ==========================================

-- 1. Función para calcular la nota final de un curso
CREATE OR REPLACE FUNCTION public.calcular_nota_final_curso(p_alumno_id UUID, p_curso_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_nota_examen_final DECIMAL;
    v_media_modulos DECIMAL;
    v_bonus_logros DECIMAL;
    v_nota_final DECIMAL;
BEGIN
    -- Mejor nota del examen final del curso
    SELECT MAX(puntuacion_porcentaje) INTO v_nota_examen_final
    FROM public.intentos_evaluacion ie
    JOIN public.evaluaciones e ON ie.evaluacion_id = e.id
    WHERE ie.alumno_id = p_alumno_id
    AND e.entidad_id = p_curso_id
    AND e.tipo = 'examen_final'
    AND ie.estado = 'terminado';

    IF v_nota_examen_final IS NULL THEN v_nota_examen_final := 0; END IF;

    -- Media de las mejores notas de los módulos del curso
    SELECT AVG(mejor_nota) INTO v_media_modulos
    FROM (
        SELECT MAX(ie.puntuacion_porcentaje) as mejor_nota
        FROM public.intentos_evaluacion ie
        JOIN public.evaluaciones e ON ie.evaluacion_id = e.id
        JOIN public.modulos m ON e.entidad_id = m.id
        WHERE ie.alumno_id = p_alumno_id
        AND m.curso_id = p_curso_id
        AND e.tipo = 'examen_modulo'
        AND ie.estado = 'terminado'
        GROUP BY m.id
    ) as mejores_notas_modulos;

    IF v_media_modulos IS NULL THEN v_media_modulos := 0; END IF;

    -- Bonus de logros (1 punto por logro hasta 10 puntos)
    SELECT LEAST(COUNT(*), 10) INTO v_bonus_logros
    FROM public.logros_alumno
    WHERE alumno_id = p_alumno_id;

    IF v_bonus_logros IS NULL THEN v_bonus_logros := 0; END IF;

    -- Cálculo final ponderado
    -- 60% examen + 30% módulos + 10% bonus
    v_nota_final := (v_nota_examen_final * 0.6) + (v_media_modulos * 0.3) + (v_bonus_logros);
    
    RETURN LEAST(v_nota_final, 100);
END;
$$ LANGUAGE plpgsql;

-- 2. Función para emitir un certificado
CREATE OR REPLACE FUNCTION public.emitir_certificado(p_alumno_id UUID, p_tipo TEXT, p_entidad_id UUID)
RETURNS UUID AS $$
DECLARE
    v_certificado_id UUID;
    v_numero_certificado TEXT;
    v_verificacion_hash TEXT;
    v_nota_final DECIMAL;
    v_distincion BOOLEAN;
    v_nivel_id UUID := NULL;
    v_curso_id UUID := NULL;
BEGIN
    -- Evitar duplicados
    IF p_tipo = 'curso' THEN
        SELECT id INTO v_certificado_id FROM public.certificados WHERE alumno_id = p_alumno_id AND curso_id = p_entidad_id;
        v_curso_id := p_entidad_id;
        v_nota_final := public.calcular_nota_final_curso(p_alumno_id, p_curso_id);
    ELSIF p_tipo = 'nivel' THEN
        SELECT id INTO v_certificado_id FROM public.certificados WHERE alumno_id = p_alumno_id AND nivel_id = p_entidad_id;
        v_nivel_id := p_entidad_id;
        -- Nota media de los cursos del nivel
        SELECT AVG(nota_final) INTO v_nota_final
        FROM public.certificados
        WHERE alumno_id = p_alumno_id
        AND curso_id IN (SELECT id FROM public.cursos WHERE nivel_id = v_nivel_id);
    ELSIF p_tipo = 'diploma_capitan' THEN
        SELECT id INTO v_certificado_id FROM public.certificados WHERE alumno_id = p_alumno_id AND tipo = 'diploma_capitan';
        -- Nota media total
        SELECT AVG(nota_final) INTO v_nota_final
        FROM public.certificados
        WHERE alumno_id = p_alumno_id;
    END IF;

    IF v_certificado_id IS NOT NULL THEN
        RETURN v_certificado_id;
    END IF;

    -- Validar nota mínima (75% para emitir)
    IF v_nota_final < 75 AND p_tipo != 'diploma_capitan' THEN
        RETURN NULL;
    END IF;
    
    -- Para diploma de capitán, validar requisitos extra
    IF p_tipo = 'diploma_capitan' THEN
        -- Validar 7 niveles
        IF (SELECT COUNT(*) FROM public.certificados WHERE alumno_id = p_alumno_id AND tipo = 'nivel') < 7 THEN
            RETURN NULL;
        END IF;
        -- Validar 12 habilidades
        IF (SELECT COUNT(*) FROM public.habilidades_alumno WHERE alumno_id = p_alumno_id) < 12 THEN
            RETURN NULL;
        END IF;
        -- Validar 100 horas
        IF (SELECT SUM(duracion_h) FROM public.horas_navegacion WHERE alumno_id = p_alumno_id) < 100 THEN
            RETURN NULL;
        END IF;
    END IF;

    -- Generar datos
    v_numero_certificado := public.generar_numero_certificado();
    v_verificacion_hash := md5(v_numero_certificado || now()::text || random()::text);
    v_distincion := v_nota_final >= 90;

    -- Insertar
    INSERT INTO public.certificados (
        alumno_id, nivel_id, curso_id, tipo, numero_certificado, 
        nota_final, distincion, verificacion_hash
    ) VALUES (
        p_alumno_id, v_nivel_id, v_curso_id, p_tipo, v_numero_certificado,
        v_nota_final, v_distincion, v_verificacion_hash
    ) RETURNING id INTO v_certificado_id;

    -- Actualizar nota_final en progreso_alumno si es curso o nivel
    IF p_tipo = 'curso' OR p_tipo = 'nivel' THEN
        UPDATE public.progreso_alumno
        SET nota_final = v_nota_final
        WHERE alumno_id = p_alumno_id 
        AND entidad_id = p_entidad_id
        AND tipo_entidad = p_tipo;
    END IF;

    RETURN v_certificado_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para emisión automática tras completado
CREATE OR REPLACE FUNCTION public.trigger_emision_certificado_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo si el estado pasó a completado
    IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
        IF NEW.tipo_entidad = 'curso' THEN
            PERFORM public.emitir_certificado(NEW.alumno_id, 'curso', NEW.entidad_id);
            
            -- Verificar si el nivel se completó tras aprobar este curso
            -- Esto requiere la lógica de propagación de Fase 4 que marca el nivel como completado.
        ELSIF NEW.tipo_entidad = 'nivel' THEN
            PERFORM public.emitir_certificado(NEW.alumno_id, 'nivel', NEW.entidad_id);
            
            -- Verificar Diploma Capitán si es el nivel 7
            IF EXISTS (SELECT 1 FROM public.niveles_formacion WHERE id = NEW.entidad_id AND nivel_numero = 7) THEN
                PERFORM public.emitir_certificado(NEW.alumno_id, 'diploma_capitan', NULL);
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_emision_certificado ON public.progreso_alumno;
CREATE TRIGGER tr_emision_certificado
AFTER UPDATE ON public.progreso_alumno
FOR EACH ROW
EXECUTE FUNCTION public.trigger_emision_certificado_automatico();
