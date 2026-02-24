
const urls = [
    'http://localhost:3000/es/courses/vela-ligera/',
    'http://localhost:3000/es/courses/iniciacion-j80/',
    'http://localhost:3000/es/courses/perfeccionamiento-vela/',
    'http://localhost:3000/es/courses/licencia-navegacion/',
    'http://localhost:3000/eu/courses/vela-ligera/',
    'http://localhost:3000/eu/courses/iniciacion-j80/'
];

async function testAll() {
    for (const url of urls) {
        try {
            const res = await fetch(url);
            console.log(`URL: ${url} -> Status: ${res.status}`);
            if (res.status !== 200) {
                const text = await res.text();
                console.log(`Error Body snippet: ${text.substring(0, 200)}`);
            }
        } catch (e) {
            console.log(`URL: ${url} -> FAILED: ${e.message}`);
        }
    }
}

testAll();
