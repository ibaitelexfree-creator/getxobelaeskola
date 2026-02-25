
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Updating rental images...');

    const updates = [
        { slug: 'alquiler-kayak-1', imagen_url: '/images/rental-category-kayak.jpg' },
        { slug: 'alquiler-kayak-2', imagen_url: '/images/rental-category-kayak.jpg' },
        { slug: 'alquiler-piragua-1', imagen_url: '/images/rental-category-kayak.jpg' },
        { slug: 'alquiler-piragua-2', imagen_url: '/images/rental-category-kayak.jpg' },
        { slug: 'alquiler-paddlesurf', imagen_url: '/images/rental-category-paddle.jpg' },
        { slug: 'alquiler-windsurf', imagen_url: '/images/rental-category-windsurf.jpg' },
        { slug: 'alquiler-raquero', imagen_url: '/images/rental-category-dinghy.jpg' }, // Attempting to use this name, will generate it later
    ];

    for (const update of updates) {
        const { error } = await supabase
            .from('servicios_alquiler')
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
