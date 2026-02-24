
const Stripe = require('stripe');
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function manualEnrollFarida() {
    console.log('Searching for Farida session...');
    const sessions = await stripe.checkout.sessions.list({ limit: 50 });
    const s = sessions.data.find(s => s.customer_details?.email === 'faridatransports@gmail.com' || s.metadata?.user_id === '72d8f011-bab5-4f99-b466-d55886d95c47');

    if (!s) {
        console.error('Session not found.');
        return;
    }

    console.log('Found session:', s.id);
    const m = s.metadata;

    // Check if already enrolled
    const { data: existing } = await supabase
        .from('inscripciones')
        .select('id')
        .eq('stripe_session_id', s.id)
        .maybeSingle();

    if (existing) {
        console.log('ALREADY ENROLLED in DB.');
        return;
    }

    const inscriptionData = {
        perfil_id: m.user_id || '72d8f011-bab5-4f99-b466-d55886d95c47',
        curso_id: m.course_id,
        edicion_id: (m.edition_id && m.edition_id !== '') ? m.edition_id : null,
        estado_pago: 'pagado',
        monto_total: s.amount_total / 100,
        stripe_session_id: s.id,
        metadata: {
            start_date: m.start_date,
            end_date: m.end_date,
            manual_fix: true,
            fixed_at: new Date().toISOString()
        }
    };

    console.log('Inserting inscription:', JSON.stringify(inscriptionData, null, 2));

    const { data: newIns, error: insError } = await supabase
        .from('inscripciones')
        .insert(inscriptionData)
        .select();

    if (insError) {
        console.error('Error inserting inscription:', insError);
    } else {
        console.log('Successfully enrolled Farida!', JSON.stringify(newIns, null, 2));

        // Update edition occupancy if needed
        if (inscriptionData.edicion_id) {
            const { data: edData } = await supabase.from('ediciones_curso').select('plazas_ocupadas').eq('id', inscriptionData.edicion_id).single();
            if (edData) {
                await supabase.from('ediciones_curso').update({ plazas_ocupadas: (edData.plazas_ocupadas || 0) + 1 }).eq('id', inscriptionData.edicion_id);
                console.log('Updated edition occupancy.');
            }
        }
    }
}

manualEnrollFarida().catch(console.error);
