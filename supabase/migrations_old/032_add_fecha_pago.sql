
-- Migration to add fecha_pago to reservas_alquiler
ALTER TABLE reservas_alquiler ADD COLUMN IF NOT EXISTS fecha_pago timestamptz;

-- Transfer existing created_at or fecha_reserva values to fecha_pago for existing records
UPDATE reservas_alquiler SET fecha_pago = created_at WHERE fecha_pago IS NULL;
