
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
    const { data: curso } = await supabase.from('cursos').select('*').limit(1).single();
    console.log("Curso schema:", Object.keys(curso));
    console.log("Values for vela-ligera:");
    const { data: vela } = await supabase.from('cursos').select('*').eq('slug', 'vela-ligera').single();
    console.log(JSON.stringify(vela, null, 2));
}

check();
