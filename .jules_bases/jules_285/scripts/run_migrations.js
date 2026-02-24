
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

async function runMigration(file) {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', file);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`🚀 Ejecutando migración: ${file}`);

    // Try multiple RPC names
    const rpcNames = ['exec_sql', 'exec'];
    let completed = false;

    // Split SQL into statements to be safer
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 5 && !s.startsWith('--'));

    for (const stmt of statements) {
        let stmtOk = false;
        const stmtWithSemi = stmt + ';';
        for (const name of rpcNames) {
            const { error } = await supabase.rpc(name, { sql: stmtWithSemi, sql_query: stmtWithSemi });
            if (!error) {
                stmtOk = true;
                break;
            }
        }
        if (!stmtOk) {
            console.log(`❌ Error en statement: ${stmt}`);
        } else {
            console.log(`✅ Statement OK`);
        }
    }
}

async function runAll() {
    await runMigration('023_gamification_support.sql');
    await runMigration('024_evaluaciones_unique.sql');
}

runAll();
