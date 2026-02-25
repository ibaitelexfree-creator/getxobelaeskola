
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');
    let content = '';
    if (fs.existsSync(envLocalPath)) content = fs.readFileSync(envLocalPath, 'utf8');
    else if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) process.env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
    });
}
loadEnv();

async function exportProfiles() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        fs.writeFileSync('all_profiles_debug.json', JSON.stringify(profiles, null, 2));
        console.log(`Exported ${profiles.length} profiles to all_profiles_debug.json`);
    }

    const { data: ins, error: insError } = await supabase
        .from('inscripciones')
        .select('*');

    if (insError) {
        console.error('Error fetching inscriptions:', insError);
    } else {
        fs.writeFileSync('all_inscriptions_debug.json', JSON.stringify(ins, null, 2));
        console.log(`Exported ${ins.length} inscriptions to all_inscriptions_debug.json`);
    }
}

exportProfiles();
