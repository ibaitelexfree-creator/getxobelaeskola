
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
