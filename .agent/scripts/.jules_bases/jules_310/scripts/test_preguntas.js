
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(p => p.trim())));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: m4 } = await supabase.from('modulos').select('id').eq('nombre_es', 'Seguridad Avanzada y Reglamento').single();
    if (!m4) return;
    const { data, error } = await supabase.from('preguntas').insert({
        entidad_tipo: 'modulo',
        entidad_id: m4.id,
        tipo_pregunta: 'opcion_multiple',
        enunciado_es: 'Test?',
        enunciado_eu: 'Test?',
        respuesta_correcta: '1'
    });
    console.log({ data, error });
}
run();
