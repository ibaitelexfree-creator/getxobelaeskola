
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";

async function forceCreateTable() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Check if we can at least find the 'exec' or similar RPC effectively
    console.log('Trying to find any working SQL execution RPC...');

    // If we can't find the RPC, we might have to use some other way or inform the user.
    // Let's try to query the list of available functions
    const { data: functions, error: funcError } = await supabase.rpc('get_available_functions', {});
    // Wait, I don't know if get_available_functions exists.

    // Common pattern: Use the REST API to see if the table exists
    const { error } = await supabase.from('mantenimiento_logs').select('id').limit(1);
    console.log('Current status of mantenimiento_logs:', error ? `${error.code}: ${error.message}` : 'Exists');
}

forceCreateTable();
