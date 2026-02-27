-- Migración 005: Quality Auditor System
-- Patrón: Migración Idempotente (como 003)

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(20) PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM schema_migrations WHERE version = '005'
  ) THEN

    -- TABLA: sw2_audit_results
    -- Almacena cada auditoría del Agent 6
    CREATE TABLE IF NOT EXISTS sw2_audit_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      swarm_id UUID REFERENCES sw2_swarms(id) ON DELETE SET NULL,
      task_id UUID REFERENCES sw2_tasks(id) ON DELETE SET NULL,
      original_prompt TEXT NOT NULL,
      synthesized_output TEXT NOT NULL,
      audit_score SMALLINT NOT NULL CHECK (audit_score BETWEEN 1 AND 10),
      security_check VARCHAR(10) NOT NULL CHECK (security_check IN ('PASS', 'FAIL')),
      missed_requirements JSONB DEFAULT '[]',
      qdrant_conflict BOOLEAN DEFAULT FALSE,
      qdrant_similar_failures JSONB DEFAULT '[]',
      confidence_delta NUMERIC(4,2) DEFAULT 0.0,
      recommendation VARCHAR(20) NOT NULL CHECK (recommendation IN ('MERGE', 'RETRY', 'HUMAN_REVIEW')),
      auditor_model VARCHAR(100) DEFAULT 'google/gemini-2.0-flash-001',
      auditor_temperature NUMERIC(3,2) DEFAULT 0.0,
      latency_ms INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- TABLA: sw2_agent_feedback
    -- Registra el feedback humano 👍👎 con blame por agente
    CREATE TABLE IF NOT EXISTS sw2_agent_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      audit_id UUID REFERENCES sw2_audit_results(id) ON DELETE CASCADE,
      swarm_id UUID REFERENCES sw2_swarms(id) ON DELETE SET NULL,
      feedback_type VARCHAR(10) NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
      blamed_agent VARCHAR(50),
      blamed_agent_number SMALLINT CHECK (blamed_agent_number BETWEEN 1 AND 5),
      blame_reason TEXT,
      rca_result JSONB,
      qdrant_point_id VARCHAR(100),
      user_comment TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_sw2_audit_score ON sw2_audit_results(audit_score);
    CREATE INDEX IF NOT EXISTS idx_sw2_audit_recommendation ON sw2_audit_results(recommendation);
    CREATE INDEX IF NOT EXISTS idx_sw2_audit_created ON sw2_audit_results(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sw2_feedback_type ON sw2_agent_feedback(feedback_type);
    CREATE INDEX IF NOT EXISTS idx_sw2_feedback_blamed ON sw2_agent_feedback(blamed_agent_number);

    INSERT INTO schema_migrations (version) VALUES ('005');
    RAISE NOTICE 'Migración 005: Quality Auditor System aplicada.';
  ELSE
    RAISE NOTICE 'Migración 005: Ya aplicada. Saltando...';
  END IF;
END $$;
