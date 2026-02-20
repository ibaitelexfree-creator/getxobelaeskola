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

async function checkColumns() {
    console.log('--- Auditing Column Schema for "experiencias" ---');

    // We try to insert a dummy row or just fetch with specific columns to see what exists
    const { data, error } = await supabase
        .from('experiencias')
        .select('*')
        .limit(1);

    if (error) {
        console.log(`❌ Error fetching: ${error.message}`);
    } else {
        console.log('✅ Success. Available columns in "experiencias":');
        if (data.length > 0) {
            console.log(Object.keys(data[0]));
        } else {
            // If no data, we can try to get column names via an RPC if it exists, 
            // but usually we can infer from an insert error
            console.log('Table is empty. Attempting a probe insert...');
            const { error: insertError } = await supabase
                .from('experiencias')
                .insert([{ slug: 'probe-' + Date.now(), nombre_es: 'Probe' }]);

            if (insertError) {
                console.log(`❌ Probe insert failed: ${insertError.message}`);
            } else {
                console.log('✅ Probe insert success.');
                const { data: newData } = await supabase.from('experiencias').select('*').limit(1);
                console.log('Columns found:', Object.keys(newData[0]));
                // Clean up
                await supabase.from('experiencias').delete().eq('nombre_es', 'Probe');
            }
        }
    }
}

checkColumns();
