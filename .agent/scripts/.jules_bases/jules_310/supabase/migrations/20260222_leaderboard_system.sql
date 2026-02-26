-- Add leaderboard visibility settings to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS leaderboard_visibility text NOT NULL DEFAULT 'private' CHECK (leaderboard_visibility IN ('public', 'anonymous', 'private'));

-- Add modules completed counter for faster leaderboard queries
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS modules_completed integer DEFAULT 0;

-- Function to update modules_completed count
CREATE OR REPLACE FUNCTION public.update_modules_completed()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the count for the affected user
    UPDATE public.profiles
    SET modules_completed = (
        SELECT COUNT(*)
        FROM public.progreso_alumno
        WHERE alumno_id = COALESCE(NEW.alumno_id, OLD.alumno_id)
        AND tipo_entidad = 'modulo'
        AND estado = 'completado'
    )
    WHERE id = COALESCE(NEW.alumno_id, OLD.alumno_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to keep modules_completed updated
DROP TRIGGER IF EXISTS trigger_update_modules_completed ON public.progreso_alumno;
CREATE TRIGGER trigger_update_modules_completed
AFTER INSERT OR UPDATE OF estado, tipo_entidad OR DELETE ON public.progreso_alumno
FOR EACH ROW
WHEN (COALESCE(NEW.tipo_entidad, OLD.tipo_entidad) = 'modulo')
EXECUTE FUNCTION public.update_modules_completed();

-- Backfill existing data
UPDATE public.profiles p
SET modules_completed = (
    SELECT COUNT(*)
    FROM public.progreso_alumno pa
    WHERE pa.alumno_id = p.id
    AND pa.tipo_entidad = 'modulo'
    AND pa.estado = 'completado'
);
