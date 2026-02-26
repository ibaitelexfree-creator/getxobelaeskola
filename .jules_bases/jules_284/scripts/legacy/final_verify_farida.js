
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

async function checkFinal() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const faridaId = '72d8f011-bab5-4f99-b466-d55886d95c47';

    const { data: profile } = await supabase.from('profiles').select('email').eq('id', faridaId).single();
    const { data: ins } = await supabase.from('inscripciones').select('curso:curso_id(nombre_es)').eq('perfil_id', faridaId);
    const { data: ren } = await supabase.from('reservas_alquiler').select('servicio:servicio_id(nombre_es)').eq('perfil_id', faridaId);

    console.log(`Email en BD: ${profile?.email}`);
    console.log(`Cursos inscritos: ${ins.map(i => i.curso?.nombre_es || '???').join(', ')}`);
    console.log(`Alquileres: ${ren.map(r => r.servicio?.nombre_es || '???').join(', ')}`);
}

checkFinal();
