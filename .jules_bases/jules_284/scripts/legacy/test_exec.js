
const { createClient } = require('@supabase/supabase-js');
async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('Testing RPC exec with SELECT 1');
    const { data, error } = await supabase.rpc('exec', { sql: 'SELECT 1 as result' });
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data:', data);
    }
}
run();
