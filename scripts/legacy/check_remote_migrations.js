
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function check() {
    const envContent = fs.readFileSync('.env', 'utf8');
    const env = {};
    envContent.split('\n').filter(l => l.includes('=')).forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
    });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- Migraciones aplicadas en remoto ---');
    // En v2 es .schema().from()
    const { data, error } = await supabase
        .schema('supabase_migrations')
        .from('schema_migrations')
        .select('*');

    if (error) {
        console.error('Error fetching migrations:', error);
        // Intentar backup si la tabla se llama distinto
        return;
    }

    data.sort((a, b) => a.version.localeCompare(b.version)).forEach(m => {
        console.log(`[${m.inserted_at}] ${m.version}`);
    });
}
check();
