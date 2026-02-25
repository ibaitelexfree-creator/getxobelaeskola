
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
    const { data: cursos } = await supabase.from('cursos').select('slug, nombre_es');
    console.log("Slugs in DB:", cursos.map(c => c.slug));
}

check();
