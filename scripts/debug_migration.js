
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
        .filter(s => s.length > 10);

    console.log(`Applying ${statements.length} statements from ${migrationFile}...`);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';
        // Try exec_sql
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });

        if (error) {
            console.error(`Statement ${i + 1} FAILED:`, JSON.stringify(error));
        } else {
            console.log(`Statement ${i + 1} SUCCESS`);
        }
    }

    console.log('Migration process finished.');
}

applyMigration();
