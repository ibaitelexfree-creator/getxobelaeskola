const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const cheerio = require('cheerio');
require('dotenv').config();

// Configuration
const connectionString = process.env.DATABASE_URL;
const EUSKALMET_PRIVATE_KEY = process.env.EUSKALMET_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '').trim();
const EUSKALMET_EMAIL = process.env.EUSKALMET_EMAIL || 'info@getxobelaeskola.com';
const AEMET_API_KEY = process.env.AEMET_API_KEY;

async function sync() {
    const isLocal = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');
    const client = new Client({
        connectionString,
        ssl: isLocal ? false : { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const now = new Date();
        const hour = now.getHours();
        const isNight = hour >= 22 || hour < 7;

        console.log(`--- Respaldo de Datos Ambientales (${now.toISOString()}) ---`);

        // 1. Fetch Weather Data (Every run)
        const weather = await fetchWeatherData();
        if (weather) {
            console.log(`Clima: ${weather.knots} kt en ${weather.station}`);
            await client.query(
                `INSERT INTO api_cache (key, data, updated_at) VALUES ($1, $2, NOW()) 
                 ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()`,
                ['weather_current', weather]
            );

            await client.query(
                `INSERT INTO weather_history (station, wind_speed, wind_gust, wind_direction, temperature, timestamp)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [weather.station, weather.knots, weather.gusts || weather.knots, weather.direction, weather.temp]
            );
        }

        // 2. Fetch Alerts (Every run during day, every 30m at night)
        if (!isNight || now.getMinutes() % 30 === 0) {
            const alerts = await fetchEuskalmetAlerts();
            console.log(`Alertas Euskalmet: ${alerts.length} encontradas`);
            await client.query(
                `INSERT INTO api_cache (key, data, updated_at) VALUES ($1, $2, NOW()) 
                 ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()`,
                ['euskalmet_alerts', alerts]
            );
        }

        // 3. Fetch AEMET Maritime Forecast (Once per hour to avoid 429)
        if (AEMET_API_KEY) {
            const cacheCheck = await client.query(
                "SELECT updated_at FROM api_cache WHERE key = 'aemet_coastal_forecast' AND updated_at > NOW() - INTERVAL '1 hour'"
            );

            if (cacheCheck.rows.length === 0) {
                const aemetData = await fetchAemetCoastalForecast('41');
                if (aemetData) {
                    console.log('Predicción AEMET Bizkaia actualizada');
                    await client.query(
                        `INSERT INTO api_cache (key, data, updated_at) VALUES ($1, $2, NOW()) 
                         ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()`,
                        ['aemet_coastal_forecast', aemetData]
                    );
                }
            } else {
                console.log('AEMET: Usando caché (actualizado hace menos de 1h)');
            }
        }

        // 4. Sea State / Tides (Simulated)
        const seaState = getSimulatedSeaState();
        const tideSummary = getTideState();
        await client.query(
            `INSERT INTO api_cache (key, data, updated_at) VALUES ($1, $2, NOW()) 
             ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()`,
            ['sea_state', { ...seaState, tide: tideSummary }]
        );

        console.log('✅ Sincronización completada.');
    } catch (err) {
        console.error('❌ Error en sincronización:', err);
    } finally {
        await client.end();
    }
}

// --- Fetchers adaptados ---

function getSimulatedSeaState() {
    const now = new Date();
    const month = now.getMonth();
    const isWinter = month >= 10 || month <= 2;
    return {
        waveHeight: isWinter ? 2.5 : 1.0,
        period: isWinter ? 10 : 7,
        waterTemp: isWinter ? 13 : 20,
        windSpeed: isWinter ? 15 : 8,
        timestamp: now.toISOString(),
        isSimulated: true
    };
}

function getTideState() {
    const hours = new Date().getHours();
    const level = 2.5 + Math.sin((hours / 12.4) * 2 * Math.PI) * 1.5;
    return {
        height: parseFloat(level.toFixed(2)),
        trend: Math.sin(((hours + 0.5) / 12.4) * 2 * Math.PI) > Math.sin((hours / 12.4) * 2 * Math.PI) ? 'rising' : 'falling'
    };
}

async function fetchWeatherData() {
    try {
        const res = await fetch('https://unisono.connect.ninja/lecturas.php?refresh=true');
        const html = await res.text();
        const $ = cheerio.load(html);
        const tables = $('table');

        let schoolData = null;
        tables.each((_, table) => {
            const tableText = $(table).text();
            if (tableText.includes('Getxo Bela') && tableText.includes('Eskola')) {
                const row = $(table).find('tr').eq(2);
                if (row.length > 0) {
                    const cells = row.find('td');
                    const knots = parseFloat(cells.eq(1).text());
                    if (!isNaN(knots)) {
                        schoolData = {
                            station: 'Getxo Bela Eskola',
                            knots,
                            kmh: parseFloat((knots * 1.852).toFixed(1)),
                            direction: parseFloat(cells.eq(3).text()) || 0,
                            temp: parseFloat(cells.eq(4).text()) || 0,
                            timestamp: new Date().toISOString(),
                            gusts: parseFloat(cells.eq(2).text()) || 0
                        };
                    }
                }
            }
        });

        if (schoolData) return schoolData;

        // Fallback Euskalmet
        const token = generateEuskalmetToken();
        if (token) {
            const gRes = await fetch('https://api.euskadi.eus/met01/euskalmet/stations/C042/current', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            if (gRes.ok) {
                const galea = await gRes.json();
                const wind = galea.readings?.find(r => r.sensorId === 'wind_speed');
                if (wind) {
                    const knots = parseFloat((wind.value * 1.94384).toFixed(1));
                    return {
                        station: 'Punta Galea (Euskalmet)',
                        knots,
                        kmh: parseFloat((wind.value * 3.6).toFixed(1)),
                        direction: 0,
                        temp: 0,
                        timestamp: new Date().toISOString()
                    };
                }
            }
        }
    } catch (e) {
        console.error('Error fetching weather:', e.message);
    }
    return null;
}

async function fetchEuskalmetAlerts() {
    try {
        const token = generateEuskalmetToken();
        if (!token) return [];
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');

        const url = `https://api.euskadi.eus/met01/euskalmet/alerts/forRegion/1/at/${yyyy}/${mm}/${dd}`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error('Error fetching alerts:', e.message);
    }
    return [];
}

async function fetchAemetCoastalForecast(coastId) {
    try {
        const url1 = `https://opendata.aemet.es/opendata/api/prediccion/maritima/costera/costa/${coastId}?api_key=${AEMET_API_KEY}`;
        const res1 = await fetch(url1);
        const json1 = await res1.json();
        if (json1.estado !== 200) {
            console.error('AEMET API Error url1:', json1);
            return null;
        }

        const res2 = await fetch(json1.datos);
        const data = await res2.json();

        if (!data || data.length === 0) return null;

        const prediction = data[0];
        // Coastal bulletin structure: prediccion.zona
        let zones = prediction.zona || prediction.prediccion?.zona || prediction.prediccion?.dia?.[0]?.zona;

        if (!zones) return null;

        const zone = zones.find(z => z.nombre && z.nombre.toUpperCase().includes('BIZKAIA'));
        if (zone) {
            return {
                wind: zone.viento,
                seaState: zone.estado_mar,
                timestamp: prediction.inicio || prediction.fecha || prediction.elaborado,
                source: 'Costa Bizkaia'
            };
        }
    } catch (e) {
        console.error('Error AEMET:', e.message);
    }
    return null;
}

function generateEuskalmetToken() {
    if (!EUSKALMET_PRIVATE_KEY) return null;
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        aud: 'met01.apikey',
        iss: 'GetxoBelaEskola',
        version: '1.0.0',
        email: EUSKALMET_EMAIL,
        iat: now,
        exp: now + 3600
    };
    return jwt.sign(payload, EUSKALMET_PRIVATE_KEY, { algorithm: 'RS256' });
}

sync();
