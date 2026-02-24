
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listBoats() {
    const { data: boats, error } = await supabase.from('embarcaciones').select('id, nombre, tipo, capacidad, matricula, estado');
    if (error) {
        console.error(error);
        return;
    }
    console.log('Boats Summary:');
    boats.forEach(b => console.log(`${b.nombre} (${b.tipo}) - ${b.estado} - ID: ${b.id}`));
}

listBoats();
