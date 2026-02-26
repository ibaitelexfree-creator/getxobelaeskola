
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
<<<<<<< HEAD
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
=======
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";
>>>>>>> pr-286

async function checkSchema() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('Checking columns of mantenimiento_logs...');
    // We can't use RPC here easily without knowing it exists, so we fetch one row
    const { data, error } = await supabase.from('mantenimiento_logs').select('*').limit(1);

    if (error) {
        console.error('Error fetching logs:', error);
    } else {
        console.log('Columns found:', data && data[0] ? Object.keys(data[0]) : 'No data, columns unknown');
    }
}

checkSchema();
