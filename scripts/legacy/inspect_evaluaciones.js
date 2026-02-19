
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSchema() {
    console.log('Inspecting "evaluaciones" table...');

    // We can't easily query information_schema via JS client directly unless we have special permissions/RPCs.
    // Instead, let's select one row and check keys, or try to insert a dummy row to see what fields exist (but that's side-effecty).
    // Better yet, let's use the RPC 'exec_sql' if it works (from earlier steps it seemed to fail).
    // If not, we can try to select * limit 1 and print keys.

    const { data, error } = await supabase.from('evaluaciones').select('*').limit(1);

    if (error) {
        console.error('Error selecting from evaluaciones:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Existing columns based on first row:', Object.keys(data[0]));
    } else {
        console.log('Table is empty, cannot infer columns from data. Trying to insert a dummy record to fail and see error? No that is risky.');
        // Let's try to query with an empty selection and hope postgrest returns structure? No.
        // Actually, let's try to select specific columns we suspect might be missing to confirm.

        const possibleColumns = [
            'id', 'titulo_es', 'titulo_eu', 'descripcion_es',
            'tipo', 'entidad_tipo', 'entidad_id',
            'num_preguntas', 'tiempo_limite_min', 'nota_aprobado',
            'cooldown_minutos', 'intentos_ventana_limite'
        ];

        console.log('Checking specific columns existence...');
        for (const col of possibleColumns) {
            const { error: colError } = await supabase.from('evaluaciones').select(col).limit(1);
            if (colError) {
                console.log(`❌ Column '${col}' likely MISSING or error:`, colError.message);
            } else {
                console.log(`✅ Column '${col}' EXISTS`);
            }
        }
    }
}

inspectSchema();
