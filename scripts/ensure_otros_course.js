const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('cursos')
        .upsert({
            id: '00000000-0000-0000-0000-000000000000',
            slug: 'otros',
            nombre_es: 'Otros / Varios',
            nombre_eu: 'Beste batzuk',
            descripcion_es: 'Sesiones y eventos varios no categorizados.',
            descripcion_eu: 'Kategorizatu gabeko hainbat saio eta ekitaldi.',
            precio: 0,
            duracion_h: 1,
            nivel: 'iniciacion',
            imagen_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5997?auto=format&fit=crop&q=80&w=2074'
        }, { onConflict: 'id' });

    if (error) console.error('Error creating Otros course:', error);
    else console.log('Otros course ensured.');
}

run();
