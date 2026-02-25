
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

async function diagnoseTable() {
    console.log('🔍 Diagnosing table: unidades_didacticas');

    // 1. Check if we can select from it (Checking visibility)
    const { data: sample, error: selectError } = await supabase
        .from('unidades_didacticas')
        .select('*')
        .limit(1);

    if (selectError) {
        console.error('❌ Error selecting from table:', selectError);
        if (selectError.code === 'PGRST204') {
            console.error('   -> The API claims the columns do not exist. Matches PGRST204.');
        }
    } else {
        console.log('✅ Select successful. Table is visible.');
        if (sample.length > 0) {
            console.log('   Sample keys:', Object.keys(sample[0]));
        } else {
            console.log('   Table is empty, but accessible.');
        }
    }

    // 2. Introspect schema to see actual column definitions
    // We can't run raw SQL easily via client, but we can verify our payload keys matches what we expect.
    // Let's print the expected keys we were trying to insert.
    const expectedKeys = [
        'modulo_id', 'titulo_es', 'titulo_eu', 'descripcion_es',
        'descripcion_eu', 'contenido_es', 'contenido_eu',
        'duracion_minutos', 'orden' //, 'tipo_contenido' (from new plan? maybe not in DB yet)
    ];
    console.log('📋 Expected columns for INSERT:', expectedKeys);

}

diagnoseTable();
