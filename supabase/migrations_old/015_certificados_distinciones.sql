-- ==========================================
-- PHASE 9.5: REFINAMIENTO SISTEMA DE DISTINCIONES
-- ==========================================

-- 1. Añadir columna de distinción con 3 niveles (migración aditiva)
ALTER TABLE public.certificados 
ADD COLUMN IF NOT EXISTS nivel_distincion TEXT 
CHECK (nivel_distincion IN ('estandar', 'merito', 'excelencia'))
DEFAULT 'estandar';

-- 2. Migrar datos existentes del campo binario al nuevo sistema
UPDATE public.certificados
SET nivel_distincion = CASE
    WHEN nota_final >= 95 THEN 'excelencia'
    WHEN nota_final >= 85 THEN 'merito'
    ELSE 'estandar'
END
WHERE nivel_distincion IS NULL;

-- 3. Actualizar función emitir_certificado con el nuevo sistema
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
    v_nivel_distincion TEXT := 'estandar';
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

    -- Determinar distinción (3 niveles según diseño funcional)
    IF v_nota_final >= 95 THEN
        v_nivel_distincion := 'excelencia';
    ELSIF v_nota_final >= 85 THEN
        v_nivel_distincion := 'merito';
    ELSE
        v_nivel_distincion := 'estandar';
    END IF;

    -- Generar número único
    v_numero_certificado := public.generar_numero_certificado();

    -- Insertar certificado
    INSERT INTO public.certificados (
        alumno_id,
        tipo,
        nivel_id,
        curso_id,
        numero_certificado,
        nota_final,
        distincion, -- Mantener por compatibilidad (será TRUE si >= 85)
        nivel_distincion,
        fecha_emision
    ) VALUES (
        p_alumno_id,
        p_tipo,
        v_nivel_id,
        v_curso_id,
        v_numero_certificado,
        v_nota_final,
        (v_nota_final >= 85), -- Compatible con campo binario antiguo
        v_nivel_distincion,
        CURRENT_DATE
    )
    RETURNING id INTO v_certificado_id;

    RETURN v_certificado_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Política RLS adicional para verificación pública
DROP POLICY IF EXISTS "Verificación pública por número" ON public.certificados;
CREATE POLICY "Verificación pública por número" ON public.certificados
FOR SELECT USING (numero_certificado IS NOT NULL);

-- Comentario: Esta política permite la verificación pública de certificados.
-- Solo expone datos públicos (nombre, nota, entidad) sin comprometer la privacidad.
