-- Migración para robustecer Cursos y Alquileres
-- 028_robust_courses_rentals.sql

-- 1. Añadir índices de búsqueda para Stripe en Inscripciones y Reservas si no existen
CREATE INDEX IF NOT EXISTS idx_inscripciones_stripe_session ON public.inscripciones(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_reservas_stripe_session ON public.reservas_alquiler(stripe_session_id);

-- 2. Asegurar que stripe_session_id sea único para evitar duplicados a nivel de DB (opcional, pero recomendado para robustez)
-- No lo pongo como UNIQUE CONSTRAINT directamente por si hay datos viejos, pero el código lo manejará.

-- 3. Índices para búsqueda de "ya inscrito"
CREATE INDEX IF NOT EXISTS idx_inscripciones_user_curso ON public.inscripciones(perfil_id, curso_id, edicion_id);
CREATE INDEX IF NOT EXISTS idx_reservas_user_slot ON public.reservas_alquiler(perfil_id, servicio_id, fecha_reserva, hora_inicio);
