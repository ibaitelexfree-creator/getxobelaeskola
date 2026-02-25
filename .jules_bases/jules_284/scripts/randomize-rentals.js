
/**
 * Script to randomize created_at of all records in reservas_alquiler.
 * Uses fetch to avoid dependency issues with supabase-js/dotenv in a simple script.
 */

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";

async function randomizeDates() {
    console.log('Fetching rentals...');

    const response = await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=id`, {
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
    console.log(`Found ${rentals.length} rentals. Randomizing...`);

    for (const rental of rentals) {
        // Random date between last 120 days
        const daysAgo = Math.floor(Math.random() * 120);
        const randomHour = Math.floor(Math.random() * 10) + 9; // 09:00 - 19:00
        const randomMin = Math.floor(Math.random() * 60);

        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(randomHour, randomMin, 0, 0);

        const newTs = date.toISOString();

        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?id=eq.${rental.id}`, {
            method: 'PATCH',
            headers: {
                "apikey": SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({ created_at: newTs })
        });

        if (updateRes.ok) {
            console.log(`Updated ${rental.id} -> ${newTs}`);
        } else {
            console.error(`Failed to update ${rental.id}`);
        }
    }
    console.log('Done!');
}

randomizeDates();
