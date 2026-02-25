
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase.from('cursos').select('id, nombre_es, slug, imagen_url');
    if (error) {
        console.error(error);
    } else {
        data.forEach(c => console.log(`${c.slug} | ${c.imagen_url}`));
    }
}

run();
