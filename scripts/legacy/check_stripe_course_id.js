
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

async function checkCourse() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const courseId = '5eafb0a1-72ae-4d40-8f9d-7f5fb621356e'; // Completion based on common UUID length

    const { data: course } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

    if (course) {
        console.log('Course found:', course.nombre_es);
    } else {
        console.log('Course NOT found. Checking all courses...');
        const { data: all } = await supabase.from('cursos').select('id, nombre_es');
        console.log(JSON.stringify(all, null, 2));
    }
}

checkCourse();
