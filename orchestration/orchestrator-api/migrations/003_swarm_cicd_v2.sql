-- Migración 003: SWARM CI/CD 2.0 - Infraestructura Base (v2 prefix)
-- Patrón: Migración Idempotente

-- 1. Asegurar tabla de control de versiones
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(20) PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ejecución Controlada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM schema_migrations WHERE version = '003'
  ) THEN
    
    -- TABLA: sw2_swarms (Agrupador de procesos v2)
    CREATE TABLE IF NOT EXISTS sw2_swarms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      repo_url VARCHAR(255),
      branch VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}',
      final_diff TEXT,
      voting_results JSONB DEFAULT '{}'
    );

    -- TABLA: sw2_tasks (Tareas v2)
    CREATE TABLE IF NOT EXISTS sw2_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      swarm_id UUID REFERENCES sw2_swarms(id) ON DELETE CASCADE,
      agent_role VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      request_payload JSONB,
      response_payload JSONB,
      error_log TEXT,
      checkpoint_data JSONB,
      retry_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );

    -- TABLA: sw2_history (Logs v2)
    CREATE TABLE IF NOT EXISTS sw2_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      swarm_id UUID REFERENCES sw2_swarms(id) ON DELETE CASCADE,
      task_id UUID REFERENCES sw2_tasks(id),
      event_type VARCHAR(100),
      message TEXT,
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- TABLA: sw2_rate_limits (Control v2)
    CREATE TABLE IF NOT EXISTS sw2_rate_limits (
      id SERIAL PRIMARY KEY,
      model_name VARCHAR(100) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      status_code INT,
      retry_after_ms INT,
      is_blocked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_sw2_swarm_status ON sw2_swarms(status);
    CREATE INDEX IF NOT EXISTS idx_sw2_tasks_swarm ON sw2_tasks(swarm_id);

    -- Marcar como aplicada
    INSERT INTO schema_migrations (version) VALUES ('003');
    
    RAISE NOTICE 'Migración 003: Swarm CI/CD 2.0 aplicada con prefijo sw2_.';
  ELSE
    RAISE NOTICE 'Migración 003: Ya aplicada o versión coincidente. Saltando...';
  END IF;
END $$;
