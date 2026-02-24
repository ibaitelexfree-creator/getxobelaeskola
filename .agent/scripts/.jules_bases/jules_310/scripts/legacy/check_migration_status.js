
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env or .env.local manually
let envPath = path.resolve(__dirname, '.env.local');
let envConfig = {};

if (!fs.existsSync(envPath)) {
    console.log("⚠️ .env.local no encontrado, intentando con .env");
    envPath = path.resolve(__dirname, '.env');
}

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                if (key && value && !key.startsWith('#')) {
                    envConfig[key] = value.replace(/"/g, ''); // Remove quotes if present
                }
            }
        });
    } else {
        console.warn("⚠️ No se encontró archivo .env ni .env.local");
    }
} catch (e) {
    console.warn("⚠️ Error leyendo archivo env, intentando usar process.env: " + e.message);
    envConfig = process.env;
}

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigration() {
    console.log('🔍 Verificando estado de migración Fase 2...');

    // Check if 'progreso_alumno' table exists by attempting to select from it
    const { error } = await supabase.from('progreso_alumno').select('id').limit(1);

    if (error) {
        if (error.code === '42P01') { // PostgreSQL error code for undefined_table
            console.log('❌ La tabla "progreso_alumno" NO existe. La migración no se ha aplicado.');
            process.exit(1); // Exit with error to signal workflow failure
        } else {
            console.error('⚠️ Error inesperado verificando tabla:', error.message);
            // Assume migration hasn't run or is broken if we can't query
            process.exit(1);
        }
    } else {
        console.log('✅ La tabla "progreso_alumno" existe. La migración parece haberse aplicado.');

        // Check for other tables just in case
        const { error: err2 } = await supabase.from('habilidades').select('id').limit(1);
        if (!err2) console.log('✅ Tabla "habilidades" detectada.');

        const { error: err3 } = await supabase.from('logros').select('id').limit(1);
        if (!err3) console.log('✅ Tabla "logros" detectada.');

        process.exit(0); // Success
    }
}

checkMigration();
