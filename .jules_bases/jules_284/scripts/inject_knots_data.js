
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

async function updateKnotsUnit() {
    console.log('Injecting Knots mission...');

    const { data: u4_4 } = await supabase.from('unidades_didacticas').select('id').eq('slug', 'nudos-que-salvan-vidas').single();
    if (u4_4) {
        await supabase.from('unidades_didacticas').update({
            recursos_json: {
                tipo_contenido: 'mision_nudos',
                mision: 'Aprende los 3 nudos críticos para la supervivencia.',
                nudos: [
                    { id: 'as-de-guia', nombre: 'As de Guía', desc: 'El nudo que no se corre.' },
                    { id: 'ballestrinque', nombre: 'Ballestrinque', desc: 'Para amarras rápidas.' },
                    { id: 'ocho', nombre: 'Ocho', desc: 'Nudo de tope esencial.' }
                ]
            }
        }).eq('id', u4_4.id);
        console.log('✅ Unit nudos-que-salvan-vidas updated.');
    }
}

updateKnotsUnit();
