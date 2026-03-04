-- Migración 006: Añadir completed_at a sw2_swarms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM schema_migrations WHERE version = '006'
  ) THEN
    ALTER TABLE sw2_swarms ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

    INSERT INTO schema_migrations (version) VALUES ('006');
    RAISE NOTICE 'Migración 006: Columna completed_at añadida a sw2_swarms.';
  END IF;
END $$;
