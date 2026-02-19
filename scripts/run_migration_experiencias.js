/**
 * Migration Runner for Experiencias
 * Uses Supabase Management API to execute SQL
 */
const fs = require('fs');
const path = require('path');

// Load env
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

// Extract project ref from URL (e.g., https://xxxxx.supabase.co -> xxxxx)
const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];

async function executeSql(sql) {
    // Method 1: Try the Supabase Management API
    const mgmtUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

    try {
        const response = await fetch(mgmtUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_KEY}`,
            },
            body: JSON.stringify({ query: sql }),
        });

        if (response.ok) {
            return { success: true, data: await response.json() };
        }
    } catch (e) {
        // Management API not available, try alternative
    }

    // Method 2: Try direct PostgREST RPC
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    for (const rpcName of ['exec_sql', 'exec', 'run_sql']) {
        const { error } = await supabase.rpc(rpcName, { sql, sql_query: sql, query: sql });
        if (!error) return { success: true };
    }

    return { success: false };
}

async function insertViaClient() {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    console.log('\n📦 Attempting to seed data via Supabase client...\n');

    const experiencias = [
        // Cumpleaños
        {
            slug: 'cumpleanos-navegacion',
            nombre_es: 'Cumpleaños Navegación',
            nombre_eu: 'Urtebetetze Nabigazioa',
            nombre_en: 'Birthday Sailing',
            descripcion_es: 'Celebra tu cumpleaños navegando con amigos. Incluye actividad de navegación guiada para grupos.',
            descripcion_eu: 'Ospatu zure urtebetetzea lagunekin nabigatuz. Talde nabigazioa barne.',
            descripcion_en: 'Celebrate your birthday sailing with friends. Includes guided group sailing activity.',
            tipo: 'cumpleanos', precio: 14.00, precio_tipo: 'por_persona',
            min_participantes: 12, recurrente: true, activo: true, visible: true, orden: 1,
            imagen_url: '/images/experiences/birthday-sailing.webp'
        },
        {
            slug: 'cumpleanos-bigsub',
            nombre_es: 'Cumpleaños BigSub',
            nombre_eu: 'Urtebetetze BigSub',
            nombre_en: 'Birthday BigSub',
            descripcion_es: 'Fiesta de cumpleaños con actividad BigSub para grupos de 12 personas.',
            descripcion_eu: '12 pertsonentzako urtebetetze festa BigSub jarduerarekin.',
            descripcion_en: 'Birthday party with BigSub activity for groups of 12.',
            tipo: 'cumpleanos', precio: 13.00, precio_tipo: 'por_persona',
            min_participantes: 12, recurrente: true, activo: true, visible: true, orden: 2,
            imagen_url: '/images/experiences/birthday-bigsub.webp'
        },
        {
            slug: 'cumpleanos-espacio',
            nombre_es: 'Alquiler Espacio Cumpleaños',
            nombre_eu: 'Urtebetetze Espazioa',
            nombre_en: 'Birthday Space Rental',
            descripcion_es: 'Alquiler de espacio para celebraciones de cumpleaños. Horario: 16:30-20:30.',
            descripcion_eu: 'Urtebetetze ospakizunetarako espazioaren alokairua. Ordutegia: 16:30-20:30.',
            descripcion_en: 'Space rental for birthday celebrations. Schedule: 16:30-20:30.',
            tipo: 'cumpleanos', precio: 150.00, precio_tipo: 'plana',
            duracion_h: 4.0, fianza: 100.00, recurrente: true, activo: true, visible: true, orden: 3,
            horario_texto: '16:30-20:30',
            imagen_url: '/images/experiences/birthday-space.webp'
        },
        // Bonos
        {
            slug: 'bono-vela-ligera',
            nombre_es: 'Bono Vela Ligera',
            nombre_eu: 'Bela Arina Bonoa',
            nombre_en: 'Light Sailing Voucher',
            descripcion_es: 'Bono de 5 salidas de vela ligera. Ideal para practicar a tu ritmo.',
            descripcion_eu: '5 irteeratako bela arina bonoa. Zure erritmoan praktikatzeko aproposa.',
            descripcion_en: 'Light sailing voucher for 5 sessions. Practice at your own pace.',
            tipo: 'bono', precio: 150.00, precio_tipo: 'plana',
            recurrente: true, activo: true, visible: true, orden: 10
        },
        {
            slug: 'bono-windsurf',
            nombre_es: 'Bono Windsurf',
            nombre_eu: 'Windsurf Bonoa',
            nombre_en: 'Windsurf Voucher',
            descripcion_es: 'Bono de 5 salidas de windsurf.',
            descripcion_eu: '5 irteeratako windsurf bonoa.',
            descripcion_en: 'Windsurf voucher for 5 sessions.',
            tipo: 'bono', precio: 130.00, precio_tipo: 'plana',
            recurrente: true, activo: true, visible: true, orden: 11
        },
        {
            slug: 'bono-navegacion',
            nombre_es: 'Bono Navegación',
            nombre_eu: 'Nabigazio Bonoa',
            nombre_en: 'Navigation Voucher',
            descripcion_es: 'Bono de 5 salidas de navegación en embarcación.',
            descripcion_eu: '5 irteeratako nabigazio bonoa ontzian.',
            descripcion_en: 'Navigation voucher for 5 sailing sessions.',
            tipo: 'bono', precio: 150.00, precio_tipo: 'plana',
            recurrente: true, activo: true, visible: true, orden: 12
        },
        // Atraques
        {
            slug: 'atraque-velero',
            nombre_es: 'Atraque Velero',
            nombre_eu: 'Belaontziaren Atraka',
            nombre_en: 'Sailboat Mooring',
            descripcion_es: 'Plaza de atraque mensual para velero. Matrícula: 50€.',
            descripcion_eu: 'Belaontziarentzako hileko atraka plaza. Matrikula: 50€.',
            descripcion_en: 'Monthly mooring spot for sailboat. Registration: €50.',
            tipo: 'atraque', precio_mensual: 50.00, precio_tipo: 'por_mes',
            fianza: 50.00, recurrente: true, activo: true, visible: true, orden: 20
        },
        {
            slug: 'atraque-windsurf',
            nombre_es: 'Atraque Windsurf',
            nombre_eu: 'Windsurf Atraka',
            nombre_en: 'Windsurf Mooring',
            descripcion_es: 'Plaza de atraque mensual para material de windsurf. Matrícula: 50€.',
            descripcion_eu: 'Windsurf materialentzako hileko atraka plaza. Matrikula: 50€.',
            descripcion_en: 'Monthly mooring spot for windsurf equipment. Registration: €50.',
            tipo: 'atraque', precio_mensual: 30.00, precio_tipo: 'por_mes',
            fianza: 50.00, recurrente: true, activo: true, visible: true, orden: 21
        },
        {
            slug: 'atraque-piragua',
            nombre_es: 'Atraque Piragua',
            nombre_eu: 'Piraga Atraka',
            nombre_en: 'Canoe Mooring',
            descripcion_es: 'Plaza de atraque mensual para piragua. Matrícula: 50€.',
            descripcion_eu: 'Piragarentzako hileko atraka plaza. Matrikula: 50€.',
            descripcion_en: 'Monthly mooring spot for canoe. Registration: €50.',
            tipo: 'atraque', precio_mensual: 25.00, precio_tipo: 'por_mes',
            fianza: 50.00, recurrente: true, activo: true, visible: true, orden: 22
        },
    ];

    const { data, error } = await supabase
        .from('experiencias')
        .upsert(experiencias, { onConflict: 'slug' });

    if (error) {
        console.error('❌ Error seeding:', error.message);
        return false;
    }

    console.log(`✅ Seeded ${experiencias.length} experiencias`);
    return true;
}

async function main() {
    console.log('🗄️  Migraciones de Experiencias — Fase 1');
    console.log('='.repeat(60));
    console.log(`📍 Project: ${projectRef}`);
    console.log(`🔗 URL: ${SUPABASE_URL}\n`);

    // Step 1: Try to create the table via SQL
    const schemaSql = fs.readFileSync(
        path.join(__dirname, '..', 'supabase', 'migrations', '20240101000059_experiencias.sql'),
        'utf8'
    );

    console.log('📋 Step 1: Creating experiencias schema...');
    const result = await executeSql(schemaSql);

    if (result.success) {
        console.log('✅ Schema created via API');
    } else {
        console.log('⚠️  Could not execute SQL via API.');
        console.log('📌 Please run the following SQL manually in the Supabase Dashboard SQL Editor:');
        console.log('   → Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
        console.log('   → Paste the contents of: supabase/migrations/20240101000059_experiencias.sql');
        console.log('   → Then re-run this script to seed data.\n');

        // Check if table already exists
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
        const { error } = await supabase.from('experiencias').select('id').limit(1);

        if (error && error.message.includes('does not exist')) {
            console.log('❌ Table does not exist yet. Apply the migration SQL first.\n');
            console.log('='.repeat(60));
            console.log('📄 SQL to execute:');
            console.log('='.repeat(60));
            console.log(schemaSql);
            return;
        } else {
            console.log('✅ Table already exists - proceeding to seed data.');
        }
    }

    // Step 2: Seed data using the Supabase client
    console.log('\n📋 Step 2: Seeding experiencias data...');
    await insertViaClient();

    console.log('\n✅ Fase 1 migration complete!');
}

main().catch(console.error);
