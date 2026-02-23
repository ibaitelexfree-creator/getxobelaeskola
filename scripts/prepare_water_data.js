const fs = require('fs');
const path = require('path');
const osmtogeojson = require('osmtogeojson');
const turf = require('@turf/turf');

async function prepareWaterData() {
    // Expanded bbox to cover the entire Abra (from Santurtzi/Zierbena to Getxo/Azkorri)
    // format: south, west, north, east
    const bbox = '43.31,-3.12,43.40,-2.98';

    const query = `
    [out:json][timeout:60];
    (
      // All natural water (sea, rivers, etc)
      way["natural"="water"](${bbox});
      relation["natural"="water"](${bbox});

      // Specifically bays and docks
      way["natural"="bay"](${bbox});
      relation["natural"="bay"](${bbox});

      way["waterway"="dock"](${bbox});
      relation["waterway"="dock"](${bbox});

      // Harbor areas
      way["harbour"="yes"](${bbox});
      relation["harbour"="yes"](${bbox});
    );
    out body;
    >;
    out skel qt;
  `;

    const url = 'https://overpass-api.de/api/interpreter';

    console.log(`Fetching water data for Abra area (${bbox})...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: 'data=' + encodeURIComponent(query),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const osmData = await response.json();
        console.log(`Fetched ${osmData.elements.length} elements.`);

        let geojson = osmtogeojson(osmData);
        const features = geojson.features.filter(f =>
            f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
        );

        console.log(`Found ${features.length} water features.`);

        let finalCollection;
        if (features.length === 0) {
            console.warn('Overpass returned 0 features. Using comprehensive Abra fallback.');
            finalCollection = getAbraFallback();
        } else {
            // Simplify to keep file size reasonable while maintaining shape
            const simplifiedFeatures = features.map(f => {
                try {
                    return turf.simplify(f, { tolerance: 0.00005, highQuality: false });
                } catch (e) {
                    return f;
                }
            });
            finalCollection = turf.featureCollection(simplifiedFeatures);
        }

        const outputDir = path.join(process.cwd(), 'src', 'data', 'geospatial');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const outputPath = path.join(outputDir, 'water-geometry.json');
        fs.writeFileSync(outputPath, JSON.stringify(finalCollection)); // Minified for production

        console.log(`Successfully saved water geometry to ${outputPath}`);
    } catch (error) {
        console.error('API Error:', error.message);
        const fallback = getAbraFallback();
        const outputDir = path.join(process.cwd(), 'src', 'data', 'geospatial');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(path.join(outputDir, 'water-geometry.json'), JSON.stringify(fallback));
        console.log('Saved comprehensive Abra fallback geometry due to error.');
    }
}

function getAbraFallback() {
    // A more comprehensive polygon representing the navigable waters of the Abra
    const abraPolygon = turf.polygon([[
        [-3.110, 43.370], // Zierbena / Punta Lucero
        [-3.090, 43.385], // Outer North
        [-3.000, 43.385], // Azkorri Outer
        [-2.990, 43.360], // Azkorri Coast
        [-3.010, 43.345], // Getxo (Puerto Deportivo)
        [-3.005, 43.325], // Puente Bizkaia
        [-3.030, 43.325], // Santurtzi
        [-3.060, 43.335], // Ciérvana
        [-3.110, 43.370]  // Close
    ]], { name: 'Abra de Bilbao (Wide Fallback)' });

    return turf.featureCollection([abraPolygon]);
}

prepareWaterData();
