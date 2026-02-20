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

const sheetCourses = [
    'Campus verano',
    'Iniciación Adultos',
    'Tecnificación Adultos',
    'Konpondu Adultos',
    'Curso iniciación Windsurf',
    'Campus Windsurf',
    'Windsurf 3 sesiones',
    'Windsurf 1 sesión'
];

const sheetRentals = [
    'J-80',
    'Omega',
    'Raquero',
    '420',
    'Laser',
    'Windsurf',
    'Bigsub',
    'Tarpon'
];

async function compare() {
    console.log('--- Comparison: Spreadsheet vs Database ---');

    // Check Courses
    const { data: dbCourses } = await supabase.from('cursos').select('nombre_es');
    const dbCourseNames = (dbCourses || []).map(c => c.nombre_es.toLowerCase());

    console.log('\n📚 Courses Verification:');
    sheetCourses.forEach(sc => {
        const found = dbCourseNames.some(dbc => dbc.includes(sc.toLowerCase()));
        if (found) {
            console.log(`   ✅ [Sheet] ${sc} -> Found in DB`);
        } else {
            console.log(`   ❌ [Sheet] ${sc} -> MISSING in DB`);
        }
    });

    // Check Rentals
    const { data: dbRentals } = await supabase.from('servicios_alquiler').select('nombre_es');
    const dbRentalNames = (dbRentals || []).map(r => r.nombre_es.toLowerCase());

    console.log('\n⛵ Rentals Verification:');
    sheetRentals.forEach(sr => {
        const found = dbRentalNames.some(dbr => dbr.includes(sr.toLowerCase()));
        if (found) {
            console.log(`   ✅ [Sheet] ${sr} -> Found in DB`);
        } else {
            console.log(`   ❌ [Sheet] ${sr} -> MISSING in DB`);
        }
    });
}

compare();
