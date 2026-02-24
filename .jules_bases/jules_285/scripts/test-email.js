async function test() {
    try {
        const response = await fetch('http://localhost:3002/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'test@example.com',
                subject: 'Simulación QA',
                text: 'Hola, esto es una prueba de QA.'
            })
        });
        console.log('STATUS:', response.status);
        const data = await response.json();
        console.log('BODY:', data);
    } catch (e) {
        console.error('FAIL:', e);
    }
}
test();
