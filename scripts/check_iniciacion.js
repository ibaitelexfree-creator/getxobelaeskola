
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
    const { data: curso } = await supabase.from('cursos').select('*').eq('slug', 'iniciacion-j80').single();
    console.log(JSON.stringify(curso, null, 2));
}

check();
