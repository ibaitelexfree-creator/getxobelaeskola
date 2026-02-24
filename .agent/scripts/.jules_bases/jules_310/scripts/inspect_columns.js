
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    const { data, error } = await supabase.from('unidades_didacticas').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    if (data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        // If empty, try to get info from a system view or just meta
        console.log('Table is empty. Checking via RPC if possible or just assuming standard from migration.');
    }
}
inspectTable();
