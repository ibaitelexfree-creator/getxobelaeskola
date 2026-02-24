
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
        .select('id, nombre_es, slug')
        .order('orden', { ascending: true });

    if (nError) {
        console.error(nError);
        return;
    }

    let output = '--- ESTRUCTURA ACADÉMICA COMPLETA ---\n';
    for (const n of niveles) {
        output += `\nNivel: ${n.nombre_es} (Slug: ${n.slug})\n`;

        const { data: cursos, error: cError } = await supabase
            .from('cursos')
            .select('id, nombre_es, slug')
            .eq('nivel_formacion_id', n.id);

        if (cError) {
            console.error(cError);
            continue;
        }

        if (cursos.length === 0) {
            output += '  (Sin cursos)\n';
        } else {
            for (const c of cursos) {
                output += `  - Curso: ${c.nombre_es} (Slug: ${c.slug})\n`;

                const { data: modulos, error: mError } = await supabase
                    .from('modulos')
                    .select('id, nombre_es')
                    .eq('curso_id', c.id)
                    .order('orden', { ascending: true });

                if (mError) {
                    console.error(mError);
                    continue;
                }

                for (const m of modulos) {
                    output += `      * Módulo: ${m.nombre_es}\n`;
                }
            }
        }
    }
    fs.writeFileSync('academic_structure.txt', output);
    console.log('Structure saved to academic_structure.txt');
}

inspectStructure();
