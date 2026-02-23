const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    const migrationFile = '013_mejor_puntuacion_progreso.sql';
    console.log(`🚀 Ejecutando migración: ${migrationFile}\n`);

    try {
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', migrationFile);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('⏳ Ejecutando SQL (usando parámetro "sql")...\n');

        const { data, error } = await supabase.rpc('exec_sql', { sql: sql });

        if (error) {
            console.warn('⚠️ Error ejecutando migración completa:', error.message);
            console.log('ℹ️ Intentando ejecución statement por statement...\n');
            const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 5);
            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i] + ';';
                process.stdout.write(`Ejecutando statement ${i + 1}/${statements.length}... `);
                const { error: err } = await supabase.rpc('exec_sql', { sql: stmt });
                if (err) console.log(`❌ Error: ${err.message}`);
                else console.log(`✅ OK`);
            }
        } else {
            console.log('✅ Migración completada con éxito');
        }

    } catch (error) {
        console.error('❌ Error inesperado:', error.message);
    }
}

runMigration();
