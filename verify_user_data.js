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

    // Mocking a specific user (the one the subagent uses)
    const email = 'ibaitelexfree@gmail.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) return console.log('User not found:', email);

    console.log('User found:', user.id);

    // Mimic the API logic
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    console.log('Profile nombre:', profile?.nombre);
    console.log('Profile apellidos:', profile?.apellidos);
}

run();
