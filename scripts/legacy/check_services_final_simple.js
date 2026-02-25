
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data } = await supabase.from('servicios_alquiler').select('slug, imagen_url');
    if (data) {
        data.forEach(d => console.log(`${d.slug}: ${d.imagen_url}`));
    }
}
run();
