
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

async function checkCourses() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- COURSES ---');
    const { data: courses, error } = await supabase.from('cursos').select('id, nombre_es, slug, precio');
    if (error) console.error(error);
    else console.log(JSON.stringify(courses, null, 2));

    console.log('--- RECENT PROFILES WITH NO EMAIL ---');
    const { data: p } = await supabase.from('profiles').select('*').is('email', null).order('created_at', { ascending: false }).limit(5);
    console.log(JSON.stringify(p, null, 2));
}

checkCourses();
