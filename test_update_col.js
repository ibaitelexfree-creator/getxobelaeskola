const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim().replace(/"/g, '');
    });
    return env;
}

async function run() {
    const env = getEnv();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Try to update the first profile's updated_at
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();
    if (!profile) return console.log('No profiles found');

    console.log('Testing update on profile:', profile.id);
    const { error } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', profile.id);

    if (error) {
        console.error('Update Error:', error);
    } else {
        console.log('Update Successful!');
    }
}

run();
