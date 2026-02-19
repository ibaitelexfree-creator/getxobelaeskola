
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    if (key && value) acc[key.trim()] = value.join('=').trim();
    return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function diagnostic() {
    console.log("--- Getxo Bela Eskola Diagnostic ---");

    // 1. Check RPC
    console.log("\n1. Testing RPC 'obtener_estado_desbloqueo_recursivo'...");
    const { data: rpcData, error: rpcError } = await supabase.rpc('obtener_estado_desbloqueo_recursivo', {
        p_alumno_id: '00000000-0000-0000-0000-000000000000' // Non existent user to test safety
    });

    if (rpcError) {
        console.error("❌ RPC Error:", rpcError);
    } else {
        console.log("✅ RPC Success. Result keys:", Object.keys(rpcData || {}));
    }

    // 2. Check Course Data
    console.log("\n2. Checking Course Slugs...");
    const { data: courses, error: courseError } = await supabase.from('cursos').select('slug, nombre_es');
    if (courseError) {
        console.error("❌ Course Fetch Error:", courseError);
    } else {
        console.log("✅ Found", courses.length, "courses.");
        const slugs = courses.map(c => c.slug);
        const hardcoded = ['iniciacion-j80', 'perfeccionamiento-vela', 'licencia-navegacion', 'vela-ligera'];
        const missing = hardcoded.filter(h => !slugs.includes(h));
        if (missing.length > 0) {
            console.warn("⚠️ Hardcoded slugs missing from DB:", missing);
        } else {
            console.log("✅ All hardcoded slugs exist in DB.");
        }
    }

    // 3. Check Internationalization Files
    console.log("\n3. Checking Message Files...");
    const locales = ['es', 'eu', 'en', 'fr'];
    locales.forEach(l => {
        const p = path.join(__dirname, `../messages/${l}.json`);
        if (fs.existsSync(p)) {
            try {
                const content = JSON.parse(fs.readFileSync(p, 'utf8'));
                console.log(`✅ ${l}.json is valid JSON. (Keys: ${Object.keys(content).length})`);
            } catch (e) {
                console.error(`❌ ${l}.json is INVALID JSON:`, e.message);
            }
        } else {
            console.error(`❌ ${l}.json is MISSING!`);
        }
    });

    console.log("\n--- Diagnostic Finished ---");
}

diagnostic();
