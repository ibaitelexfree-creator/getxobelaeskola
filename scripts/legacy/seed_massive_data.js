const { createClient } = require('@supabase/supabase-js');

async function seedMassiveData() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('--- Seeding Massive Seasonal Data (Last 2 years) ---');

    const { data: profiles } = await supabase.from('profiles').select('id').limit(10);
    const { data: services } = await supabase.from('servicios_alquiler').select('id, precio_base').limit(5);

    if (!profiles?.length || !services?.length) {
        console.error('Missing profiles or services.');
        return;
    }

    const fakeReservations = [];
    const now = new Date();

    // Iterate over the last 24 months
    for (let m = 0; m < 24; m++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const month = targetDate.getMonth(); // 0-11
        const year = targetDate.getFullYear();

        // Define season: Summer (June, July, August, September)
        const isSummer = month >= 5 && month <= 8;
        const count = isSummer ? 130 : 50;

        console.log(`Generating ${count} records for ${month + 1}/${year}...`);

        for (let i = 0; i < count; i++) {
            const day = Math.floor(Math.random() * 28) + 1;
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];

            const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
            const randomService = services[Math.floor(Math.random() * services.length)];
            const finalPrice = randomService.precio_base + (Math.floor(Math.random() * 21) - 10);

            fakeReservations.push({
                perfil_id: randomProfile.id,
                servicio_id: randomService.id,
                fecha_reserva: dateStr,
                hora_inicio: `${Math.floor(Math.random() * 8) + 9}:00:00`,
                duracion_horas: Math.floor(Math.random() * 3) + 1,
                monto_total: finalPrice,
                estado_pago: 'pagado',
                estado_entrega: 'completado',
                log_seguimiento: [{ status: 'pagado', note: 'Seasonal seed data', timestamp: date.toISOString() }]
            });
        }
    }

    console.log(`Total records generated: ${fakeReservations.length}. Starting batch upload...`);

    // Insert in batches of 100
    for (let i = 0; i < fakeReservations.length; i += 100) {
        const batch = fakeReservations.slice(i, i + 100);
        const { error } = await supabase.from('reservas_alquiler').insert(batch);
        if (error) {
            console.error(`Error in batch starting at ${i}:`, error.message);
        } else {
            process.stdout.write('.');
        }
    }

    console.log('\nMassive seeding completed successfully.');
}

seedMassiveData();
