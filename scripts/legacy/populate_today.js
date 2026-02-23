const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    const today = new Date().toISOString().split('T')[0];
    console.log('Today is:', today);

    // 1. Get a student and a service
    const { data: students } = await supabase.from('profiles').select('id').eq('rol', 'alumno').limit(1);
    const { data: services } = await supabase.from('servicios_alquiler').select('id').limit(2);

    if (students && students.length > 0 && services && services.length > 0) {
        console.log('Inserting rentals for today...');
        const { error } = await supabase.from('reservas_alquiler').upsert([
            {
                perfil_id: students[0].id,
                servicio_id: services[0].id,
                fecha_reserva: today,
                hora_inicio: '10:00',
                duracion_horas: 1,
                monto_total: 30,
                estado_pago: 'pagado',
                estado_entrega: 'pendiente'
            },
            {
                perfil_id: students[0].id,
                servicio_id: services[1].id,
                fecha_reserva: today,
                hora_inicio: '12:00',
                duracion_horas: 1,
                monto_total: 45,
                estado_pago: 'pagado',
                estado_entrega: 'entregado'
            }
        ]);
        if (error) console.error('Error inserting rentals:', error);
        else console.log('Rentals for today inserted successfully.');
    } else {
        console.log('No students or services found to create rentals.');
    }

    // 2. Fix profile roles if any are 'estudiante' instead of 'alumno'
    const { data: estProfiles } = await supabase.from('profiles').select('id').eq('rol', 'estudiante');
    if (estProfiles && estProfiles.length > 0) {
        console.log('Fixing roles: estudiante -> alumno');
        await supabase.from('profiles').update({ rol: 'alumno' }).in('id', estProfiles.map(p => p.id));
    }
}

run();
