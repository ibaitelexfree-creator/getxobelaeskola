const fs = require('fs');
const path = require('path');

async function testN8n() {
    const testTxtPath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(testTxtPath, 'Hola, esto es una prueba.');

    const formData = new FormData();
    const fileContent = fs.readFileSync(testTxtPath);
    const blob = new Blob([fileContent], { type: 'text/plain' });
    formData.append('file1', blob, 'test.txt');

    try {
        console.log('Enviando petición a n8n...');
        const url = 'https://n8n.srv1368175.hstgr.cloud/webhook-test/trigger-report';
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json().catch(() => null) || await res.text();
        if (res.ok) {
            console.log('✅ Éxito en la prueba HTTP:', data);
        } else {
            console.log(`❌ Falló la prueba HTTP: ${res.status}`);
            console.log(data);
        }
    } catch (e) {
        console.log('❌ Error:', e.message);
    }
}

testN8n();
