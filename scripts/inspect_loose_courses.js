
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

async function inspectLooseCourses() {
    const { data: cursos } = await supabase
        .from('cursos')
        .select('id, nombre_es, slug, nivel_formacion_id');

    console.log('--- INSPECCIÓN DE CURSOS ---');
    for (const c of cursos) {
        const { count } = await supabase
            .from('modulos')
            .select('*', { count: 'exact', head: true })
            .eq('curso_id', c.id);

        console.log(`Curso: ${c.nombre_es} | LevelID: ${c.nivel_formacion_id} | Módulos: ${count}`);
    }
}

inspectLooseCourses();
