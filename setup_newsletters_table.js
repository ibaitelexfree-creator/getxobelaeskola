const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    console.log('Creating newsletters table...');

    const sql = `
        CREATE TABLE IF NOT EXISTS public.newsletters (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            scheduled_for TIMESTAMPTZ,
            sent_at TIMESTAMPTZ,
            status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sent'
            created_at TIMESTAMPTZ DEFAULT now(),
            created_by UUID REFERENCES auth.users(id),
            type TEXT DEFAULT 'newsletter'
        );

        -- Add RLS
        ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

        -- Admin/Staff can do everything
        CREATE POLICY "Admins can manage newsletters" 
        ON public.newsletters 
        FOR ALL 
        USING (true);
    `;

    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
        console.error('Error creating table:', error);
    } else {
        console.log('Newsletters table created successfully.');
    }
}

run();
