
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'servicios_alquiler' });
    if (error) {
        // Fallback: try to select one row
        const { data: row, error: rowError } = await supabase.from('servicios_alquiler').select('*').limit(1);
        if (rowError) {
            console.error(rowError);
        } else {
            console.log('Row sample:', row);
        }
    } else {
        console.log('Table info:', data);
    }
}

inspectTable();
