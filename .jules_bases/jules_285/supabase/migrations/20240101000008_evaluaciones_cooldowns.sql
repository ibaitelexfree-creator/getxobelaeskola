-- ==========================================
-- FASE 5: SISTEMA DE COOLDOWNS Y LÍMITES
-- ==========================================

-- 1. Añadir columnas de configuración a la tabla evaluaciones
ALTER TABLE public.evaluaciones 
ADD COLUMN IF NOT EXISTS cooldown_minutos INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS intentos_ventana_limite INT DEFAULT NULL, -- NULL = ilimitado
ADD COLUMN IF NOT EXISTS intentos_ventana_horas INT DEFAULT NULL; -- NULL = sin ventana

-- 2. Configurar valores por defecto según el tipo de evaluación

-- Quiz de unidad: Cooldown 2 min, sin límite de intentos diarios
UPDATE public.evaluaciones
SET 
    cooldown_minutos = 2,
    intentos_ventana_limite = NULL,
    intentos_ventana_horas = NULL
WHERE tipo = 'quiz_unidad';

-- Examen de módulo: Máximo 3 intentos cada 24h
UPDATE public.evaluaciones
SET 
    cooldown_minutos = 0, -- Podría tener cooldown también, pero el requerimiento solo menciona límite diario
    intentos_ventana_limite = 3,
    intentos_ventana_horas = 24
WHERE tipo = 'examen_modulo';

-- Examen final: Máximo 2 intentos cada 48h
UPDATE public.evaluaciones
SET 
    cooldown_minutos = 0,
    intentos_ventana_limite = 2,
    intentos_ventana_horas = 48
WHERE tipo = 'examen_final';

-- 3. Comentarios
COMMENT ON COLUMN public.evaluaciones.cooldown_minutos IS 'Minutos de espera tras un intento fallido (SUSPENSO)';
COMMENT ON COLUMN public.evaluaciones.intentos_ventana_limite IS 'Número máximo de intentos permitidos en la ventana de tiempo (NULL = ilimitado)';
COMMENT ON COLUMN public.evaluaciones.intentos_ventana_horas IS 'Horas de la ventana de tiempo para el límite de intentos';
