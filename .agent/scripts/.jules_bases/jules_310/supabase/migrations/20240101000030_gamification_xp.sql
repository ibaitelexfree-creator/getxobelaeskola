-- 1. Add XP columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- 2. Add Function to add XP
CREATE OR REPLACE FUNCTION public.add_xp(p_user_id UUID, p_amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET xp = COALESCE(xp, 0) + p_amount,
        total_xp = COALESCE(total_xp, 0) + p_amount
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger to award XP on unit completion
CREATE OR REPLACE FUNCTION public.award_xp_on_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_xp_amount INT := 0;
BEGIN
    -- Only when status changes to 'completado'
    IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
        
        -- Determine XP based on entity type
        IF NEW.tipo_entidad = 'unidad' THEN
            v_xp_amount := 10;
        ELSIF NEW.tipo_entidad = 'modulo' THEN
            v_xp_amount := 50;
        ELSIF NEW.tipo_entidad = 'curso' THEN
            v_xp_amount := 200;
        ELSIF NEW.tipo_entidad = 'nivel' THEN
            v_xp_amount := 500;
        END IF;

        IF v_xp_amount > 0 THEN
            PERFORM public.add_xp(NEW.alumno_id, v_xp_amount);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_award_xp ON public.progreso_alumno;
CREATE TRIGGER tr_award_xp
AFTER UPDATE ON public.progreso_alumno
FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_completion();

-- 4. Also award XP for achievements
CREATE OR REPLACE FUNCTION public.award_xp_on_achievement()
RETURNS TRIGGER AS $$
DECLARE
    v_points INT;
BEGIN
    SELECT puntos INTO v_points FROM public.logros WHERE id = NEW.logro_id;
    IF v_points > 0 THEN
        PERFORM public.add_xp(NEW.alumno_id, v_points);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_award_xp_achievement ON public.logros_alumno;
CREATE TRIGGER tr_award_xp_achievement
AFTER INSERT ON public.logros_alumno
FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_achievement();
