
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    console.log('Fixing rental images with existing files...');

    const updates = [
        // J80 - Specific image exists
        { slug: 'alquiler-j80', imagen_url: '/images/J80.webp' },

        // Raquero - Specific image exists
        { slug: 'alquiler-raquero', imagen_url: '/images/course-raquero-students.webp' },

        // Light Sailing / Laser / Optimist - Use course images
        { slug: 'alquiler-optimist', imagen_url: '/images/courses/CursodeVelaLigera.webp' },
        { slug: 'alquiler-laser', imagen_url: '/images/courses/PerfeccionamientoVela.webp' },

        // Kayak/Piragua/Paddle/Windsurf - Using generic sailing action shot as requested ("taking them from the ones we have")
        { slug: 'alquiler-kayak-1', imagen_url: '/images/home-hero-sailing-action.webp' },
        { slug: 'alquiler-kayak-2', imagen_url: '/images/home-hero-sailing-action.webp' },
        { slug: 'alquiler-piragua-1', imagen_url: '/images/home-hero-sailing-action.webp' },
        { slug: 'alquiler-piragua-2', imagen_url: '/images/home-hero-sailing-action.webp' },
        { slug: 'alquiler-paddlesurf', imagen_url: '/images/home-hero-sailing-action.webp' },
        { slug: 'alquiler-windsurf', imagen_url: '/images/home-hero-sailing-action.webp' },
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
