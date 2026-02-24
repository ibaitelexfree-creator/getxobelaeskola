
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";

async function checkData() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log('Sample of ediciones_curso:');
    const { data: edData } = await supabase.from('ediciones_curso').select('*').limit(1);
    console.log(edData);

    console.log('\nSample of reservas_alquiler:');
    const { data: resData } = await supabase.from('reservas_alquiler').select('*').limit(1);
    console.log(resData);
}

checkData();
