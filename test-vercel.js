const token = 'vcp_5RYMTFTtIVRKsN7lcUt7Om9oGgDgJeyA8kzFvS5U5mgplUpsKf348WlB';
const projectId = 'prj_CVHwakp0yA70gav5t1xcXC0GGwYz';
const teamId = 'team_qsH6nFq6HfVQmrfB3tj03jLU';

async function testVercel() {
    const fetchUsage = async (url) => {
        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                console.log(`✅ Success for ${url}`);
                console.log(JSON.stringify(await res.json(), null, 2).substring(0, 300));
            } else {
                console.log(`❌ Failed for ${url}: ${res.status}`);
            }
        } catch (e) { }
    };

    await fetchUsage(`https://api.vercel.com/v1/usage?teamId=${teamId}`);
    await fetchUsage(`https://api.vercel.com/v5/teams/${teamId}/usage`);
    await fetchUsage(`https://api.vercel.com/v2/usage?teamId=${teamId}`);
    await fetchUsage(`https://api.vercel.com/v8/projects/${projectId}/custom-environments`);
    await fetchUsage(`https://api.vercel.com/v2/usage`);

}

testVercel();
