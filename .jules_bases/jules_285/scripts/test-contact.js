async function testContact() {
    console.log('--- Testing Contact API ---');
    const payload = {
        nombre: 'Integrator Test',
        email: 'test@example.com',
        asunto: 'Prueba de Integración',
        mensaje: 'Este es un mensaje de prueba generado por el script de validación.'
    };

    try {
        const response = await fetch('http://localhost:3010/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();

        try {
            const data = JSON.parse(text);
            console.log('Response JSON:', data);
        } catch (e) {
            console.log('Response is not JSON. Length:', text.length);
            console.log('Snippet:', text.substring(0, 200));
        }
    } catch (error) {
        console.error('Fetch Error Detail:', error);
    }
}

testContact();
