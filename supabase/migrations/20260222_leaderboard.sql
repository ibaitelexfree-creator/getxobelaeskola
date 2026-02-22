-- Add public_profile column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT false;

-- Create RPC to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  nombre text,
  apellidos text,
  avatar_url text,
  xp int,
  current_streak int,
  public_profile boolean,
  modules_completed bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.nombre,
    p.apellidos,
    p.avatar_url,
    p.total_xp as xp,
    p.current_streak,
    COALESCE(p.public_profile, false) as public_profile,
    (SELECT COUNT(*) FROM progreso_alumno pa WHERE pa.alumno_id = p.id AND pa.tipo_entidad = 'modulo' AND pa.estado = 'completado') as modules_completed
  FROM profiles p
  ORDER BY p.total_xp DESC
  LIMIT limit_count;
$$;
