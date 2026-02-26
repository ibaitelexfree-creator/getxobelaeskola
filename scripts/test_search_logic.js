
const { createClient } = require('@supabase/supabase-js');

async function testSearch() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
<<<<<<< HEAD
        process.env.SUPABASE_SERVICE_ROLE_KEY
=======
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
>>>>>>> pr-286
    );

    const query = 'Jorge';
    console.log(`Searching for: ${query}`);

    const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('id')
        .or(`nombre.ilike.%${query}%,apellidos.ilike.%${query}%,email.ilike.%${query}%`);

    console.log('Matched profiles:', matchedProfiles?.length || 0);
    const matchedProfileIds = matchedProfiles?.map(p => p.id) || [];

    if (matchedProfileIds.length > 0) {
        const orString = `perfil_id.in.(${matchedProfileIds.join(',')})`;
        console.log('Or string:', orString);

        const { data: rentals, error } = await supabase
            .from('reservas_alquiler')
            .select('*')
            .or(orString)
            .limit(5);

        if (error) {
            console.error('Query Error:', error);
        } else {
            console.log('Found rentals:', rentals.length);
        }
    } else {
        console.log('No profiles matched.');
    }
}

testSearch();
