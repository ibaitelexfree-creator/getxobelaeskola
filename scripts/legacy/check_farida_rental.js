
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

async function checkFaridaRental() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const faridaId = '72d8f011-bab5-4f99-b466-d55886d95c47';

    console.log(`Checking rentals for Farida (${faridaId})...`);
    const { data: rentals, error } = await supabase
        .from('reservas_alquiler')
        .select('*, servicios_alquiler(nombre_es)')
        .eq('perfil_id', faridaId);

    if (error) console.error(error);
    else console.log(JSON.stringify(rentals, null, 2));
}

checkFaridaRental();
