
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
<<<<<<< HEAD
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
=======
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A';
>>>>>>> pr-286
const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpBoats() {
    const { data: boats, error } = await supabase.from('embarcaciones').select('nombre');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(boats.map(b => b.nombre), null, 2));
}

dumpBoats();
