import http from 'https';

const url = 'https://n8n.srv1368175.hstgr.cloud/webhook/swarm-dispatcher';
const data = JSON.stringify({
    original_prompt: "Test Swarm: Hello World",
    proposal: [
        {
            role: "Lead Architect",
            count: 1,
            account: "getxobelaeskola@gmail.com"
        }
    ]
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(url, options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
