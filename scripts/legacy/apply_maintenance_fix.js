
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";

async function applyMigration() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const sqlPath = "supabase/migrations/20240210_create_maintenance_logs.sql";
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying maintenance logs migration...');
    const statements = sql
        .replace(/--.*$/gm, '') // Remove comments
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 5);

    for (const stmt of statements) {
        console.log(`Executing: ${stmt.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
        if (error) {
            console.warn(`Statement failed: ${error.message}`);
        } else {
            console.log('Success.');
        }
    }
    console.log('Done.');
}

applyMigration();
