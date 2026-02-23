
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const userId = '951152d9-9fa6-484c-ba9f-ade8bc980962'; // Test user from previous check
    console.log(`Checking unlock status for user: ${userId}`);

    const { data: status, error } = await supabase.rpc('obtener_estado_desbloqueo_recursivo', {
        p_alumno_id: userId
    });

    if (error) {
        console.error('RPC Error:', error);
        return;
    }

    console.log('--- Levels ---');
    console.log(status.niveles);

    console.log('--- Modules ---');
    const moduleId = 'c5dcfc3e-a981-42bd-87f4-ef69d6130627';
    console.log(`Module ${moduleId} status:`, status.modulos[moduleId]);

    // List all unlocked modules
    const unlockedModules = Object.entries(status.modulos || {})
        .filter(([id, s]) => s !== 'bloqueado')
        .map(([id, s]) => id);

    console.log('Unlocked Modules count:', unlockedModules.length);
}

check();
