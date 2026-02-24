
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
    const envContent = fs.readFileSync('.env', 'utf8');
    const env = {};
    envContent.split('\n').filter(l => l.includes('=')).forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
    });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- Migraciones en Remote History ---');
    const { data, error } = await supabase
        .schema('supabase_migrations')
        .from('schema_migrations')
        .select('version');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(data.map(m => m.version).sort().join(', '));
}
check();
