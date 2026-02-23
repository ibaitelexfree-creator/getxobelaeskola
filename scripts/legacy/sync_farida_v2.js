
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

async function checkFinalFix() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const faridaId = '72d8f011-bab5-4f99-b466-d55886d95c47';
    const cursoLigeraId = '5eafb0a1-72ae-4d4b-85a1-7ab392f71894';

    const { data: ins } = await supabase
        .from('inscripciones')
        .select('*')
        .eq('perfil_id', faridaId)
        .eq('curso_id', cursoLigeraId)
        .maybeSingle();

    if (ins) {
        console.log(`✅ Farida is ALREADY enrolled in Vela Ligera (Ins ID: ${ins.id})`);
    } else {
        console.log(`❌ Farida is NOT enrolled in Vela Ligera. Searching for her sessions to sync them...`);

        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const sessions = await stripe.checkout.sessions.list({ limit: 50 });
        const herSessions = sessions.data.filter(s =>
            (s.customer_details?.email === 'faridatransports@gmail.com' || s.metadata?.user_id === faridaId)
            && s.status === 'complete'
            && s.payment_status === 'paid'
        );

        for (const s of herSessions) {
            const m = s.metadata;
            const targetCourseId = m.course_id || (m.item_name.includes('Vela Ligera') ? cursoLigeraId : null);

            if (targetCourseId) {
                console.log(`Processing session ${s.id} for course ${targetCourseId}...`);
                const { error: insError } = await supabase.from('inscripciones').insert({
                    perfil_id: faridaId,
                    curso_id: targetCourseId,
                    edicion_id: (m.edition_id && m.edition_id !== '') ? m.edition_id : null,
                    estado_pago: 'pagado',
                    monto_total: s.amount_total / 100,
                    stripe_session_id: s.id,
                    metadata: { manual_sync: true, sync_date: new Date().toISOString() }
                });

                if (insError) console.error(`  Error enrolling: ${insError.message}`);
                else console.log(`  ✅ Successfully enrolled in course ${targetCourseId}`);
            }
        }
    }
}

checkFinalFix();
