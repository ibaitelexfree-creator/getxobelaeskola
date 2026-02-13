
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

async function listAllCourses() {
    const { data: cursos, error } = await supabase
        .from('cursos')
        .select('id, nombre_es, slug, nivel_formacion_id');

    if (error) {
        console.error(error);
        return;
    }

    console.log('--- TODOS LOS CURSOS ---');
    cursos.forEach(c => {
        console.log(`- ${c.nombre_es} (ID: ${c.id}, NivelID: ${c.nivel_formacion_id})`);
    });
}

listAllCourses();
