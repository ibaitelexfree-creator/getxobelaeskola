
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    if (key && value) acc[key.trim()] = value.join('=').trim();
    return acc;
}, {});

// Generate a random UUID-like string for testing (or uses a real one if you have it)
const testUserId = '00000000-0000-0000-0000-000000000000';

async function testRPC() {
    const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Testing RPC 'obtener_estado_desbloqueo_recursivo'...");
    const { data, error } = await supabase.rpc('obtener_estado_desbloqueo_recursivo', {
        p_alumno_id: testUserId
    });

    if (error) {
        console.error("RPC Error:", error.message, error.hint, error.details);
    } else {
        console.log("RPC is OK. Data:", JSON.stringify(data).substring(0, 200));
    }
}

testRPC();
