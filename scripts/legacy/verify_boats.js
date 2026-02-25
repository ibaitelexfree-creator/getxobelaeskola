
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkEmbarcaciones() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    console.log('Fetching from embarcaciones...');
    const { data, error } = await supabase.from('embarcaciones').select('*').limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success, found:', data.length, 'records.');
    }
}

checkEmbarcaciones();
