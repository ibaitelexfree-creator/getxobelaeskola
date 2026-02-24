
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
// We need SERVICE_ROLE_KEY to bypass RLS and modify schema if needed, though for RPC creation we usually need special privileges.
// If SERVICE_ROLE_KEY is not in .env.local, we might fail if we don't have permissions.
// Let's hope it's there or that logged in user (if we were using one) could do it, but here we run as admin script.
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL(sql) {
    // Try to use a common RPC if available 'exec_sql' or similar if implemented in previous migrations.
    // If not, we might have to use the REST API if we have the service role key and permissions? 
    // Actually, supabase-js doesn't support raw SQL execution directly unless via RPC.
    // However, the previous script `fix_missing_column.js` used `supabase.rpc('exec_sql', { sql })`.
    // This implies `exec_sql` RPC exists! If so, we are golden.

    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
        console.error('RPC exec_sql Error:', error);
        return false;
    }
    return true;
}

async function start() {
    console.log('Attempting to apply dashboard fix migration...');

    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240218_fix_dashboard_crash.sql');
    if (!fs.existsSync(migrationPath)) {
        console.error('Migration file not found:', migrationPath);
        return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running SQL...');
    const success = await runSQL(migrationSQL);

    if (success) {
        console.log('Migration applied successfully!');
    } else {
        console.log('Failed to apply migration via RPC.');
        console.log('Please run the following SQL manually in Supabase SQL Editor:');
        console.log(migrationSQL);
    }
}

start();
