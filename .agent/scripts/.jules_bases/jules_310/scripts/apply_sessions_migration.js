
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration() {
    const migrationFile = '20240210_create_sessions.sql';
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile);

    if (!fs.existsSync(migrationPath)) {
        console.error('Migration file not found:', migrationPath);
        return;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 10); // Skip empty or tiny lines

    console.log(`Applying ${statements.length} statements from ${migrationFile}...`);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        // Try known RPC names for SQL execution
        let success = false;
        for (const rpcName of ['exec_sql', 'run_sql', 'exec']) {
            const { error } = await supabase.rpc(rpcName, {
                sql: stmt,
                sql_query: stmt,
                query: stmt
            });

            if (!error) {
                success = true;
                break;
            } else if (error.code !== 'PGRST202') { // PGRST202 = Function not found
                console.error(`Error in statement ${i + 1} with ${rpcName}:`, error.message);
            }
        }

        if (!success) {
            console.error(`❌ Failed to execute statement ${i + 1}. You might need to run this manually in the Supabase SQL Editor.`);
            // Continue anyway to try other statements if some tables already exist
        }
    }

    console.log('Migration process finished.');
}

applyMigration();
