
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSchema() {
    console.log('--- Inspecting Cursos Table ---');
    const { data: sample, error: sampleErr } = await supabase.from('cursos').select('*').limit(1);
    if (sampleErr) console.error('Error fetching sample from cursos:', sampleErr.message);
    else console.log('Columns in cursos:', Object.keys(sample[0] || {}));
}

inspectSchema();
