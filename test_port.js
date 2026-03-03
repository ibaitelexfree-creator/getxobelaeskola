const net = require('net');
const client = new net.Socket();
const timeout = 5000;
client.setTimeout(timeout);

console.log('Testing 76.13.52.6:22...');
client.connect(22, '76.13.52.6', () => {
    console.log('SUCCESS: Connected to 76.13.52.6:22');
    client.destroy();
});

client.on('error', (err) => {
    console.log('FAILED: ' + err.message);
    client.destroy();
});

client.on('timeout', () => {
    console.log('FAILED: Connection timed out');
    client.destroy();
});
