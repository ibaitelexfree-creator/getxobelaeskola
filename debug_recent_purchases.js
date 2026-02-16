
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

async function checkRecentPurchases() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- RECENT INSCRIPCIONES ---');
    const { data: recentIns, error: insError } = await supabase
        .from('inscripciones')
        .select('*, profiles(email, full_name), cursos(nombre_es)')
        .order('created_at', { ascending: false })
        .limit(10);

    if (insError) console.error('Error fetching inscripciones:', insError);
    else console.log(JSON.stringify(recentIns, null, 2));

    console.log('\n--- RECENT WEBHOOKS ---');
    const { data: recentWebhooks, error: webError } = await supabase
        .from('processed_webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (webError) console.error('Error fetching webhooks:', webError);
    else console.log(JSON.stringify(recentWebhooks, null, 2));

    console.log('\n--- SEARCHING FOR EMAIL IN PROFILES (ILIKE) ---');
    const { data: fuzzyProfiles, error: pError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .ilike('email', '%farida%');

    if (pError) console.error('Error fetching fuzzy profiles:', pError);
    else console.log('Fuzzy profiles:', JSON.stringify(fuzzyProfiles, null, 2));
}

checkRecentPurchases();
