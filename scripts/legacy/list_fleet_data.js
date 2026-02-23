
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A';
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
