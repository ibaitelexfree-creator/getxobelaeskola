const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    console.log('--- Fixing Evaluations Structure ---');
    const sql = `
        ALTER TABLE public.evaluaciones
        ADD COLUMN IF NOT EXISTS cooldown_minutos INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS intentos_ventana_limite INT,
        ADD COLUMN IF NOT EXISTS intentos_ventana_horas INT;
    `;

    // We try many RPC names
    const names = ['exec_sql', 'run_sql', 'exec', 'query'];
    for (const name of names) {
        console.log(`Trying RPC: ${name}...`);
        const { error } = await supabase.rpc(name, { sql: sql, sql_query: sql });
        if (!error) {
            console.log(`✅ Success with ${name}!`);
            return;
        }
        console.log(`   ❌ Failed: ${error.message}`);
    }
}

fix();
