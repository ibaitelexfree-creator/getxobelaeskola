-- ==========================================
-- FASE 17 (QA FIX): CORRECCIÓN INTEGRAL DE DESBLOQUEO TRANSVERSAL
-- ==========================================

-- 1. Asegurar que los prerrequisitos de los niveles transversales apuntan al Nivel 2
DO $$
DECLARE
    v_nivel2_id UUID;
    v_nivel6_id UUID;
    v_nivel7_id UUID;
BEGIN
    SELECT id INTO v_nivel2_id FROM public.niveles_formacion WHERE orden = 2 LIMIT 1;
    SELECT id INTO v_nivel6_id FROM public.niveles_formacion WHERE orden = 6 LIMIT 1;
    SELECT id INTO v_nivel7_id FROM public.niveles_formacion WHERE orden = 7 LIMIT 1;

    IF v_nivel2_id IS NOT NULL THEN
        UPDATE public.niveles_formacion SET prerequisitos = ARRAY[v_nivel2_id] WHERE id = v_nivel6_id;
        UPDATE public.niveles_formacion SET prerequisitos = ARRAY[v_nivel2_id] WHERE id = v_nivel7_id;
    END IF;
END $$;

-- 2. Refaccionar la función de desbloqueo para ser robusta y SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.verificar_desbloqueos_dependencias(p_alumno_id UUID)
RETURNS VOID AS $$
DECLARE
    v_nivel RECORD;
    v_curso RECORD;
    v_cumple_prerequisitos BOOLEAN;
    v_prereq_id UUID;
    v_first_child_id UUID;
BEGIN
    -- A) DESBLOQUEO DE NIVELES
    FOR v_nivel IN SELECT * FROM public.niveles_formacion LOOP
        -- Verificar si ya tiene progreso
        IF NOT EXISTS (
            SELECT 1 FROM public.progreso_alumno 
            WHERE alumno_id = p_alumno_id AND tipo_entidad = 'nivel' AND entidad_id = v_nivel.id
        ) THEN
            v_cumple_prerequisitos := TRUE;
            
            -- Verificar cada prerrequisito
            IF v_nivel.prerequisitos IS NOT NULL AND array_length(v_nivel.prerequisitos, 1) > 0 THEN
                FOREACH v_prereq_id IN ARRAY v_nivel.prerequisitos LOOP
                    IF NOT EXISTS (
                        SELECT 1 FROM public.progreso_alumno 
                        WHERE alumno_id = p_alumno_id 
                        AND tipo_entidad = 'nivel' 
                        AND entidad_id = v_prereq_id 
                        AND estado = 'completado'
                    ) THEN
                        v_cumple_prerequisitos := FALSE;
                        EXIT;
                    END IF;
                END LOOP;
            END IF;

            -- Caso especial: Nivel 1
            IF v_nivel.orden = 1 THEN v_cumple_prerequisitos := TRUE; END IF;
            
            -- Si cumple, desbloquear Nivel
            IF v_cumple_prerequisitos THEN
                INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, fecha_inicio)
                VALUES (p_alumno_id, 'nivel', v_nivel.id, 'no_iniciado', NOW())
                ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;
                
                -- Desbloquear primer curso
                SELECT id INTO v_first_child_id FROM public.cursos WHERE nivel_formacion_id = v_nivel.id ORDER BY orden_en_nivel ASC LIMIT 1;
                IF v_first_child_id IS NOT NULL THEN
                    INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, fecha_inicio)
                    VALUES (p_alumno_id, 'curso', v_first_child_id, 'no_iniciado', NOW())
                    ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;
                END IF;
            END IF;
        END IF;
    END LOOP;

    -- B) DESBLOQUEO DE CURSOS
    FOR v_curso IN SELECT * FROM public.cursos LOOP
        IF NOT EXISTS (
            SELECT 1 FROM public.progreso_alumno 
            WHERE alumno_id = p_alumno_id AND tipo_entidad = 'curso' AND entidad_id = v_curso.id
        ) THEN
            -- Solo intentar si el nivel está desbloqueado
            IF EXISTS (
                SELECT 1 FROM public.progreso_alumno 
                WHERE alumno_id = p_alumno_id AND tipo_entidad = 'nivel' AND entidad_id = v_curso.nivel_formacion_id
                AND estado IN ('no_iniciado', 'en_progreso', 'completado')
            ) THEN
                v_cumple_prerequisitos := TRUE;
                
                -- Si es el primer curso del nivel, se abre solo
                -- Si no, el anterior debe estar completado
                IF v_curso.orden_en_nivel > 1 THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM public.cursos c_prev
                        JOIN public.progreso_alumno p_prev ON c_prev.id = p_prev.entidad_id
                        WHERE c_prev.nivel_formacion_id = v_curso.nivel_formacion_id
                        AND c_prev.orden_en_nivel = v_curso.orden_en_nivel - 1
                        AND p_prev.alumno_id = p_alumno_id
                        AND p_prev.tipo_entidad = 'curso'
                        AND p_prev.estado = 'completado'
                    ) THEN
                        v_cumple_prerequisitos := FALSE;
                    END IF;
                END IF;

                IF v_cumple_prerequisitos THEN
                    INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, fecha_inicio)
                    VALUES (p_alumno_id, 'curso', v_curso.id, 'no_iniciado', NOW())
                    ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;
                END IF;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Actualizar el trigger para que funcione en INSERT (completado directo) y UPDATE
CREATE OR REPLACE FUNCTION public.trigger_verificar_desbloqueos()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado IS DISTINCT FROM 'completado') THEN
        IF NEW.tipo_entidad IN ('nivel', 'curso') THEN
            PERFORM public.verificar_desbloqueos_dependencias(NEW.alumno_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_progreso_completado_check_deps ON public.progreso_alumno;
CREATE TRIGGER on_progreso_completado_check_deps
AFTER INSERT OR UPDATE ON public.progreso_alumno
FOR EACH ROW
EXECUTE FUNCTION public.trigger_verificar_desbloqueos();
