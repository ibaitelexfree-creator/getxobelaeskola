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

async function checkRpc() {
    console.log('--- Checking for SQL execution RPC ---');

    // Attempt standard names
    const names = ['exec_sql', 'run_sql', 'execute_sql', 'sql'];
    const testSql = 'SELECT 1';

    for (const name of names) {
        try {
            const { data, error } = await supabase.rpc(name, { sql: testSql, query: testSql, sql_query: testSql });
            if (!error) {
                console.log(`✅ Found working RPC: ${name}`);
                process.exit(0);
            } else {
                console.log(`❌ RPC "${name}" failed: ${error.message}`);
            }
        } catch (e) {
            console.log(`❌ RPC "${name}" throw error`);
        }
    }
    console.log('No SQL RPC found.');
}

checkRpc();
