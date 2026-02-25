const token = process.env.VERCEL_ACCESS_TOKEN;
const teamId = process.env.VERCEL_TEAM_ID;

async function testFetch() {
    const urls = [
        `https://api.vercel.com/v1/billing/charges?teamId=${teamId}`,
        `https://api.vercel.com/v1/billing/usage?teamId=${teamId}`,
        `https://api.vercel.com/v8/artifacts/usage?teamId=${teamId}`
    ];

    for (const url of urls) {
        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            console.log(`\nURL: ${url}`);
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const text = await res.text();
                console.log(text.substring(0, 500));
            }
        } catch (e) {
            console.error(e);
        }
    }
}

testFetch();
