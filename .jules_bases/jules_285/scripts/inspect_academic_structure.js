
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

async function inspectStructure() {
    const { data: niveles, error: nError } = await supabase
        .from('niveles_formacion')
        .select('id, nombre_es, slug');

    if (nError) {
        console.error(nError);
        return;
    }

    console.log('--- ESTRUCTURA ACADÉMICA ACTUAL ---');
    for (const n of niveles) {
        console.log(`\nNivel: ${n.nombre_es} (${n.slug})`);

        const { data: cursos, error: cError } = await supabase
            .from('cursos')
            .select('id, nombre_es, slug')
            .eq('nivel_formacion_id', n.id);

        if (cError) {
            console.error(cError);
            continue;
        }

        if (cursos.length === 0) {
            console.log('  (Sin cursos)');
        } else {
            for (const c of cursos) {
                console.log(`  - Curso: ${c.nombre_es} (${c.slug})`);

                const { data: modulos, error: mError } = await supabase
                    .from('modulos')
                    .select('id, nombre_es')
                    .eq('curso_id', c.id);

                if (mError) {
                    console.error(mError);
                    continue;
                }

                for (const m of modulos) {
                    console.log(`      * Módulo: ${m.nombre_es}`);
                }
            }
        }
    }
}

inspectStructure();
