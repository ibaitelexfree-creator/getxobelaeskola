
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
} else {
    // try .env
    const envPath2 = path.join(__dirname, '.env');
    if (fs.existsSync(envPath2)) {
        envContent = fs.readFileSync(envPath2, 'utf8');
    }
}

const env = {};
if (envContent) {
    envContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
    });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    const migrationFile = '20260219000000_fix_habilidades_slugs.sql';
    console.log(`🚀 Ejecutando migración: ${migrationFile}\n`);

    try {
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', migrationFile);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('⏳ Ejecutando SQL...\n');

        const { data, error } = await supabase.rpc('exec_sql', { sql: sql });

        if (error) {
            console.warn('⚠️ Error executing via exec_sql:', error.message);
            console.log("Attempting to run via separate statements isn't implemented here.");
        } else {
            console.log('✅ Migración completada con éxito');
        }

    } catch (error) {
        console.error('❌ Error inesperado:', error.message);
    }
}

runMigration();
