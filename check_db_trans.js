
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

async function checkDbTranslations() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- CURSOS ---');
    const { data: cursos } = await supabase.from('cursos').select('nombre_es, nombre_eu');
    cursos?.forEach(c => {
        if (!c.nombre_eu || c.nombre_eu === c.nombre_es) {
            console.log(`[!] Missing/Same EU name for: ${c.nombre_es}`);
        }
    });

    console.log('\n--- SERVICIOS ALQUILER ---');
    const { data: serv } = await supabase.from('servicios_alquiler').select('nombre_es, nombre_eu');
    serv?.forEach(s => {
        if (!s.nombre_eu || s.nombre_eu === s.nombre_es) {
            console.log(`[!] Missing/Same EU name for: ${s.nombre_es}`);
        }
    });

    console.log('\n--- NIVELES FORMACION ---');
    const { data: niv } = await supabase.from('niveles_formacion').select('nombre_es, nombre_eu');
    niv?.forEach(n => {
        if (!n.nombre_eu || n.nombre_eu === n.nombre_es) {
            console.log(`[!] Missing/Same EU name for: ${n.nombre_es}`);
        }
    });
}

checkDbTranslations();
