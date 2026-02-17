-- ==========================================
-- FASE 6 (HARDENING): MEJORAS DE ROBUSTEZ Y SEGURIDAD
-- ==========================================

-- 1. CONSTRAINT Y TRIGGER PARA VALIDAR UUIDs EN PRERREQUISITOS DE NIVELES
-- Antes de insertar un nivel con prerequisitos, verificamos que esos IDs existan y no sean el propio nivel.

CREATE OR REPLACE FUNCTION public.validar_prerequisitos_nivel()
RETURNS TRIGGER AS $$
DECLARE
    v_prereq_id UUID;
BEGIN
    IF NEW.prerequisitos IS NOT NULL THEN
        FOREACH v_prereq_id IN ARRAY NEW.prerequisitos LOOP
            -- 1. Evitar autoreferencia
            IF v_prereq_id = NEW.id THEN
                RAISE EXCEPTION 'Un nivel no puede depender de sí mismo.';
            END IF;
            
            -- 2. Verificar existencia
            IF NOT EXISTS (SELECT 1 FROM public.niveles_formacion WHERE id = v_prereq_id) THEN
                RAISE EXCEPTION 'El nivel prerequisito % no existe.', v_prereq_id;
            END IF;
        END LOOP;
        
        -- 3. Evitar duplicados en el array (opcional pero limpio)
        -- (Postgres no tiene 'DISTINCT' nativo para arrays fácil sin unnest, lo omitimos por simplicidad/rendimiento,
        --  pero el de autoreferencia y existencia son los criticos).
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_prerequisitos_nivel ON public.niveles_formacion;
CREATE TRIGGER trg_validar_prerequisitos_nivel
BEFORE INSERT OR UPDATE ON public.niveles_formacion
FOR EACH ROW EXECUTE FUNCTION public.validar_prerequisitos_nivel();


-- 2. CONSTRAINT Y TRIGGER PARA VALIDAR UUIDs EN PRERREQUISITOS DE CURSOS
CREATE OR REPLACE FUNCTION public.validar_prerequisitos_curso()
RETURNS TRIGGER AS $$
DECLARE
    v_prereq_id UUID;
BEGIN
    IF NEW.prerequisitos_curso IS NOT NULL THEN
        FOREACH v_prereq_id IN ARRAY NEW.prerequisitos_curso LOOP
            IF v_prereq_id = NEW.id THEN
                RAISE EXCEPTION 'Un curso no puede depender de sí mismo.';
            END IF;
            IF NOT EXISTS (SELECT 1 FROM public.cursos WHERE id = v_prereq_id) THEN
                RAISE EXCEPTION 'El curso prerequisito % no existe.', v_prereq_id;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_prerequisitos_curso ON public.cursos;
CREATE TRIGGER trg_validar_prerequisitos_curso
BEFORE INSERT OR UPDATE ON public.cursos
FOR EACH ROW EXECUTE FUNCTION public.validar_prerequisitos_curso();


-- 3. MEJORAS DE ÍNDICES PARA ESCALABILIDAD
-- Optimizamos las búsquedas frecuentes del motor de desbloqueo

-- Índice compuesto para búsquedas de estado específicas por alumno (fundamental para los endpoints y RPCs)
CREATE INDEX IF NOT EXISTS idx_progreso_alumno_entidad_tipo_id 
ON public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado);

-- Índice para búsquedas rápidas en la jerarquía (ordenar desbloqueos)
CREATE INDEX IF NOT EXISTS idx_cursos_orden_nivel ON public.cursos (nivel_formacion_id, orden_en_nivel);
CREATE INDEX IF NOT EXISTS idx_modulos_orden_curso ON public.modulos (curso_id, orden);
CREATE INDEX IF NOT EXISTS idx_unidades_orden_modulo ON public.unidades_didacticas (modulo_id, orden);


-- 4. SEGURIDAD: FUNCIÓN PARA VALIDAR ACCESO DE ESCRITURA
-- Esta función debe llamarse desde los endpoints antes de permitir un 'unit-read' o 'evaluation-start'
CREATE OR REPLACE FUNCTION public.puede_acceder_entidad(
    p_alumno_id UUID,
    p_tipo_entidad TEXT,
    p_entidad_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_estado TEXT;
    v_es_primero BOOLEAN := FALSE;
BEGIN
    -- 1. Buscar estado explícito
    SELECT estado INTO v_estado
    FROM public.progreso_alumno
    WHERE alumno_id = p_alumno_id AND tipo_entidad = p_tipo_entidad AND entidad_id = p_entidad_id;
    
    IF v_estado IN ('no_iniciado', 'en_progreso', 'completado') THEN
        RETURN TRUE;
    END IF;
    
    -- 2. Si no hay registro, verificar si es el "Primer elemento" de una estructura superior desbloqueada.
    --    (Aunque la lógica de propagación debería haber insertado 'no_iniciado', esto es un failsafe).
    
    -- Nota: Por diseño estricto, SIEMPRE debería existir el registro 'no_iniciado' si está desbloqueado.
    -- Si no existe, es que está bloqueado.
    -- Excepción: Nivel 1 (si no se ha corrido el script inicial para ese user).
    
    -- Validar Nivel 1 por defecto si no hay requisitos
    IF p_tipo_entidad = 'nivel' THEN
         IF EXISTS (SELECT 1 FROM public.niveles_formacion WHERE id = p_entidad_id AND (prerequisitos IS NULL OR array_length(prerequisitos, 1) = 0)) THEN
             RETURN TRUE;
         END IF;
    END IF;

    RETURN FALSE; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. TRIGGER DE INTEGRIDAD: IMPEDIR BORRADO DE PROGRESO CRÍTICO
-- Si se intenta borrar un progreso 'completado' que es prerrequisito de otro, se debería impedir o warn.
-- Por ahora, impedimos borrar cualquier 'completado' accidentalmente.

CREATE OR REPLACE FUNCTION public.proteger_progreso_completado()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado = 'completado' THEN
        RAISE EXCEPTION 'No se permite eliminar un progreso completado. Use una actualización de estado si es estrictamente necesario (admin).';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proteger_borrado_progreso
BEFORE DELETE ON public.progreso_alumno
FOR EACH ROW EXECUTE FUNCTION public.proteger_progreso_completado();
