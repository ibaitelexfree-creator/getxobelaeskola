const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function cleanup() {
    console.log('--- Cleaning Up Redundant Records ---');

    const { data: redundancies, error: findError } = await supabase
        .from('servicios_alquiler')
        .select('id, nombre_es')
        .in('categoria', ['eventos', 'cumpleanos', 'bono', 'atraque']);

    if (findError) {
        console.error('❌ Error finding redundancies:', findError.message);
        return;
    }

    if (redundancies.length === 0) {
        console.log('✅ No redundant records found.');
        return;
    }

    console.log(`🗑️ Deleting ${redundancies.length} records from servicios_alquiler...`);
    const idsToDelete = redundancies.map(r => r.id);

    const { error: deleteError } = await supabase
        .from('servicios_alquiler')
        .delete()
        .in('id', idsToDelete);

    if (deleteError) {
        console.error('❌ Error deleting records:', deleteError.message);
    } else {
        console.log('✅ Redundancies removed safely.');
    }
}

cleanup();
