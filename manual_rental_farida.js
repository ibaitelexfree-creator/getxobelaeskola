
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

async function manualRentalFix() {
    console.log('Searching for Farida rental session...');
    const sessions = await stripe.checkout.sessions.list({ limit: 50 });
    const s = sessions.data.find(s => s.customer_details?.email === 'faridatransports@gmail.com' || s.metadata?.user_id === '72d8f011-bab5-4f99-b466-d55886d95c47');

    if (!s) {
        console.error('Session not found.');
        return;
    }

    console.log('Found session:', s.id);
    const m = s.metadata;

    if (m.mode !== 'rental_test') {
        console.log('Session is NOT a rental:', m.mode);
        // If it was a course, I already handled it (or I should check again)
    }

    const rentalData = {
        perfil_id: m.user_id || '72d8f011-bab5-4f99-b466-d55886d95c47',
        servicio_id: m.service_id,
        fecha_reserva: m.reserved_date || new Date().toISOString().split('T')[0],
        hora_inicio: m.reserved_time || '10:00:00',
        duracion_horas: 1, // Default from webhook code
        opcion_seleccionada: m.item_name.includes('(') ? m.item_name.split('(')[1].replace(')', '') : 'Estándar',
        monto_total: s.amount_total / 100,
        estado_pago: 'pagado',
        stripe_session_id: s.id
    };

    console.log('Inserting rental:', JSON.stringify(rentalData, null, 2));

    const { data, error } = await supabase
        .from('reservas_alquiler')
        .insert(rentalData)
        .select();

    if (error) {
        console.error('Error inserting rental:', error);
    } else {
        console.log('Successfully recorded Farida rental!', JSON.stringify(data, null, 2));
    }
}

manualRentalFix().catch(console.error);
