
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSchema() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('Checking columns of ediciones_curso...');
    const { data: edData, error: edError } = await supabase.from('ediciones_curso').select('*').limit(1);
    console.log('ediciones_curso columns:', edData && edData[0] ? Object.keys(edData[0]) : 'None found');

    console.log('\nChecking columns of reservas_alquiler...');
    const { data: resData, error: resError } = await supabase.from('reservas_alquiler').select('*').limit(1);
    console.log('reservas_alquiler columns:', resData && resData[0] ? Object.keys(resData[0]) : 'None found');
}

checkSchema();
