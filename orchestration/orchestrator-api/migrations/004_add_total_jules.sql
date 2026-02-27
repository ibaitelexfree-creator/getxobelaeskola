-- Migración 004: Añadir total_jules a sw2_swarms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM schema_migrations WHERE version = '004'
  ) THEN
    ALTER TABLE sw2_swarms ADD COLUMN IF NOT EXISTS total_jules INT DEFAULT 0;
    
    INSERT INTO schema_migrations (version) VALUES ('004');
    RAISE NOTICE 'Migración 004: Columna total_jules añadida a sw2_swarms.';
  END IF;
END $$;
