const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updatePrice() {
    console.log('Starting update...');
    const { data, error } = await supabase
        .from('servicios_alquiler')
        .update({ precio_base: 40 })
        .eq('id', '1a944e63-6089-4a35-a70c-c55212bed813')
        .select();

    if (error) {
        console.error('Error updating price:', error);
        process.exit(1);
    }

    console.log('Update successful:', data[0].nombre_es, data[0].precio_base);
    process.exit(0);
}

updatePrice();
