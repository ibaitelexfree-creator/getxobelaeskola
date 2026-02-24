
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

async function fixRedundancy() {
    console.log('Inspecting for redundant course layers...');

    const { data: niveles } = await supabase
        .from('niveles_formacion')
        .select('id, nombre_es, slug');

    for (const n of niveles) {
        const { data: cursos } = await supabase
            .from('cursos')
            .select('id, nombre_es, slug')
            .eq('nivel_formacion_id', n.id);

        if (cursos && cursos.length === 1) {
            const curso = cursos[0];
            // If the course name is very similar to level name, or it's clearly a wrapper
            console.log(`Level: ${n.nombre_es} has only one course: ${curso.nombre_es}`);

            // Action: We can't delete the course because modules need it.
            // But we can make the level identifier link directly to the course in the UI.
        }
    }
}

fixRedundancy();
