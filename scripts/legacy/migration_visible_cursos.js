
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://xbledhifomblirxurtyv.supabase.co';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('🚀 Adding "visible" column to "cursos" table...');

    const sql = `
        ALTER TABLE cursos ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;
        UPDATE cursos SET visible = FALSE WHERE slug = 'otros' OR id = '00000000-0000-0000-0000-000000000000';
    `;

    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
            console.error('❌ Error executing SQL:', error.message);
        } else {
            console.log('✅ Column added and "Otros/Varios" hidden successfully.');
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

run();
