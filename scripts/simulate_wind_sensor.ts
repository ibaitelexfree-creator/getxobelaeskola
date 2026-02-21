// scripts/simulate_wind_sensor.ts
// Use: npx tsx scripts/simulate_wind_sensor.ts

const API_URL = 'http://localhost:3000/api/iot/wind';
const SENSOR_ID = 'club-nautico-iot-1';

function getRandomWind() {
    const baseSpeed = 10;
    const speed = baseSpeed + (Math.random() * 5 - 2.5);
    const gust = speed + (Math.random() * 5);
    const direction = (45 + Math.random() * 20 - 10 + 360) % 360; // Approx NE wind
    const battery = 95 - (Math.random() * 5);

    return {
        sensor_id: SENSOR_ID,
        speed_knots: parseFloat(speed.toFixed(1)),
        direction_deg: parseFloat(direction.toFixed(0)),
        gust_knots: parseFloat(gust.toFixed(1)),
        battery_level: parseFloat(battery.toFixed(1))
    };
}

async function sendData() {
    const data = getRandomWind();
    console.log(`Sending wind data: ${data.speed_knots}kn @ ${data.direction_deg}° (Gust: ${data.gust_knots})`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'club-nautico-iot-secret-2024'
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log('✅ Data sent successfully');
        } else {
            console.error('❌ Failed to send data:', response.status, await response.text());
        }
    } catch (error) {
        console.error('❌ Error sending data:', error);
    }
}

// Run immediately then every 5 seconds
sendData();
setInterval(sendData, 5000);
