const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkCursos() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: cursoData, error } = await supabase.from('cursos').select('nombre_es, imagen_url');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(cursoData, null, 2));
}

checkCursos();
