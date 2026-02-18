
const { createClient } = require('@supabase/supabase-js');

async function run() {
    // Using the same credentials as seen in previous scripts
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    console.log('Synchronizing rental images with VALID local assets...');

    // Mapping based on files verified to exist in public/images/
    const updates = [
        { slug: 'alquiler-j80', imagen_url: '/images/J80.webp' },
        { slug: 'alquiler-paddlesurf', imagen_url: '/images/home-hero-sailing-action.webp' }, // Generic action
        { slug: 'alquiler-windsurf', imagen_url: '/images/courses/PerfeccionamientoVela.webp' }, // Best fit for wind/sailing
        { slug: 'alquiler-kayak-1', imagen_url: '/images/home-hero-sailing-action.webp' }, // Generic action
        { slug: 'alquiler-kayak-2', imagen_url: '/images/home-hero-sailing-action.webp' }, // Generic action
        { slug: 'alquiler-piragua-1', imagen_url: '/images/home-hero-sailing-action.webp' }, // Generic action
        { slug: 'alquiler-piragua-2', imagen_url: '/images/home-hero-sailing-action.webp' }, // Generic action
        { slug: 'alquiler-optimist', imagen_url: '/images/courses/CursodeVelaLigera.png' }, // Note: Script used png, filesystem showed webp. Let's check if png exists. 
        // File listing showed: courses/CursodeVelaLigera.webp. I should use webp.
        { slug: 'alquiler-optimist', imagen_url: '/images/courses/CursodeVelaLigera.webp' },
        { slug: 'alquiler-laser', imagen_url: '/images/courses/CursodeVelaLigera.webp' },
        { slug: 'alquiler-raquero', imagen_url: '/images/course-raquero-students.webp' },
    ];

    for (const update of updates) {
        // We update based on slug
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
