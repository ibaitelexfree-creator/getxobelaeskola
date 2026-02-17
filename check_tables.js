
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

    console.log('--- Checking tables presence ---');
    const tables = ['profiles', 'progreso_alumno', 'habilidades_alumno', 'logros_alumno', 'horas_navegacion', 'certificados', 'desafios_diarios', 'intentos_desafios'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('count').limit(0);
        console.log(`${table}: ${error ? 'MISSING (' + error.code + ': ' + error.message + ')' : 'EXISTS'}`);
    }
}

run();
