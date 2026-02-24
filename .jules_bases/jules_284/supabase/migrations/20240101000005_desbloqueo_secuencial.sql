-- ==========================================
-- FASE 6: MOTOR DE DESBLOQUEO SECUENCIAL Y DEPENDENCIAS
-- ==========================================

-- 1. Función para verificar y aplicar desbloqueos complejos (Niveles y Cursos con prerrequisitos)
CREATE OR REPLACE FUNCTION public.verificar_desbloqueos_dependencias(p_alumno_id UUID)
RETURNS VOID AS $$
DECLARE
    v_nivel RECORD;
    v_curso RECORD;
    v_cumple_prerequisitos BOOLEAN;
    v_prereq_id UUID;
    v_parent_id UUID;
    v_first_child_id UUID;
BEGIN
    -- A) DESBLOQUEO DE NIVELES (Basado en prerrequisitos)
    FOR v_nivel IN SELECT * FROM public.niveles_formacion LOOP
        -- Si ya tiene estado (bloqueado, disponible, etc), pasamos (o podríamos revalidar)
        -- Asumimos que si no existe fila, está bloqueado implícitamente.
        -- Queremos insertar 'no_iniciado' si cumple todos los requisitos.
        
        -- Verificar si ya existe registro
        PERFORM 1 FROM public.progreso_alumno 
        WHERE alumno_id = p_alumno_id AND tipo_entidad = 'nivel' AND entidad_id = v_nivel.id;
        
        IF NOT FOUND THEN
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
                        EXIT; -- Salir del loop de prerequisitos
                    END IF;
                END LOOP;
            END IF;

            -- Caso especial: Nivel 1 (sin prerequisitos) siempre cumple si es NULL o vacío
            IF v_nivel.prerequisitos IS NULL OR array_length(v_nivel.prerequisitos, 1) = 0 THEN
                 v_cumple_prerequisitos := TRUE;
            END IF;
            
            -- Si cumple, desbloquear Nivel
            IF v_cumple_prerequisitos THEN
                INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, fecha_inicio)
                VALUES (p_alumno_id, 'nivel', v_nivel.id, 'no_iniciado', NOW())
                ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;
                
                -- Al desbloquear nivel, desbloquear s/u PRIMER CURSO automáticamente
                SELECT id INTO v_first_child_id 
                FROM public.cursos 
                WHERE nivel_formacion_id = v_nivel.id 
                ORDER BY orden_en_nivel ASC LIMIT 1;
                
                IF v_first_child_id IS NOT NULL THEN
                    INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, fecha_inicio)
                    VALUES (p_alumno_id, 'curso', v_first_child_id, 'no_iniciado', NOW())
                    ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;
                END IF;
            END IF;
        END IF;
    END LOOP;

    -- B) DESBLOQUEO DE CURSOS (Basado en prerrequisitos + secuencia)
    -- Nota: La secuencia simple (Curso 1 -> Curso 2) ya la maneja 'recalcular_progreso_alumno'.
    -- Aquí manejamos 'prerequisitos_curso' explícitos si los hubiera y la apertura inicial.
    
    FOR v_curso IN SELECT * FROM public.cursos LOOP
         -- Verificar si ya existe registro
        PERFORM 1 FROM public.progreso_alumno 
        WHERE alumno_id = p_alumno_id AND tipo_entidad = 'curso' AND entidad_id = v_curso.id;
        
        IF NOT FOUND THEN
             -- Verificar si el NIVEL padre está desbloqueado (al menos 'no_iniciado')
            IF EXISTS (
                SELECT 1 FROM public.progreso_alumno 
                WHERE alumno_id = p_alumno_id 
                AND tipo_entidad = 'nivel' 
                AND entidad_id = v_curso.nivel_formacion_id
                AND estado IN ('no_iniciado', 'en_progreso', 'completado')
            ) THEN
                v_cumple_prerequisitos := TRUE;

                -- Verificar prerrequisitos explícitos de curso
                IF v_curso.prerequisitos_curso IS NOT NULL AND array_length(v_curso.prerequisitos_curso, 1) > 0 THEN
                    FOREACH v_prereq_id IN ARRAY v_curso.prerequisitos_curso LOOP
                        IF NOT EXISTS (
                            SELECT 1 FROM public.progreso_alumno 
                            WHERE alumno_id = p_alumno_id 
                            AND tipo_entidad = 'curso' 
                            AND entidad_id = v_prereq_id 
                            AND estado = 'completado'
                        ) THEN
                            v_cumple_prerequisitos := FALSE;
                            EXIT;
                        END IF;
                    END LOOP;
                END IF;
                
                -- Verificar secuencia: si tiene orden > 1, el anterior debe estar completado
                -- (Esto es redundante con recalcular_progreso pero sirve de seguridad)
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
                    
                     -- Al desbloquear curso, desbloquear su PRIMER MÓDULO
                    SELECT id INTO v_first_child_id 
                    FROM public.modulos 
                    WHERE curso_id = v_curso.id 
                    ORDER BY orden ASC LIMIT 1;
                    
                    IF v_first_child_id IS NOT NULL THEN
                        INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, fecha_inicio)
                        VALUES (p_alumno_id, 'modulo', v_first_child_id, 'no_iniciado', NOW())
                        ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;
                    END IF;
                END IF;
            END IF;
        END IF;
    END LOOP;
    
    -- C) DESBLOQUEO DE MÓDULOS (Apertura inicial del primer hijo)
    -- La secuencia Módulo 1 -> Módulo 2 ya está en recalcular_progreso.
    -- Aquí aseguramos que si un curso está abierto, su primer módulo también.
    -- (Ya cubierto arriba en la sección de curso, pero reforzamos para modulos huérfanos si los hubiera)

    -- D) DESBLOQUEO DE UNIDADES (Apertura inicial de la primera hija)
    -- Si un módulo está abierto ('no_iniciado', 'en_progreso', 'completado'), su primera unidad debe estar abierta.
    INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, fecha_inicio)
    SELECT p_alumno_id, 'unidad', u.id, 'no_iniciado', NOW()
    FROM public.progreso_alumno p
    JOIN public.unidades_didacticas u ON u.modulo_id = p.entidad_id
    WHERE p.alumno_id = p_alumno_id 
    AND p.tipo_entidad = 'modulo'
    AND p.estado IN ('no_iniciado', 'en_progreso', 'completado')
    AND u.orden = 1
    ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;

