const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    const { data, error } = await supabase.from('reservas_alquiler').select('*').limit(1);
    if (error) {
        console.error(error);
    } else if (data[0]) {
        console.log('Columns:', Object.keys(data[0]).join(', '));
    } else {
        console.log('No data found in reservas_alquiler');
    }
}

run();
