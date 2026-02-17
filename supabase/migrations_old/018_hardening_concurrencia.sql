-- ==========================================
-- FASE 17: HARDENING DE CONCURRENCIA Y ATOMICIDAD
-- ==========================================

-- 1. Restricción de Unicidad en Certificados para evitar duplicados por Race Condition
-- Queremos que un alumno solo tenga UN certificado de cada curso/nivel/diploma.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unico_certificado_curso 
ON public.certificados (alumno_id, curso_id) 
WHERE tipo = 'curso';

CREATE UNIQUE INDEX IF NOT EXISTS idx_unico_certificado_nivel 
ON public.certificados (alumno_id, nivel_id) 
WHERE tipo = 'nivel';

CREATE UNIQUE INDEX IF NOT EXISTS idx_unico_certificado_capitan 
ON public.certificados (alumno_id) 
WHERE tipo = 'diploma_capitan';


-- 2. Limpieza de posibles duplicados (Failsafe)
-- Borra certificados duplicados manteniendo solo el más antiguo para un mismo objetivo.
DELETE FROM public.certificados a
USING public.certificados b
WHERE a.id > b.id
  AND a.alumno_id = b.alumno_id
  AND (
    (a.curso_id = b.curso_id AND a.tipo = 'curso') OR
    (a.nivel_id = b.nivel_id AND a.tipo = 'nivel') OR
    (a.tipo = 'diploma_capitan' AND b.tipo = 'diploma_capitan')
  );


-- 3. Refuerzo de Atemicidad en el Trigger de Certificados
-- Asegurar que tr_auto_emision_certificados no falle y provoque rollbacks en cadena
-- pero que maneje los errores de forma limpia o sea robusto.
CREATE OR REPLACE FUNCTION public.trigger_auto_emision_certificados()
RETURNS TRIGGER AS $$
BEGIN
    -- Si una entidad se completa
    IF NEW.estado = 'completado' AND (OLD.estado IS DISTINCT FROM 'completado') THEN
        
        -- Emisión de Curso
        IF NEW.tipo_entidad = 'curso' THEN
            BEGIN
                PERFORM public.emitir_certificado(NEW.alumno_id, 'curso', NEW.entidad_id);
            EXCEPTION WHEN unique_violation THEN
                -- Si ya existe por una carrera de hilos, lo ignoramos silenciosamente
                NULL;
            END;
        
        -- Emisión de Nivel
        ELSIF NEW.tipo_entidad = 'nivel' THEN
            BEGIN
                PERFORM public.emitir_certificado(NEW.alumno_id, 'nivel', NEW.entidad_id);
            EXCEPTION WHEN unique_violation THEN
                NULL;
            END;
            
            -- Si completó el nivel 7, intentar emitir Diploma Capitán
            IF EXISTS (SELECT 1 FROM public.niveles_formacion WHERE id = NEW.entidad_id AND nivel_numero = 7) THEN
                BEGIN
                    PERFORM public.emitir_certificado(NEW.alumno_id, 'diploma_capitan');
                EXCEPTION WHEN unique_violation THEN
                    NULL;
                END;
            END IF;
        END IF;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 4. Seguridad en recalculado: Asegurar que el RPC sea SECURITY DEFINER (Ya lo es, pero reforzamos)
-- Y establecemos el search_path para mayor seguridad en SECURITY DEFINER.
ALTER FUNCTION public.recalcular_progreso_alumno(uuid, text, uuid) SECURITY DEFINER SET search_path = public;


-- 5. Hardening de APIs: Recomendación de usar siempre el RPC
-- Añadimos comentario a la tabla para documentar que el progreso DEBE ser gestionado por el RPC.
COMMENT ON TABLE public.progreso_alumno IS 'El progreso debe actualizarse mediante el RPC recalcular_progreso_alumno para asegurar atomicidad.';
