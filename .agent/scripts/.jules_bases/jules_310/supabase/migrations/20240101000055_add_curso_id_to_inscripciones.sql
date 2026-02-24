-- Add curso_id to inscripciones table to handle courses without specific editions (like external events or online courses)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscripciones' AND column_name = 'curso_id') THEN
        ALTER TABLE public.inscripciones ADD COLUMN curso_id UUID REFERENCES public.cursos(id);
    END IF;
END $$;

-- Update RLS if needed (already enabled, policies might need review but should be fine as it's just a new column)
