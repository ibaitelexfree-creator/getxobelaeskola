const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
<<<<<<< HEAD
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
=======
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";
>>>>>>> pr-286

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
