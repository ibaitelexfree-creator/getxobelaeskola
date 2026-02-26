const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyLegalMigration() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ No se encontró .env');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/"/g, '');
            env[key] = value;
        }
    });

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no definidos');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const sql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '014_legal_consents.sql'), 'utf8');

    console.log('⏳ Aplicando migración legal_consents...');

    // Split by semicolon and filter empty lines
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 5);

    for (const stmt of statements) {
        process.stdout.write(`Ejecutando: ${stmt.substring(0, 50)}... `);
        const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
        if (error) {
            console.log(`❌ ERROR: ${error.message}`);
        } else {
            console.log('✅ OK');
        }
    }
}

applyLegalMigration();
