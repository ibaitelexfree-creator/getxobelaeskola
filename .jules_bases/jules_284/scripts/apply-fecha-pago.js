
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('Applying fecha_pago migration...');
    const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', 'add_fecha_pago.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.warn('Error with bulk SQL, trying statement by statement:', error.message);
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 5);
        for (const stmt of statements) {
            const { error: err } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
            if (err) console.error(`Failed: ${stmt.substring(0, 50)}... -> ${err.message}`);
            else console.log(`Success: ${stmt.substring(0, 50)}...`);
        }
    } else {
        console.log('Migration applied successfully.');
    }
}

run();
