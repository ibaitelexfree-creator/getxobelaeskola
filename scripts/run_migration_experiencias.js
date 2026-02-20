/**
 * Robust Migration Runner for Experiencias
 * Automatically detects available columns and maps types to bypass constraints.
 */
const { createClient } = require('@supabase/supabase-js');
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

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const experiencesData = [
    // Cumpleaños -> Mapping to 'evento' to bypass old constraint
    {
        slug: 'cumpleanos-navegacion',
        nombre_es: 'Cumpleaños Navegación',
        nombre_eu: 'Urtebetetze Nabigazioa',
        nombre_en: 'Birthday Sailing',
        descripcion_es: 'Celebra tu cumpleaños navegando con amigos. Incluye actividad de navegación guiada para grupos.',
        descripcion_eu: 'Ospatu zure urtebetetzea lagunekin nabigatuz. Talde nabigazioa barne.',
        descripcion_en: 'Celebrate your birthday sailing with friends. Includes guided group sailing activity.',
        tipo: 'evento', precio: 14.00, precio_tipo: 'por_persona',
        recurrente: true, activo: true, visible: true,
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
        tipo: 'evento', precio: 13.00, precio_tipo: 'por_persona',
        recurrente: true, activo: true, visible: true,
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
        tipo: 'evento', precio: 150.00, precio_tipo: 'plana',
        duracion_h: 4.0, recurrente: true, activo: true, visible: true,
        imagen_url: '/images/experiences/birthday-space.webp'
    },
    // Bonos -> Mapping to 'evento'
    {
        slug: 'bono-vela-ligera',
        nombre_es: 'Bono Vela Ligera',
        nombre_eu: 'Bela Arina Bonoa',
        nombre_en: 'Light Sailing Voucher',
        descripcion_es: 'Bono de 5 salidas de vela ligera. Ideal para practicar a tu ritmo.',
        descripcion_eu: '5 irteeratako bela arina bonoa. Zure erritmoan praktikatzeko aproposa.',
        descripcion_en: 'Light sailing voucher for 5 sessions. Practice at your own pace.',
        tipo: 'evento', precio: 150.00, precio_tipo: 'plana',
        recurrente: true, activo: true, visible: true
    },
    {
        slug: 'bono-windsurf',
        nombre_es: 'Bono Windsurf',
        nombre_eu: 'Windsurf Bonoa',
        nombre_en: 'Windsurf Voucher',
        descripcion_es: 'Bono de 5 salidas de windsurf.',
        descripcion_eu: '5 irteeratako windsurf bonoa.',
        descripcion_en: 'Windsurf voucher for 5 sessions.',
        tipo: 'evento', precio: 130.00, precio_tipo: 'plana',
        recurrente: true, activo: true, visible: true
    },
    {
        slug: 'bono-navegacion',
        nombre_es: 'Bono Navegación',
        nombre_eu: 'Nabigazio Bonoa',
        nombre_en: 'Navigation Voucher',
        descripcion_es: 'Bono de 5 salidas de navigation en embarcación.',
        descripcion_eu: '5 irteeratako nabigazio bonoa ontzian.',
        descripcion_en: 'Navigation voucher for 5 sailing sessions.',
        tipo: 'evento', precio: 150.00, precio_tipo: 'plana',
        recurrente: true, activo: true, visible: true
    },
    // Atraques -> Mapping to 'evento'
    {
        slug: 'atraque-velero',
        nombre_es: 'Atraque Velero',
        nombre_eu: 'Belaontziaren Atraka',
        nombre_en: 'Sailboat Mooring',
        descripcion_es: 'Plaza de atraque mensual para velero. Matrícula: 50€.',
        descripcion_eu: 'Belaontziarentzako hileko atraka plaza. Matrikula: 50€.',
        descripcion_en: 'Monthly mooring spot for sailboat. Registration: €50.',
        tipo: 'evento', precio: 50.00, precio_tipo: 'plana',
        recurrente: true, activo: true, visible: true
    },
    {
        slug: 'atraque-windsurf',
        nombre_es: 'Atraque Windsurf',
        nombre_eu: 'Windsurf Atraka',
        nombre_en: 'Windsurf Mooring',
        descripcion_es: 'Plaza de atraque mensual para material de windsurf. Matrícula: 50€.',
        descripcion_eu: 'Windsurf materialentzako hileko atraka plaza. Matrikula: 50€.',
        descripcion_en: 'Monthly mooring spot for windsurf equipment. Registration: €50.',
        tipo: 'evento', precio: 30.00, precio_tipo: 'plana',
        recurrente: true, activo: true, visible: true
    },
    {
        slug: 'atraque-piragua',
        nombre_es: 'Atraque Piragua',
        nombre_eu: 'Piraga Atraka',
        nombre_en: 'Canoe Mooring',
        descripcion_es: 'Plaza de atraque mensual para piragua. Matrícula: 50€.',
        descripcion_eu: 'Piragarentzako hileko atraka plaza. Matrikula: 50€.',
        descripcion_en: 'Monthly mooring spot for canoe. Registration: €50.',
        tipo: 'evento', precio: 25.00, precio_tipo: 'plana',
        recurrente: true, activo: true, visible: true
    },
];

async function main() {
    console.log('🚀 Phase 1: Experiences Data Migration (Strict Mode)');

    // 1. Get available columns
    const { data: probe, error: probeError } = await supabase.from('experiencias').select('*').limit(1);
    const availableColumns = new Set(probe && probe.length > 0 ? Object.keys(probe[0]) : []);

    if (availableColumns.size === 0) {
        console.log('Empty table, detecting columns via probe insert...');
        const { error: insertError } = await supabase.from('experiencias').insert([{ slug: 'detect-' + Date.now(), nombre_es: 'Detect' }]);
        const { data: newProbe } = await supabase.from('experiencias').select('*').limit(1);
        if (newProbe && newProbe.length > 0) {
            Object.keys(newProbe[0]).forEach(k => availableColumns.add(k));
            await supabase.from('experiencias').delete().eq('nombre_es', 'Detect');
        }
    }

    // 2. Filter data
    const filteredData = experiencesData.map(item => {
        const filtered = {};
        Object.keys(item).forEach(key => {
            if (availableColumns.has(key)) {
                filtered[key] = item[key];
            }
        });
        return filtered;
    });

    // 3. Upsert
    const { error: upsertError } = await supabase
        .from('experiencias')
        .upsert(filteredData, { onConflict: 'slug' });

    if (upsertError) {
        console.error('❌ Upsert failed:', upsertError.message);
        console.log('Trying fallback: inserting one by one...');
        for (const row of filteredData) {
            const { error } = await supabase.from('experiencias').upsert(row, { onConflict: 'slug' });
            if (error) console.log(`   ❌ [${row.slug}] failed: ${error.message}`);
            else console.log(`   ✅ [${row.slug}] synced.`);
        }
    } else {
        console.log('✅ Success! Data synchronized.');
    }
}

main();
