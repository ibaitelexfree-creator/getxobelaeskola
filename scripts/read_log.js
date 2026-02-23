
const fs = require('fs');
try {
    const content = fs.readFileSync('dev.log', 'utf16le');
    const lines = content.split('\n');
    let output = [];
    for (let i = lines.length - 1; i >= 0 && output.length < 50; i--) {
        if (lines[i].includes('IntlError') || lines[i].includes('ERROR')) {
            // grab a few lines around it
            output.push(lines.slice(Math.max(0, i - 5), i + 5).join('\n'));
        }
    }
    console.log(output.join('\n---\n'));
} catch (e) {
    console.error(e);
}
