
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
    const { data: cursos, error: errorCursos } = await supabase
        .from('cursos')
        .select('*');

    if (errorCursos) {
        console.error("Error Cursos:", errorCursos);
    } else {
        console.log("Cursos count:", cursos.length);
        console.log("Cursos Slugs:", cursos.map(c => c.slug));
    }

    const { data: editions, error: errorEditions } = await supabase
        .from('ediciones_curso')
        .select('*')
        .limit(1);

    if (errorEditions) {
        console.error("Error Ediciones (Table exists?):", errorEditions.message);
    } else {
        console.log("Ediciones sample:", editions);
    }
}

check();
