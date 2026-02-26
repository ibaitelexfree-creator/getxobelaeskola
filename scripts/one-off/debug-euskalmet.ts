import { fetchEuskalmetStationData } from './src/lib/euskalmet';

async function main() {
    console.log('Fetching B090 (Puerto Bilbao)...');
    const b090 = await fetchEuskalmetStationData('B090');
    if (b090 && b090.readings) {
        console.log('B090 Sensors:', b090.readings.map((r: any) => r.sensorId || r.type));
    } else {
        console.log('B090: No data');
    }

    console.log('Fetching C042 (Punta Galea)...');
    const c042 = await fetchEuskalmetStationData('C042');
    if (c042 && c042.readings) {
        console.log('C042 Sensors:', c042.readings.map((r: any) => r.sensorId || r.type));
    } else {
        console.log('C042: No data');
    }
}

main().catch(console.error);