END;
$$ LANGUAGE plpgsql;


-- 2. Trigger para llamar a verificar_desbloqueos tras completar algo
CREATE OR REPLACE FUNCTION public.trigger_verificar_desbloqueos()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo si cambia a completado
    IF NEW.estado = 'completado' AND (OLD.estado IS DISTINCT FROM 'completado') THEN
        -- Si es nivel o curso, hay dependencias complejas posibles
        IF NEW.tipo_entidad IN ('nivel', 'curso') THEN
            PERFORM public.verificar_desbloqueos_dependencias(NEW.alumno_id);
        END IF;
        
        -- Si es módulo, aseguramos que se abra la primera unidad del siguiente módulo (ya cubierto por recalcular, pero por seguridad)
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_progreso_completado_check_deps
AFTER UPDATE ON public.progreso_alumno
FOR EACH ROW
EXECUTE FUNCTION public.trigger_verificar_desbloqueos();


-- 3. Función RPC para la API: Obtener Estado de Desbloqueo Completo
-- Devuelve un JSON con el mapa de estados para el front
CREATE OR REPLACE FUNCTION public.obtener_estado_desbloqueo(p_alumno_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    -- Construimos un objeto JSON gigante con todas las entidades y su estado calculado
    -- Usamos LEFT JOIN para que aparezcan incluso las que no tienen fila en progreso_alumno (como 'bloqueado')
    
    SELECT jsonb_build_object(
        'niveles', (
            SELECT jsonb_object_agg(n.id, COALESCE(p.estado, 'bloqueado'))
            FROM public.niveles_formacion n
            LEFT JOIN public.progreso_alumno p ON n.id = p.entidad_id AND p.alumno_id = p_alumno_id
        ),
        'cursos', (
            SELECT jsonb_object_agg(c.id, COALESCE(p.estado, 'bloqueado'))
            FROM public.cursos c
            LEFT JOIN public.progreso_alumno p ON c.id = p.entidad_id AND p.alumno_id = p_alumno_id
        ),
        'modulos', (
            SELECT jsonb_object_agg(m.id, COALESCE(p.estado, 'bloqueado'))
            FROM public.modulos m
            LEFT JOIN public.progreso_alumno p ON m.id = p.entidad_id AND p.alumno_id = p_alumno_id
        ),
        'unidades', (
            SELECT jsonb_object_agg(u.id, COALESCE(p.estado, 'bloqueado'))
            FROM public.unidades_didacticas u
            LEFT JOIN public.progreso_alumno p ON u.id = p.entidad_id AND p.alumno_id = p_alumno_id
        )
    ) INTO v_resultado;
    
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- 4. Ejecutar verificación inicial para todos los alumnos (útil si ya hay usuarios creados)
-- Desbloquea el Nivel 1 y sus hijos para todos los alumnos existentes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.profiles LOOP
        PERFORM public.verificar_desbloqueos_dependencias(r.id);
    END LOOP;
END $$;
