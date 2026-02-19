
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

async function introspect() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- TABLES IN PUBLIC SCHEMA ---');
    const { data: tables, error: tError } = await supabase.rpc('get_tables'); // Checking if this RPC exists from earlier efforts
    if (tError) {
        // fallback: try to select from information_schema if permissions allow (unlikely via service role if RLS is on, but service role usually bypasses RLS).
        // Actually, let's just try to select from common tables and list columns for profiles
        console.log("RPC 'get_tables' failed. Trying direct column query for 'profiles'.");
    }

    const { data: profileCols, error: pColError } = await supabase.from('profiles').select('*').limit(1);
    if (profileCols && profileCols.length > 0) {
        console.log('Profiles columns:', Object.keys(profileCols[0]));
    } else {
        console.log('Profiles table is empty or inaccessible.');
    }

    // Try finding the webhook table
    const { data: webCheck, error: webCheckError } = await supabase.from('webhook_events').select('*').limit(1);
    if (!webCheckError) console.log('Found webhook_events table');
    else console.log('No webhook_events table:', webCheckError.message);

    const { data: webCheck2, error: webCheckError2 } = await supabase.from('processed_webhook_events').select('*').limit(1);
    if (!webCheckError2) console.log('Found processed_webhook_events table');
    else console.log('No processed_webhook_events table:', webCheckError2.message);

}

introspect();
