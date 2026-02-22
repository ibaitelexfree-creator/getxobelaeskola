
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testApiLogic() {
    const id = 'c5dcfc3e-a981-42bd-87f4-ef69d6130627';
    console.log('Testing query for ID:', id);

    // Test Module query
    const { data: modulo, error: moduloError } = await supabase
        .from('modulos')
        .select(`
            id,
            curso_id,
            nombre_es,
            nombre_eu,
            descripcion_es,
            descripcion_eu,
            objetivos_json,
            orden,
            curso:curso_id (
                id,
                slug,
                nombre_es,
                nombre_eu,
                nivel_formacion:nivel_formacion_id (
                    slug,
                    nombre_es,
                    nombre_eu,
                    orden
                )
            )
        `)
        .eq('id', id)
        .single();

    if (moduloError) {
        console.error('Module fetch error:', moduloError.message);
    } else {
        console.log('Module fetch success!');

        // Test units query
        const { data: unidades, error: unidadesError } = await supabase
            .from('unidades_didacticas')
            .select('id, nombre_es, nombre_eu, duracion_estimada_min, orden, slug, objetivos_es, objetivos_eu')
            .eq('modulo_id', id)
            .order('orden');

        if (unidadesError) {
            console.error('Units fetch error:', unidadesError.message);
        } else {
            console.log('Units fetch success! Units found:', unidades.length);
        }
    }
}

testApiLogic();
