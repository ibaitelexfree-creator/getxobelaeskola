-- 009_fix_evaluacion_race_conditions.sql

-- FIX 1: Evitar dos intentos "en_progreso" simultáneos (Race Condition)
-- Índice único parcial que asegura que un alumno solo tenga 1 intento en progreso por evaluación
CREATE UNIQUE INDEX IF NOT EXISTS idx_unico_intento_en_progreso
ON public.intentos_evaluacion (alumno_id, evaluacion_id)
WHERE estado = 'en_progreso';
