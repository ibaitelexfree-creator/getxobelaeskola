
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('Testing alternative RPC names...');
    const calls = [
        { name: 'exec_sql', params: { sql: 'SELECT 1' } },
        { name: 'exec', params: { sql: 'SELECT 1' } },
        { name: 'query', params: { sql: 'SELECT 1' } },
        { name: 'execute_sql', params: { sql: 'SELECT 1' } },
        { name: 'run_sql', params: { sql: 'SELECT 1' } }
    ];

    for (const call of calls) {
        process.stdout.write(`Calling ${call.name}... `);
        const { data, error } = await supabase.rpc(call.name, call.params);
        if (error) {
            console.log(`❌ ${error.message}`);
        } else {
            console.log(`✅ SUCCESS! Data:`, data);
            return;
        }
    }
}

run();
