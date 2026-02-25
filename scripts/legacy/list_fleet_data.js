
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listBoats() {
    const { data: boats, error } = await supabase.from('embarcaciones').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log('Boats:', boats);

    const { data: services, error: sError } = await supabase.from('servicios_alquiler').select('*');
    if (sError) {
        console.error(sError);
        return;
    }
    console.log('Services:', services);
}

listBoats();
