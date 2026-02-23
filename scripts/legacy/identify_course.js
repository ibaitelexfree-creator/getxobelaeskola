
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

async function findCourse() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: courses } = await supabase.from('cursos').select('*');

    // Farida's session was for 18 EUR based on my previous grep (truncated)
    // Wait, let's check the session precisely.
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sessions = await stripe.checkout.sessions.list({ limit: 10 });
    const s = sessions.data.find(s => s.customer_details?.email === 'faridatransports@gmail.com');

    if (s) {
        console.log('Session metadata:', JSON.stringify(s.metadata, null, 2));
        const course = courses.find(c => c.id === s.metadata.course_id);
        if (course) {
            console.log('Course identified:', course.nombre_es);
        } else {
            console.log('Course ID not found in database:', s.metadata.course_id);
        }
    }
}

findCourse().catch(console.error);
