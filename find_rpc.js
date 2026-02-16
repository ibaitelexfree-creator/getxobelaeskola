
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');
    let content = '';
    if (fs.existsSync(envLocalPath)) content = fs.readFileSync(envLocalPath, 'utf8');
    else if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) process.env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
    });
}
loadEnv();

async function findWorkingRPC() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const rpcs = [
        { name: 'exec_sql', params: { sql: 'SELECT 1' } },
        { name: 'exec_sql', params: { sql_query: 'SELECT 1' } },
        { name: 'exec', params: { sql: 'SELECT 1' } },
        { name: 'run_sql', params: { sql: 'SELECT 1' } }
    ];

    for (const rpc of rpcs) {
        console.log(`Testing RPC: ${rpc.name} with params ${JSON.stringify(rpc.params)}`);
        const { data, error } = await supabase.rpc(rpc.name, rpc.params);
        if (error) {
            console.log(`  ❌ Error: ${error.message}`);
        } else {
            console.log(`  ✅ Success!`);
            return { name: rpc.name, paramKey: Object.keys(rpc.params)[0] };
        }
    }
    return null;
}

findWorkingRPC().then(res => {
    if (res) console.log('Found working RPC:', res);
    else console.log('No working SQL RPC found.');
});
