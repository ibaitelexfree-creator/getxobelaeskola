-- Schema assumption for AI Usage Monitoring
-- Create this table in your Supabase database to track AI metrics.

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    model text NOT NULL,        -- e.g., 'gpt-4', 'claude-3-opus'
    tokens_input int DEFAULT 0,
    tokens_output int DEFAULT 0,
    cost numeric DEFAULT 0,     -- Actual cost in USD/EUR
    saved_cost numeric DEFAULT 0, -- Estimated savings (e.g., from cache hits or cheaper models)
    context text,               -- e.g., 'evaluation', 'chat', 'summary'
    user_id uuid,               -- Optional: Link to user
    metadata jsonb              -- Optional: Additional details
);

-- Index for faster time-range queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage_logs(created_at);
