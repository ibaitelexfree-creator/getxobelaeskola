
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listServices() {
    const { data, error } = await supabase.from('servicios_alquiler').select('nombre_es, slug');
    if (error) {
        console.error(error);
        return;
    }
    data.forEach(s => console.log(`${s.slug}|${s.nombre_es}`));
}

listServices();
