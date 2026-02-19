
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

async function syncAllFarida() {
    console.log('Syncing all sessions for Farida...');
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const herSessions = sessions.data.filter(s =>
        (s.customer_details?.email === 'faridatransports@gmail.com' || s.metadata?.user_id === '72d8f011-bab5-4f99-b466-d55886d95c47')
        && s.status === 'complete'
        && s.payment_status === 'paid'
    );

    console.log(`Found ${herSessions.length} paid sessions.`);

    for (const s of herSessions) {
        const m = s.metadata;
        console.log(`Processing session ${s.id} (${m.mode})...`);

        if (m.mode === 'course' || !m.mode) { // Assume course if mode missing and it looks like one
            const { data: existing } = await supabase.from('inscripciones').select('id').eq('stripe_session_id', s.id).maybeSingle();
            if (!existing) {
                const insData = {
                    perfil_id: m.user_id || '72d8f011-bab5-4f99-b466-d55886d95c47',
                    curso_id: m.course_id,
                    edicion_id: (m.edition_id && m.edition_id !== '') ? m.edition_id : null,
                    estado_pago: 'pagado',
                    monto_total: s.amount_total / 100,
                    stripe_session_id: s.id,
                    metadata: { manual_sync: true, start_date: m.start_date, end_date: m.end_date }
                };
                await supabase.from('inscripciones').insert(insData);
                console.log(`  ✅ Enrolled in ${m.item_name}`);
            } else {
                console.log('  Already enrolled.');
            }
        } else if (m.mode === 'rental_test') {
            const { data: existing } = await supabase.from('reservas_alquiler').select('id').eq('stripe_session_id', s.id).maybeSingle();
            if (!existing) {
                const rentData = {
                    perfil_id: m.user_id || '72d8f011-bab5-4f99-b466-d55886d95c47',
                    servicio_id: m.service_id,
                    fecha_reserva: m.reserved_date || new Date().toISOString().split('T')[0],
                    hora_inicio: m.reserved_time || '10:00:00',
                    duracion_horas: 1,
                    opcion_seleccionada: m.item_name.includes('(') ? m.item_name.split('(')[1].replace(')', '') : 'Estándar',
                    monto_total: s.amount_total / 100,
                    estado_pago: 'pagado',
                    stripe_session_id: s.id
                };
                await supabase.from('reservas_alquiler').insert(rentData);
                console.log(`  ✅ Reserved ${m.item_name}`);
            } else {
                console.log('  Already reserved.');
            }
        }
    }
}

syncAllFarida().catch(console.error);
