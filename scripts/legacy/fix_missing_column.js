
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL(sql) {
    // Try to use a common RPC if available, otherwise we might be stuck
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
        console.error('RPC Error:', error);
        return false;
    }
    return true;
}

async function start() {
    console.log('Attempting to fix missing column...');
    const migration = `ALTER TABLE reservas_alquiler ADD COLUMN IF NOT EXISTS fecha_pago timestamptz;`;
    const success = await runSQL(migration);
    if (success) {
        console.log('Column added successfully (or already existed).');
    } else {
        console.log('Failed to add column via RPC. Please check Supabase SQL Editor manually.');
    }
}

start();
