const https = require('https');

['atendai/evolution-api', 'evolutionapi/evolution-api', 'atendare/evolution-api'].forEach(repo => {
    https.get(`https://registry.hub.docker.com/v2/repositories/${repo}/tags`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const parsed = JSON.parse(data);
            if (parsed.results) {
                console.log(`FOUND ${repo}:`, parsed.results.map(t => t.name).join(', '));
            } else {
                console.log(`NOT FOUND ${repo}`);
            }
        });
    });
});
