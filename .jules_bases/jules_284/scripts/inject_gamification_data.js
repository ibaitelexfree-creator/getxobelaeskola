
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function updateUnitsWithGamification() {
    console.log('Injecting gamification data into recursos_json...');

    // 1. Module 1: Inventory
    const { data: u1 } = await supabase.from('unidades_didacticas').select('id').eq('slug', 'partes-del-barco').single();
    if (u1) {
        await supabase.from('unidades_didacticas').update({
            recursos_json: {
                tipo_contenido: 'inventario',
                mision: 'Identifica las partes del barco para equipar tu inventario.',
                items: ['Proa', 'Popa', 'Babor', 'Estribor', 'Mástil', 'Botavara', 'Timón']
            }
        }).eq('id', u1.id);
        console.log('✅ Unit partes-del-barco updated.');
    }

    // 2. Module 4: RIPPA Scenario
    const { data: u4_1 } = await supabase.from('unidades_didacticas').select('id').eq('slug', 'protocolo-choque-rippa').single();
    if (u4_1) {
        await supabase.from('unidades_didacticas').update({
            recursos_json: {
                tipo_contenido: 'mision_tactica',
                mision: 'Crash Course: Quién tiene preferencia?',
                escenarios: [
                    {
                        pregunta: 'Barco A (Estribor) vs Barco B (Babor). Quién cede?',
                        opciones: ['Barco A', 'Barco B'],
                        correcta: 1,
                        explicacion: 'El que ve rojo (Babor) cede.'
                    }
                ]
            }
        }).eq('id', u4_1.id);
        console.log('✅ Unit protocolo-choque-rippa updated.');
    }
}

updateUnitsWithGamification();
