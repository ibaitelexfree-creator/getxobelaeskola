
import { isPointInWater } from './src/lib/geospatial/water-check';

const points = [
    { name: 'Arriluze Lighthouse', lat: 43.3394, lng: -3.0133 },
    { name: 'Muelle Arriluze', lat: 43.339182, lng: -3.021255 },
    { name: 'Mid Bay', lat: 43.34, lng: -3.015 }
];

points.forEach(p => {
    const inWater = isPointInWater(p.lat, p.lng);
    console.log(`${p.name} (${p.lat}, ${p.lng}): ${inWater ? 'Water' : 'LAND'}`);
});
