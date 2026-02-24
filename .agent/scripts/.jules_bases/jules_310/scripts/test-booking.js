async function testBooking() {
    console.log('--- Testing Booking (Rental Checkout) API ---');
    const payload = {
        serviceId: 'test-service-id',
        optionIndex: 0,
        locale: 'es',
        reservedDate: '2026-06-15',
        reservedTime: '10:00'
    };

    try {
        const response = await fetch('http://localhost:3010/api/checkout/rental', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            const data = await response.json();
            console.log('Response JSON:', data);
        } else {
            const text = await response.text();
            console.log('Response Text:', text.substring(0, 500));
        }
    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
}

testBooking();
