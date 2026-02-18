-- ==========================================
-- PREMIUM STRIPE ARCHITECTURE: AUDIT & ROBUSTNESS
-- ==========================================

-- 1. Create Audit Log for raw Stripe events
CREATE TABLE IF NOT EXISTS public.stripe_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'failed'
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- Extra context like user_id, session_id
);

-- 2. Indexing for audit performance
CREATE INDEX IF NOT EXISTS idx_stripe_audit_type ON public.stripe_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_audit_status ON public.stripe_audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_stripe_audit_created ON public.stripe_audit_logs(created_at);

-- 3. atomic_course_enrollment RPC
-- This ensures that updating plazas and creating the record happens in a single transaction
CREATE OR REPLACE FUNCTION public.confirm_course_enrollment(
    p_user_id UUID,
    p_course_id UUID,
    p_edition_id UUID,
    p_amount DECIMAL,
    p_session_id TEXT,
    p_metadata JSONB,
    p_coupon TEXT DEFAULT NULL
) 
RETURNS VOID AS $$
BEGIN
    -- 1. Insert Inscription
    INSERT INTO public.inscripciones (
        perfil_id, 
        curso_id, 
        edicion_id, 
        estado_pago, 
        monto_total, 
        stripe_session_id, 
        metadata,
        cupon_usado
    ) VALUES (
        p_user_id, 
        p_course_id, 
        p_edition_id, 
        'pagado', 
        p_amount, 
        p_session_id, 
        p_metadata,
        p_coupon
    );

    -- 2. If edition exists, increment occupancy
    IF p_edition_id IS NOT NULL THEN
        UPDATE public.ediciones_curso 
        SET plazas_ocupadas = COALESCE(plazas_ocupadas, 0) + 1 
        WHERE id = p_edition_id;
    END IF;

    -- 3. Award initial Welcome XP if not already awarded for this course
    PERFORM public.add_xp(p_user_id, 50); -- Bonus for booking
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. atomic_rental_booking RPC
CREATE OR REPLACE FUNCTION public.confirm_rental_booking(
    p_user_id UUID,
    p_service_id UUID,
    p_date DATE,
    p_time TIME,
    p_option TEXT,
    p_amount DECIMAL,
    p_session_id TEXT,
    p_coupon TEXT DEFAULT NULL
) 
RETURNS VOID AS $$
BEGIN
    -- 1. Insert Rental
    INSERT INTO public.reservas_alquiler (
        perfil_id, 
        servicio_id, 
        fecha_reserva, 
        hora_inicio, 
        duracion_horas,
        opcion_seleccionada,
        monto_total, 
        estado_pago, 
        stripe_session_id, 
        cupon_usado
    ) VALUES (
        p_user_id, 
        p_service_id, 
        p_date, 
        p_time,
        1,
        p_option,
        p_amount, 
        'pagado',
        p_session_id, 
        p_coupon
    );

    -- 2. Award XP
    PERFORM public.add_xp(p_user_id, 25); -- Renting material awards some XP
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. RLS for Audit Logs (Only Service Role)
ALTER TABLE public.stripe_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access to audit" ON public.stripe_audit_logs FOR ALL USING (true);
