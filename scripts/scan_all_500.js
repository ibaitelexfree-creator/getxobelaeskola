
const fs = require('fs');
try {
    const content = fs.readFileSync('dev.log', 'utf16le');
    const lines = content.split('\n');
    console.log("Searching for ALL 500 errors in dev.log...");

    const results = lines.filter(line => line.includes(' 500 '));

    console.log(`Found ${results.length} lines with 500 status.`);
    console.log(results.slice(-20).join('\n'));
} catch (e) {
    console.error(e);
}
