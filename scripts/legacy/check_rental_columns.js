const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Fetching one rental to see columns...');
    const { data, error } = await supabase.from('reservas_alquiler').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Rental object:', JSON.stringify(data[0], null, 2));
    }
}

run();
