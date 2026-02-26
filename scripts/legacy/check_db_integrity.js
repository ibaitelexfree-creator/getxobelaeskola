const { createClient } = require('@supabase/supabase-js');

async function checkDatabase() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
<<<<<<< HEAD
        process.env.SUPABASE_SERVICE_ROLE_KEY
=======
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
>>>>>>> pr-286
    );

    console.log('--- Checking reservas_alquiler data ---');
    const { data: rentals, error: rError } = await supabase
        .from('reservas_alquiler')
        .select('*')
        .limit(5);

    if (rError) console.error('Error fetching rentals:', rError);
    else console.log('Sample rentals:', JSON.stringify(rentals, null, 2));

    console.log('\n--- Checking profiles data ---');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (pError) console.error('Error fetching profiles:', pError);
    else console.log('Sample profile:', JSON.stringify(profiles, null, 2));

    console.log('\n--- Checking servicios_alquiler data ---');
    const { data: services, error: sError } = await supabase
        .from('servicios_alquiler')
        .select('*')
        .limit(1);

    if (sError) console.error('Error fetching services:', sError);
    else console.log('Sample service:', JSON.stringify(services, null, 2));
}

checkDatabase();
