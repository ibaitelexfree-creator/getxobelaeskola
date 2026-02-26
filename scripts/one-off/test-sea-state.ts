import { fetchWeatherData } from './src/lib/weather';

async function main() {
    console.log('Fetching Weather...');
    try {
        const weather = await fetchWeatherData();
        console.log('Weather:', weather);
    } catch (e) {
        console.warn('Weather fetch failed:', e);
    }
}

main();
