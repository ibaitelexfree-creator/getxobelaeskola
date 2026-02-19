
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('session_edits')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success accessing session_edits.');
        if (data.length > 0) {
            console.log('Keys:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, inserting value to check FK...');
            // Only insert if empty to avoid polluting
        }
    }
}

checkSchema();
