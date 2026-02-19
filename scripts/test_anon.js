
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    if (key && value) acc[key.trim()] = value.join('=').trim();
    return acc;
}, {});

async function testAnon() {
    console.log("Testing Anon Key:", env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.from('cursos').select('id').limit(1);
    if (error) {
        console.error("Anon Key Error:", error.message);
    } else {
        console.log("Anon Key is WORKING.");
    }
}

testAnon();
