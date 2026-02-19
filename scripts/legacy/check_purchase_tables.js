
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
    const { data, error } = await supabase
        .rpc('get_tables'); // Try a common RPC if exists, unlikely.

    // Better approach: try to select from likely tables
    console.log("Checking for 'compras'...");
    const { error: e1 } = await supabase.from('compras').select('*').limit(1);
    console.log(e1 ? "No 'compras'" : "Found 'compras'");

    console.log("Checking for 'pedidos'...");
    const { error: e2 } = await supabase.from('pedidos').select('*').limit(1);
    console.log(e2 ? "No 'pedidos'" : "Found 'pedidos'");

    console.log("Checking for 'user_courses'...");
    const { error: e3 } = await supabase.from('user_courses').select('*').limit(1);
    console.log(e3 ? "No 'user_courses'" : "Found 'user_courses'");

    console.log("Checking for 'matriculas'...");
    const { error: e4 } = await supabase.from('matriculas').select('*').limit(1);
    console.log(e4 ? "No 'matriculas'" : "Found 'matriculas'");

    console.log("Checking for 'inscripciones'...");
    const { error: e5 } = await supabase.from('inscripciones').select('*').limit(1);
    console.log(e5 ? "No 'inscripciones'" : "Found 'inscripciones'");
}

inspect();
