
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data } = await supabase.from('servicios_alquiler').select('nombre_es, imagen_url');
    console.table(data);
}

run();
