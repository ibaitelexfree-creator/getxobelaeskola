const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Leer .env manualmente
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const migration = `
        ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
        ALTER TABLE public.servicios_alquiler ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
    `;
    console.log('⏳ Aplicando migración...');
    const { error } = await supabase.rpc('exec_sql', { sql: migration });
    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log('✅ Columnas añadidas.');

        console.log('⏳ Mapeando productos de Stripe...');

        const courses = [
            { slug: 'iniciacion-j80', id: 'prod_TyXmDGJSGYtOq4' },
            { slug: 'perfeccionamiento', id: 'prod_TyXlTf08jPFwVT' },
            { slug: 'licencia-navegacion', id: 'prod_TyXjaKMjPoGegp' },
            { slug: 'vela-ligera', id: 'prod_TyXgLNS5hFjfQw' }
        ];

        for (const c of courses) {
            await supabase.from('cursos').update({ stripe_product_id: c.id }).eq('slug', c.slug);
        }

        const rentals = [
            { nombre: 'Raquero', id: 'prod_TyYDfaEgxLB4Be' },
            { nombre: 'Velero J80', id: 'prod_TyYCAC78QfFKH7' },
            { nombre: 'Laser', id: 'prod_TyYAvgHy2h0Xx3' },
            { nombre: 'Optimist', id: 'prod_TyY9gZ6jPpXEXK' },
            { nombre: 'Windsurf', id: 'prod_TyY7qrpGE5qICW' },
            { nombre: 'Piragua (2 Personas)', id: 'prod_TyY4aQfPjM4me0' },
            { nombre: 'Piragua (1 Persona)', id: 'prod_TyXzszdLv6Dmex' },
            { nombre: 'Paddle Surf', id: 'prod_TyXx2eo4hlBlPI' },
            { nombre: 'Kayak (2 Personas)', id: 'prod_TyXvxsizYikBjn' },
            { nombre: 'Kayak (1 Persona)', id: 'prod_TyXs9y6Y4Ljwun' }
        ];

        for (const r of rentals) {
            await supabase.from('servicios_alquiler').update({ stripe_product_id: r.id }).ilike('nombre_es', r.nombre);
        }

        console.log('✅ Mapeo completado.');
    }
}

run();
