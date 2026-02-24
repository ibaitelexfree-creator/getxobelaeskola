
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpFleet() {
    const { data: boats, error } = await supabase.from('embarcaciones').select('nombre, tipo, capacidad, estado');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(boats, null, 2));

    const { data: services, error: sError } = await supabase.from('servicios_alquiler').select('nombre_es, slug');
    if (sError) {
        console.error(sError);
        return;
    }
    console.log('--- SERVICES ---');
    console.log(JSON.stringify(services, null, 2));
}

dumpFleet();
