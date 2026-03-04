-- Create leads table for CRM functionality (Neon PG Version)
CREATE TABLE IF NOT EXISTS public.leads (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE SET NULL,
    service_type TEXT, -- Private Viewing, Investment Brief, etc.
    status TEXT DEFAULT 'new', -- new, contacted, closed, lost
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: No RLS policies here as the app handles auth logic for now.
