
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";

async function findTable() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const tables = ['mantenimiento', 'incidencias', 'barcos_mantenimiento', 'logs_mantenimiento'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
            console.log(`Table found: ${table}`);
            return;
        } else if (error.code !== 'PGRST204' && error.code !== 'PGRST205') {
            console.log(`Table ${table} error: ${error.code} - ${error.message}`);
        }
    }
    console.log('No maintenance table found in the predefined list.');
}

findTable();
