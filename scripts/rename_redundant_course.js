
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

async function renameCourse() {
    console.log('Renaming course to match level name...');

    // Level: Iniciación a la Vela
    // Course: Iniciación a la Vela Ligera -> Iniciación a la Vela
    const { error } = await supabase
        .from('cursos')
        .update({
            nombre_es: 'Iniciación a la Vela',
            nombre_eu: 'Belaren Hasiera',
            slug: 'iniciacion-vela' // Matching the level slug more closely
        })
        .eq('slug', 'iniciacion-vela-ligera');

    if (error) console.error(error);
    else console.log('✓ Renamed course "Iniciación a la Vela Ligera" to "Iniciación a la Vela"');

}

renameCourse();
