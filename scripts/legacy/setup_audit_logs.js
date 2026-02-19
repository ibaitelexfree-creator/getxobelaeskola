const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    console.log('--- Creating audit_logs table ---');

    // Using simple rpc or sql if available, but usually we don't have sql rpc by default.
    // I'll try to use a common trick: query a table to check if it exists, if not, we can't do much without SQL access.
    // HOWEVER, I can provide the SQL to the user.
    // Actually, I can use the 'postgres' extension IF enabled, or try to run a query that might exist.

    // Wait, the user asked me to give the SQL if needed. I should provide it in the final response.
    // But to make it work NOW, I'll assume they want me to try.

    const query = `
    CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        action_type TEXT NOT NULL,
        target_id TEXT,
        target_type TEXT,
        description TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff can view logs" ON audit_logs;
    CREATE POLICY "Staff can view logs" ON audit_logs FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.rol = 'admin' OR profiles.rol = 'instructor'))
    );

    DROP POLICY IF EXISTS "System/Staff can insert logs" ON audit_logs;
    CREATE POLICY "System/Staff can insert logs" ON audit_logs FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.rol = 'admin' OR profiles.rol = 'instructor'))
    );
    `;

    console.log('SQL to run in Supabase Dashboard:');
    console.log(query);
}

run();
