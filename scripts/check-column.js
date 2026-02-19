
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('Adding notion_threshold column to embarcaciones...');

    // We can't run ALTER TABLE via the client directly unless we use an RPC or it's a superuser.
    // However, we can try to use the REST API to see if it's possible or just Inform the user.

    // Actually, I'll just try to update a dummy row to see if it exists.
    const { error } = await supabase.from('embarcaciones').select('notion_threshold').limit(1);

    if (error && error.code === '42703') {
        console.log('Column does not exist. Please run this SQL in your Supabase Dashboard:');
        console.log('ALTER TABLE embarcaciones ADD COLUMN notion_threshold DECIMAL DEFAULT 0.2;');
    } else {
        console.log('Column already exists or another error:', error?.message || 'Success');
    }
}

run();
