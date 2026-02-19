
async function test() {
    try {
        const url = 'http://127.0.0.1:3000/es/courses/vela-ligera/';
        console.log(`Fetching ${url}...`);
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Body length: ${text.length}`);
        if (res.status !== 200) {
            console.log("Body Snippet:", text.substring(0, 500));
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

test();
