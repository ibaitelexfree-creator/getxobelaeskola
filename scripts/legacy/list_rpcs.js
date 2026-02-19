const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim().replace(/"/g, '').replace(/'/g, '');
    });
    return env;
}

const env = getEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function listRPCs() {
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: "SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public';"
    });

    if (error) {
        console.log('exec_sql failed, trying metadata query...');
        // Try to query the schema cache indirectly if possible, but usually not via RPC
        console.log('Error:', error.message);
    } else {
        console.log('RPCs:', data);
    }
}

listRPCs();
