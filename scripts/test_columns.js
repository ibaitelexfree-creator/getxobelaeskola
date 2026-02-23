
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    if (key && value) acc[key.trim()] = value.join('=').trim();
    return acc;
}, {});

async function testEditions() {
    const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Testing columns in ediciones_curso...");
    const { data, error } = await supabase.from('ediciones_curso').select('id, curso_id, fecha_inicio, fecha_fin').limit(1);

    if (error) {
        console.error("Columns Error:", error.message);
    } else {
        console.log("Columns are OK.");
    }
}

testEditions();
