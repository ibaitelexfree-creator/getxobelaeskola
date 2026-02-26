
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
<<<<<<< HEAD
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
=======
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A';
>>>>>>> pr-286
const supabase = createClient(supabaseUrl, supabaseKey);

async function listServices() {
    const { data, error } = await supabase.from('servicios_alquiler').select('nombre_es, slug');
    if (error) {
        console.error(error);
        return;
    }
    data.forEach(s => console.log(`${s.slug}|${s.nombre_es}`));
}

listServices();
