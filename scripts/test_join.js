
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    if (key && value) acc[key.trim()] = value.join('=').trim();
    return acc;
}, {});

async function testJoin() {
    const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Testing join on reservas_alquiler -> servicios_alquiler...");
    const { data, error } = await supabase
        .from('reservas_alquiler')
        .select(`
            *,
            servicios_alquiler (id, nombre_es, nombre_eu)
        `)
        .limit(1);

    if (error) {
        console.error("Join Error:", error.message, error.hint, error.details);
    } else {
        console.log("Join is OK.");
    }
}

testJoin();
