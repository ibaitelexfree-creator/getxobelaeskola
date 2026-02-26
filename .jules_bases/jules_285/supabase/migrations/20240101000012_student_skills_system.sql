-- ==========================================
-- PHASE 6: STUDENT SKILLS SYSTEM
-- ==========================================

-- 1. Table: skills
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT, -- e.g., "maniobras", "seguridad", "navegación"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: student_skills
CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    source_type TEXT, -- 'unit', 'module', 'course'
    source_id UUID,
    UNIQUE(student_id, skill_id)
);

-- 3. Table: skill_unlock_rules
CREATE TABLE IF NOT EXISTS public.skill_unlock_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('complete_unit', 'complete_module', 'complete_course', 'complete_level')),
    source_id UUID NOT NULL, -- The ID of the unit/module/course required
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON public.student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_unlock_rules_source ON public.skill_unlock_rules(rule_type, source_id);

-- RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_unlock_rules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Student read own skills" ON public.student_skills FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Backend manage student_skills" ON public.student_skills FOR ALL USING (true); -- Ideally restrictive but for triggers/functions calling it
CREATE POLICY "Public read rules" ON public.skill_unlock_rules FOR SELECT USING (true);


-- 4. Logic: Automatic Unlocking
CREATE OR REPLACE FUNCTION public.check_and_unlock_skills()
RETURNS TRIGGER AS $$
DECLARE
    v_rule_type TEXT;
    v_source_type TEXT;
    v_new_skill RECORD;
BEGIN
    -- Only proceed if status changed to 'completado'
    IF NEW.estado = 'completado' AND (OLD.estado IS DISTINCT FROM 'completado') THEN
        
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

-- 5. Triggers
-- Trigger for updates
CREATE TRIGGER check_skills_update
AFTER UPDATE ON public.progreso_alumno
FOR EACH ROW
EXECUTE FUNCTION public.check_and_unlock_skills();

-- Trigger for inserts (in case it's inserted as completed directly)
CREATE TRIGGER check_skills_insert
AFTER INSERT ON public.progreso_alumno
FOR EACH ROW
EXECUTE FUNCTION public.check_and_unlock_skills();
