
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

async function checkRecent() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    console.log(`--- INSCRIPCIONES SINCE ${yesterday} ---`);
    const { data: ins, error } = await supabase
        .from('inscripciones')
        .select('*, profiles(email, nombre), curso:curso_id(nombre_es)')
        .gte('created_at', yesterday);

    if (error) console.error(error);
    else console.log(JSON.stringify(ins, null, 2));
}

checkRecent();
