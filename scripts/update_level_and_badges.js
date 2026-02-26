
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateLevel1() {
    console.log('Updating Level 1 description...');
    const { data, error } = await supabase
        .from('niveles_formacion')
        .update({
            descripcion_es: "¡Zarpa en tu primera aventura! Domina el arte de navegar con el viento, descubre los secretos del mar y consigue tu insignia de 'Grumete de Iniciación' al completar este nivel.",
            descripcion_eu: "Belaren munduan murgildu zaitez! Haizearekin nabigatzeko artea menderatu, itsasoko sekretuak aurkitu eta lortu zure 'Hasiberriaren Intsignia' maila hau osatzean."
        })
        .eq('slug', 'iniciacion');

    if (error) {
        console.error('Error updating level 1:', error);
    } else {
        console.log('Level 1 updated successfully!');
    }
}

async function addSpecificBadge() {
    console.log('Checking for Level 1 Badge...');
    const { data: existingLogro } = await supabase
        .from('logros')
        .select('id')
        .eq('slug', 'logro-iniciacion')
        .maybeSingle();

    if (!existingLogro) {
        const { error } = await supabase
            .from('logros')
            .insert({
                slug: 'logro-iniciacion',
                nombre_es: 'Grumete de Iniciación',
                nombre_eu: 'Hasiberriaren Intsignia',
                descripcion_es: 'Has completado con éxito el Nivel 1 de formación náutica',
                descripcion_eu: 'Prestakuntza nautiako 1. maila ongi osatu duzu',
                icono: '🎖️',
                categoria: 'progreso',
                puntos: 150,
                rareza: 'comun',
                condicion_json: { tipo: 'nivel_especifico_slug', slug: 'iniciacion' }
            });

        if (error) console.error('Error adding badge:', error);
        else console.log('Level 1 Badge added successfully!');
    } else {
        console.log('Level 1 Badge already exists.');
    }
}

async function run() {
    await updateLevel1();
    await addSpecificBadge();
}

run();
