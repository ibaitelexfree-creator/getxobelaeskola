
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
