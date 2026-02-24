
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanUpCursos() {
    console.log('Cleaning up courses and assigning them to levels...');

    // Perfeccionamiento -> Level 2
    await supabase
        .from('cursos')
        .update({
            nivel_formacion_id: '78800f3a-220b-4d1a-846a-4effed8c4f87',
            nombre_es: 'Perfeccionamiento',
            nombre_eu: 'Hobekuntza'
        })
        .eq('slug', 'perfeccionamiento-vela');

    // Vela Ligera -> Level 3
    await supabase
        .from('cursos')
        .update({
            nivel_formacion_id: 'cbf54ea9-0bf6-4cb8-8cb7-8e383b439b69',
            nombre_es: 'Vela Ligera',
            nombre_eu: 'Bela Arina'
        })
        .eq('slug', 'curso-vela-ligera');

    console.log('✓ Clean up complete.');
}

cleanUpCursos();
