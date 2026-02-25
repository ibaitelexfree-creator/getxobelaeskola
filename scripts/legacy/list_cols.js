const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
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
