require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    try {
        const { data, error } = await supabase.from('experiencias').select('*').limit(1);
        if (error) throw error;
        if (data && data.length > 0) {
            console.log('COLUMNS_START');
            console.log(Object.keys(data[0]).join(', '));
            console.log('COLUMNS_END');
        } else {
            console.log('No data in experiencias table.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkColumns();
