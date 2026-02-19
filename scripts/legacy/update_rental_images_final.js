
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    console.log('Finalizing rental image updates...');

    const updates = [
        { slug: 'alquiler-raquero', imagen_url: '/images/courses/CursodeVelaLigera.png' },
        { slug: 'alquiler-kayak-1', imagen_url: '/images/rental-category-kayak.jpg' },
        { slug: 'alquiler-kayak-2', imagen_url: '/images/rental-category-kayak.jpg' },
        { slug: 'alquiler-piragua-1', imagen_url: '/images/rental-category-kayak.jpg' },
        { slug: 'alquiler-piragua-2', imagen_url: '/images/rental-category-kayak.jpg' },
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
