const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function listCourses() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').filter(l => l.includes('=')).forEach(l => {
        const [k, ...v] = l.split('=');
        env[k.trim()] = v.join('=').trim().replace(/^"(.*)"$/, '$1');
    });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: courses, error } = await supabase.from('cursos').select('id, nombre_es, slug');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(JSON.stringify(courses, null, 2));
}

listCourses();
