
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
    const migrationFile = '023_gamification_support.sql';
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`🚀 Ejecutando migración: ${migrationFile}`);

    // Try multiple RPC names and parameters commonly found in this project
    const rpcAttempts = [
        { name: 'exec_sql', params: { sql: sql } },
        { name: 'exec_sql', params: { sql_query: sql } },
    ];

    let completed = false;
    for (const attempt of rpcAttempts) {
        const { error } = await supabase.rpc(attempt.name, attempt.params);
        if (!error) {
            console.log(`✅ Migración completada via ${attempt.name}`);
            completed = true;
            break;
        }
    }

    if (!completed) {
        console.log('ℹ️ RPC directos fallaron, intentando statement por statement...');
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 5 && !s.startsWith('--'));

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i] + ';';

            // Try 'exec' rpc if 'exec_sql' failed
            const { error: err } = await supabase.rpc('exec', { sql: stmt });
            if (err) {
                // Try another variant
                const { error: err2 } = await supabase.rpc('exec_sql', { sql_query: stmt });
                if (err2) {
                    console.log(`❌ Error: ${err2.message}`);
                } else {
                    console.log(`✅ OK (stmt ${i + 1})`);
                }
            } else {
                console.log(`✅ OK (stmt ${i + 1})`);
            }
        }
    }
}

runMigration();
