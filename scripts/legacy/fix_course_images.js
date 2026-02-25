
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Fixing course images...');

    const updates = [
        { slug: 'iniciacion-vela', imagen_url: '/images/courses/CursodeVelaLigera.png' }
    ];

    for (const update of updates) {
        const { error } = await supabase
            .from('cursos')
            .update({ imagen_url: update.imagen_url })
            .eq('slug', update.slug);

        if (error) {
            console.error(`Error updating ${update.slug}:`, error);
        } else {
            console.log(`Updated ${update.slug} to ${update.imagen_url}`);
        }
    }
}

run();
