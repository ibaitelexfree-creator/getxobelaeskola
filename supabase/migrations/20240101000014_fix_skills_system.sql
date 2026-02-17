-- ==========================================
-- FIXES FOR STUDENT SKILLS SYSTEM (Based on Technical Review)
-- ==========================================

-- 1. SECURITY: Remove permissive RLS policy
-- Previously allowed any authenticated user to insert/update/delete.
DROP POLICY IF EXISTS "Backend manage student_skills" ON public.student_skills;

-- 2. INTEGRITY: Add CHECK constraint for source_type
ALTER TABLE public.student_skills
ADD CONSTRAINT check_source_type 
CHECK (source_type IN ('unit', 'module', 'course', 'level'));

-- 3. INTERGRITY/SCALABILITY: Add missing index on skill_id
CREATE INDEX IF NOT EXISTS idx_student_skills_skill ON public.student_skills(skill_id);

-- 4. LOGIC: Fix Trigger Logic and Execution Order

-- Rename trigger to ensure it runs AFTER 'on_progreso_completado_check_deps'
-- (Postgres executes triggers in alphabetical order)
DROP TRIGGER IF EXISTS check_skills_update ON public.progreso_alumno;
CREATE TRIGGER zz_check_skills_update
AFTER UPDATE ON public.progreso_alumno
FOR EACH ROW
EXECUTE FUNCTION public.check_and_unlock_skills();

-- Update function to be explicit about INSERT vs UPDATE
CREATE OR REPLACE FUNCTION public.check_and_unlock_skills()
RETURNS TRIGGER AS $$
DECLARE
    v_rule_type TEXT;
    v_source_type TEXT;
    v_new_skill RECORD;
    v_is_completed BOOLEAN;
BEGIN
    -- Determine if the state is 'completado'
    -- For INSERT: NEW.estado is 'completado'
    -- For UPDATE: NEW.estado is 'completado' AND OLD.estado was NOT 'completado'
    
    v_is_completed := (NEW.estado = 'completado');
    
    IF TG_OP = 'UPDATE' THEN
        v_is_completed := v_is_completed AND (OLD.estado IS DISTINCT FROM 'completado');
    END IF;

    -- Only proceed if status is effectively 'completado' (newly)
    IF v_is_completed THEN
        
        -- Map entity type to rule type AND source type
        CASE NEW.tipo_entidad
            WHEN 'unidad' THEN 
                v_rule_type := 'complete_unit';
                v_source_type := 'unit';
            WHEN 'modulo' THEN 
                v_rule_type := 'complete_module';
                v_source_type := 'module';
            WHEN 'curso' THEN 
                v_rule_type := 'complete_course';
                v_source_type := 'course';
            WHEN 'nivel' THEN 
                v_rule_type := 'complete_level';
                v_source_type := 'level';
            ELSE 
                -- Log warning for unknown types
                RAISE WARNING 'check_and_unlock_skills: Unknown entity type %', NEW.tipo_entidad;
                v_rule_type := NULL;
                v_source_type := NULL;
        END CASE;

        IF v_rule_type IS NOT NULL THEN
            -- Find matching rules and insert unlocked skills
            FOR v_new_skill IN
                SELECT skill_id 
                FROM public.skill_unlock_rules
                WHERE rule_type = v_rule_type 
                  AND source_id = NEW.entidad_id
            LOOP
                INSERT INTO public.student_skills (student_id, skill_id, unlocked_at, source_type, source_id)
                VALUES (NEW.alumno_id, v_new_skill.skill_id, NOW(), v_source_type, NEW.entidad_id)
                ON CONFLICT (student_id, skill_id) DO NOTHING;
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CLEANUP: Deprecate old tables (renaming to avoid accidental usage)
-- Only if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habilidades') THEN
        ALTER TABLE public.habilidades RENAME TO _deprecated_habilidades;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habilidades_alumno') THEN
        ALTER TABLE public.habilidades_alumno RENAME TO _deprecated_habilidades_alumno;
    END IF;
END $$;
