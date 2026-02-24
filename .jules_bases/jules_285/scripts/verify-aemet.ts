
import fs from 'fs';
import path from 'path';

// Manual .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.error('Error loading .env.local', e);
    }
}

loadEnv();

const AEMET_API_KEY = process.env.AEMET_API_KEY;

if (!AEMET_API_KEY) {
    console.error('Error: AEMET_API_KEY is not defined in environment variables.');
    // Don't exit, maybe it's passed via CLI: AEMET_API_KEY=... npx tsx ...
    if (!process.env.AEMET_API_KEY) process.exit(1);
}

interface AemetResponse {
    estado: number;
    datos: string;
    metadatos: string;
}

async function fetchAemetData(endpoint: string) {
    try {
        console.log(`Fetching from: ${endpoint}`);
        const url = `https://opendata.aemet.es/opendata/api${endpoint}?api_key=${AEMET_API_KEY}`;

        const res1 = await fetch(url);
        if (!res1.ok) {
            throw new Error(`First request failed: ${res1.status} ${res1.statusText}`);
        }

        const json1 = await res1.json() as AemetResponse;

        if (json1.estado !== 200) {
            // AEMET returns 401/404 in the JSON body sometimes
            console.error(`API Error Body:`, json1);
            throw new Error(`API Error: ${JSON.stringify(json1)}`);
        }

        console.log(`Data URL: ${json1.datos}`);

        const res2 = await fetch(json1.datos);
        if (!res2.ok) {
            throw new Error(`Second request failed: ${res2.status} ${res2.statusText}`);
        }

        const data = await res2.json();
        return data;

    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

async function main() {
    console.log('--- Verifying AEMET API for Getxo/Bilbao ---');

    // 1. Coastal Forecast (Bizkaia)
    console.log('\n--- Coastal Forecast (Bizkaia - 48) ---');
    const coastalData = await fetchAemetData('/prediccion/maritima/costera/costa/48');
    if (coastalData) {
        console.log('Success! Sample Data Structure:');
        console.log(JSON.stringify(coastalData, null, 2).slice(0, 1000));
    }

    // 2. Port Forecast (Bilbao - 4801)
    console.log('\n--- Port Forecast (Bilbao - 4801) ---');
    const portData = await fetchAemetData('/prediccion/maritima/puerto/4801');
    if (portData) {
        console.log('Success! Sample Data Structure:');
        console.log(JSON.stringify(portData, null, 2).slice(0, 1000));
    }
}

main();
