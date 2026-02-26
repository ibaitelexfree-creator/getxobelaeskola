
const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";

async function generateTwoYearHistory() {
    console.log('--- Iniciando Re-sembrado de Histórico (2 Años) ---');

    // 1. Obtener todos los alquileres existentes
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=*`, {
        headers: {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": `Bearer ${SERVICE_ROLE_KEY}`
        }
    });

    if (!response.ok) {
        console.error('Error fetching rentals:', await response.text());
        return;
    }

    const rentals = await response.json();
    console.log(`Procesando ${rentals.length} registros para distribuir en 730 días...`);

    const now = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setDate(now.getDate() - 730);

    // Definición de montos realistas por servicio (aproximados)
    const pricePoints = [40, 60, 80, 120, 150];

    for (let i = 0; i < rentals.length; i++) {
        const rental = rentals[i];

        // A. Generar una fecha aleatoria en los últimos 2 años
        const randomDaysAgo = Math.floor(Math.random() * 730);
        const targetDate = new Date();
        targetDate.setDate(now.getDate() - randomDaysAgo);
        targetDate.setHours(12, 0, 0, 0); // Force noon to avoid TZ issues

        const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // B. Horario comercial (10:00 - 19:00)
        const randomHour = Math.floor(Math.random() * 9) + 10;
        const randomMin = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        const hora_inicio = `${randomHour.toString().padStart(2, '0')}:${randomMin.toString().padStart(2, '0')}:00`;

        // C. Fecha de Factura (fecha_pago)
        // Generar retraso de facturación visible (0 a 4 días después)
        const invoiceDate = new Date(targetDate);
        // 20% same day, 80% with delay [1-4 days]
        const delayDays = Math.random() < 0.2 ? 0 : Math.floor(Math.random() * 4) + 1;
        invoiceDate.setDate(invoiceDate.getDate() + delayDays);

        // Poner hora laboral aleatoria de pago (9:00 - 18:00)
        const payHour = Math.floor(Math.random() * 9) + 9;
        const payMin = Math.floor(Math.random() * 60);
        invoiceDate.setHours(payHour, payMin, 0, 0);

        const fecha_pago = invoiceDate.toISOString();

        // D. Monto realista si es 0 o null
        const monto_total = rental.monto_total && rental.monto_total > 0
            ? rental.monto_total
            : pricePoints[Math.floor(Math.random() * pricePoints.length)];

        const updates = {
            fecha_reserva: dateStr,
            hora_inicio: hora_inicio,
            fecha_pago: fecha_pago,
            monto_total: monto_total,
            estado_pago: 'pagado' // La mayoría históricos estarán pagados
        };

        if (i % 50 === 0) console.log(`Progreso: ${i}/${rentals.length}...`);

        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?id=eq.${rental.id}`, {
            method: 'PATCH',
            headers: {
                "apikey": SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify(updates)
        });

        if (!updateRes.ok) {
            console.error(`Error en ${rental.id}:`, await updateRes.text());
        }
    }

    console.log('--- Proceso de Histórico Completo ---');
    console.log('Ahora los gráficos deberían mostrar 2 años de datos coherentes.');
}

generateTwoYearHistory();
