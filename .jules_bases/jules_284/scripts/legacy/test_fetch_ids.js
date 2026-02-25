const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getData() {
    try {
        const { data: units, error: unitError } = await supabase.from('unidades_didacticas').select('id, nombre_es').limit(5);
        if (unitError) throw unitError;

        console.log('UNITS_START');
        console.log(JSON.stringify(units));
        console.log('UNITS_END');

        if (units && units.length > 0) {
            const { data: evals, error: evalError } = await supabase.from('evaluaciones').select('id, titulo_es, entidad_id').in('entidad_id', units.map(u => u.id));
            if (evalError) throw evalError;
            console.log('EVALS_START');
            console.log(JSON.stringify(evals));
            console.log('EVALS_END');
        }
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}
getData();
