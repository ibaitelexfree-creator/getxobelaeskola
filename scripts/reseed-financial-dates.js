
/**
 * RESEED FINANCIAL DATES
 * Populations fecha_pago with variety for testing charts.
 */

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
<<<<<<< HEAD
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
=======
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";
>>>>>>> pr-286

async function populateFechaPago() {
    console.log('Fetching rentals...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=id,created_at`, {
        headers: { "apikey": SERVICE_ROLE_KEY, "Authorization": `Bearer ${SERVICE_ROLE_KEY}` }
    });
    const rentals = await response.json();
    console.log(`Found ${rentals.length} rentals. Seeding fecha_pago...`);

    for (const rental of rentals) {
        // Random date between last 120 days
        const daysAgo = Math.floor(Math.random() * 120);
        const randomHour = Math.floor(Math.random() * 10) + 9;
        const randomMin = Math.floor(Math.random() * 60);

        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(randomHour, randomMin, 0, 0);

        const fecha_pago = date.toISOString();

        await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?id=eq.${rental.id}`, {
            method: 'PATCH',
            headers: {
                "apikey": SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fecha_pago })
        });
    }
    console.log('Finished seeding fecha_pago.');
}

populateFechaPago();
