async function test() {
    try {
        const res = await fetch('http://localhost:3000/controlmanager/realstate/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Oceanfront Mansion',
                price: 75000000,
                location: 'Palm Jumeirah',
                property_type: 'Mansion',
                bedrooms: 7,
                bathrooms: 8,
                description: 'A masterpiece of architecture with direct beach access.'
            })
        });
        const data = await res.json();
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
