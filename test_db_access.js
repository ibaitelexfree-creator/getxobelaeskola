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

    // Mock a user session if possible, but easier to just check if we can query the tables
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error('Database Error on profiles:', error);
    } else {
        console.log('Profile found:', profile.nombre);
    }
}

run();
