
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env');
    const envLocalPath = path.join(process.cwd(), '.env.local');

    let content = '';
    if (fs.existsSync(envLocalPath)) {
        content = fs.readFileSync(envLocalPath, 'utf8');
    } else if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
        }
    });
}

loadEnv();

async function findUser() {
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const email = 'faridatransports@gmail.com';

    console.log(`Searching for email: ${email}`);

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (profileError) {
        console.error('Error finding profile:', profileError.message);
    } else {
        console.log('Profile found:', JSON.stringify(profile, null, 2));
    }

    if (profile) {
        const { data: ins, error: insError } = await supabase
            .from('inscripciones')
            .select('*, curso:curso_id(nombre_es)')
            .eq('perfil_id', profile.id);

        console.log(`Inscripciones for ${profile.id}:`, JSON.stringify(ins, null, 2));
    }

    console.log('\n--- Checking for unprocessed Stripe sessions for this user ---');
    // Check if there are any processed_webhook_events that might be relevant? 
    // Usually stripe event ids aren't directly linked to user emails in that table.

    // Let's check the logs if there were any errors or anomalies
    // Searching for 'anomaly' in a generic way would be hard, but let's check recent processed_webhook_events
    const { data: webhooks, error: webError } = await supabase
        .from('processed_webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    console.log('Recent Webhook Events:', JSON.stringify(webhooks, null, 2));
}

findUser();
