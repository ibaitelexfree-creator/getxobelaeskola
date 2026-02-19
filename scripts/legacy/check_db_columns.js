const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('inscripciones').select('*').limit(1);
    if (error) {
        console.error('Error fetching inscripciones:', error);
    } else {
        console.log('Inscripciones columns:', Object.keys(data[0] || {}));
    }

    const { data: data2, error: error2 } = await supabase.from('reservas_alquiler').select('*').limit(1);
    if (error2) {
        console.error('Error fetching reservas_alquiler:', error2);
    } else {
        console.log('Reservas columns:', Object.keys(data2[0] || {}));
    }
}

check();
