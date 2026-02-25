
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
