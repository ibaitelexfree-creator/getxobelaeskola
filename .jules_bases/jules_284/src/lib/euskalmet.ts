
import jwt from 'jsonwebtoken';

const PRIVATE_KEY = process.env.EUSKALMET_PRIVATE_KEY?.replace(/\\n/g, '\n');
const EMAIL = process.env.EUSKALMET_EMAIL || 'info@getxobelaeskola.com';

export function generateEuskalmetToken() {
    if (!PRIVATE_KEY) {
        throw new Error('EUSKALMET_PRIVATE_KEY is not defined');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        aud: 'met01.apikey',
        iss: 'GetxoBelaEskola',
        version: '1.0.0',
        email: EMAIL,
        iat: now,
        exp: now + 3600 // 1 hour
    };

    return jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
}

export async function fetchEuskalmetStationData(stationId: string) {
    try {
        const token = generateEuskalmetToken();
        const url = `https://api.euskadi.eus/met01/euskalmet/stations/${stationId}/current`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            signal: controller.signal,
            next: { revalidate: 600 }
        });

        clearTimeout(timeoutId);
        if (!res.ok) return null;
        return res.json();

    } catch (e) {
        console.error('Euskalmet Station Fetch Error:', e);
        return null;
    }
}

export async function fetchEuskalmetAlerts() {
    try {
        const token = generateEuskalmetToken();
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');

        // Try both 'costa' and '1' for Costa Bizkaia
        const endpoints = [
            `https://api.euskadi.eus/met01/euskalmet/alerts/forRegion/1/at/${yyyy}/${mm}/${dd}`,
            `https://api.euskadi.eus/met01/euskalmet/alerts/forRegionZone/costa/at/${yyyy}/${mm}/${dd}`
        ];

        for (const url of endpoints) {
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                next: { revalidate: 3600 }
            });

            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data)) return data;
            }
        }
        return [];
    } catch (e) {
        console.error('Euskalmet Alert Fetch Error:', e);
        return [];
    }
}
