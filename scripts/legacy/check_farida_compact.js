
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

async function checkDetailed() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const faridaId = '72d8f011-bab5-4f99-b466-d55886d95c47';

    const { data: ins } = await supabase
        .from('inscripciones')
        .select('id, curso_id, stripe_session_id, curso:curso_id(nombre_es)')
        .eq('perfil_id', faridaId);

    console.log('--- INSCRIPCIONES ---');
    ins.forEach(i => console.log(`ID: ${i.id} | CursoID: ${i.curso_id} | Session: ${i.stripe_session_id.substring(0, 20)}... | Name: ${i.curso?.nombre_es || 'NULL'}`));

    const { data: rentals } = await supabase
        .from('reservas_alquiler')
        .select('id, servicio_id, stripe_session_id, servicio:servicio_id(nombre_es)')
        .eq('perfil_id', faridaId);

    console.log('\n--- RENTALS ---');
    rentals.forEach(r => console.log(`ID: ${r.id} | ServiceID: ${r.servicio_id} | Session: ${r.stripe_session_id.substring(0, 20)}... | Name: ${r.servicio?.nombre_es || 'NULL'}`));
}

checkDetailed();
