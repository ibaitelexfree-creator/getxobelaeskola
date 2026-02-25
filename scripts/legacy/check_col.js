
const { createClient } = require('@supabase/supabase-js');
async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (data && data[0]) {
        console.log('Profiles Columns:', Object.keys(data[0]).join(', '));
    } else {
        console.log('No data or error:', error);
    }
}
run();
