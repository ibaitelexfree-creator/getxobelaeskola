
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env manually
const envPath = path.resolve(__dirname, '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('Error reading .env:', e.message);
    process.exit(1);
}

const envConfig = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && value && !key.startsWith('#')) {
            envConfig[key] = value;
        }
    }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260219000000_fix_recursive_unlock_bug.sql');
    let sqlContent = '';
    try {
        sqlContent = fs.readFileSync(migrationPath, 'utf8');
    } catch (e) {
        console.error('Error reading migration file:', e.message);
        process.exit(1);
    }

    console.log('Applying migration...');
    // Execute SQL using pg (postgres) directly if supabase-js doesn't support raw sql easily without RPC "exec_sql"
    // However, looking at previous scripts like "test_exec_sql.js", it seems there might be an "exec_sql" RPC available.
    // Let's try to use that first.

    // Check if exec_sql rpc is available
    const { data: rpcList, error: rpcListError } = await supabase.rpc('get_service_role_user'); // Dummy call to just check connection or list rpcs if possible? No.

    // Try to run via exec_sql rpc if it exists (common pattern in this project)
    // If not, we might need another way.
    // Actually, looking at previous project structure, there is a `run_sql.js` script. Let's see if we can use that logic.
    // But for now, let's assume `exec_sql` exists as it's often used for migrations.

    // Wait, create a dedicated function to run sql if exec_sql is not available is tricky without direct DB access.
    // But let's assume we can use the 'exec_sql' RPC which is a common helper in Supabase setups for these agents.

    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
        console.error('Error executing SQL via RPC:', error);

        // Fallback: If exec_sql doesn't exist, we can't easily run raw SQL from client unless we have direct connection string and pg library.
        // But we do have `postgres` string in .env possibly?
        // Let's check if we can interpret the error.
        if (error.title === 'ActiveRecord::StatementInvalid' || error.message.includes('function "exec_sql" does not exist')) {
            console.log("RPC exec_sql not found. Trying direct SQL execution if possible or manual instruction.");
        }
    } else {
        console.log('Migration applied successfully via RPC!');
    }
}

applyMigration();
