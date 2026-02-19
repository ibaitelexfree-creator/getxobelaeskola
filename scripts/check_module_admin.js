
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkModule() {
    const moduleId = 'c5dcfc3e-a981-42bd-87f4-ef69d6130627';
    console.log('Checking module:', moduleId);

    const { data, error } = await supabase
        .from('modulos')
        .select('*')
        .eq('id', moduleId)
        .single();

    if (error) {
        console.error('Error fetching module (Admin):', error);
    } else {
        console.log('Module found (Admin):', data ? 'YES' : 'NO');
        if (data) console.log('Module Name:', data.nombre_es);
    }
}

checkModule();
