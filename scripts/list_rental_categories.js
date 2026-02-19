
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const part = line.split('=');
        if (part.length >= 2) env[part[0].trim()] = part.slice(1).join('=').trim();
    });
    return env;
}

const env = getEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data } = await supabase.from('servicios_alquiler').select('categoria').eq('activo', true);
    const cats = [...new Set(data.map(d => d.categoria))];
    console.log(JSON.stringify(cats, null, 2));
}

run();
