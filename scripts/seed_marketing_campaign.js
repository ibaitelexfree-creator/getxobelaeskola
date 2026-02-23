const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function seedCampaign() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').filter(l => l.includes('=')).forEach(l => {
        const [k, ...v] = l.split('=');
        env[k.trim()] = v.join('=').trim().replace(/^"(.*)"$/, '$1');
    });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const triggerId = 'd66a31a3-0b24-43d0-b7e2-c4c5600ea1da'; // Iniciación a la Vela
    const targetId = 'd8db9369-020c-4ffb-9a91-8dec67aacb0c'; // Perfeccionamiento

    console.log('Checking for existing marketing campaign...');
    const { data: existing } = await supabase
        .from('marketing_campaigns')
        .select('id')
        .eq('nombre', 'Retorno a Perfeccionamiento')
        .single();

    if (existing) {
        console.log('Campaign already exists, skipping seed.');
        return;
    }

    console.log('Seeding default marketing campaign...');
    const { data, error } = await supabase.from('marketing_campaigns').insert({
        nombre: 'Retorno a Perfeccionamiento',
        descripcion: 'Campaña automática para alumnos de Iniciación que no han vuelto en 3 meses.',
        curso_trigger_id: triggerId,
        dias_espera: 90,
        curso_objetivo_id: targetId,
        cupon_codigo: 'PROMO-VELA-15',
        descuento_porcentaje: 15,
        activo: true
    });

    if (error) {
        console.error('Error seeding campaign:', error);
    } else {
        console.log('Default campaign seeded successfully.');
    }
}

seedCampaign();
