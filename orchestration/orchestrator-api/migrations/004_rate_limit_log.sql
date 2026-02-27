-- Migración 004: Añadir tabla rate_limit_log para el modulo RateGuard
-- Esta tabla sigue exactamente el esquema requerido por lib/rate-guard.js

CREATE TABLE IF NOT EXISTS rate_limit_log (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'USE', 'BLOCK'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    reset_at TIMESTAMPTZ
);

-- Índices para mejorar rendimiento de auditoría
CREATE INDEX IF NOT EXISTS idx_rate_limit_model ON rate_limit_log(model_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_timestamp ON rate_limit_log(timestamp);

-- Actualizar control de migraciones
INSERT INTO schema_migrations (version) VALUES ('004') ON CONFLICT DO NOTHING;
