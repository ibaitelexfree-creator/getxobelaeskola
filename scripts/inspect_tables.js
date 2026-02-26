
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSchema() {
    console.log('--- Inspecting Tables ---');

    // Check modulos columns
    const { data: modCols, error: modErr } = await supabase.rpc('get_table_columns', { table_name: 'modulos' });
    if (modErr) {
        // Fallback: try a generic query to see columns if RPC doesn't exist
        console.log('RPC get_table_columns failed, trying alternate method...');
        const { data: sample, error: sampleErr } = await supabase.from('modulos').select('*').limit(1);
        if (sampleErr) console.error('Error fetching sample from modulos:', sampleErr.message);
        else console.log('Columns in modulos:', Object.keys(sample[0] || {}));
    } else {
        console.log('Columns in modulos:', modCols);
    }

    const { data: uniSample, error: uniErr } = await supabase.from('unidades_didacticas').select('*').limit(1);
    if (uniErr) console.error('Error fetching sample from unidades_didacticas:', uniErr.message);
    else console.log('Columns in unidades_didacticas:', Object.keys(uniSample[0] || {}));
}

inspectSchema();
